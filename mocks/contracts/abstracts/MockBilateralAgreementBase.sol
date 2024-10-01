// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/BilateralAgreementBase.sol";

contract MockBilateralAgreementBase is BilateralAgreementBase {
    constructor(address[2] memory party, IAgreement implementation) BilateralAgreementBase(party, implementation) {}
}
