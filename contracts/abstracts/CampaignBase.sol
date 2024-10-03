// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/ICampaignBase.sol";
// import "../intefaces/IValidation.sol"; 

abstract contract campaignBase is ICampaignBase {
    enum CAMPAIGN_STATUS {
        INACTIVE,
        ACTIVE
    }

    enum CAMPAIGN_TYPE {
        BURN,
        EARN
    }

    bool private _init;
    string private _name;

    struct CampaingInfo {
        CAMPAIGN_TYPE types;
        CAMPAIGN_STATUS status;
        uint32 estimateParticipate;
        uint32 actualParticipate;
        uint256 totalSupply;
        uint256 startBlock;
        uint256 validFor; 
        // if the network sub-second can be more tight presume wrost case block time is 100ms
        // campaign should not be stay active forever. 
        // min 1 min
        // max 1 year
        // 138 bytes without metadata uri
        string uri; // campaign metadata
        // IValidation implementation; // the reward logic or something.
    }

    constructor(string memory name_) {
        _initialize(name_);
    }

    function _initialize(string memory name) internal {
        if (_init == true) {
            revert();
        }
        _name = name;
        _init = true;
        // events
    }

    /// @dev burn or transferFrom from given account
    function _redeem(address account, uint256 value) internal virtual returns (bool) {}

    /// @dev mint or transfer token to given account
    function _reward(address account, uint256 value) internal virtual returns (bool) {}

}
