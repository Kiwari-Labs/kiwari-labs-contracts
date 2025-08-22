// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20TLSW} from "../../../../../../contracts/tokens/ERC20/ERC20TLSW.sol";
import {ERC7818Exception} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Exception.sol";
import {IERC7818} from "../../../../../../contracts/tokens/ERC20/interfaces/IERC7818.sol";

contract MockERC7818ExceptionTLSW is ERC20TLSW, ERC7818Exception {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC20TLSW(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override(ERC20EXPBase, ERC20TLSW) returns (EPOCH_TYPE) {
        return super.epochType();
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint256) {
        return super._pointerProvider();
    }

    function balanceOf(address account) public view virtual override(IERC20, ERC20EXPBase, ERC7818Exception) returns (uint256) {
        return super.balanceOf(account);
    }

    function transfer(address to, uint256 value) public virtual override(IERC20, ERC20EXPBase, ERC7818Exception) returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override(IERC20, ERC20EXPBase, ERC7818Exception) returns (bool) {
        return super.transferFrom(from, to, value);
    }

    function transferAtEpoch(
        uint256 epoch,
        address to,
        uint256 value
    ) public virtual override(IERC7818, ERC20EXPBase, ERC7818Exception) returns (bool) {
        return super.transferAtEpoch(epoch, to, value);
    }

    function transferFromAtEpoch(
        uint256 epoch,
        address from,
        address to,
        uint256 value
    ) public virtual override(IERC7818, ERC20EXPBase, ERC7818Exception) returns (bool) {
        return super.transferFromAtEpoch(epoch, from, to, value);
    }

    function addToException(address account) public {
        _addToExceptionList(account);
    }

    function removeFromException(address account) public {
        _removeFromExceptionList(account);
    }

    function exceptionTokenTransfer(address to, uint256 value) public {
        address sender = _msgSender();
        _updateExceptionBalance(sender, to, value);
    }

    function mintToException(address to, uint256 value) public {
        _mintToException(to, value);
    }

    function burnFromException(address to, uint256 value) public {
        _burnFromException(to, value);
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }
}
