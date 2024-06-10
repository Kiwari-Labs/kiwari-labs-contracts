---
title: ERC20 Expirable Extension
description: An expirable extension for make expirable fungible token.
author: sirawt (@MASDXI), ADISAKBOONMARK (@ADISAKBOONMARK)
discussions-to: https://ethereum-magicians.org/t/eip-number-name/number
status: Draft
type: Standards Track
category: ERC
created: 2024-mm-dd
requires: 20, 165, 1410, 3643
---

## Simple Summary

An expiration token extension standard interface for ERC20 tokens

## Abstract

This extension standard provides expiration feature.

## Motivation

An extension standard allows to create tokens with expiration date like loyalty that backward compatible with ERC20 interface.

## Specification

To create fungible tokens that have abilities to expiration like loyalty reward is 
challenge due to the limitation of smart contract concept that every block has block gas limit how to preventing the transaction of   contract hits the block gas limit while compatible with existing ERC20 standard interface.

## Rationale
##### Requirement: 
- [x] Compatible with existing ERC20 standard.
- [x] Configurable expiration period can be change.
- [x] Configurable block period (blocktime) can be change.
- [x] Auto select nearly expiration token when transfer as default (FIFO).
- [x] Auto look back spendable balance.
- [x] Extensible design for fit the business use case.  
##### Additional requirement:
- [ ] Whitelist account holding non-expriable balance.
- [ ] Separate spending and receiving balance on whitelist account.

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
With this struct `Slot` it's providing abstract loop in horizontal way more efficient to calculate usable balance of the account because it's provide `slotBalance` so
you don't need to get to iterate or traversal over the `list` for each `Slot` to calculate the entire slot balance if the slot can presume not expire. otherwise struct `Slot` also providing vertical in a sorted list.

##### Buffer Slot

In the design sliding window algorithm need to be coarse because it's deterministic and fixed size to ensure that usable balance that nearly expire will be include in usable balance of the account it's need to buffered one slot

- [ ] This contract provide loyalty reward like, it's expirable so it's not suitable to have `MAX_SUPPLY`.
- [ ] This contract have `gasUsed` per interaction higher than original ERC20.
- [ ] This contract rely on `block.number` rather than `block.timestamp` so whatever happen that make network halt asset will be safe.
- [ ] This contract can have scenario that expiration block are shorten than actual true expiration block, due to `blockPerYear` and `blockPerSlot * slotPerEra` output from calculate can be different.

``` text
    /* @note Motivation
    * avoid to change ERC20 Interface Standard, support most ERC20 Interface Standard as much as possible.
    * avoid to declaration ERA or SLOT as global variable and maintaining the counter style as much as possible.
    * support configurable expiration period change.
    * support configurable block produce per year of the network are change.
    * support extensible hook logic beforeTransfer, AfterTransfer if use @openzeppelin v4.x and above.
    * smart contract address can be grant as wholesale account so token in contract are non-expirable.
    * ** to ensure balance correctness it's need to buffer 1 slot for look back.
    * ** Warning: avoid to combine this contract with other ERC20 extension,
    *    due it's can cause unexpected behavior.
    * ** Warning: this rely on blocknumber more than block.timestamp
    *    in some scenario expiration block are shorten than actual true expiration block
    *
    */
```
Assuming each era contain 4 slot.
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

`Era` definition  
Similar idea fo page in pagination.

`FIFO` definition
First In First Out.

`Slot` definition
Similar idea of index in each page of pagination.  
** first index of slot is 0

## Security Considerations
all address that not registered as whitelist address will be use sliding window algorithm by default.
Sliding window algorithm is not update the 

## Copyright

Copyright and related rights waived via [CC0](../LICENSE.md).