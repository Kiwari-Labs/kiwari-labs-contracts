// Copyright Kiwari Labs and @kiwarilabs/contracts contributors 2024,2025. All Rights Reserved.
// Node module: kiwari-labs-contracts
// This file is licensed under the Apache License 2.0.
// License text available at https://www.apache.org/licenses/LICENSE-2.0

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

export const ERC7858 = {
  errors: {
    ERC7858InvalidTimeStamp: "ERC7858InvalidTimeStamp",
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

export const ERC721 = {
  constructor: {
    name: "VoucherToken",
    symbol: "VOUCHER",
  },
  errors: {
    ERC721InvalidOwner: "ERC721InvalidOwner",
    ERC721NonexistentToken: "ERC721NonexistentToken",
    ERC721IncorrectOwner: "ERC721IncorrectOwner",
    ERC721InvalidSender: "ERC721InvalidSender",
    ERC721InvalidReceiver: "ERC721InvalidReceiver",
    ERC721InsufficientApproval: "ERC721InsufficientApproval",
    ERC721InvalidApprover: "ERC721InvalidApprover",
    ERC721InvalidOperator: "ERC721InvalidOperator",
  },
  events: {
    Transfer: "Transfer",
    Approval: "Approval",
    ApprovalForAll: "ApprovalForAll",
  },
};

export const ERC7818Permit = {
  name: "MockERC7818Permit",
  events: {},
  errors: {
    ERC2612ExpiredSignature: "ERC2612ExpiredSignature",
    ERC2612InvalidSigner: "ERC2612InvalidSigner",
  },
};

export const ERC7818PermitBLSW = {
  name: "MockERC7818PermitBLSW",
  errors: {},
  events: {},
};

export const ERC7818PermitTLSW = {
  name: "MockERC7818PermitTLSW",
  errors: {},
  events: {},
};

export const ERC7818Frozen = {
  name: "MockERC7818Frozen",
  events: {
    Freeze: "Freeze",
    Unfreeze: "Unfreeze",
  },
  errors: {
    AccountFrozen: "AccountFrozen",
    AccountNotFrozen: "AccountNotFrozen",
  },
};

export const ERC7818FrozenBLSW = {
  name: "MockERC7818FrozenBLSW",
  errors: {},
  events: {},
};

export const ERC7818FrozenTLSW = {
  name: "MockERC7818FrozenTLSW",
  errors: {},
  events: {},
};

export const ERC7818Blacklist = {
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
    MinterAlreadySet: "MinterAlreadySet",
  },
  events: {
    MinterAdded: "MinterAdded",
    MinterRemoved: "MinterRemoved",
    QuotaSet: "QuotaSet",
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

export const ERC7818Exception = {
  name: "MockERC7818Exception",
  errors: {
    InvalidExceptionAddress: "InvalidExceptionAddress",
    ExistInExceptionList: "ExistInExceptionList",
    NotExistInExceptionList: "NotExistInExceptionList",
    ExceptionAddressNotSupportTransferAtEpoch: "ExceptionAddressNotSupportTransferAtEpoch",
    ExceptionAddressNotSupportTransferFromAtEpoch: "ExceptionAddressNotSupportTransferFromAtEpoch",
  },
  events: {
    AddedToExceptionList: "AddedToExceptionList",
    RemovedFromExceptionList: "RemovedFromExceptionList",
  },
};

export const ERC7818ExceptionBLSW = {
  name: "MockERC7818ExceptionBLSW",
  errors: {},
  events: {},
};

export const ERC7818ExceptionTLSW = {
  name: "MockERC7818ExceptionTLSW",
  errors: {},
  events: {},
};

export const ERC7818NearestExpiryQueryBLSW = {
  name: "MockERC7818NearestExpiryQueryBLSW",
  errors: {},
  events: {},
};

export const ERC7818NearestExpiryQueryTLSW = {
  name: "MockERC7818NearestExpiryQueryTLSW",
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

export const ERC721TLSW = {
  name: "MockERC721TLSW",
  errors: {},
  events: {},
};

export const ERC721BLSW = {
  name: "MockERC721BLSW",
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
    XortedListLibrary,
  },
};
