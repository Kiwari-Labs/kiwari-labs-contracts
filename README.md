# @kiwarilabs/contracts

This is a `solidity` smart contract library for provide multiple types of assets, agreement, campaigns, and utilities for Loyalty Program.

### Installation

Install via `npm`
``` shell
npm install --dev @kiwarilabs/contracts@stable
```
Install via `yarn`
``` shell
yarn add --dev @kiwarilabs/contracts@stable
```

### Usage
```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@kiwarilabs/contracts/tokens/ERC20/ERC20EXPBase.sol";

/* @dev creates a loyalty point with token expiration functionality. 
* `blockTime_` The average block time of the network, measured in milliseconds.
* `frameSize_` represents the total number of slots that form one full expiration cycle. 
* `slotSize_`  defines the total number of slots in a year. 
*              For example, 4 slots/year could imply each slot lasts 3 months.
*/
contract MyLoyaltyPoint is ERC20EXPBase {
  constructor(
    uint16 blockTime_,  // block time of the network (in milliseconds)
    uint8 frameSize_,   // Number of slots in one expiration cycle (e.g., 4 slots for annual expiration)
    uint8 slotSize_     // Total slots per year (e.g., 4 slots/year)
  ) ERC20EXPBase("MyLoyaltyPoint", "MLP", block.number, blockTime_, frameSize_, slotSize_) {}
}
```

### Contribute

Check out the contribution [guide](CONTRIBUTING.md)

## Support and Issue

For support or any inquiries, feel free to reach out to us at [github-issue](https://github.com/Kiwari-Labs/kiwari-labs-contracts/issues) or kiwarilabs@protonmail.com

### License

All code within the `contracts` directory is released under the [Apache-2.0](LICENSE).  
Copyright (C) Kiwari Labs. 
