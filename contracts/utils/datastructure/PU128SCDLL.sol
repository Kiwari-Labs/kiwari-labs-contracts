// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @title Packed Uint128 Sorted Circular Doubly Linked List (PU128SCDLL)
/// @dev Stores two 128-bit pointers (next and prev) in a single 256-bit storage slot to reduce storage accesses and costs.
/// @author Kiwari Labs

library PU128SCDLL {
    struct List {
        uint128 size;
    }

    uint8 private constant SENTINEL = 0x00;
    uint128 constant BASE_SLOT = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    uint128 constant MASK_128 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

    function node(List storage list, uint256 element) internal view returns (uint128 previous, uint128 next) {
        assembly {
            let value := sload(xor(xor(list.slot, BASE_SLOT), element))
            next := and(value, MASK_128)
            previous := shr(0x80, value)
        }
    }

    function next(List storage list, uint256 element) internal view returns (uint128 result) {
        assembly {
            result := and(sload(xor(xor(list.slot, BASE_SLOT), element)), MASK_128)
        }
    }

    function previous(List storage list, uint256 element) internal view returns (uint128 result) {
        assembly {
            result := shr(0x80, sload(xor(xor(list.slot, BASE_SLOT), element)))
        }
    }

    function tail(List storage list) internal view returns (uint128 result) {
        assembly {
            result := shr(0x80, sload(xor(xor(list.slot, BASE_SLOT), SENTINEL)))
        }
    }

    function head(List storage list) internal view returns (uint128 result) {
        assembly {
            result := and(sload(xor(xor(list.slot, BASE_SLOT), SENTINEL)), MASK_128)
        }
    }

    function exist(List storage list, uint256 element) internal view returns (bool result) {
        assembly {
            let base := xor(list.slot, BASE_SLOT)
            result := or(
                gt(shr(0x80, sload(xor(base, element))), 0),
                eq(and(sload(xor(base, SENTINEL)), MASK_128), element)
            )
        }
    }

    function middle(List storage list) internal view returns (uint128 result) {
        uint256 size = list.size;
        if (size == 0) return result;
        unchecked {
            size = size / 2; // Find the middle index
            uint128 cursor = head(list); // Start from the head of the list
            for (uint128 index = 0; index < size; index++) {
                result = cursor;
                (, cursor) = node(list, cursor); // move to the next node
            }
        }
    }

    /// @custom:gas-inefficiency O(n)
    function ascending(List storage list) internal view returns (uint256[] memory result) {
        uint256 size = list.size;
        if (size == 0) return result;
        result = new uint256[](size);
        uint256 cursor = uint256(head(list));
        unchecked {
            for (uint128 index = 0; cursor != SENTINEL; index++) {
                result[index] = cursor;
                (, cursor) = node(list, cursor); // use unpack to get the next node
            }
        }
    }

    /// @custom:gas-inefficiency O(n)
    function descending(List storage list) internal view returns (uint256[] memory result) {
        uint256 size = list.size;
        if (size == 0) return result;
        result = new uint256[](size);
        uint256 cursor = uint256(tail(list));
        unchecked {
            for (uint128 index = 0; cursor != SENTINEL; index++) {
                result[index] = cursor;
                (cursor, ) = node(list, cursor); // use unpack to get the prev node
            }
        }
    }

    function remove(List storage list, uint256 element) internal {
        if (exist(list, element)) {
            uint128 previous;
            uint128 next;
            uint128 beforePrevious;
            uint128 afterNext;
            assembly {
                let base := xor(list.slot, BASE_SLOT)
                let value := sload(xor(base, element))
                next := and(value, MASK_128)
                previous := shr(0x80, value)
                beforePrevious := shr(0x80, sload(xor(base, previous)))
                afterNext := and(sload(xor(base, next)), MASK_128)
            }
            if (beforePrevious == afterNext) {
                assembly {
                    sstore(xor(xor(list.slot, BASE_SLOT), SENTINEL), or(shl(0x80, SENTINEL), SENTINEL))
                }
            } else {
                assembly {
                    let base := xor(list.slot, BASE_SLOT)
                    sstore(xor(base, previous), or(shl(0x80, beforePrevious), next))
                    sstore(xor(base, next), or(shl(0x80, previous), afterNext))
                }
            }
            assembly {
                sstore(xor(xor(list.slot, BASE_SLOT), element), SENTINEL)
            }
            unchecked {
                list.size--;
            }
        }
    }

    /// @custom:gas-inefficiency O(n)
    function insert(List storage list, uint256 element) internal {
        uint128 e = uint128(element);
        if (!exist(list, e)) {
            uint128 size = list.size;
            uint128 back;
            uint128 front;
            assembly {
                let value := sload(xor(xor(list.slot, BASE_SLOT), SENTINEL))
                front := and(value, MASK_128)
                back := shr(0x80, value)
            }
            if (size == 0) {
                assembly {
                    mstore(0x20, xor(list.slot, BASE_SLOT))
                    sstore(xor(mload(0x20), SENTINEL), or(shl(0x80, e), e))
                    sstore(xor(mload(0x20), e), or(shl(0x80, SENTINEL), SENTINEL))
                }
            } else if (e < front) {
                // push_front
                assembly {
                    let base := xor(list.slot, BASE_SLOT)
                    sstore(xor(base, e), or(shl(0x80, SENTINEL), front))
                    sstore(xor(base, SENTINEL), or(shl(0x80, back), e))
                    back := sload(xor(base, front))
                    sstore(xor(base, front), or(shl(0x80, e), and(back, MASK_128)))
                }
            } else if (e > back) {
                // push_back
                assembly {
                    let base := xor(list.slot, BASE_SLOT)
                    sstore(xor(base, e), or(shl(0x80, back), SENTINEL))
                    sstore(xor(base, SENTINEL), or(shl(0x80, e), front))
                    sstore(xor(base, back), or(shl(0x80, shr(0x80, sload(xor(base, back)))), e))
                }
            } else {
                // push
                uint128 cursor = front;
                unchecked {
                    if (e - front <= back - e) {
                        while (e > cursor) {
                            (, cursor) = node(list, cursor);
                        }
                    } else {
                        cursor = back;
                        while (e < cursor) {
                            (cursor, ) = node(list, cursor);
                        }
                    }
                }
                assembly {
                    let base := xor(list.slot, BASE_SLOT)
                    let value := sload(xor(base, cursor))
                    front := and(value, MASK_128)
                    back := shr(0x80, value)
                    sstore(xor(base, e), or(shl(0x80, back), cursor))
                    sstore(xor(base, cursor), or(shl(0x80, e), front))
                    sstore(xor(base, back), or(shl(0x80, shr(0x80, sload(xor(base, back)))), e))
                }
            }
            unchecked {
                list.size = size + 1;
            }
        }
    }
}
