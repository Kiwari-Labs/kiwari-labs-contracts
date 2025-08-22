// SPDX-License-Identifier: Apache-2.0
/// @author Kiwari Labs
import {SlidingWindow} from "../utils/algorithms/SlidingWindow.sol";

abstract contract AbstractSlidingWindow {
    using SlidingWindow for SlidingWindow.Window;

    SlidingWindow.Window private m_Window;

    constructor(uint256 t_init, uint40 t_duration, uint8 t_size, bool t_safe) {
        m_Window.setup(t_init, t_duration, t_size, t_safe);
    }
}
