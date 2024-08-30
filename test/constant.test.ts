export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// abstracts
export const ERC20_EXP_BASE_CONTRACT = "MockERC20EXPBase";
export const LIGHT_WEIGHT_ERC20_EXP_BASE_CONTRACT = "MockLightWeightERC20EXPBase";
export const SLIDING_WINDOW_CONTRACT = "MockSlidingWindow";
export const LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT = "MockLightWeightSlidingWindow";

// extensions
export const ERC20_EXP_WHITELIST_CONTRACT = "MockERC20EXPWhitelist";
export const LIGHT_WEIGHT_ERC20_EXP_WHITELIST_CONTRACT = "MockLightWeightERC20EXPWhitelist";

// libraries
export const SLIDING_WINDOW_LIBRARY_CONTRACT = "MockSlidingWindowLibrary";
export const LIGHT_WEIGHT_SLIDING_WINDOW_LIBRARY_CONTRACT = "MockLightWeightSlidingWindowLibrary";
export const SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT = "MockSortedCircularDoublyLinkedListLibrary";
export const LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT =
  "MockLightWeightSortedCircularDoublyLinkedListLibrary";

export const ERC20_EXP_EXPIRE_PERIOD = 4;

export const ERC20_EXP_BLOCK_PERIOD = 400;
export const ERC20_EXP_FRAME_SIZE = 2;
export const ERC20_EXP_SLOT_SIZE = 4;
export const ERC20_EXP_NAME = "PointToken";
export const ERC20_EXP_SYMBOL = "POINT";

export const TWO_BITS = 2;
export const THREE_BITS = 3;
export const SLOT_PER_ERA = 4;
export const MINIMUM_SLOT_PER_ERA = 1;
export const MAXIMUM_SLOT_PER_ERA = 12;
export const MINIMUM_FRAME_SIZE = 1;
export const MAXIMUM_FRAME_SIZE = 64;
export const MINIMUM_BLOCK_TIME_IN_MILLISECONDS = 100;
export const MAXIMUM_BLOCK_TIME_IN_MILLISECONDS = 600_000;
export const YEAR_IN_MILLISECONDS = 31_556_926_000;

export const DAY_IN_MILLISECONDS = 86_400_000;

export const INVALID_BLOCK_TIME = "InvalidBlockTime";
export const INVALID_FRAME_SIZE = "InvalidFrameSize";
export const INVALID_SLOT_PER_ERA = "InvalidSlotPerEra";

export const ERC20_INVALID_SENDER = "ERC20InvalidSender";
export const ERC20_INVALID_RECEIVER = "ERC20InvalidReceiver";
export const ERC20_INSUFFICIENT_BALANCE = "ERC20InsufficientBalance";
export const ERC20_INVALID_APPROVER = "ERC20InvalidApprover";
export const ERC20_INVALID_SPENDER = "ERC20InvalidSpender";
export const ERC20_INSUFFICIENT_ALLOWANCE = "ERC20InsufficientAllowance";

export const EVENT_TRANSFER = "Transfer";
export const EVENT_APPROVAL = "Approval";

export interface SlidingWindowState extends LightWeightSlidingWindowState {
  _slotSize: Number;
}

export interface LightWeightSlidingWindowState {
  _blockPerEra: Number;
  _blockPerSlot: Number;
  _frameSizeInBlockLength: Number;
  _frameSizeInEraAndSlotLength: Array<Number>;
  _startBlockNumber: Number;
}
