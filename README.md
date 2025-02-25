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
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC20EXPBase} from "@kiwarilabs/contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC20BLSW} from "@kiwarilabs/contracts/tokens/ERC20/ERC20BLSW.sol";

contract ExpirableERC20 is ERC20BLSW {
  constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20BLSW(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function _epochType() internal pure virtual override(ERC20EXPBase, ERC20BLSW) returns (EPOCH_TYPE) {
        return super._epochType();
    }

    function _getEpoch(uint256 pointer) internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256) {
        return super._getEpoch(pointer);
    }

    function _getWindowRage(
        uint256 pointer
    ) internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256 fromEpoch, uint256 toEpoch) {
        return super._getWindowRage(pointer);
    }

    function _getWindowSize() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint8) {
        return super._getWindowSize();
    }

    function _getPointersInEpoch() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint40) {
        return super._getPointersInEpoch();
    }

    function _getPointersInWindow() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint40) {
        return super._getPointersInWindow();
    }

    /// @notice In some Layer 2 (L2) use pre-compiled/system-contract to get block height instead of block.number.
    /// @dev Retrieve block.number as pointer in block-based lazy sliding window.
    /// @return uint256 return the current block height.
    function _pointerProvider() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256) {
        return super._pointerProvider();
    }
}
```

### ERC-7858

#### Individual Expiration

``` Solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC721BLSW} from "@kiwarilabs/contracts/tokens/ERC721/ERC721B.sol";
import {ERC721EXPBase} from "@kiwarilabs/contracts/tokens/ERC721/ERC721EXPBase.sol";

// Expirable ERC721 with individual expiration
contract ExpirableERC721 is ERC721BLSW {

    constructor (string memory name_, string memory symbol_) ERC721BLSW(name_, symbol) {}

}
```

#### Epoch Expiration

``` Solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC721BLSW} from "@kiwarilabs/contracts/tokens/ERC721/extensions/ERC721BLSW.sol";
import {ERC721EXPEpochBase} from "@kiwarilabs/contracts/tokens/ERC721/extensions/ERC721EpochBase.sol";

// Expirable ERC721 with epoch expiration
contract ExpirableERC721 is ERC721BLSW {
    
    constructor (
        string memory name_, 
        string memory symbol_, 
        uint256 initialBlockNumber_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_,
        bool development_) 
        ERC721BLSW(
            name_, 
            symbol_, 
            initialBlockNumber_,
            blocksPerEpoch_,
            windowSize_,
            development) {}

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
