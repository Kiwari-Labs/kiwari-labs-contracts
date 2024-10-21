// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/AgreementBase.sol";

contract MockAgreementBase is AgreementBase {
    constructor(string memory name) AgreementBase(name) {}

    function bumpMajorVersion() public {
        _bumpMajorVersion();
    }

    function bumpMinorVersion() public {
        _bumpMinorVersion();
    }

    function bumpPatchVersion() public {
        _bumpPatchVersion();
    }

    function _verifyAgreement(bytes memory x, bytes memory y) internal pure override returns (bool) {
        return (abi.decode(x, (bool)) && abi.decode(y, (bool)));
    }

    function verifyAgreement(bytes memory x, bytes memory y) public returns (bool) {
        return _verifyAgreement(x, y);
    }
}
