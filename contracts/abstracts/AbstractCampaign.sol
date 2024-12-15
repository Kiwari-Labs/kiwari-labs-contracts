// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/ICampaignBase.sol";
// import "../intefaces/IValidation.sol";

abstract contract CampaignBase is ICampaignBase {
    enum CAMPAIGN_TYPE {
        EARN,
        BURN
    }

    bool private _init;

    struct CampaingInfo {
        CAMPAIGN_TYPE types;
        bool status;
        uint32 estimateParticipate;
        uint32 actualParticipate;
        uint256 totalSupply; // total budget for the campaign zero for no limit?
        uint256 startBlock;
        uint56 validFor; // wrost case blocktime is 100ms and campaign validfor 10 years
        uint256 rewardAmount;
        address rewardToken;
        string uri; // campaign metadata
        // IValidation implementation; // the reward logic or something.
        // e.g. (mapping => bool) participate
    }

    /// @dev burn or transferFrom from given account
    function _redeem(address account, uint256 value) internal virtual returns (bool) {
        // function _redeem(address account, uint256 value, bytes memory encodeData) internal virtual returns (bool) {
        // address campaignValidationLogic = campaign[campaignId].implementation;
        // (bool redemtion) = IValidate(campaignValidationLogic).validation(encodedeta);
        // if (redemtion) {
        //  ... some logic
        // }
        // actualParticipate++;
    }

    /// @dev mint or transfer token to given account
    function _reward(address account, uint256 value) internal virtual returns (bool) {
        // function _reward(address account, uint256 value, bytes memory encodeData) internal virtual returns (bool) {
        // address campaignValidationLogic = campaign[campaignId].implementation;
        // (bool rewarding) = IValidate(campaingValidationLogic).validation(encodedeta);
        // if (rewarding) {
        //  ... some logic
        // }
        // actualParticipate++;
    }
}
