// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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

    /// @notice Returns the current epoch and slot within the sliding window.
    /// @return epoch Current epoch number.
    /// @return slot Current slot number.
    function currentEpochAndSlot() external view returns (uint256 epoch, uint8 slot);

    /// @notice Returns the current frame boundaries in terms of epochs and slots.
    /// @return fromEpoch Starting epoch of the current frame.
    /// @return toEpoch Ending epoch of the current frame.
    /// @return fromSlot Starting slot within the starting epoch of the current frame.
    /// @return toSlot Ending slot within the ending epoch of the current frame.
    function frame() external view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot);

    /// @notice Returns the safe frame boundaries in terms of epochs and slots based on the current block number.
    /// @return fromEpoch Starting epoch of the safe frame.
    /// @return toEpoch Ending epoch of the safe frame.
    /// @return fromSlot Starting slot within the starting epoch of the safe frame.
    /// @return toSlot Ending slot within the ending epoch of the safe frame.
    function safeFrame() external view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot);

    /// @notice Returns the number of blocks per epoch.
    /// @return blockPerEpoch Number of blocks per epoch.
    function getBlocksPerEpoch() external view returns (uint40);

    /// @notice Returns the number of blocks per slot.
    /// @return blockPerSlot Number of blocks per slot.
    function getBlocksPerSlot() external view returns (uint40);

    /// @notice Returns the size of the sliding window frame in blocks.
    /// @return frameSizeInBlockLength Size of the frame in blocks.
    function getFrameSizeInBlockLength() external view returns (uint40);

    /// @notice Returns the size of the sliding window frame in epochs.
    /// @return frameSizeInEpochLength Size of the frame in epochs.
    // function getFrameSizeInEpochLength() external view returns (uint8);

    /// @notice Returns the size of the sliding window frame in slots.
    /// @return frameSizeInSlotLength Size of the frame in slots.
    // function getFrameSizeInSlotLength() external view returns (uint8);

    /// @notice Retrieves the frame size in epoch and slot length from the sliding window state.
    /// @return An array containing frame size in epoch and slot length.
    // function getFrameSizeInEpochAndSlotLength() external view returns (uint8[2] memory);

    /// @notice Returns the number of slots per epoch.
    /// @return slotPerEpoch Number of slots per epoch.
    function getSlotsPerEpoch() external view returns (uint8);
}
