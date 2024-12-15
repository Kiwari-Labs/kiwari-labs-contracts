# @kiwarilabs/contracts

`solidity` library for creating expirable token.

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

contract MyToken is ERC20EXPBase {
  /// @param blockTim The average block time of the network, measured in milliseconds.
  /// @param windowSize represents the total number of epochs that form one full expiration cycle.  
  /// For example, Sliding Window make 4 epochs/year could imply each epoch lasts 3 months.
  constructor(
    uint16 blockTime,  // block time of the network (in milliseconds)
    uint8 windowSize,   // Number of slots in one expiration cycle (e.g., 4 for annual expiration)
  ) ERC20EXPBase("MyToken", "MYT", block.number, blockTime, windowSize) {}
}
```

### Contribute

Check out the contribution [guide](CONTRIBUTING.md)

## Support and Issue

For support or any inquiries, feel free to reach out to us at [github-issue](https://github.com/Kiwari-Labs/kiwari-labs-contracts/issues) or kiwarilabs@protonmail.com

### License

All code within the `contracts` directory is released under the [Apache-2.0](LICENSE).  
Copyright (C) Kiwari Labs. 
