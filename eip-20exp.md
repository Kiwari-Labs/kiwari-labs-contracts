---
title: ERC20 Expirable Extension
description: An expirable extension for making expirable fungible tokens.
author: sirawt (@MASDXI), ADISAKBOONMARK (@ADISAKBOONMARK)
discussions-to: https://ethereum-magicians.org/t/eip-number-name/number
status: Draft
type: Standards Track
category: ERC
created: 2024-09-09
requires: 20, 165, 1400, 3643
---

## Simple Summary

An expiration token extension standard interface for ERC20 tokens

## Abstract

This extension standard provides an expiration feature.

## Motivation

An extension standard allows to create of tokens with expiration dates like loyalty that are backward compatible with the ERC20 interface.

## Specification

Creating fungible tokens that have abilities to expire like loyalty rewards is 
a challenge due to the limitation of the smart contract concept that every block has a block gas limit how to prevent the transaction of   the contract hits the block gas limit while compatible with the existing ERC20 standard interface.
`ERC1400` and `ERC3643` both are large.

## Rationale
##### Requirement: 
- [x] Compatible with existing ERC20 standard.
- [x] Configurable expiration period can be change.
- [x] Configurable block period (blocktime) can be changed.
- [x] Auto select nearly expiration token when transfer as default (FIFO).
- [x] Extensible design to fit the business use case.  

##### Era and Slot Conceptual

This contract creates an abstract implementation that adopts the sliding window algorithm to maintain a window over a period of time (block height). This efficient approach allows for the look back and calculation of usable balances for each account within that window period. With this approach, the contract does not require a variable acting as a "counter" to keep updating the latest state (current period), nor does it need any interaction calls to keep updating the current period, which is an effortful and costly design.

``` markdown
 ExpirePeriod to ERA-SLOT Mapping.
 ┌─────────┬──────────────────────────┐
 │   SLOT  │         ERA cycle        │
 ├─────────┼──────────────────────────┤
 │    1    │   0 ERA cycle, 1 SLOT    │
 │    2    │   0 ERA cycle, 2 SLOT    │
 │    3    │   0 ERA cycle, 3 SLOT    │
 │    4    │   1 ERA cycle, 0 SLOT    │
 │    5    │   1 ERA cycle, 1 SLOT    │
 │    6    │   1 ERA cycle, 2 SLOT    │
 │    7    │   1 ERA cycle, 3 SLOT    │
 │    8    │   2 ERA cycle, 0 SLOT    │
 │    9    │   2 ERA cycle, 1 SLOT    │
 │   10    │   2 ERA cycle, 2 SLOT    │
 │   11    │   2 ERA cycle, 3 SLOT    │
 │   12    │   3 ERA cycle, 0 SLOT    │
 │   13    │   3 ERA cycle, 1 SLOT    │
 │   14    │   3 ERA cycle, 2 SLOT    │
 │   15    │   3 ERA cycle, 3 SLOT    │
 │   16    │   4 ERA cycle, 0 SLOT    │
 └─────────┴──────────────────────────┘
```

##### Vertical and Horizontal Scaling

``` solidity
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        CircularDoublyLinkedList.List list;
    }
    
    //... skipping

    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _balances;
```
With this struct `Slot` it provides an abstract loop in a horizontal way more efficient for calculating the usable balance of the account because it provides `slotBalance` which acts as suffix balance so you don't need to get to iterate or traversal over the `list` for each `Slot` to calculate the entire slot balance if the slot can presume not to expire. otherwise struct `Slot` also provides vertical in a sorted list.

##### Buffer Slot

In the design sliding window algorithm needs to be coarse because it's deterministic and fixed in size to ensure that a usable balance that nearly expires will be included in the usable balance of the account it's needs to buffered one slot.

- [ ] This contract provides a loyalty reward like, it's expirable so it's not suitable to have `MAX_SUPPLY`.
- [ ] This contract has `gasUsed` per interaction higher than the original ERC20.
- [ ] This contract relies on `block.number` rather than `block.timestamp` so whatever happens that makes the network halt asset will be safe.
- [ ] This contract can have a scenario where the expiration block is shorter than the actual true expiration block, due to the `blockPerYear` and `blockPerSlot * slotPerEra` output from calculate can be different.

``` text
    /* @note Motivation
    * Avoid changing ERC20 Interface Standard, support most ERC20 Interface Standard as much as possible.
    * Avoid declaring ERA or SLOT as a global variable and maintain the counter style as much as possible.
    * support configurable expiration period change.
    * support configurable blocks produce per year of the network are change.
    * support extensible hook logic beforeTransfer, AfterTransfer if use @openzeppelin v4.x and above.
    * smart contract address can be granted as a wholesale account so tokens in the contract are non-expirable.
    * ** To ensure balance correctness it's need to buffer 1 slot for look back.
    * ** Warning: avoid to combine this contract with other ERC20 extension,
    *    due it's can cause unexpected behavior.
    * ** Warning: this relies on block.number more than the block.timestamp
    *    in some scenarios expiration blocks are shortened than the actual true expiration block
    *
    */
```
Assuming each era contains 4 slots.
| Block Time (ms) | Receive Token Every (ms) | index/slot              | tx/day | Likelihood   |
|-----------------|--------------------------|-------------------------|--------|--------------|
| 100             | 100                      | 78,892,315              | 864,000| Very Unlikely|
| 500             | 500                      | 15,778,463              | 172,800| Very Unlikely|
| 1000            | 1000                     | 7,889,231               | 86,400 | Very Unlikely|
| 1000            | 28,800,000               | 273                     | 3      | Unlikely     |
| 1000            | 86,400,000               | 91                      | 1      | Possible     |
| 5000            | 86,400,000               | 18                      | 1      | Very Likely  |
| 10000           | 86,400,000               | 9                       | 1      | Very Likely  |


#### Appendix

`Era` definition is a Similar idea for a page in pagination.

`FIFO` definition First In First Out.

`Slot` definition is Similar to the idea of the index on each page of pagination.  
** The first index of the slot is 0

## Security Considerations
- Run out of gas problem due to the operation consuming high gas used if transferring multiple groups of small tokens.
- Exceeds block gas limit if the blockchain have block gas limit lower than the gas used of the transaction. 
- Need to be avoiding to create a [dust](https://www.investopedia.com/terms/b/bitcoin-dust.asp) transaction from actions transfer, minting and burning.
- State bloat growth the database size.

## Copyright and License

[BSL-1.1](/LICENSE).
