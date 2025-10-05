// SPDX-License-Identifier: Apache-2.0
/// @author Kiwari Labs
pragma solidity >=0.8.0 <0.9.0;

library SlidingWindow {
    uint8 private constant MINIMUM_WINDOW_SIZE = 1;
    uint8 private constant MAXIMUM_WINDOW_SIZE = 254;
    uint40 private constant MINIMUM_DURATION = 1;
    uint40 private constant MAXIMUM_DURATION = 31_556_926; // 1 year in second

    struct Window {
        uint256 _init;
        uint40 _duration;
        uint8 _size;
    }

    error InvalidDuration();
    error InvalidSize();

    function getIndex(uint256 t_init, uint256 t_current, uint256 t_duration) private pure returns (uint256 result) {
        assembly ("memory-safe") {
            if and(gt(t_current, t_init), gt(t_init, 0)) {
                result := div(sub(t_current, t_init), t_duration)
            }
        }
    }

    /// @custom:reference truncate https://docs.soliditylang.org/en/latest/types.html#division
    function getIndexes(
        uint256 t_init,
        uint256 t_current,
        uint256 t_duration,
        uint256 t_size
    ) private pure returns (uint256 startIndex, uint256 endIndex) {
        assembly ("memory-safe") {
            if and(gt(t_current, t_init), gt(t_init, 0)) {
                endIndex := div(sub(t_current, t_init), t_duration)
                startIndex := mul(sub(endIndex, t_size), iszero(lt(endIndex, t_size)))
            }
        }
    }

    function initValue(Window storage self) internal view returns (uint256) {
        return self._init;
    }

    function duration(Window storage self) internal view returns (uint256) {
        return self._duration;
    }

    function size(Window storage self) internal view returns (uint8) {
        return self._size;
    }

    function indexFor(Window storage self, uint256 t_current) internal view returns (uint256) {
        return getIndex(self._init, t_current, self._duration);
    }

    function indexRange(Window storage self, uint256 t_current) internal view returns (uint256, uint256) {
        return getIndexes(self._init, t_current, self._duration, self._size);
    }

    /**
     * @dev Setup the sliding window's params
     * @param self The sliding window storage.
     * @param t_init The initial block number or timestamp.
     * @param t_duration The duration of blocks/seconds per epoch.
     * @param t_size The number of epochs per window.
     * @param t_safe Whether to apply safe mode to validate the duration and size.
     */
    function setup(Window storage self, uint256 t_init, uint40 t_duration, uint8 t_size, bool t_safe) internal {
        if (t_safe) {
            if (t_duration < MINIMUM_DURATION || t_duration >= MAXIMUM_DURATION) {
                revert InvalidDuration();
            }
            if (t_size < MINIMUM_WINDOW_SIZE || t_size >= MAXIMUM_WINDOW_SIZE) {
                revert InvalidSize();
            }
        }
        self._init = t_init;
        self._duration = t_duration;
        self._size = t_size;
    }

    /**
     * @dev Clear the sliding window's params
     * @param self The sliding window storage.
     */
    function clear(Window storage self) internal {
        self._init = 0;
        self._duration = 0;
        self._size = 0;
    }
}
