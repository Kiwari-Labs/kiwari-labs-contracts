// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/ICampaignBase.sol";
// import "../intefaces/IValidation.sol"; 

abstract contract CampaignBase is ICampaignBase {

    ICampaignBase private _state;

    /// @dev burn or transferFrom from given account
    function redeem(address account, uint256 value, bytes memory encodeData) public virtual returns (bool) {}

    /// @dev mint or transfer token to given account
    function reward(address account, uint256 value, bytes memory encodeData) public virtual returns (bool) {}

}
