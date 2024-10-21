// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC20EXP Whitelist extension contract
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC20EXPWhitelist is ERC20EXPBase {
    /// @notice Struct to define balance infomation for each minter
    struct Whitelist {
        uint256 _spendableBalances;
        uint256 _unspendableBalances;
    }

    /// @notice Mapping whitelist address
    mapping(address => bool) private _whitelist;
    /// @notice Mapping from whitelist address to their whitelist balance details
    mapping(address => Whitelist) private _balances;

    /// @notice Custom error definitions
    error InvalidWhitelistAddress();
    error NotExistInWhitelist();
    error ExistInWhitelist();

    /// @notice Events
    event WhitelistGranted(address indexed caller, address indexed whitelist);
    event WhitelistRevoked(address indexed caller, address indexed whitelist);

    /// @notice Updates the spendable balance by either minting or burning non-expirable tokens.
    /// @dev This function handles the minting of tokens to the `to` address if `from` is the zero address,
    /// and burning of tokens from the `from` address if `from` is not the zero address. It also updates
    /// the spendable balance for both the `from` and `to` addresses accordingly.
    /// @param from The address of the account from which tokens are being transferred or burned. If `from` is the zero address, tokens are minted to the `to` address.
    /// @param to The address of the account to which tokens are being transferred or minted.
    /// @param value The amount of tokens to be transferred, minted, or burned.
    function _updateSpendableBalance(address from, address to, uint256 value) internal {
        unchecked {
            uint256 balanceFrom = _balances[from]._spendableBalances;
            if (from == address(0)) {
                // mint non-expirable token to spendable balance.
                _balances[to]._spendableBalances += value;
            } else if (to == address(0)) {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                _balances[from]._spendableBalances -= value;
            } else {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                // burn non-expirable token from spendable balance.
                _balances[from]._spendableBalances -= value;
                // update non-expirable token from and to spendable balance.
                _balances[to]._spendableBalances += value;
            }
        }
        emit Transfer(from, to, value);
    }

    /// @notice Updates the unspendable balance by either minting or burning non-expirable tokens.
    /// @dev This function handles the minting of tokens to the `to` address if `from` is the zero address,
    /// and burning of tokens from the `from` address if `from` is not the zero address. It also updates
    /// the unspendable balance for both the `from` and `to` addresses accordingly.
    /// @param from The address of the account from which tokens are being transferred or burned. If `from` is the zero address, tokens are minted to the `to` address.
    /// @param to The address of the account to which tokens are being transferred or minted.
    /// @param value The amount of tokens to be transferred, minted, or burned.
    function _updateUnspendableBalance(address from, address to, uint256 value) internal {
        unchecked {
            uint256 balanceFrom = _balances[from]._unspendableBalances;
            if (from == address(0)) {
                // mint non-expirable token to unspendable balance.
                _balances[to]._unspendableBalances += value;
            } else if (to == address(0)) {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                _balances[from]._unspendableBalances -= value;
            } else {
                if (balanceFrom < value) {
                    revert ERC20InsufficientBalance(from, balanceFrom, value);
                }
                // burn non-expirable token from unspendable balance.
                _balances[from]._unspendableBalances -= value;
                // update non-expirable token from and to unspendable balance.
                _balances[to]._unspendableBalances += value;
            }
        }
        emit Transfer(from, to, value);
    }

    /// @notice Always returns 0 for non-wholesale accounts.
    /// @dev Returns the available balance for the given account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param unsafe Flag to select the balance type:
    /// - `false`: Returns the spendable balance only.
    /// - `true`: Includes the unspendable balance token balance.
    /// @return balance The available balance based on the selected type.
    function _unSafeBalanceOf(address account, bool unsafe) internal view returns (uint256 balance) {
        unchecked {
            Whitelist memory balanceInfo = _balances[account];
            if (unsafe) {
                balance += balanceInfo._spendableBalances;
                balance += balanceInfo._unspendableBalances;
            } else {
                balance += balanceInfo._spendableBalances;
            }
        }
    }

    /// @notice Only allows burning non-expirable tokens from whitelist accounts.
    /// @dev Directly burns tokens from a whitelist account.
    /// @param to The address of the whitelist account from which tokens will be burned.
    /// @param value The amount of tokens to burn.
    /// @param spendable Set to true to burn tokens from spendable balance, false to burn from unspendable balance.
    function _burnWhitelist(address to, uint256 value, bool spendable) internal virtual {
        if (_whitelist[to]) {
            if (spendable) {
                _updateSpendableBalance(to, address(0), value);
            } else {
                _updateUnspendableBalance(to, address(0), value);
            }
        } else {
            revert InvalidWhitelistAddress();
        }
    }

    /// @notice Cannot mint expirable tokens to whitelist accounts.
    /// @dev Mints new tokens directly to a retail account.
    /// @param to The address of the retail account receiving the minted tokens.
    /// @param value The amount of tokens to mint.
    /// @param spendable Set to true to mint tokens to spendable balance, false to mint to unspendable balance.
    function _mintWhitelist(address to, uint256 value, bool spendable) internal virtual {
        if (_whitelist[to]) {
            if (spendable) {
                _updateSpendableBalance(address(0), to, value);
            } else {
                _updateUnspendableBalance(address(0), to, value);
            }
        } else {
            revert InvalidWhitelistAddress();
        }
    }

    /// @notice Adds an address to the whitelist.
    /// @dev Grants whitelist status to the specified address.
    /// @param account The address to whitelist.
    function _grantWhitelist(address account) internal virtual {
        if (_whitelist[account]) {
            revert ExistInWhitelist();
        } else {
            address caller = _msgSender();
            _whitelist[account] = true;
            emit WhitelistGranted(caller, account);
        }
    }

    /// @notice Revokes whitelist status from an account and burns any associated tokens.
    /// @dev Removes the account from the whitelist and burns its spendable and unspendable balances.
    /// @param account The address of the account to revoke whitelist status from.
    function _revokeWhitelist(address account) internal virtual {
        if (_whitelist[account]) {
            address caller = _msgSender();
            Whitelist memory balanceInfo = _balances[account];
            if (balanceInfo._spendableBalances > 0) {
                _burnWhitelist(account, balanceInfo._spendableBalances, true);
            }
            if (balanceInfo._unspendableBalances > 0) {
                _burnWhitelist(account, balanceInfo._unspendableBalances, false);
            }
            _whitelist[account] = false;
            emit WhitelistRevoked(caller, account);
        } else {
            revert NotExistInWhitelist();
        }
    }

    /// @notice Performs a custom token transfer operation using safe balanceOf for calculating available balances.
    /// @custom:inefficientgasusedappetite Emits 2 transfer events which may result in inefficient gas usage.
    /// @param from The address from which tokens are being transferred.
    /// @param to The address to which tokens are being transferred.
    /// @param value The amount of tokens being transferred.
    function _transferHandler(address from, address to, uint256 value) internal {
        // hook before transfer
        _beforeTokenTransfer(from, to, value);
        uint256 selector = (_whitelist[from] ? 2 : 0) | (_whitelist[to] ? 1 : 0);
        if (selector == 0) {
            _transfer(from, to, value);
        } else if (selector == 1) {
            // consolidate by burning non whitelist balance and mint non-expirable to whitelist unspendable balance.
            _burn(from, value);
            _mintWhitelist(to, value, false);
        } else if (selector == 2) {
            // consolidate by burning whitelist spendable balance and mint expirable to retail balance.
            _burnWhitelist(from, value, true);
            _mint(to, value);
        } else {
            // wholesale to wholesale transfer only use spendable balance.
            _updateSpendableBalance(from, to, value);
        }

        // hook after transfer
        _afterTokenTransfer(from, to, value);
    }

    /// @inheritdoc IERC20
    function balanceOf(address account) public view override returns (uint256) {
        if (_whitelist[account]) {
            return _unSafeBalanceOf(account, true);
        } else {
            return super.balanceOf(account);
        }
    }

    /// @inheritdoc IERC20
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address from = _msgSender();
        _transferHandler(from, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transferHandler(from, to, value);
        return true;
    }

    /// @dev Checks if the given address is a whitelist account.
    /// @param account The address to check.
    /// @return bool Returns true if the address is a whitelist account, false otherwise.
    function whitelist(address account) external view returns (bool) {
        return _whitelist[account];
    }
}
