


## Simple Summary

An expiration token extension standard interface for ERC20 tokens

## Abstract

This extenstion standard provides expiration feature.

## Motivation

An extension standard allows to create tokens with expiration date like loyalty that backward complatibitie with ERC20 interface.

## Specification

To create fungible tokens that have abilities to expiration like loyalty reward is 
challege due to the limitation of smart contract concept that every block has block gas limit how to preventing the transaction of   contract hits the block gas limit while compatible with existing ERC20 standard interface.

##### Requirement: 
- [ ] Compatible with existing ERC20 standard.
- [ ] Configuration expiration period can be change.
- [ ] Configuration block period can be change.
- [ ] Auto select nearly expiration token when transfer as default (FIFO).
- [ ] Auto look back spendable balance.

##### Rational
- [ ] This contract provide loyalty reward like, it's expirable so it's not suitable to have `MAX_SUPPLY`.
- [ ] This contract have `gasUsed` per interaction higher than original ERC20.
- [ ] This contract rely on `block.number` rather than `block.timestamp` so whatever happen that make network halt asset will be safe.

#### Era and Slot Conceptual

`Era` defination  
similar idea fo page in pagination

`Slot` defination
similar idea of index in each page of pagination
** frist index of slot is 0
``` text
    /* @note Motiviation
    * avoid to change ERC20 Interface Standard, support most ERC20 Interface Standard as much as possible.
    * avoid to declaration ERA or SLOT as global variable and maintaining the counter style as much as possible.
    * support configurable expiration period change.
    * support configurable block produce per year of the network are change.
    * support extensible hook logic beforeTransfer, AfterTransfer if use @openzeppelin v4.x and above.
    * smart contract address can be grant as wholesale account so token in contract are non-expirable
    * ExpirePeriod to ERA-SLOT Mapping.
    *┌─────────┬─────────────────────────┐
    *│   SLOT  │         ERA cycle       │
    *├─────────┼─────────────────────────┤
    *│    1    │   0 ERA cycle, 1 SLOT   │
    *│    2    │   0 ERA cycle, 2 SLOT   │
    *│    3    │   0 ERA cycle, 3 SLOT   │
    *│    4    │   1 ERA cycle, 0 SLOT   │
    *│    5    │   1 ERA cycle, 1 SLOT   │
    *│    6    │   1 ERA cycle, 2 SLOT   │
    *│    7    │   1 ERA cycle, 3 SLOT   │
    *│    8    │   2 ERA cycle, 0 SLOT   │
    *└─────────┴─────────────────────────┘
    * ** to ensure balance correctness it's need to buffer 1 slot for looback.
    * ** Warning: avoid to use in sub-zero blocktime network.
    *    31,556,952,000 are year in milliseconds
    * ** Warning: avoid to combine this contract with other ERC20 extension,
    *    due it's can cause unexpected behavior.
    * ** Warning: this rely on blocknumber more than block.timestamp
    *    in some scenario expiration block are shorten than actual true expiration block
    *
    */
```

```
        // 7889231 index if blocktime is 1 and expire period is 1 slot receive token every 1 second
        // 1577846 index if blocktime is 5 and expire period is 1 slot receive token every 5 second
        // 788923 index if blocktime is 10 and expire period is 1 slot receive token every 10 second
        // 91 index if blocktime 1 is and expire period is 1 slot receive token every 84600 second (1day)
        // 18 index if blocktime 5 is and expire period is 1 slot receive token every 84600 second (1day)
        // 9 index if blocktime 10 is and expire period is 1 slot receive token every 84600 second (1day)
        // dynamic adjust number slot per era from given blockperiod
        // if short blockperiod increase slot per era 
        // if long blockperiod decrease slot per era
        // how ever buffer slot still 1 even slot increase or decrease
        // @note if wanted to reduce size in each slot reduce the frequent of receive token
```
