// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for the ERC20 token contract with minting functionality
interface IPoint {
    function mint(address to, uint256 amount) external;
}

contract Campaign is Ownable {
    uint256 public startTime;
    uint256 public endTime;
    bool public isCampaignActive;
    IPoint public rewardToken; // ERC20 token for minting rewards
    uint256 public rewardAmount; // Amount of tokens to mint as reward

    mapping(address => bool) public hasClaimed; // Track if user has claimed reward

    event RewardClaimed(address indexed user, uint256 rewardAmount);

    constructor(
        address _owner,
        uint256 _startTime,
        uint256 _endTime,
        address _rewardTokenAddress,
        uint256 _rewardAmount
    ) Ownable(_owner) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        startTime = _startTime;
        endTime = _endTime;
        rewardToken = IPoint(_rewardTokenAddress);
        rewardAmount = _rewardAmount;
        isCampaignActive = false;
    }

    // Function to check if the campaign is ongoing
    function isCampaignOngoing() public view returns (bool) {
        return (block.timestamp >= startTime && block.timestamp <= endTime && isCampaignActive);
    }

    // Owner can manually stop the campaign if desired
    function stopCampaign() public onlyOwner {
        require(isCampaignActive, "Campaign is already inactive");
        isCampaignActive = false;
    }

    // Automatically deactivate the campaign when endTime is reached
    function checkAndDeactivateCampaign() internal {
        if (block.timestamp > endTime) {
            isCampaignActive = false;
        }
    }

    // User can claim reward, automatically activating the campaign if necessary
    // The campaign will also automatically deactivate when the end time is reached
    function claimReward(address to_) public {
        // Deactivate the campaign if the current time is past the end time
        checkAndDeactivateCampaign();
        require(block.timestamp <= endTime, "Campaign has already ended");

        // Activate the campaign if it hasn't been activated yet and within the time period
        if (!isCampaignActive && block.timestamp >= startTime && block.timestamp <= endTime) {
            isCampaignActive = true;
        }

        require(isCampaignActive, "Campaign is not active");
        require(!hasClaimed[to_], "Reward already claimed");

        // Mint reward tokens to the user
        rewardToken.mint(to_, rewardAmount);

        // Mark that the user has claimed their reward
        hasClaimed[to_] = true;

        // Emit the event for reward claim
        emit RewardClaimed(msg.sender, rewardAmount);

        // Check again after minting to deactivate if the campaign has ended
        checkAndDeactivateCampaign();
    }

    function claimReward() public {
        claimReward(msg.sender);
    }

    // Owner can extend the campaign time
    function extendCampaign(uint256 newEndTime) public onlyOwner {
        require(newEndTime > endTime, "New end time must be after current end time");
        endTime = newEndTime;
    }

    // Function to return campaign times
    function getCampaignTimes() public view returns (uint256, uint256) {
        return (startTime, endTime);
    }
}
