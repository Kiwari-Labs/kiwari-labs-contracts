# @kiwarilabs/contracts

This is a Solidity smart contract library for create asset that could be use for Loyalty program.

## Overview

#### Installing

```
$ npm install --dev @kiwarilabs/contracts
```

```solidity
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "@kiwarilabs/contracts/abstracts/ERC20EXPBase.sol";

contract MyLoyaltyPoint is ERC20EXPBase {
  constructor(
    uint16 blockTime_,
    uint8 frameSize_,
    uint8 slotSize_
  ) ERC20EXPBase("MyLoyaltyPoint", "MLP", block.number, blockTime_, frameSize_, slotSize_) {}
}
```

### Support and Issue

For support or any inquiries, feel free to reach out to us at [github-issue]() or kiwarilabs@protonmail.com

### License

All ERC20EXP code Copyright (C) Kiwari Labs. All rights reserved.  
`@kiwarilabs/contracts` is released under the [BUSL-1.1](LICENSE)
