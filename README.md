# ERC20 Expirable Token

This is a Solidity smart contract that implements an ERC20 token with the SCDLLS (Sorted Circular Doubly Linked List with Sentinel node) data-structure and sliding window algorithm to enabling the expiration mechanism on ERC20 token. The contract is designed to allow the minting of tokens with an expiration date, after which they become unusable. With sliding window algorithm balance can be change but not dynamic or elastic like in elastic supply token.

## Getting Started

#### Prerequisites

To compile and test the smart contract, you need the following:

- node [Download](https://nodejs.org/en/)
- nvm [Download](https://github.com/nvm-sh/nvm#installing-and-updating)
- yarn [Download](https://yarnpkg.com/getting-started/install)
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

Run the tests coverage:

```
yarn coverage
```

`**NOTE: require at least 4GB of RAM to run tests coverage.`

### TODO List

| Task                                                                                                                               | High | Low |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---- | --- |
| test:Unit test all function                                                                                                        | ✓    |     |
| test:Gas Benchmark test                                                                                                            | ✓    |     |
| test:Acceptance/E2E test                                                                                                           | ✓    |     |
| feat:[Change expirePeriod from length of slot into length of blocks](https://github.com/MASDXI/ERC20EXP/issues/4#issue-2234558942) |      | ✓   |
| feat:[issue9](https://github.com/MASDXI/ERC20EXP/issues/9),[pullrequest](https://github.com/MASDXI/ERC20EXP/pull/23)               | ✓    |     |

## License

All ERC20EXP code Copyright (C) Kiwari Labs. All rights reserved.
