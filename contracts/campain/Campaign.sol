// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

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

    modifier withinCampaignPeriod() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Campaign is not within the active period");
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

    // Owner can start the campaign if within the period
    function startCampaign() public onlyOwner {
        require(block.timestamp >= startTime, "It's not time to start the campaign yet");
        require(!isCampaignActive, "Campaign is already active");

        isCampaignActive = true;
    }

    // Owner can manually stop the campaign even if it's within the active period
    function stopCampaign() public onlyOwner {
        require(isCampaignActive, "Campaign is already inactive");

        isCampaignActive = false;
    }

    // Function to check if the campaign is both within the active period and manually activated
    function isCampaignOngoing() public view returns (bool) {
        return block.timestamp >= startTime && block.timestamp <= endTime && isCampaignActive;
    }

    // Owner can extend the campaign time
    function extendCampaign(uint256 newEndTime) public onlyOwner {
        require(newEndTime > endTime, "New end time must be after current end time");
        endTime = newEndTime;
    }

    // User can claim reward if the campaign is active and they haven't claimed before
    function claimReward() public withinCampaignPeriod {
        require(isCampaignActive, "Campaign is not active");
        require(!hasClaimed[msg.sender], "Reward already claimed");

        // Mint reward tokens to the user
        rewardToken.mint(msg.sender, rewardAmount);

        // Mark that the user has claimed their reward
        hasClaimed[msg.sender] = true;
    }

    // Function to return campaign times
    function getCampaignTimes() public view returns (uint256, uint256) {
        return (startTime, endTime);
    }
}
