# ERC20 Expirable Token
This is a Solidity smart contract that implements an ERC20 token with the CDLLS (Circular Doubly Linked List with Sentinel node) data-structure and sliding window algorithm to enabling the expiration mechanism on ERC20 token. The contract is designed to allow the minting of tokens with an expiration date, after which they become unusable.

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

## Testing
### Test case
Reasonable number of receive transaction per user per slot.
``` 
273 index if blocktime 1 is and expire period is 1 slot receive token every 28200 second (3tx/day)
``` 
###### ** TODO need to reduce the gas used for suitable in any usecase or under uncertain condition.
Run the tests:
```
yarn test
```