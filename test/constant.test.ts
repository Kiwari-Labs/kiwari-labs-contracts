export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// abstracts
export const AGREEMENT_BASE_CONTRACT = "MockAgreementBase";
export const BILATERAL_AGREEMENT_BASE_CONTRACT = "MockBilateralAgreementBase";
export const ERC20_EXP_BASE_CONTRACT = "MockERC20EXPBase";
export const LIGHT_WEIGHT_ERC20_EXP_BASE_CONTRACT = "MockLightWeightERC20EXPBase";
export const SLIDING_WINDOW_CONTRACT = "MockSlidingWindow";
export const LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT = "MockLightWeightSlidingWindow";

// extensions
export const ERC20_EXP_MINT_QUOTA_CONTRACT = "MockERC20EXPMintQuota";
export const ERC20_EXP_WHITELIST_CONTRACT = "MockERC20EXPWhitelist";
export const LIGHT_WEIGHT_ERC20_EXP_WHITELIST_CONTRACT = "MockLightWeightERC20EXPWhitelist";

// libraries
export const SLIDING_WINDOW_LIBRARY_CONTRACT = "MockSlidingWindowLibrary";
export const LIGHT_WEIGHT_SLIDING_WINDOW_LIBRARY_CONTRACT = "MockLightWeightSlidingWindowLibrary";
export const SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT = "MockSortedCircularDoublyLinkedListLibrary";
export const LIGHT_WEIGHT_SORTED_CIRCULAR_DOUBLY_LINKED_LIST_LIBRARY_CONTRACT =
  "MockLightWeightSortedCircularDoublyLinkedListLibrary";
export const COMPARATOR_LIBRARY_CONTRACT = "MockComparator";

export const AGREEMENT_NAME = "MockAgreement";

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

// custom error
export const INVALID_AGREEMENT_FAILED = "AgreementFailed";

export const INVALID_BLOCK_TIME = "InvalidBlockTime";
export const INVALID_FRAME_SIZE = "InvalidFrameSize";
export const INVALID_SLOT_PER_ERA = "InvalidSlotPerEra";

export const INVALID_WHITELIST_ADDRESS = "InvalidWhitelistAddress";
export const INVALID_WHITELIST_ADDRESS_EXIST = "ExistInWhitelist";
export const INVALID_WHITELIST_ADDRESS_NOT_EXIST = "NotExistInWhitelist";

export const INVALID_UNAUTHORIZED_MINTER = "UnauthorizedMinter";
export const INVALID_MINT_QUOTA_EXCEEDED = "MintQuotaExceeded";
export const INVALID_INVALID_MINTER_ADDRESS = "InvalidMinterAddress";

export const ERC20_INVALID_SENDER = "ERC20InvalidSender";
export const ERC20_INVALID_RECEIVER = "ERC20InvalidReceiver";
export const ERC20_INSUFFICIENT_BALANCE = "ERC20InsufficientBalance";
export const ERC20_INVALID_APPROVER = "ERC20InvalidApprover";
export const ERC20_INVALID_SPENDER = "ERC20InvalidSpender";
export const ERC20_INSUFFICIENT_ALLOWANCE = "ERC20InsufficientAllowance";

// events
export const EVENT_AGREEMENT_BUMP_MAJOR_VERSION = "BumpMajorVersion";
export const EVENT_AGREEMENT_BUMP_MINOR_VERSION = "BumpMinorVersion";
export const EVENT_AGREEMENT_BUMP_PATCH_VERSION = "BumpPatchVersion";

export const EVENT_TRANSFER = "Transfer";
export const EVENT_APPROVAL = "Approval";

export const EVENT_WHITELIST_GRANTED = "WhitelistGranted";
export const EVENT_WHITELIST_REVOKED = "WhitelistRevoked";

export const EVENT_QUOTA_SET = "QuotaSet";
export const EVENT_QUOTA_RESET = "QuotaReset";
export const EVENT_QUOTA_MINTED = "QuotaMinted";
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
