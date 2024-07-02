export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ERC20_EXP_CONTRACT = "MockToken";
export const LIGHT_WEIGHT_ERC20_EXP_CONTRACT = "MockLightWeightToken";

export const SLIDING_WINDOW_CONTRACT = "MockSlidingWindow";
export const LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT = "MockSlidingWindow";

export const SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT = "MockSortedCircularDoublyLinkedList";
export const LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_CONTRACT = "MockLightWeightSortedCircularDoublyLinkedList";

export const ERC20_EXP_BLOCK_PERIOD = "4000";
export const ERC20_EXP_EXPIRE_PERIOD = "4";
export const ERC20_EXP_NAME = "PointToken";
export const ERC20_EXP_SYMBOL = "POINT";

export const MINIMUM_SLOT_PER_ERA = 1;
export const MAXIMUM_SLOT_PER_ERA = 12;
export const MINIMUM_FRAME_SIZE = 1;
export const MAXIMUM_FRAME_SIZE = 64;
export const MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100;
export const MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000;
export const YEAR_IN_MILLI_SECONDS = 31_556_926_000;

export interface SlidingWindowState {
  _blockPerEra: Number;
  _blockPerSlot: Number;
  _frameSizeInBlockLength: Number;
  _frameSizeInEraAndSlotLength: Array<Number>;
  _slotSize: Number;
  _startBlockNumber: Number;
}
