// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/AbstractAgreement.sol";

contract MockAgreementBase is AbstractAgreement {
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

    function _verifyAgreement(bytes memory x, bytes memory y) internal pure override returns (bool) {
        return (abi.decode(x, (bool)) && abi.decode(y, (bool)));
    }

    function verifyAgreement(bytes memory x, bytes memory y) public pure returns (bool) {
        return _verifyAgreement(x, y);
    }
}
