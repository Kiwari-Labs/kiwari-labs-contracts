// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SlidingWindow} from "../../utils/algorithms/SlidingWindow.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

abstract contract ERC7818B is EIP712, Nonces, IERC20Errors, IERC20Metadata, IERC20Permit, IERC7818 {
    using SlidingWindow for SlidingWindow.Window;

    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    string private _name;
    string private _symbol;
    uint256 private _issuedSupply;

    SlidingWindow.Window private _Window;

    mapping(uint256 => uint256) private _epochBalances;
    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Minted(uint256 indexed epoch, uint256 amount);
    event Burned(uint256 indexed epoch, uint256 amount);

    error ERC2612ExpiredSignature(uint256 deadline);
    error ERC2612InvalidSigner(address signer, address owner);

    constructor(string memory name_, string memory symbol_, uint256 init_, uint40 duration_, uint8 size_, bool safe_) EIP712(name_, "1") {
        _name = name_;
        _symbol = symbol_;
        _Window.setup(init_, duration_, size_, safe_);
    }

    function getBalanceOverIndex(uint256 head, uint256 tail, address account) internal view returns (uint256 balance) {
        if (account == address(0)) {
            while (head < tail) {
                balance += _epochBalances[head];
                head++;
            }
        } else {
            while (head < tail) {
                balance += _balances[head][account];
                head++;
            }
        }
    }

    function _approve(address owner, address spender, uint256 amount, bool emitted) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }

        _allowances[owner][spender] = amount;

        if (emitted) {
            emit Approval(owner, spender, amount);
        }
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = _allowances[owner][spender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, amount);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - amount, false);
            }
        }
    }

    function _transfer(address from, address to, uint256 amount) internal {
        _beforeTokenTransfer(from, to, amount);

        (uint256 head, uint256 tail) = _Window.indexRange(block.number);
        uint256 fromBalance = getBalanceOverIndex(head, tail, from);
        if (fromBalance < amount) {
            revert ERC20InsufficientBalance(from, fromBalance, amount);
        }
        uint256 value = amount;
        while (amount > 0 && head < tail) {
            uint256 epochBalance = _balances[head][from];

            if (epochBalance > 0) {
                uint256 transferFromEpoch = epochBalance < amount ? epochBalance : amount;

                unchecked {
                    _balances[head][from] -= transferFromEpoch;
                    _balances[head][to] += transferFromEpoch;
                    amount -= transferFromEpoch;
                }
            }

            head++;
        }

        emit Transfer(from, to, value);

        _afterTokenTransfer(from, to, value);
    }

    function _transferAtEpoch(uint256 epoch, address from, address to, uint256 amount) internal {
        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[epoch][from];
        if (fromBalance < amount) {
            revert ERC20InsufficientBalance(from, fromBalance, amount);
        }
        unchecked {
            _balances[epoch][from] = fromBalance - amount;
            _balances[epoch][to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(uint256 epoch, address to, uint256 amount) internal {
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _beforeTokenTransfer(address(0), to, amount);

        _issuedSupply += amount;
        unchecked {
            _balances[epoch][to] += amount;
            _epochBalances[epoch] += amount;
        }

        emit Transfer(address(0), to, amount);

        emit Minted(epoch, amount);

        _afterTokenTransfer(address(0), to, amount);
    }

    function _burn(uint256 epoch, address from, uint256 amount) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _beforeTokenTransfer(from, address(0), amount);

        uint256 accountBalance = _balances[epoch][from];
        if (accountBalance < amount) {
            revert ERC20InsufficientBalance(from, accountBalance, amount);
        }
        _issuedSupply -= amount;
        unchecked {
            _balances[epoch][from] = accountBalance - amount;
            _epochBalances[epoch] -= amount;
        }

        emit Transfer(from, address(0), amount);

        emit Burned(epoch, amount);

        _afterTokenTransfer(from, address(0), amount);
    }

    /// @dev See {IERC20.allowance}.
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /// @dev See {IERC20Metadata.name}.
    function name() public view override returns (string memory) {
        return _name;
    }

    /// @dev See {IERC20Metadata.symbol}.
    function symbol() public view override returns (string memory) {
        return _symbol;
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
        (uint256 head, uint256 tail) = _Window.indexRange(block.number);
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

        return _balances[epoch][account];
    }

    /// @dev See {IERC7818.currentEpoch}.
    function currentEpoch() public view override returns (uint256) {
        return _Window.indexFor(block.number);
    }

    /// @dev See {IERC7818.epochLength}.
    function epochLength() public view override returns (uint256) {
        return _Window.duration();
    }

    /// @dev See {IERC7818.epochType}.
    function epochType() public pure override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED; // default
    }

    /// @dev See {IERC7818.validityDuration}.
    function validityDuration() public view override returns (uint256) {
        return _Window.size();
    }

    /// @dev See {IERC7818.isEpochExpired}.
    function isEpochExpired(uint256 epoch) public view override returns (bool) {
        uint256 current = currentEpoch();
        return current >= epoch + _Window.size();
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
        (uint256 head, uint256 tail) = _Window.indexRange(block.number);
        return getBalanceOverIndex(head, tail, address(0));
    }

    function expiredSupply() public view returns (uint256) {
        return issuedSupply() - circulateSupply();
    }

    function issuedSupply() public view returns (uint256) {
        return _issuedSupply;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}
