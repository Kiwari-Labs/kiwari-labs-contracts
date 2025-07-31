// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC7818 Exception extension
 * @author Kiwari Labs
 */

import {ERC20EXPBase} from "../ERC20EXPBase.sol";

abstract contract ERC7818Exception is ERC20EXPBase {
    /**
     * @notice Emitted when an address is added to the exception
     * @param caller Operate by the address
     * @param account The address that was exception
     */
    event AddedToExceptionList(address indexed caller, address indexed account);

    /**
     * @notice Emitted when an address is removed from the exception
     * @param caller Operate by the address
     * @param account The address that was removed from the exception
     */
    event RemovedFromExceptionList(address indexed caller, address indexed account);

    /**
     * @notice Custom error definitions
     */
    error InvalidExceptionAddress();
    error NotExistInExceptionList();
    error ExistInExceptionList();
    error ExceptionAddressNotSupportTransferAtEpoch();
    error ExceptionAddressNotSupportTransferFromAtEpoch();

    /**
     * @notice Mapping exception address
     */
    mapping(address => bool) private _exceptionList;

    /**
     * @notice Mapping from exception address to their balance
     */
    mapping(address => uint256) private _balances;

    /**
     * @notice Updates the balance by either minting or burning non-expirable tokens.
     * @dev This function handles the minting of tokens to the `to` address if `from` is the zero address,
     * and burning of tokens from the `from` address if `from` is not the zero address. It also updates
     * the balance for both the `from` and `to` addresses accordingly.
     * @param from The address of the account from which tokens are being transferred or burned. If `from` is the zero address, tokens are minted to the `to` address.
     * @param to The address of the account to which tokens are being transferred or minted.
     * @param value The amount of tokens to be transferred, minted, or burned.
     */
    function _updateExceptionBalance(address from, address to, uint256 value) internal {
        unchecked {
            uint256 balanceFrom = _balances[from];
            if (from == address(0)) {
                // mint non-expirable token `to` balance.
                _balances[to] += value;
            } else if (to == address(0)) {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                _balances[from] -= value;
            } else {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                // burn non-expirable token `from`balance.
                _balances[from] -= value;
                // update non-expirable token `from` and `to` balance.
                _balances[to] += value;
            }
        }
        emit Transfer(from, to, value);
    }

    /**
     * @notice Only allows burning non-expirable tokens from exception accounts.
     * @dev Directly burns tokens from a exception account.
     * @param to The address of the exception account from which tokens will be burned.
     * @param value The amount of tokens to burn.
     */
    function _burnFromException(address to, uint256 value) internal virtual {
        if (_exceptionList[to]) {
            _updateExceptionBalance(to, address(0), value);
        } else {
            revert InvalidExceptionAddress();
        }
    }

    /**
     * @notice Cannot mint expirable tokens to exception accounts.
     * @dev Mints new tokens directly to a retail account.
     * @param to The address of the retail account receiving the minted tokens.
     * @param value The amount of tokens to mint.
     */
    function _mintToException(address to, uint256 value) internal virtual {
        if (_exceptionList[to]) {
            _updateExceptionBalance(address(0), to, value);
        } else {
            revert InvalidExceptionAddress();
        }
    }

    /**
     * @notice Adds an address to the exception.
     * @dev Grants exception status to the specified address.
     * @param account The address to exception.
     */
    function _addToExceptionList(address account) internal virtual {
        if (_exceptionList[account]) {
            revert ExistInExceptionList();
        } else {
            address caller = _msgSender();
            _exceptionList[account] = true;
            emit AddedToExceptionList(caller, account);
        }
    }

    /**
     * @notice Revokes exception status from an account and burns any associated tokens.
     * @dev Removes the account from the exception and burns its balances.
     * @param account The address of the account to revoke exception status from.
     */
    function _removeFromExceptionList(address account) internal virtual {
        if (_exceptionList[account]) {
            address caller = _msgSender();
            uint256 accountBalance = _balances[account];

            if (accountBalance > 0) {
                _burnFromException(account, accountBalance);
            }
            _exceptionList[account] = false;
            emit RemovedFromExceptionList(caller, account);
        } else {
            revert NotExistInExceptionList();
        }
    }

    /**
     * @notice Performs a custom token transfer operation using safe balanceOf for calculating available balances.
     * @custom:gas-inefficiency Emits 2 transfer events which may result in inefficient gas usage.
     * @param from The address from which tokens are being transferred.
     * @param to The address to which tokens are being transferred.
     * @param value The amount of tokens being transferred.
     */
    function _transferHandler(address from, address to, uint256 value) internal virtual {
        uint256 selector = (_exceptionList[from] ? 2 : 0) | (_exceptionList[to] ? 1 : 0);
        if (selector == 0) {
            _transfer(from, to, value);
        } else if (selector == 1) {
            // consolidate by burning non exception balance and mint non-expirable to exception balance.
            _burn(from, value);
            _mintToException(to, value);
        } else if (selector == 2) {
            // consolidate by burning exception balance and mint expirable to retail balance.
            _burnFromException(from, value);
            _mint(to, value);
        } else {
            // wholesale to wholesale transfer only use exception balance.
            _updateExceptionBalance(from, to, value);
        }
    }

    function _transferAtEpochHandler(address from, address to, uint256 value, uint256 epoch) internal virtual {
        if (_exceptionList[to]) {
            _updateAtEpoch(epoch, from, address(0), value);
            _mintToException(to, value);
        } else {
            _transferAtEpoch(epoch, from, to, value);
        }
    }

    /**
     * @dev Checks if the given address is a exception account.
     * @param account The address to check.
     * @return bool Returns true if the address is a exception account, false otherwise.
     */
    function isExceptionAddress(address account) external view returns (bool) {
        return _exceptionList[account];
    }

    /**
     * @dev See {IERC20-balanceOf}
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        if (_exceptionList[account]) {
            return _balances[account];
        } else {
            return super.balanceOf(account);
        }
    }

    /**
     * @dev See {IERC7818-transferAtEpoch}.
     */
    function transferAtEpoch(uint256 epoch, address to, uint256 value) public virtual override returns (bool) {
        address owner = _msgSender();

        if (_exceptionList[owner]) {
            revert ExceptionAddressNotSupportTransferAtEpoch();
        }

        if (_expired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }

        _transferAtEpochHandler(owner, to, value, epoch);
        return true;
    }

    /**
     * @dev See {IERC7818-transferFromAtEpoch}.
     */
    function transferFromAtEpoch(uint256 epoch, address from, address to, uint256 value) public virtual override returns (bool) {
        if (_exceptionList[from]) {
            revert ExceptionAddressNotSupportTransferFromAtEpoch();
        }

        if (_expired(epoch)) {
            revert ERC7818TransferredExpiredToken();
        }

        address spender = _msgSender();

        _spendAllowance(from, spender, value);
        _transferAtEpochHandler(from, to, value, epoch);

        return true;
    }

    /**
     * @dev See {IERC20-transfer}
     */
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address from = _msgSender();
        _transferHandler(from, to, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}
     */
    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transferHandler(from, to, value);
        return true;
    }
}
