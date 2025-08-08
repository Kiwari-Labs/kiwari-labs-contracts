// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC7818 with write heavy design
 * @author Kiwari Labs
 */

import {SortedList} from "../../utils/datastructures/SortedList.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

abstract contract ERC7818 is Context, IERC20Errors, IERC20Metadata, IERC7818 {
    using SortedList for SortedList.List;

    struct EpochParams {
        uint256 initBlockNumber;
        uint8 window;
        uint8 lookback;
        uint40 length;
    }

    /**
     * @dev Epoch state container for temporal balance tracking within ring buffer slots.
     * @custom:attribute totalBalance is a aggregate balance sum for this epoch index slot
     * @custom:attribute balance is a block-granular or timestamp-granular balance mapping: blockNumber → balance / timeStamp → balance
     * @custom:attribute list is a sorted container of active block numbers or time stamps.
     * @custom:invariant In block-based epochs: |list| ≤ epoch.length (deterministic upper bound)
     * @custom:invariant In timestamp-based epochs: |list| is unbounded due to unreliable network can causing non-deterministic block production
     * @custom:note Ring buffer architecture enables slot reuse across temporally disjoint epochs
     */
    struct Epoch {
        uint256 totalBalance;
        mapping(uint256 stamp => uint256 balance) balances;
        SortedList.List list;
    }

    string private _name;
    string private _symbol;
    uint8 private constant RESERVED_INDEX = 0;
    uint256 private _issuedSupply;
    uint256 private _lastSeenEpoch;
    uint256 private constant MAGIC_ZERO = type(uint256).max;

    /**
     * @dev Bounded ring buffer storage with finite index domain.
     * @custom:invariant ∀i ∈ indices: 0 ≤ i ≤ 2 × lookback_max = 2 × 32 = 64
     * @custom:note Index 0 serves as reserved accumulator for expired balances
     */
    mapping(uint256 index => uint256 supply) private _indexedTotalSupply;
    mapping(uint256 index => mapping(address account => Epoch)) private _balances;
    mapping(address owner => mapping(address spender => uint256 amount)) private _allowances;

    EpochParams private _epochParams;

    constructor(string memory name_, string memory symbol_, uint256 blockNumber, uint8 lookback, uint40 length) {
        require(lookback >= 0x01, "Minimum lookback is 1");
        require(lookback <= 0x20, "Maximum lookback is 32");
        require(length >= 0x01, "Minimum epoch length is 1");
        require(length <= 0x282070, "Minimum epoch length is 2629744");

        _name = name_;
        _symbol = symbol_;

        _epochParams.initBlockNumber = blockNumber;
        _epochParams.lookback = lookback;
        _epochParams.window = lookback * 2;
        _epochParams.length = length;
    }

    /**
     * @dev it's stateless check index not epoch it's can create fault positive.
     */
    function isExpiredIndex(uint256 index, uint256 currentIndex, uint256 lookback, uint256 window) private pure returns (bool) {
        if (currentIndex >= index) {
            return (currentIndex - index) >= lookback;
        } else {
            return (window + currentIndex - index) >= lookback;
        }
    }

    function calculateEpochAndIndexRange(
        uint256 initialBlockNumber,
        uint256 blockNumber,
        uint256 length,
        uint256 window
    ) private pure returns (uint256 fromIndex, uint256 toIndex, uint256 toEpoch) {
        toEpoch = (blockNumber - initialBlockNumber) / length;
        toIndex = epochToIndex(toEpoch, window);
        // shift right with 1 instead div by 2.
        if (toIndex < window) {
            fromIndex = ((window >> 1) + toIndex);
        } else {
            fromIndex = toIndex + (window >> 1);
        }
    }

    //
    function totalBalanceOverIndexRange(
        uint256 fromIndex,
        uint256 toIndex,
        address account,
        uint256 window
    ) private view returns (uint256 balance) {
        while (fromIndex != RESERVED_INDEX) {
            uint256 value = _balances[fromIndex][account].totalBalance;
            if (value != MAGIC_ZERO) {
                balance += value;
            }
            if (fromIndex == toIndex) break;
            unchecked {
                fromIndex = (fromIndex % window) + 1; // Wraps around using ring buffer logic, prevent starting at reserve index
            }
        }
    }

    function _activeBalanceAtIndex(
        uint256 index,
        address account,
        uint256 pointer,
        uint256 duration
    ) internal view returns (uint256 balance) {
        (uint256 element, ) = _findValidBalance(account, index, pointer, duration);
        Epoch storage _account = _balances[index][account];
        unchecked {
            while (element > 0) {
                balance += _account.balances[element];
                element = _account.list.next(element);
            }
        }
        return balance;
    }

    function _findValidBalance(
        address account,
        uint256 index,
        uint256 pointer,
        uint256 duration
    ) internal view returns (uint256 element, uint256 value) {
        // @TODO back() is the latest of the list cause, it's store blocknumber or timestamp.
        // then reverse traversal cloud better in case randomly R/W,
        // or should we store snap-shot latestSearch and start from there.
        // how ever it's possible to move latestSearch cause receive fund from other it's
        SortedList.List storage list = _balances[index][account].list;
        if (!list.isEmpty()) {
            element = list.front();
            unchecked {
                while (pointer - element >= duration) {
                    if (element == 0) {
                        break;
                    }
                    element = list.next(element);
                }
            }
            value = _balances[index][account].balances[element];
        }
    }

    function sweepBuffer(address from, address to, uint256 currentEpoch, uint256 currentIndex, uint256 window, uint256 lookback) internal {
        uint256 expiredSum;
        if (currentEpoch >= _lastSeenEpoch + window) {
            // sweep everything at once
            expiredSum = _sweepAllIndices(from, to, window);
        } else {
            // partial sweep only expired indices
            expiredSum = _sweepExpiredIndices(from, to, currentIndex, lookback, window);
        }

        // Update reserved index
        if (expiredSum > 0) {
            _indexedTotalSupply[RESERVED_INDEX] += expiredSum;
        }
    }

    function _sweepAllIndices(address from, address to, uint256 n) private returns (uint256 expiredSum) {
        unchecked {
            while (n > 0) {
                uint256 val = _indexedTotalSupply[n];
                if (val != MAGIC_ZERO) {
                    expiredSum += val;
                    _indexedTotalSupply[n] = MAGIC_ZERO;
                }

                // Clean user balances
                _cleanBalanceOfAtIndex(n, from);
                if (to != address(0)) {
                    _cleanBalanceOfAtIndex(n, to);
                }
                n--;
            }
        }
    }

    function _sweepExpiredIndices(
        address from,
        address to,
        uint256 currentIndex,
        uint256 lookback,
        uint256 window
    ) private returns (uint256 expiredSum) {
        unchecked {
            uint256 i = window;
            while (i > 0) {
                if (isExpiredIndex(i, currentIndex, lookback, window)) {
                    uint256 val = _indexedTotalSupply[i];
                    if (val != MAGIC_ZERO) {
                        expiredSum += val;
                        _indexedTotalSupply[i] = MAGIC_ZERO;
                    }

                    _cleanBalanceOfAtIndex(i, from);
                    if (to != address(0)) {
                        _cleanBalanceOfAtIndex(i, to);
                    }
                }
                i--;
            }
        }
    }

    function _cleanBalanceOfAtIndex(uint256 index, address account) private {
        if (_balances[index][account].totalBalance != MAGIC_ZERO) {
            _balances[index][account].totalBalance = MAGIC_ZERO;
            _balances[index][account].list.clear();
        }
    }

    function epochToIndex(uint256 epoch, uint256 window) private pure returns (uint256) {
        return (epoch % window) + 1;
    }

    function fetchValidElementAtIndex(address account, uint256 index, uint256 pointer, uint256 length) private {
        Epoch storage _account = _balances[index][account];
        if (!_account.list.isEmpty()) {
            uint256 element = _account.list.front();
            uint256 balance;
            unchecked {
                while (pointer - element >= duration) {
                    balance += _account.balances[element];
                    element = _account.list.next(element);
                }
            }
            if (balance > 0) {
                _account.list.shrink(element);
                _account.totalBalance -= balance;
            }
        }
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = _allowances[owner][spender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }

    function _update(address from, address to, uint256 value) internal virtual {
        _update(currentEpoch(), from, to, value);
    }

    function _updateAtEpoch(uint256 epoch, address from, address to, uint256 value) internal virtual {
        // @TODO

        emit Transfer(from, to, value);
    }

    function _update(uint256 epoch, address from, address to, uint256 value) internal {
        if (from == address(0)) {
            uint256 window = _epochParams.window;
            uint256 index = epochToIndex(epoch, window);

            // handle both normal expiration and "too long gap" scenarios
            sweepBuffer(address(0), to, epoch, index, window, _epochParams.lookback);
            unchecked {
                if (_indexedTotalSupply[index] == MAGIC_ZERO) {
                    _indexedTotalSupply[index] = value;
                    _balances[index][to].totalBalance = value;
                } else {
                    _indexedTotalSupply[index] += value;
                    _balances[index][to].totalBalance += value;
                }
                _balances[index][to].balances[block.number] += value;
                _balances[index][to].list.insert(block.number, false);
                _issuedSupply += value;
            }
        } else {
            EpochParams memory epochParams = _epochParams;
            (uint256 fromIndex, uint256 toIndex, uint256 toEpoch) = calculateEpochAndIndexRange(
                epochParams.initBlockNumber,
                block.number,
                epochParams.length,
                epochParams.window
            );
            sweepBuffer(from, to, toEpoch, toIndex, epochParams.window, epochParams.lookback);
            fetchValidElementAtIndex(from, fromIndex, block.number, epochParams.length);
            uint256 balance = totalBalanceOverIndexRange(fromIndex, toIndex, from, epochParams.window);
            if (balance < value) {
                revert ERC20InsufficientBalance(from, balance, value);
            }
            if (to == address(0)) {
                _burnFIFO(from, value, fromIndex, toIndex, epochParams.window);
            } else {
                _transferFIFO(from, to, value, fromIndex, toIndex, epochParams.window);
            }
        }
        _lastSeenEpoch = epoch;

        emit Transfer(from, to, value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    function _transferAtEpoch(uint256 epoch, address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _updateAtEpoch(epoch, from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(currentEpoch(), address(0), to, value);
    }

    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    function _burnFIFO(address from, uint256 value, uint256 fromIndex, uint256 toIndex, uint256 window) private {
        uint256 currentIndex = fromIndex;

        while (value > 0) {
            Epoch storage account = _balances[currentIndex][from];
            uint256 element = account.list.front();

            while (element > 0 && value > 0) {
                uint256 balance = account.balances[element];
                if (balance <= value) {
                    unchecked {
                        value -= balance;
                        account.totalBalance -= balance;
                        account.balances[element] = 0; // Set to 0 instead of -= balance
                        _indexedTotalSupply[currentIndex] -= balance; // Fix: use currentIndex not element
                    }
                    uint256 nextElement = account.list.next(element);
                    account.list.remove(element);
                    element = nextElement;
                } else {
                    unchecked {
                        account.totalBalance -= value;
                        account.balances[element] -= value;
                        _indexedTotalSupply[currentIndex] -= value; // Fix: use currentIndex not element
                    }
                    value = 0;
                }
            }

            // Check if we've reached the end
            if (currentIndex == toIndex) {
                break;
            }

            // Handle ring buffer wraparound
            if (currentIndex == window) {
                currentIndex = 1; // Skip reserved index 0
            } else {
                currentIndex++;
            }

            // Safety check to prevent infinite loop
            if (currentIndex == fromIndex) {
                break;
            }
        }
    }

    function _transferFIFO(address from, address to, uint256 value, uint256 fromIndex, uint256 toIndex, uint256 window) private {
        uint256 currentIndex = fromIndex;

        while (value > 0) {
            Epoch storage _spender = _balances[currentIndex][from];
            Epoch storage _recipient = _balances[currentIndex][to];
            uint256 element = _spender.list.front();

            while (element > 0 && value > 0) {
                uint256 balance = _spender.balances[element];
                if (balance <= value) {
                    unchecked {
                        value -= balance;
                        _spender.totalBalance -= balance;
                        _spender.balances[element] = 0; // Set to 0 instead of -= balance

                        // Handle recipient balance initialization
                        if (_recipient.totalBalance == MAGIC_ZERO) {
                            _recipient.totalBalance = balance;
                        } else {
                            _recipient.totalBalance += balance;
                        }
                        _recipient.balances[element] += balance;
                    }
                    _recipient.list.insert(element, false);
                    uint256 nextElement = _spender.list.next(element);
                    _spender.list.remove(element);
                    element = nextElement;
                } else {
                    unchecked {
                        _spender.totalBalance -= value;
                        _spender.balances[element] -= value;

                        // Handle recipient balance initialization
                        if (_recipient.totalBalance == MAGIC_ZERO) {
                            _recipient.totalBalance = value;
                        } else {
                            _recipient.totalBalance += value;
                        }
                        _recipient.balances[element] += value;
                    }
                    _recipient.list.insert(element, false);
                    value = 0;
                }
            }

            // Check if we've reached the end
            if (currentIndex == toIndex) {
                break;
            }

            // Handle ring buffer wraparound
            if (currentIndex == window) {
                currentIndex = 1; // Skip reserved index 0
            } else {
                currentIndex++;
            }

            // Safety check to prevent infinite loop
            if (currentIndex == fromIndex) {
                break;
            }
        }
    }

    /**
     * @dev This is "NOT" a full account-by-account circulating supply scan.
     *      It includes only the unexpired balances (eligible for transfer/use).
     * @return Returns the total eligible active (non-expired) token supply.
     */
    function circulatingSupply() public view returns (uint256) {
        uint256 window = _epochParams.window;
        uint256 current = currentEpoch();

        if (current >= _lastSeenEpoch + window) {
            return 0;
        }

        current = epochToIndex(current, window);

        uint256 eligibleSum;
        uint256 lookback = _epochParams.lookback;
        uint256 index = window;
        while (index > 0) {
            if (!isExpiredIndex(index, current, lookback, window)) {
                uint256 value = _indexedTotalSupply[index];
                if (value != MAGIC_ZERO) {
                    eligibleSum += value;
                }
            }
            unchecked {
                --index;
            }
        }

        return eligibleSum;
    }

    function expiredSupply() public view returns (uint256) {
        uint256 expired = _indexedTotalSupply[RESERVED_INDEX];
        uint256 window = _epochParams.window;
        uint256 epoch = currentEpoch();

        // Full expiration due to long inactivity
        if (epoch >= _lastSeenEpoch + window) {
            uint256 index = window;
            while (index > 0) {
                uint256 value = _indexedTotalSupply[index];
                if (value != MAGIC_ZERO) {
                    expired += value;
                }
                unchecked {
                    --index;
                }
            }
        } else {
            uint256 lookback = _epochParams.lookback;
            uint256 currentIndex = epochToIndex(epoch, window);
            uint256 index = window;
            while (index > 0) {
                if (isExpiredIndex(index, currentIndex, lookback, window)) {
                    uint256 value = _indexedTotalSupply[index];
                    if (value != MAGIC_ZERO) {
                        expired += value;
                    }
                }
                unchecked {
                    --index;
                }
            }
        }

        return expired;
    }

    function issuedSupply() public view returns (uint256) {
        return _issuedSupply;
    }

    /**
     * @dev See {IERC20Metadata.name}.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC20Metadata.symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC20Metadata.decimals}.
     */
    function decimals() public pure virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-approve}.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC7818.totalSupply}.
     */
    function totalSupply() public pure returns (uint256) {
        return 0;
    }

    /**
     *@dev See {IERC7818.balanceOf}.
     */
    function balanceOf(address account) public view returns (uint256) {
        EpochParams memory epochParams = _epochParams;
        (uint256 fromIndex, uint256 toIndex, uint256 toEpoch) = calculateEpochAndIndexRange(
            epochParams.initBlockNumber,
            block.number,
            epochParams.length,
            epochParams.window
        );
        if (toEpoch >= _lastSeenEpoch + epochParams.window) return 0;
        uint256 balance = _activeBalanceAtIndex(fromIndex, account, block.number, epochParams.length);
        // fromIndex is buffer then move 1 index.
        if (fromIndex == epochParams.window) {
            fromIndex = 1;
        } else {
            fromIndex++;
        }
        balance += totalBalanceOverIndexRange(fromIndex, toIndex, account, epochParams.window);

        return balance;
    }

    /**
     *@dev See {IERC7818.balanceOfAtEpoch}.
     */
    function balanceOfAtEpoch(uint256 epoch, address account) public view returns (uint256) {
        // @TODO check is given epoch expired
        // compute window range if epoch == fromEpoch
        // computeBalanceAtEpoch
        // else return totalBalance cause can presume not expired
        return 0;
    }

    /**
     * @dev See {IERC7818.transfer}.
     */
    function transfer(address to, uint256 value) public returns (bool) {
        address from = _msgSender();
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev See {IERC7818.transferFrom}.
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev See {IERC7818.transferAtEpoch}.
     */
    function transferAtEpoch(uint256 epoch, address to, uint256 value) public returns (bool) {
        if (isEpochExpired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        address owner = _msgSender();
        _transferAtEpoch(epoch, owner, to, value);
        return true;
    }

    /**
     * @dev See {IERC7818.transferFromAtEpoch}.
     */
    function transferFromAtEpoch(uint256 epoch, address from, address to, uint256 value) public returns (bool) {
        if (isEpochExpired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transferAtEpoch(epoch, from, to, value);
        return true;
    }

    /**
     * @dev See {IERC7818.currentEpoch}.
     */
    function currentEpoch() public view override returns (uint256) {
        if (block.number <= _epochParams.initBlockNumber) return 0;
        return (block.number - _epochParams.initBlockNumber) / _epochParams.length;
    }

    /**
     * @dev See {IERC7818.epochLength}.
     */
    function epochLength() public view override returns (uint256) {
        return _epochParams.length;
    }

    /**.
     * @dev See {IERC7818.epochLength}.
     */
    function epochType() public pure override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    /**
     * @dev See {IERC7818.validityDuration}.
     */
    function validityDuration() public view override returns (uint256) {
        return _epochParams.lookback;
    }

    /**
     * @dev See {IERC7818.isEpochExpired}.
     */
    function isEpochExpired(uint256 epoch) public view override returns (bool) {
        uint256 current = currentEpoch();
        uint256 window = _epochParams.window;
        uint256 lookback = _epochParams.lookback;

        // If the epoch is outside of valid range due to inactivity, all epochs expired
        if (current >= _lastSeenEpoch + window) {
            return true;
        }

        current = epochToIndex(current, window);

        return isExpiredIndex(epochToIndex(epoch, window), current, lookback, window);
    }

    /**
     * @dev See {IERC7818.getEpochBalance}.
     * @custom:override behavior return only the valid epoch.
     */
    function getEpochBalance(uint256 epoch) public view returns (uint256) {
        uint256 tmp_uint256 = currentEpoch();
        // Check if epoch is too old (beyond lookback window)
        if (epoch + _epochParams.lookback <= tmp_uint256) {
            return 0;
        }
        uint256 window = _epochParams.window;
        // Check if there's been too long a gap since last activity
        if (tmp_uint256 >= _lastSeenEpoch + window) {
            return 0;
        }
        // Get the value from storage
        tmp_uint256 = _indexedTotalSupply[epochToIndex(epoch, window)];
        return tmp_uint256 == MAGIC_ZERO ? 0 : tmp_uint256;
    }
}
