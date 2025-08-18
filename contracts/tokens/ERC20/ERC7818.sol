// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC7818 bulk expiration.
 * @author Kiwari Labs
 * modified from @openzeppelin/contracts v4.9.0 and v5.0.2
 */

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

abstract contract ERC7818B is EIP712, Nonces, IERC20Errors, IERC20Metadata, IERC20Permit, IERC7818 {
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    struct Window {
        uint256 blockNumber;
        uint8 size;
        uint40 indexDuration;
    }

    string private m_name;
    string private m_symbol;
    uint256 private m_issuedSupply;

    Window private m_Window;

    mapping(uint256 => uint256) private m_epochBalances;
    mapping(uint256 => mapping(address => uint256)) private m_balances;
    mapping(address => mapping(address => uint256)) private m_allowances;

    event Minted(uint256 indexed epoch, uint256 amount);
    event Burned(uint256 indexed epoch, uint256 amount);

    error ERC2612ExpiredSignature(uint256 deadline);
    error ERC2612InvalidSigner(address signer, address owner);

    constructor(string memory t_name, string memory t_symbol, Window memory t_Window) EIP712(t_name, "1") {
        m_name = t_name;
        m_symbol = t_symbol;
        m_Window = t_Window;

        // m_Window.blockNumber = block.number;
        // m_Window.size = 4;
        // m_Window.indexDuration = 1;
    }

    function getEpoch(uint256 t_initBlockNumber, uint256 t_blockNumber, uint256 t_duration) internal pure returns (uint256 epoch) {
        assembly ("memory-safe") {
            if and(gt(t_blockNumber, t_initBlockNumber), gt(t_initBlockNumber, 0)) {
                epoch := div(sub(t_blockNumber, t_initBlockNumber), t_duration)
            }
        }
    }

    function getWindow(
        uint256 t_initBlockNumber,
        uint256 t_blockNumber,
        uint256 t_duration,
        uint256 t_windowSize
    ) private pure returns (uint256 head, uint256 tail) {
        assembly ("memory-safe") {
            if and(gt(t_blockNumber, t_initBlockNumber), gt(t_initBlockNumber, 0)) {
                tail := div(sub(t_blockNumber, t_initBlockNumber), t_duration)
                let temp := add(tail, 1)
                head := mul(sub(temp, t_windowSize), iszero(lt(temp, t_windowSize)))
            }
        }
    }

    function getEpoch(uint256 t_blockNumber) internal view returns (uint256) {
        Window memory window = m_Window;
        return getEpoch(window.indexDuration, t_blockNumber, window.indexDuration);
    }

    function getWindow() internal view returns (uint256, uint256) {
        Window memory window = m_Window;
        return getWindow(window.blockNumber, block.number, window.indexDuration, window.size);
    }

    function getBalanceOverIndex(uint256 t_head, uint256 t_tail, address t_account) internal view returns (uint256 balance) {
        if (t_account == address(0)) {
            while (t_head < t_tail) {
                balance += m_epochBalances[t_head];
                t_head++;
            }
        } else {
            while (t_head < t_tail) {
                balance += m_balances[t_head][t_account];
                t_head++;
            }
        }
    }

    function _approve(address t_owner, address t_spender, uint256 t_amount, bool t_emitted) internal virtual {
        if (t_owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (t_spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }

        m_allowances[t_owner][t_spender] = t_amount;

        if (t_emitted) {
            emit Approval(t_owner, t_spender, t_amount);
        }
    }

    function _spendAllowance(address t_owner, address t_spender, uint256 t_amount) internal virtual {
        uint256 currentAllowance = m_allowances[t_owner][t_spender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < t_amount) {
                revert ERC20InsufficientAllowance(t_spender, currentAllowance, t_amount);
            }
            unchecked {
                _approve(t_owner, t_spender, currentAllowance - t_amount, false);
            }
        }
    }

    function _transfer(address t_from, address t_to, uint256 t_amount) internal {
        _beforeTokenTransfer(t_from, t_to, t_amount);

        (uint256 head, uint256 tail) = getWindow();
        uint256 fromBalance = getBalanceOverIndex(head, tail, t_from);
        if (fromBalance < t_amount) {
            revert ERC20InsufficientBalance(t_from, fromBalance, t_amount);
        }
        uint256 amount = t_amount;
        while (t_amount > 0 && head < tail) {
            uint256 epochBalance = m_balances[head][t_from];

            if (epochBalance > 0) {
                uint256 transferFromEpoch = epochBalance < t_amount ? epochBalance : t_amount;

                unchecked {
                    m_balances[head][t_from] -= transferFromEpoch;
                    m_balances[head][t_to] += transferFromEpoch;
                    t_amount -= transferFromEpoch;
                }
            }

            head++;
        }

        emit Transfer(t_from, t_to, amount);

        _afterTokenTransfer(t_from, t_to, amount);
    }

    function _transferAtEpoch(uint256 t_epoch, address t_from, address t_to, uint256 t_amount) internal {
        _beforeTokenTransfer(t_from, t_to, t_amount);

        uint256 fromBalance = m_balances[t_epoch][t_from];
        if (fromBalance < t_amount) {
            revert ERC20InsufficientBalance(t_from, fromBalance, t_amount);
        }
        unchecked {
            m_balances[t_epoch][t_from] = fromBalance - t_amount;
            m_balances[t_epoch][t_to] += t_amount;
        }

        emit Transfer(t_from, t_to, t_amount);

        _afterTokenTransfer(t_from, t_to, t_amount);
    }

    function _mint(uint256 t_epoch, address t_to, uint256 t_amount) internal {
        if (t_to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _beforeTokenTransfer(address(0), t_to, t_amount);

        m_issuedSupply += t_amount;
        unchecked {
            m_balances[t_epoch][t_to] += t_amount;
            m_epochBalances[t_epoch] += t_amount;
        }

        emit Transfer(address(0), t_to, t_amount);

        emit Minted(t_epoch, t_amount);

        _afterTokenTransfer(address(0), t_to, t_amount);
    }

    function _burn(uint256 t_epoch, address t_from, uint256 t_amount) internal {
        if (t_from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _beforeTokenTransfer(t_from, address(0), t_amount);

        uint256 accountBalance = m_balances[t_epoch][t_from];
        if (accountBalance < t_amount) {
            revert ERC20InsufficientBalance(t_from, accountBalance, t_amount);
        }
        m_issuedSupply -= t_amount;
        unchecked {
            m_balances[t_epoch][t_from] = accountBalance - t_amount;
            m_epochBalances[t_epoch] -= t_amount;
        }

        emit Transfer(t_from, address(0), t_amount);

        emit Burned(t_epoch, t_amount);

        _afterTokenTransfer(t_from, address(0), t_amount);
    }

    /// @dev See {IERC20.allowance}.
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return m_allowances[owner][spender];
    }

    /// @dev See {IERC20Metadata.name}.
    function name() public view override returns (string memory) {
        return m_name;
    }

    /// @dev See {IERC20Metadata.symbol}.
    function symbol() public view override returns (string memory) {
        return m_symbol;
    }

    /// @dev See {IERC20Metadata.decimals}.
    function decimals() public pure virtual override returns (uint8) {
        return 18;
    }

    /// @dev See {IERC20Permit.nonces}.
    function nonces(address owner) public view virtual override(IERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    /// @dev See {IERC20Permit.DOMAIN_SEPARATOR}.
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view virtual override returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @dev See {IERC20.approve}.
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(msg.sender, spender, amount, true);

        return true;
    }

    /// @dev See {IERC20Permit.permit}.
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual override {
        if (block.timestamp > deadline) {
            revert ERC2612ExpiredSignature(deadline);
        }

        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline));

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        if (signer != owner) {
            revert ERC2612InvalidSigner(signer, owner);
        }

        _approve(owner, spender, value, true);
    }

    /// @custom:override IERC20.totalSupply behavior with IERC7818.totalSupply behavior.
    /// @dev See {IERC7818.totalSupply}.
    function totalSupply() public pure override returns (uint256) {
        return 0;
    }

    /// @custom:override IERC20.balanceOf behavior with IERC7818.balanceOf behavior.
    /// @dev See {IERC7818.balanceOf}.
    function balanceOf(address account) public view override returns (uint256) {
        (uint256 head, uint256 tail) = getWindow();
        return getBalanceOverIndex(head, tail, account);
    }

    /// @custom:override IERC20.transfer behavior with IERC7818.transfer behavior.
    /// @dev See {IERC7818.transfer}.
    function transfer(address to, uint256 amount) public override returns (bool) {
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _transfer(msg.sender, to, amount);

        return true;
    }

    /// @custom:override IERC20.transferFrom behavior with IERC7818.transferFrom behavior.
    /// @dev See {IERC7818.transferFrom}.
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (from == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);

        return true;
    }

    /// @dev See {IERC7818.balanceOfAtEpoch}.
    function balanceOfAtEpoch(uint256 epoch, address account) public view override returns (uint256) {
        if (isEpochExpired(epoch)) {
            return 0;
        }

        return m_balances[epoch][account];
    }

    /// @dev See {IERC7818.currentEpoch}.
    function currentEpoch() public view override returns (uint256) {
        return getEpoch(m_Window.blockNumber, block.number, m_Window.indexDuration);
    }

    /// @dev See {IERC7818.epochLength}.
    function epochLength() public view override returns (uint256) {
        return m_Window.indexDuration;
    }

    /// @dev See {IERC7818.epochType}.
    function epochType() public pure override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    /// @dev See {IERC7818.validityDuration}.
    function validityDuration() public view override returns (uint256) {
        return m_Window.size;
    }

    /// @dev See {IERC7818.isEpochExpired}.
    function isEpochExpired(uint256 epoch) public view override returns (bool) {
        uint256 current = currentEpoch();

        return current >= epoch + m_Window.size;
    }

    /// @dev See {IERC7818.transferAtEpoch}.
    function transferAtEpoch(uint256 epoch, address to, uint256 amount) public override returns (bool) {
        if (isEpochExpired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }

        _transferAtEpoch(epoch, msg.sender, to, amount);

        return true;
    }

    /// @dev See {IERC7818.transferFromAtEpoch}.
    function transferFromAtEpoch(uint256 epoch, address from, address to, uint256 amount) public override returns (bool) {
        if (isEpochExpired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }
        if (from == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }

        _spendAllowance(from, msg.sender, amount);
        _transferAtEpoch(epoch, from, to, amount);

        return true;
    }

    function circulateSupply() public view returns (uint256) {
        (uint256 head, uint256 tail) = getWindow();
        return getBalanceOverIndex(head, tail, address(0));
    }

    function expiredSupply() public view returns (uint256) {
        return issuedSupply() - circulateSupply();
    }

    function issuedSupply() public view returns (uint256) {
        return m_issuedSupply;
    }

    function _beforeTokenTransfer(address t_from, address t_to, uint256 t_amount) internal virtual {}

    function _afterTokenTransfer(address t_from, address t_to, uint256 t_amount) internal virtual {}
}
