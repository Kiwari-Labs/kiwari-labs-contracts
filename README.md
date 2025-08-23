# @kiwarilabs/contracts

A Solidity library for creating expirable tokens with time or block-based expiration.

- [ERC-7818](https://eips.ethereum.org/EIPS/eip-7818): Expirable ERC20
- [ERC-7858](https://eips.ethereum.org/EIPS/eip-7858): Expirable NFTs and SBTs

## Installation

Install via `npm`
``` shell
npm install --dev @kiwarilabs/contracts@stable
```
Install via `yarn`
``` shell
yarn add --dev @kiwarilabs/contracts@stable
```

## Usage

### ERC-7818

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20EXPBase} from "@kiwarilabs/contracts/tokens/ERC20/ERC20EXPBase.sol";

contract ERC7818 is ERC20EXPBase {
  constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function epochType() internal pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    /**
     * @notice In some Layer 2 (L2) use precompiled/system-contract to get block height instead of block.number.
     * @return uint256 return the current block height.
     */
    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

}
```

### ERC-7858

#### Individual Expiration

``` Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC7858EXPBase} from "@kiwarilabs/contracts/tokens/ERC721/ERC7858EXPBase.sol";

// Expirable ERC721 with individual expiration
contract ExpirableERC721 is ERC7858EXPBase {

    constructor (string memory name_, string memory symbol_) ERC7858EXPBase(name_, symbol) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

}
```

#### Epoch Expiration

``` Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC7858EXPEpochBase} from "@kiwarilabs/contracts/tokens/ERC721/extensions/ERC7858EXPEpochBase.sol";

// Expirable ERC721 with epoch expiration
contract ExpirableERC7858 is ERC7858EXPEpochBase {
    
    constructor (
        string memory name_, 
        string memory symbol_, 
        uint256 initialBlockNumber_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_)
        ERC7858EXPEpochBase(
            name_, 
            symbol_, 
            initialBlockNumber_,
            blocksPerEpoch_,
            windowSize_,
            development) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

}

```

## Contribute

Check out the contribution [guide](CONTRIBUTING.md)

## Support and Issue

For support or any inquiries, feel free to reach out to us at [github-issue](https://github.com/Kiwari-Labs/kiwari-labs-contracts/issues) or kiwarilabs@protonmail.com

## Funding

If you value our work and would like to support Kiwari Labs, please visit our [Open Collective](https://opencollective.com/kiwari-labs) page to make a donation. Thank you!

## License

This repository is released under the [Apache-2.0](LICENSE).  
Copyright (C) Kiwari Labs. 
