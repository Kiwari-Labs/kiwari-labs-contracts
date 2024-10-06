// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for the ERC20 token contract with minting functionality
interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
}

contract Campaign {
    address public owner;
    uint256 public startTime;
    uint256 public endTime;
    bool public isCampaignActive;
    IERC20Mintable public rewardToken; // ERC20 token for minting rewards
    uint256 public rewardAmount; // Amount of tokens to mint as reward

    mapping(address => bool) public hasClaimed; // Track if user has claimed reward

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(uint256 _startTime, uint256 _endTime, address _rewardTokenAddress, uint256 _rewardAmount) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
        rewardToken = IERC20Mintable(_rewardTokenAddress);
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
    function claimReward() public {
        // Deactivate the campaign if the current time is past the end time
        checkAndDeactivateCampaign();
        require(block.timestamp <= endTime, "Campaign has already ended");

        // Activate the campaign if it hasn't been activated yet and within the time period
        if (!isCampaignActive && block.timestamp >= startTime && block.timestamp <= endTime) {
            isCampaignActive = true;
        }

        require(isCampaignActive, "Campaign is not active");
        require(!hasClaimed[msg.sender], "Reward already claimed");

        // Mint reward tokens to the user
        rewardToken.mint(msg.sender, rewardAmount);

        // Mark that the user has claimed their reward
        hasClaimed[msg.sender] = true;

        // Check again after minting to deactivate if the campaign has ended
        checkAndDeactivateCampaign();
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
