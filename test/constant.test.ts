export const common = {
  zeroAddress: "0x0000000000000000000000000000000000000000",
  expirePeriod: 4,
  blockPeriod: 400,
  frameSize: 2,
  slotSize: 4,
  twoBits: 2,
  threeBits: 3,
  slotPerEpoch: 4,
  minSlotPerEpoch: 1,
  maxSlotPerEpoch: 12,
  minFrameSize: 1,
  maxFrameSize: 64,
  minBlockTimeInMilliseconds: 100,
  maxBlockTimeInMilliseconds: 600_000,
  yearInMilliseconds: 31_556_926_000,
  dayInMilliseconds: 86_400_000,
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
    InvalidFrameSize: "InvalidFrameSize",
    InvalidSlotPerEpoch: "InvalidSlotPerEpoch",
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
    WhitelistGranted: "WhitelistGranted",
    WhitelistRevoked: "WhitelistRevoked",
  },
};

export const ERC7818NearestExpiryQuery = {
  name: "MockERC7818NearestExpiryQuery",
  errors: {},
  events: {},
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
    ERC7818NearestExpiryQuery,
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
  name: "MockLightWeightSortedCircularDoublyLinkedListLibrary",
  errors: {},
  events: {},
};

export const PU128SCDLL = {
  name: "MockLightWeightSortedCircularDoublyLinkedListLibraryV2",
  errors: {},
  events: {},
};

export const LightWeightSlidingWindowLibrary = {
  name: "MockLightWeightSlidingWindowLibrary",
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
    // MockLightWeightERC20EXPBase: "MockLightWeightERC20EXPBase",
  },
  utils: {
    SlidingWindowLibrary,
    SortedCircularDoublyLinkedListLibrary,
    LightWeightSlidingWindowLibrary,
    LightWeightSortedCircularDoublyLinkedListLibrary,
    PU128SCDLL,
    comparators: {
      Comparator,
    },
  },
};
