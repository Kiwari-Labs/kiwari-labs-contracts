export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// abstracts
export const AGREEMENT_BASE_CONTRACT = "MockAgreementBase";
export const BILATERAL_AGREEMENT_BASE_CONTRACT = "MockBilateralAgreementBase";
export const ERC20_EXP_BASE_CONTRACT = "MockERC20EXPBase";
export const LIGHT_WEIGHT_ERC20_EXP_BASE_CONTRACT = "MockLightWeightERC20EXPBase";
export const SLIDING_WINDOW_CONTRACT = "MockSlidingWindow";
export const LIGHT_WEIGHT_SLIDING_WINDOW_CONTRACT = "MockLightWeightSlidingWindow";

// extensions
export const ERC20_EXP_BACKLIST_CONTRACT = "MockERC20EXPBacklist";
export const ERC20_EXP_MINT_QUOTA_CONTRACT = "MockERC20EXPMintQuota";
export const ERC20_EXP_WHITELIST_CONTRACT = "MockERC20EXPWhitelist";
export const ERC20_EXP_NEAREST_EXPIRY_QUERY_CONTRACT = "MockERC20EXPNearestExpiryQuery";
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
export const ERROR_AGREEMENT_FAILED = "AgreementFailed";

export const ERROR_INVALID_BLOCK_TIME = "InvalidBlockTime";
export const ERROR_INVALID_FRAME_SIZE = "InvalidFrameSize";
export const ERROR_INVALID_SLOT_PER_ERA = "InvalidSlotPerEra";

export const ERROR_INVALID_WHITELIST_ADDRESS = "InvalidWhitelistAddress";
export const ERROR_EXIST_IN_WHITELIST = "ExistInWhitelist";
export const ERROR_NOT_EXIST_IN_WHITELIST = "NotExistInWhitelist";

export const ERROR_UNAUTHORIZED_MINTER = "UnauthorizedMinter";
export const ERROR_MINT_QUOTA_EXCEEDED = "MintQuotaExceeded";
export const ERROR_INVALID_MINTER_ADDRESS = "InvalidMinterAddress";

export const ERROR_ERC20_INVALID_SENDER = "ERC20InvalidSender";
export const ERROR_ERC20_INVALID_RECEIVER = "ERC20InvalidReceiver";
export const ERROR_ERC20_INSUFFICIENT_BALANCE = "ERC20InsufficientBalance";
export const ERROR_ERC20_INVALID_APPROVER = "ERC20InvalidApprover";
export const ERROR_ERC20_INVALID_SPENDER = "ERC20InvalidSpender";
export const ERROR_ERC20_INSUFFICIENT_ALLOWANCE = "ERC20InsufficientAllowance";

export const ERROR_BLACKLISTED_ADDRESS = "BlacklistedAddress";
export const ERROR_INVALID_ADDRESS = "InvalidAddress";

// events
export const EVENT_AGREEMENT_COMPLETE = "AgreementComplete";
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

export const EVENT_BLACKLISTED = "Blacklisted";
export const EVENT_UNBLACKLISTED = "Unblacklisted";

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
