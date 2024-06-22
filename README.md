# ERC20 Expirable Token

This is a Solidity smart contract that implements an ERC20 token with the SCDLLS (Sorted Circular Doubly Linked List with Sentinel node) data-structure and sliding window algorithm to enabling the expiration mechanism on ERC20 token. The contract is designed to allow the minting of tokens with an expiration date, after which they become unusable. With sliding window algorithm balance can be change but not dynamic or elastic like in elastic supply token.

## Getting Started

#### Prerequisites

To compile and test the smart contract, you need the following:

- node [Download](https://nodejs.org/en/)
- nvm [Download](https://github.com/nvm-sh/nvm#installing-and-updating)
- git [Download](https://git-scm.com/)

#### Installing

```
git clone https://github.com/MASDXI/ERC20-Expirable.git
```

Change work directory to ERC20-Expirable

```
cd ./ERC20-Expirable
```

Install the dependencies:

```
yarn install
```

#### Compiling

Compile the smart contract:

```
yarn compile
```

Run the tests:

```
yarn test
```

### TODO List

| Task                                                                                                                               | High | Low |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---- | --- |
| test:Unit test all function                                                                                                        | ✓    |     |
| test:Gas Benchmark test                                                                                                            | ✓    |     |
| test:Acceptance/E2E test                                                                                                           | ✓    |     |
| bug:Case block per era more than or less than block per slot \* slot per era (rounding error)                                      | ✓    |     |
| feat:[Change expirePeriod from length of slot into length of blocks](https://github.com/MASDXI/ERC20EXP/issues/4#issue-2234558942) |      | ✓   |
| feat:[Change remove WholeSale for non-expire balance](https://github.com/MASDXI/ERC20EXP/issues/9)                                 |      | ✓   |

## License

All ERC20EXP code Copyright (C) Kiwari Labs. All rights reserved.
