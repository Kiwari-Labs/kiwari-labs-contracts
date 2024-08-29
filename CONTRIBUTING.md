## Getting Started

#### Prerequisites

To compile and test the smart contract, you need the following:

- node [Download](https://nodejs.org/en/)
- nvm [Download](https://github.com/nvm-sh/nvm#installing-and-updating)
- yarn [Download](https://yarnpkg.com/getting-started/install)
- git [Download](https://git-scm.com/)

#### Installing

```
git clone https://github.com/Kiwari-Labs/asset-contracts.git
```

Change work directory to asset-contracts

```
cd ./asset-contracts
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