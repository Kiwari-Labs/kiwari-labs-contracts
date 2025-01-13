import {MaxUint256, ZeroAddress} from "ethers";

export const constants = {
  MAX_UINT256: MaxUint256,
  ZERO_ADDRESS: ZeroAddress,
  EPOCH_TYPE: {
    BLOCKS_BASED: 0,
    TIME_BASED: 1,
  },
  DEFAULT_SECONDS_PER_EPOCH: 3600,
  DEFAULT_BLOCKS_PER_EPOCH: 300,
  DEFAULT_WINDOW_SIZE: 2,
  MIN_WINDOW_SIZE: 1,
  MAX_WINDOW_SIZE: 32,
  MIN_BLOCKS_PER_EPOCH: 300,
  MAX_BLOCKS_PER_EPOCH: 2_629_744,
  YEAR_IN_MILLISECONDS: 31_556_926_000,
};

export const SlidingWindow = {
  name: "MockSlidingWindow",
  errors: {
    InvalidDuration: "InvalidDuration",
    InvalidWindowSize: "InvalidWindowSize",
  },
  events: {},
};

export const LightWeightSlidingWindow = {
  name: "MockLightWeightSlidingWindow",
  errors: {...SlidingWindow.errors},
  events: {},
};

export const ERC7818 = {
  errors: {
    ERC7818TransferredExpiredToken: "ERC7818TransferredExpiredToken",
  },
  events: {},
};

export const ERC20 = {
  constructor: {
    name: "PointToken",
    symbol: "POINT",
  },
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
  name: "MockERC7818Blacklist",
  errors: {
    AccountBlacklisted: "AccountBlacklisted",
    AccountNotBlacklisted: "AccountNotBlacklisted",
  },
  events: {
    AddedToBlacklist: "AddedToBlacklist",
    RemovedFromBlacklist: "RemovedFromBlacklist",
  },
};

export const ERC7818BlacklistBLSW = {
  name: "MockERC7818BlacklistBLSW",
  errors: {},
  events: {},
};

export const ERC7818BlacklistTLSW = {
  name: "MockERC7818BlacklistTLSW",
  errors: {},
  events: {},
};


export const ERC7818MintQuota = {
  name: "MockERC7818MintQuota",
  errors: {
    MintQuotaExceeded: "MintQuotaExceeded",
    MinterNotSet: "MinterNotSet",
  },
  events: {
    QuotaSet: "QuotaSet",
    QuotaReset: "QuotaReset",
    QuotaMinted: "QuotaMinted",
  },
};

export const ERC7818MintQuotaBLSW = {
  name: "MockERC7818MintQuotaBLSW",
  errors: {},
  events: {},
};

export const ERC7818MintQuotaTLSW = {
  name: "MockERC7818MintQuotaTLSW",
  errors: {},
  events: {},
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

export const ERC7818WhitelistBLSW = {
  name: "MockERC7818WhitelistBLSW",
  errors: {},
  events: {},
};

export const ERC7818WhitelistTLSW = {
  name: "MockERC7818WhitelistTLSW",
  errors: {},
  events: {},
};

export const ERC20BLSW = {
  name: "MockERC20BLSW",
  errors: {},
  events: {},
};

export const ERC20TLSW = {
  name: "MockERC20TLSW",
  errors: {},
  events: {},
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

export const SortedListLibrary = {
  name: "MockSortedList",
  errors: {},
  events: {},
};

export const XortedListLibrary = {
  name: "MockXort128",
  errors: {},
  events: {},
};

export const contracts = {
  abstracts: {
    SlidingWindow,
    LightWeightSlidingWindow,
  },
  tokens: {
    ERC20,
    ERC20BLSW,
  },
  utils: {
    SlidingWindowLibrary,
    SortedListLibrary,
    XortedListLibrary
  },
};
