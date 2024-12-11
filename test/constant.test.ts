import {MaxUint256, ZeroAddress} from "ethers";

export const constants = {
  MAX_UINT256: MaxUint256,
  ZERO_ADDRESS: ZeroAddress,
  BLOCK_TIME: 250,
  WINDOW_SIZE: 4,
  BLOCKS_IN_EPOCH: 0,
  BLOCKS_IN_WINDOW: 0,
  MIN_WINDOW_SIZE: 1,
  MAX_WINDOW_SIZE: 32,
  MIN_BLOCK_TIME: 100,
  MAX_BLOCK_TIME: 600_000,
  YEAR_IN_MILLISECONDS: 31_556_926_000,
};

export const AgreementBase = {
  name: "MockAgreementBase",
  constructor: {
    name: "MockAgreement",
  },
  errors: {
    AgreementFailed: "AgreementFailed",
  },
  events: {
    AgreementComplete: "AgreementComplete",
    BumpMajorVersion: "BumpMajorVersion",
    BumpMinorVersion: "BumpMinorVersion",
    BumpPatchVersion: "BumpPatchVersion",
  },
};

export const BilateralAgreementBase = {
  name: "MockBilateralAgreementBase",
  errors: {},
  events: {},
};

export const SlidingWindow = {
  name: "MockSlidingWindow",
  errors: {
    InvalidBlockTime: "InvalidBlockTime",
    InvalidWindowSize: "InvalidWindowSize",
  },
  events: {},
};

export const LightWeightSlidingWindow = {
  name: "MockLightWeightSlidingWindow",
  errors: {...SlidingWindow.errors},
  events: {},
};

export const AgreementBaseForBilateral = {
  name: "MockAgreementBaseForBilateral",
  errors: {},
  events: {},
};

export const ERC20 = {
  errors: {
    ERC20InsufficientBalance: "ERC20InsufficientBalance",
    ERC20InvalidApprover: "ERC20InvalidApprover",
    ERC20InvalidSpender: "ERC20InvalidSpender",
    ERC20InvalidReceiver: "ERC20InvalidReceiver",
    ERC20InvalidSender: "ERC20InvalidSender",
    ERC20InsufficientAllowance: "ERC20InsufficientAllowance",
  },
  events: {
    Transfer: "Transfer",
    Approval: "Approval",
  },
};

export const ERC7818Backlist = {
  name: "MockERC7818Backlist",
  errors: {
    BlacklistedAddress: "BlacklistedAddress",
    InvalidAddress: "InvalidAddress",
  },
  events: {
    Blacklisted: "Blacklisted",
    Unblacklisted: "Unblacklisted",
  },
};

export const ERC7818MintQuota = {
  name: "MockERC7818MintQuota",
  errors: {
    UnauthorizedMinter: "UnauthorizedMinter",
    MintQuotaExceeded: "MintQuotaExceeded",
    InvalidMinterAddress: "InvalidMinterAddress",
  },
  events: {
    QuotaSet: "QuotaSet",
    QuotaReset: "QuotaReset",
    QuotaMinted: "QuotaMinted",
  },
};

export const ERC7818Whitelist = {
  name: "MockERC7818Whitelist",
  errors: {
    InvalidWhitelistAddress: "InvalidWhitelistAddress",
    ExistInWhitelist: "ExistInWhitelist",
    NotExistInWhitelist: "NotExistInWhitelist",
  },
  events: {
    Whitelisted: "Whitelisted",
    Unwhitelisted: "Unwhitelisted",
  },
};

export const ERC20EXPBase = {
  name: "MockERC20EXPBase",
  constructor: {
    name: "PointToken",
    symbol: "POINT",
  },
  errors: {},
  events: {},
  extensions: {
    ERC7818Backlist,
    ERC7818MintQuota,
    ERC7818Whitelist,
    // MockLightWeightERC20EXPWhitelist: "MockLightWeightERC20EXPWhitelist",
  },
};

export const SlidingWindowLibrary = {
  name: "MockSlidingWindowLibrary",
  errors: {},
  events: {},
};

export const BLSWLibrary = {
  name: "MockBLSW",
  errors: {},
  events: {},
};

export const SortedCircularDoublyLinkedListLibrary = {
  name: "MockSortedCircularDoublyLinkedListLibrary",
  errors: {},
  events: {},
};

export const LightWeightSortedCircularDoublyLinkedListLibrary = {
  name: "MockXort128",
  errors: {},
  events: {},
};

export const Xort128 = {
  name: "MockLightWeightSortedCircularDoublyLinkedListLibraryV2",
  errors: {},
  events: {},
};

export const Comparator = {
  name: "MockComparator",
  errors: {},
  events: {},
};

export const contracts = {
  abstracts: {
    AgreementBase,
    BilateralAgreementBase,
    SlidingWindow,
    LightWeightSlidingWindow,
    AgreementBaseForBilateral,
  },
  tokens: {
    ERC20,
    ERC20EXPBase,
  },
  utils: {
    SlidingWindowLibrary,
    SortedCircularDoublyLinkedListLibrary,
    // LightWeightSlidingWindowLibrary,
    // LightWeightSortedCircularDoublyLinkedListLibrary,
    // PU128SCDLL,
    comparators: {
      Comparator,
    },
  },
};
