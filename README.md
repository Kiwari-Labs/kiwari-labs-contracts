# Expirable Token
This is a Solidity smart contract that implements an ERC20 token with the UTXO (Unspent Transaction Output) model and an expiration mechanism. The contract is designed to allow the minting of tokens with an expiration date, after which they become unusable.

## Getting Started
#### Prerequisites
To compile and test the smart contract, you need the following:

- node [Download](https://nodejs.org/en/)
- nvm [Download](https://github.com/nvm-sh/nvm#installing-and-updating)
- git [Download](https://git-scm.com/)


#### Installing
```
git clone https://github.com/MASDXI/ERC20-Expriable.git
```
Install the dependencies:
```
cd ERC20UTXOExpirable
yarn install
```
#### Compiling
Compile the smart contract:
```
yarn compile
```

#### Testing
Run the tests:
```
yarn test:utxo
```