// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {SCDLL} from "../../utils/datastructures/LSCDLL.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

/**
 * @title ERC20EXP Base
 * @author Kiwari Labs
 */
abstract contract ERC20EXPBase is Context, IERC20Errors, IERC20Metadata, IERC7818 {
    using SCDLL for SCDLL.List;

    string private _name;
    string private _symbol;

    struct Epoch {
        uint256 totalBalance;
        mapping(uint256 account => uint256 balance) balances;
        SCDLL.List list;
    }

    mapping(uint256 epoch => mapping(address account => Epoch)) private _balances;
    mapping(address owner => mapping(address spender => uint256 amount)) private _allowances;
    mapping(uint256 pointer => uint256 balance) private _worldStateBalances;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @notice Computes the total balance of an account over a range of epochs.
     * @dev Iterates through the specified epoch range and sums up the total balance for the account.
     * @param fromEpoch The starting epoch of the range.
     * @param toEpoch The ending epoch of the range.
     * @param account The address of the account.
     * @return balance The total balance of the account over the specified epoch range.
     */
    function _computeBalanceOverEpochRange(uint256 fromEpoch, uint256 toEpoch, address account) internal view returns (uint256 balance) {
        unchecked {
            for (; fromEpoch <= toEpoch; fromEpoch++) {
                balance += _balances[fromEpoch][account].totalBalance;
            }
        }
    }

    /**
     * @notice Computes the total balance of an account for a specific epoch.
     * @dev Iterates over valid balance elements for the given epoch and sums them up.
     * @param epoch The epoch for which to compute the balance.
     * @param account The address of the account.
     * @param pointer The current pointer value.
     * @param duration The duration to determine valid elements.
     * @return balance The total balance of the account for the specified epoch.
     */
    function _computeBalanceAtEpoch(
        uint256 epoch,
        address account,
        uint256 pointer,
        uint256 duration
    ) internal view returns (uint256 balance) {
        (uint256 element, ) = _findValidBalance(account, epoch, pointer, duration);
        Epoch storage _account = _balances[epoch][account];
        unchecked {
            while (element > 0) {
                balance += _account.balances[element];
                element = _account.list.next(element);
            }
        }
        return balance;
    }

    /**
     * @notice Refreshes the balance of an account for a specific epoch.
     * @dev Updates the balances of the account by removing outdated elements
     *      based on the duration and pointer. Shrinks the list of elements if necessary.
     * @param account The address of the account.
     * @param epoch The epoch for which to refresh the balance.
     * @param pointer The current pointer value.
     * @param duration The duration to determine outdated elements.
     */
    function _refreshBalanceAtEpoch(address account, uint256 epoch, uint256 pointer, uint256 duration) private {
        Epoch storage _account = _balances[epoch][account];
        if (_account.list.size() > 0) {
            uint256 element = _account.list.head();
            uint256 balance;
            unchecked {
                while (pointer - element >= duration) {
                    balance += _account.balances[element];
                    element = _account.list.next(element);
                }
            }
            if (balance > 0) {
                _account.list.lazyShrink(element);
                _account.totalBalance -= balance;
            }
        }
    }

    /**
     * @notice Checks if a given epoch is expired.
     * @param epoch The epoch to check for expiration.
     * @return True if the epoch is expired, false otherwise.
     */
    function _expired(uint256 epoch) internal view returns (bool) {
        unchecked {
            (uint256 fromEpoch, ) = _getWindowRage(_pointerProvider());
            if (epoch < fromEpoch) {
                return true;
            }
            return false;
        }
    }

    /**
     * @notice Internal function to update token balances during token transfers with FIFO.
     * @dev Handles various scenarios including minting, burning, and transferring tokens with expiration logic.
     * @param from The address from which tokens are being transferred (or minted/burned).
     * @param to The address to which tokens are being transferred (or burned to if `to` is `zero address`).
     * @param value The amount of tokens being transferred, minted, or burned.
     */
    function _update(uint256 pointer, address from, address to, uint256 value) private {
        if (from == address(0)) {
            // mint token to current epoch.
            uint256 epoch = _getEpoch(pointer);
            Epoch storage _recipient = _balances[epoch][to];
            unchecked {
                _recipient.totalBalance += value;
                _recipient.balances[pointer] += value;
                _worldStateBalances[pointer] += value;
            }
            _recipient.list.insert(pointer);
        } else {
            uint256 blockLengthCache = _getPointersInWindow();
            (uint256 fromEpoch, uint256 toEpoch) = _getWindowRage(pointer);
            _refreshBalanceAtEpoch(from, fromEpoch, pointer, blockLengthCache);
            uint256 balance = _computeBalanceOverEpochRange(fromEpoch, toEpoch, from);
            if (balance < value) {
                revert ERC20InsufficientBalance(from, balance, value);
            }
            uint256 pendingValue = value;
            if (to == address(0)) {
                // burn token from
                while (fromEpoch <= toEpoch && pendingValue > 0) {
                    Epoch storage _spender = _balances[fromEpoch][from];
                    uint256 element = _spender.list.head();
                    while (element > 0 && pendingValue > 0) {
                        balance = _spender.balances[element];
                        if (balance <= pendingValue) {
                            unchecked {
                                pendingValue -= balance;
                                _spender.totalBalance -= balance;
                                _spender.balances[element] -= balance;
                                _worldStateBalances[element] -= balance;
                            }
                            element = _spender.list.next(element);
                            _spender.list.remove(_spender.list.previous(element));
                        } else {
                            unchecked {
                                _spender.totalBalance -= pendingValue;
                                _spender.balances[element] -= pendingValue;
                                _worldStateBalances[element] -= pendingValue;
                            }
                            pendingValue = 0;
                        }
                    }
                    if (pendingValue > 0) {
                        fromEpoch++;
                    }
                }
            } else {
                // Transfer token.
                while (fromEpoch <= toEpoch && pendingValue > 0) {
                    Epoch storage _spender = _balances[fromEpoch][from];
                    Epoch storage _recipient = _balances[fromEpoch][to];
                    uint256 element = _spender.list.head();
                    while (element > 0 && pendingValue > 0) {
                        balance = _spender.balances[element];
                        if (balance <= pendingValue) {
                            unchecked {
                                pendingValue -= balance;
                                _spender.totalBalance -= balance;
                                _spender.balances[element] -= balance;
                                _recipient.totalBalance += balance;
                                _recipient.balances[element] += balance;
                            }
                            _recipient.list.insert(element);
                            element = _spender.list.next(element);
                            _spender.list.remove(_spender.list.previous(element));
                        } else {
                            unchecked {
                                _spender.totalBalance -= pendingValue;
                                _spender.balances[element] -= pendingValue;
                                _recipient.totalBalance += pendingValue;
                                _recipient.balances[element] += pendingValue;
                            }
                            _recipient.list.insert(element);
                            pendingValue = 0;
                        }
                    }
                    if (pendingValue > 0) {
                        fromEpoch++;
                    }
                }
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @notice Finds the index of the first valid block balance in a sorted list of block numbers.
     * A block balance index is considered valid if the difference between the current pointer
     * and the block number at the index (key) is less than the duration.
     * @dev This function is used to determine the first valid block balance index within a sorted circular doubly linked list.
     * It iterates through the list starting from the head and stops when it finds a valid index or reaches the end of the list.
     * @param account The account address.
     * @param epoch The epoch number.
     * @param pointer The current block number.
     * @param duration The maximum allowed difference between pointer and the key.
     * @return element The index of the first valid block balance.
     */
    function _findValidBalance(
        address account,
        uint256 epoch,
        uint256 pointer,
        uint256 duration
    ) internal view returns (uint256 element, uint256 value) {
        SCDLL.List storage list = _balances[epoch][account].list;
        if (list.size() > 0) {
            element = list.head();
            unchecked {
                while (pointer - element >= duration) {
                    element = list.next(element);
                }
            }
            value = _balances[epoch][account].balances[element];
        }
    }

    /**
     * @notice Updates balances and handles token minting, burning, or transferring.
     * @dev This function delegates to the private `_update` function with the current pointer value.
     * @param from The address initiating the action (sender or zero address for minting).
     * @param to The address receiving the tokens (receiver or zero address for burning).
     * @param value The amount of tokens to be transferred, minted, or burned.
     */
    function _update(address from, address to, uint256 value) internal virtual {
        _update(_pointerProvider(), from, to, value);
    }

    /**
     * @notice Updates balances for a transfer at a specific epoch.
     * @dev Ensures balances are updated correctly, traversing epochs if necessary.
     * Reverts if the sender has insufficient balance.
     * @param epoch The epoch for the transfer.
     * @param from The sender's address.
     * @param to The receiver's address.
     * @param value The amount to transfer.
     */
    function _updateAtEpoch(uint256 epoch, address from, address to, uint256 value) internal virtual {
        uint256 duration = _getPointersInWindow();
        (uint256 element, ) = _findValidBalance(from, epoch, _pointerProvider(), duration);
        _refreshBalanceAtEpoch(from, epoch, element, duration);

        Epoch storage _spender = _balances[epoch][from];
        Epoch storage _recipient = _balances[epoch][to];

        uint256 balance = _spender.totalBalance;

        if (balance < value) {
            revert ERC20InsufficientBalance(from, balance, value);
        }

        uint256 pendingValue = value;

        while (element > 0 && pendingValue > 0) {
            balance = _spender.balances[element];
            if (balance <= pendingValue) {
                unchecked {
                    pendingValue -= balance;
                    _spender.totalBalance -= balance;
                    _spender.balances[element] -= balance;
                    _recipient.totalBalance += balance;
                    _recipient.balances[element] += balance;
                }
                _recipient.list.insert(element);
                element = _spender.list.next(element);
                _spender.list.remove(_spender.list.previous(element));
            } else {
                unchecked {
                    _spender.totalBalance -= pendingValue;
                    _spender.balances[element] -= pendingValue;
                    _recipient.totalBalance += pendingValue;
                    _recipient.balances[element] += pendingValue;
                }
                _recipient.list.insert(element);
                pendingValue = 0;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @notice Mints new tokens to a specified account.
     * @dev This function updates the token balance by minting `value` amount of tokens to the `account`.
     * Reverts if the `account` address is zero.
     * @param account The address of the account to receive the minted tokens.
     * @param value The amount of tokens to be minted.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @notice Burns a specified amount of tokens from an account.
     * @dev This function updates the token balance by burning `value` amount of tokens from the `account`.
     * Reverts if the `account` address is zero.
     * @param account The address of the account from which tokens will be burned.
     * @param value The amount of tokens to be burned.
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @notice Spends the specified allowance by reducing the allowance of the spender.
     * @dev This function deducts the `value` amount from the current allowance of the `spender` by the `owner`.
     * If the current allowance is less than `value`, the function reverts with an error.
     * If the current allowance is the maximum `uint256`, the allowance is not reduced.
     * @param owner The address of the token owner.
     * @param spender The address of the spender.
     * @param value The amount of tokens to spend from the allowance.
     */
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

    /**
     * @notice Approves the `spender` to spend `value` tokens on behalf of `owner`.
     * @dev Calls an overloaded `_approve` function with an additional parameter to emit an event.
     * @param owner The address of the token owner.
     * @param spender The address allowed to spend the tokens.
     * @param value The amount of tokens to be approved for spending.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @notice Approves the specified allowance for the spender on behalf of the owner.
     * @dev Sets the allowance of the `spender` by the `owner` to `value`.
     * If `emitEvent` is true, an `Approval` event is emitted.
     * The function reverts if the `owner` or `spender` address is zero.
     * @param owner The address of the token owner.
     * @param spender The address of the spender.
     * @param value The amount of tokens to allow.
     * @param emitEvent Boolean flag indicating whether to emit the `Approval` event.
     */
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

    /**
     * @notice Transfers tokens from one address to another.
     * @dev Moves `value` tokens from `from` to `to`.
     * The function reverts if the `from` or `to` address is zero.
     * @param from The address from which the tokens are transferred.
     * @param to The address to which the tokens are transferred.
     * @param value The amount of tokens to transfer.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @notice Handles token transfer at a specific epoch.
     * @param epoch The epoch for the transfer.
     * @param from The sender's address.
     * @param to The receiver's address.
     * @param value The transfer amount.
     * @dev Reverts if `from` or `to` is the zero address.
     */
    function _transferAtEpoch(uint256 epoch, address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _updateAtEpoch(epoch, from, to, value);
    }

    /**
     * @notice Retrieves the total balance stored at a specific block.
     * @dev This function returns the balance of the given block from the internal `_worldStateBalances` mapping.
     * @param pointer The block number for which the balance is being queried.
     * @return balance The total balance stored at the given block number.
     */
    function getWorldStateBalance(uint256 pointer) external view virtual returns (uint256) {
        return _worldStateBalances[pointer];
    }

    /**
     * @custom:gas-inefficiency if not limit the size of array
     */
    function tokenList(address account, uint256 epoch) external view virtual returns (uint256[] memory list) {
        list = _balances[epoch][account].list.ascending();
    }

    /**
     * @dev See {IERC20Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC20Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC20Metadata-decimals}.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @notice Returns 0 as there is no actual total supply due to token expiration.
     * @dev This function returns the total supply of tokens, which is constant and set to 0.
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public pure virtual returns (uint256) {
        return 0;
    }

    /**
     * @notice Returns the available balance of tokens for a given account.
     * @dev Calculates and returns the available balance based on the frame.
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        uint256 pointer = _pointerProvider();
        (uint256 fromEpoch, uint256 toEpoch) = _getWindowRage(pointer);
        uint256 balance = _computeBalanceAtEpoch(fromEpoch, account, pointer, _getPointersInWindow());
        if (fromEpoch == toEpoch) {
            return balance;
        } else {
            fromEpoch += 1;
        }
        balance += _computeBalanceOverEpochRange(fromEpoch, toEpoch, account);
        return balance;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-transfer}.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address from = _msgSender();
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
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
     * @dev See {IERC7818-balanceOfAtEpoch}.
     */
    function balanceOfAtEpoch(uint256 epoch, address account) external view virtual returns (uint256) {
        uint256 pointer = _pointerProvider();
        (uint256 fromEpoch, uint256 toEpoch) = _getWindowRage(pointer);
        if (epoch < fromEpoch || epoch > toEpoch) {
            return 0;
        }
        if (epoch == fromEpoch) {
            return _computeBalanceAtEpoch(epoch, account, pointer, _getPointersInWindow());
        }
        return _balances[epoch][account].totalBalance;
    }

    /**
     * @dev See {IERC7818-currentEpoch}.
     */
    function currentEpoch() public view virtual returns (uint256) {
        return _getEpoch(_pointerProvider());
    }

    /**
     * @dev See {IERC7818-epochLength}.
     */
    function epochLength() public view virtual returns (uint256) {
        return _getPointersInEpoch();
    }

    /**
     * @dev See {IERC7818-epochType}.
     */
    function epochType() public pure virtual returns (EPOCH_TYPE) {
        return _epochType();
    }

    /**
     * @dev See {IERC7818-validityDuration}.
     */
    function validityDuration() public view virtual returns (uint256) {
        return _getWindowSize();
    }

    /**
     * @dev See {IERC7818-isEpochExpired}.
     */
    function isEpochExpired(uint256 id) public view virtual returns (bool) {
        return _expired(id);
    }

    /**
     * @dev See {IERC7818-transferAtEpoch}.
     */
    function transferAtEpoch(uint256 epoch, address to, uint256 value) public virtual returns (bool) {
        if (_expired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        address owner = _msgSender();
        _transferAtEpoch(epoch, owner, to, value);
        return true;
    }

    /**
     * @dev See {IERC7818-transferFromAtEpoch}.
     */
    function transferFromAtEpoch(uint256 epoch, address from, address to, uint256 value) public virtual returns (bool) {
        if (_expired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transferAtEpoch(epoch, from, to, value);
        return true;
    }

    function _epochType() internal pure virtual returns (EPOCH_TYPE) {}

    function _getEpoch(uint256 pointer) internal view virtual returns (uint256) {}

    function _getWindowRage(uint256 pointer) internal view virtual returns (uint256 fromEpoch, uint256 toEpoch) {}

    function _getWindowSize() internal view virtual returns (uint8) {}

    function _getPointersInEpoch() internal view virtual returns (uint40) {}

    function _getPointersInWindow() internal view virtual returns (uint40) {}

    function _pointerProvider() internal view virtual returns (uint256) {}
}
