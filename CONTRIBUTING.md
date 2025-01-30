## Prerequisites

Before you begin developing or contributing to kiwari-labs-contracts, ensure that the following software is installed. And please follow the code pattern.

- node [Download](https://nodejs.org/en/)
- nvm [Download](https://github.com/nvm-sh/nvm#installing-and-updating)
- yarn [Download](https://yarnpkg.com/getting-started/install)
- git [Download](https://git-scm.com/)

## Development

```
git clone https://github.com/Kiwari-Labs/kiwari-labs-contracts.git
```

Change work directory to `kiwari-labs-contracts`

```
cd ./kiwari-labs-contracts
```

Install the dependencies via `yarn`

```
yarn install
```

## Compiling and Test

Compile the `solidity` smart contract:

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

> [!IMPORTANT]
> require 8GB of RAM, to run all the test coverage.