// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

/// @title Sorted List Library
/// @dev stores two 128-bit pointers `next` and `previous` in a single 256-bit storage slot to reduce storage accesses costs.
/// @author sirawt (@MASDXI)
/// @notice This library is still under development and is not suitable for production.
/// It requires fuzz testing to ensure that the storage slot usage is diversified and avoids collisions.

library xort128 {
    struct List {
        uint8 _spacer;
    }

    uint8 private constant SENTINEL = 0x00;
    uint128 constant MAX_UINT128 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

    function next(List storage self, uint256 element) internal view returns (uint128 result) {
        assembly {
            let base := xor(self.slot, MAX_UINT128)
            let value := sload(xor(base, element))
            result := and(value, MAX_UINT128)
        }
    }

    function previous(List storage self, uint256 element) internal view returns (uint128 result) {
        assembly {
            let base := xor(self.slot, MAX_UINT128)
            let value := sload(xor(base, element))
            result := shr(0x80, value)
        }
    }

    function back(List storage self) internal view returns (uint128 result) {
        assembly {
            let base := xor(self.slot, MAX_UINT128)
            let value := sload(xor(base, SENTINEL))
            result := shr(0x80, value)
        }
    }

    function front(List storage self) internal view returns (uint128 result) {
        assembly {
            let base := xor(self.slot, MAX_UINT128)
            let value := sload(xor(base, SENTINEL))
            result := and(value, MAX_UINT128)
        }
    }

    function contains(List storage self, uint256 element) internal view returns (bool result) {
        assembly {
            let base := xor(self.slot, MAX_UINT128)
            result := or(gt(shr(0x80, sload(xor(base, element))), 0), eq(and(sload(xor(base, SENTINEL)), MAX_UINT128), element))
        }
    }

    /// @notice not dynamics
    function toArray(List storage self) internal view returns (uint256[] memory result) {
        uint128 cursor = front(self);
        if (cursor == SENTINEL) return result;
        result = new uint256[](512);
        uint128 index;
        unchecked {
            for (; cursor != SENTINEL; index++) {
                result[index] = cursor;
                cursor = next(self, cursor);
            }
        }
        assembly {
            mstore(result, index)
        }
    }

    function remove(List storage self, uint256 element) internal {
        if (contains(self, element)) {
            uint128 previous;
            uint128 next;
            uint128 beforePrevious;
            uint128 afterNext;
            uint256 slot;
            uint256 base;
            assembly {
                slot := self.slot
                base := xor(slot, MAX_UINT128)
                let value := sload(xor(base, element))
                next := and(value, MAX_UINT128)
                previous := shr(0x80, value)
                beforePrevious := shr(0x80, sload(xor(base, previous)))
                afterNext := and(sload(xor(base, next)), MAX_UINT128)
            }
            if (beforePrevious == afterNext) {
                assembly {
                    sstore(xor(base, SENTINEL), or(shl(0x80, SENTINEL), SENTINEL))
                }
            } else {
                assembly {
                    sstore(xor(base, previous), or(shl(0x80, beforePrevious), next))
                    sstore(xor(base, next), or(shl(0x80, previous), afterNext))
                }
            }
            assembly {
                sstore(xor(base, element), SENTINEL)
            }
        }
    }

    function insert(List storage self, uint256 element) internal {
        // cast down
        uint128 e = uint128(element);
        if (!contains(self, e)) {
            uint128 back = back(self);
            uint128 front = front(self);
            uint256 base;
            assembly {
                base := xor(self.slot, MAX_UINT128)
            }
            if (front == SENTINEL) {
                assembly {
                    mstore(0x20, base)
                    sstore(xor(mload(0x20), SENTINEL), or(shl(0x80, e), e))
                    sstore(xor(mload(0x20), e), or(shl(0x80, SENTINEL), SENTINEL))
                }
                return;
            }
            if (e < front) {
                // push_front
                assembly {
                    sstore(xor(base, e), or(shl(0x80, SENTINEL), front))
                    sstore(xor(base, SENTINEL), or(shl(0x80, back), e))
                    back := sload(xor(base, front))
                    sstore(xor(base, front), or(shl(0x80, e), and(back, MAX_UINT128)))
                }
                return;
            }
            if (e > back) {
                // push_back
                assembly {
                    sstore(xor(base, e), or(shl(0x80, back), SENTINEL))
                    sstore(xor(base, SENTINEL), or(shl(0x80, e), front))
                    sstore(xor(base, back), or(shl(0x80, shr(0x80, sload(xor(base, back)))), e))
                }
                return;
            }
            // push
            uint128 cursor = front;
            unchecked {
                while (e > cursor) {
                    cursor = next(self, cursor);
                }
            }
            assembly {
                let value := sload(xor(base, cursor))
                front := and(value, MAX_UINT128)
                back := shr(0x80, value)
                sstore(xor(base, e), or(shl(0x80, back), cursor))
                sstore(xor(base, cursor), or(shl(0x80, e), front))
                sstore(xor(base, back), or(shl(0x80, shr(0x80, sload(xor(base, back)))), e))
            }
        }
    }

    function isEmpty(List storage self) internal view returns (bool) {
        return (front(self) == SENTINEL);
    }

    // @TODO shrink set new head
    // function shrink(List storage self, uint256 element) internal {
    // }
}

// contract SortedListTest {
//     using xort128 for xort128.List;

//     xort128.List private list;

//     // Event to track changes to the list
//     event ListUpdated(uint256[] newList);

//     // Function to insert multiple elements into the sorted list
//     function insertMultiple(uint256[] memory elements) public {
//         for (uint256 i = 0; i < elements.length; i++) {
//             list.insert(elements[i]);
//         }
//     }

//     function insert(uint256 elements) public {
//         list.insert(elements);
//     }

//     // Function to convert the list to an array for easier testing
//     function toArray() public view returns (uint256[] memory) {
//         return list.toArray();
//     }

//     // Function to check if an element exists in the list
//     function containsElement(uint256 element) public view returns (bool) {
//         return list.contains(element);
//     }

//     // Function to remove an element from the list
//     function removeElement(uint256 element) public {
//         list.remove(element);
//     }

//     // Function to test the current front of the list
//     function getFront() public view returns (uint256) {
//         return list.front();
//     }

//     // Function to test the current back of the list
//     function getBack() public view returns (uint256) {
//         return list.back();
//     }
// }
