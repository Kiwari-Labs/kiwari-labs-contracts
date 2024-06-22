// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

/// @title Interface for working with sliding window algorithm.
/// @author Kiwari Labs

interface ISlidingWindow {
    event BlockProducedPerYearUpdated(uint256 blockPerYearOld, uint256 blockPerYearNew);
    event ExpirationPeriodUpdated(uint256 expirePeriodOld, uint256 expirePeriodNew);

    function blockPerEra() external view returns (uint40);
    function blockPerSlot() external view returns (uint40);
    function currentEraAndSlot() external view returns (uint256 era, uint8 slot);
    function getFrameSizeInBlockLength() external view returns (uint40);
    function getFrameSizeInSlotLegth() external view returns (uint8);
    function getFrameSizeInEraLength() external view returns (uint8);
    function frame() external view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot);
    function safeFrame() external view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot);
    function slotPerEra() external view returns (uint8);
}
