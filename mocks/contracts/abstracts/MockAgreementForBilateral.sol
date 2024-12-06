// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/AbstractAgreement.sol";

contract MockAgreementBaseForBilateral is AbstractAgreement {
    constructor(string memory name) AbstractAgreement(name) {}

    function bumpMajorVersion() public {
        _bumpMajorVersion();
    }

    function bumpMinorVersion() public {
        _bumpMinorVersion();
    }

    function bumpPatchVersion() public {
        _bumpPatchVersion();
    }

    function _verifyAgreement(bytes memory x, bytes memory y) internal override returns (bool) {
        (address tokenA, uint256 amountA) = abi.decode(x, (address, uint256));
        (address tokenB, uint256 amountB) = abi.decode(y, (address, uint256));
        return tokenA != tokenB;
    }

    function verifyAgreement(bytes memory x, bytes memory y) public returns (bool) {
        return _verifyAgreement(x, y);
    }
}
