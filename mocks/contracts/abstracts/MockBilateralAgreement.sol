// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/AbstractBilateralAgreement.sol";

contract MockBilateralAgreementBase is AbstractBilateralAgreement {
    constructor(address[2] memory party, IAgreement implementation) AbstractBilateralAgreement(party, implementation) {}
}
