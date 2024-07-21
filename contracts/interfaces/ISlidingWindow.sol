// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

/// @title Interface for working with sliding window algorithm.
/// @author Kiwari Labs
/// @notice This interface defines methods to interact with a sliding window algorithm used for block management.

interface ISlidingWindow {
    /// @notice Emitted when the number of blocks produced per year is updated.
    /// @param blockPerYearOld Previous number of blocks produced per year.
    /// @param blockPerYearNew New number of blocks produced per year.
    event BlockProducedPerYearUpdated(uint256 blockPerYearOld, uint256 blockPerYearNew);

    /// @notice Emitted when frame size parameters are updated.
    /// @param oldFrameSizeInBlocks Previous frame size in blocks.
    /// @param newFrameSizeInBlocks New frame size in blocks.
    event FrameSizeUpdated(uint256 oldFrameSizeInBlocks, uint256 newFrameSizeInBlocks);

    /// @notice Returns the number of blocks per era.
    /// @return blockPerEra Number of blocks per era.
    function blockPerEra() external view returns (uint40);

    /// @notice Returns the number of blocks per slot.
    /// @return blockPerSlot Number of blocks per slot.
    function blockPerSlot() external view returns (uint40);

    /// @notice Returns the current era and slot within the sliding window.
    /// @return era Current era number.
    /// @return slot Current slot number.
    function currentEraAndSlot() external view returns (uint256 era, uint8 slot);

    /// @notice Returns the size of the sliding window frame in blocks.
    /// @return frameSizeInBlockLength Size of the frame in blocks.
    function getFrameSizeInBlockLength() external view returns (uint40);

    /// @notice Returns the size of the sliding window frame in slots.
    /// @return frameSizeInSlotLength Size of the frame in slots.
    function getFrameSizeInSlotLength() external view returns (uint8);

    /// @notice Returns the size of the sliding window frame in eras.
    /// @return frameSizeInEraLength Size of the frame in eras.
    function getFrameSizeInEraLength() external view returns (uint8);

    /// @notice Returns the current frame boundaries in terms of eras and slots.
    /// @return fromEra Starting era of the current frame.
    /// @return toEra Ending era of the current frame.
    /// @return fromSlot Starting slot within the starting era of the current frame.
    /// @return toSlot Ending slot within the ending era of the current frame.
    function frame() external view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot);

    /// @notice Returns the safe frame boundaries in terms of eras and slots based on the current block number.
    /// @return fromEra Starting era of the safe frame.
    /// @return toEra Ending era of the safe frame.
    /// @return fromSlot Starting slot within the starting era of the safe frame.
    /// @return toSlot Ending slot within the ending era of the safe frame.
    function safeFrame() external view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot);

    /// @notice Returns the number of slots per era.
    /// @return slotPerEra Number of slots per era.
    function slotPerEra() external view returns (uint8);
}
