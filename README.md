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
import {ERC20BLSW} from "@kiwarilabs/contracts/tokens/ERC20/BLSW/ERC20BLSW.sol";

contract ExpirableERC20 is ERC20EXPBase, ERC20BLSW {
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

ERC-7858

> [!IMPORTANT] This ERC still underdevelopment.

## Contribute

Check out the contribution [guide](CONTRIBUTING.md)

## Support and Issue

For support or any inquiries, feel free to reach out to us at [github-issue](https://github.com/Kiwari-Labs/kiwari-labs-contracts/issues) or kiwarilabs@protonmail.com

## License

This repository is released under the [Apache-2.0](LICENSE).  
Copyright (C) Kiwari Labs. 
