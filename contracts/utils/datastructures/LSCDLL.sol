// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title A lightweight version of a Sorted Circular Doubly Linked List.
 * @author Kiwari Labs
 * @notice This version reduces gas usage by removing embedded byte data from nodes and incurs less overhead compared to the original version.
 */
library SCDLL {
    /**
     * Sorted Circular Doubly Linked List
     */
    struct List {
        uint256 _size;
        mapping(uint256 node => mapping(bool direction => uint256 value)) _nodes;
    }

    /**
     * Constants for managing a doubly linked list.
     */
    uint8 private constant ONE_BIT = 1; // A constant representing a single bit (1).
    uint8 private constant SENTINEL = 0; // A sentinel value used to indicate the end or start of the list.
    bool private constant PREV = false; // Direction constant for the previous node.
    bool private constant NEXT = true; // Direction constant for the next node.

    /**
     * @notice Partitions the linked list in the specified direction.
     * @dev This function creates an array `part` of size `listSize`, containing the indices of nodes
     * in the linked list, traversed in the specified `direction` (NEXT or PREV).
     * @param self The linked list state.
     * @param listSize The size of the list to partition.
     * @param direction The direction of traversal: NEXT for forward, PREV for backward.
     * @return part An array containing the indices of the nodes in the partition.
     */
    function _partition(List storage self, uint256 listSize, bool direction) private view returns (uint256[] memory part) {
        unchecked {
            part = new uint256[](listSize);
            uint256 index;
            for (uint256 i = SENTINEL; i < listSize; i++) {
                part[i] = self._nodes[index][direction];
                index = part[i];
            }
        }
    }

    /**
     * @notice Retrieves the path of node indices in the specified direction, starting from the given index.
     * @dev Constructs an array `part` containing the indices of nodes in the linked list,
     * starting from `index` and following the specified `direction` (NEXT or PREV) until the end is reached.
     * @param self The linked list state.
     * @param index The starting index of the node.
     * @param direction The direction of traversal: NEXT for forward, PREV for backward.
     * @return part An array of node indices from the starting index to the head (for NEXT) or the tail (for PREV).
     */
    function _path(List storage self, uint256 index, bool direction) private view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        part = new uint[](tmpSize);
        uint256 counter;
        unchecked {
            while (index != SENTINEL && counter < tmpSize) {
                part[counter] = index;
                counter++;
                index = self._nodes[index][direction];
            }
        }
        assembly {
            /// @notice Resize the array to the actual count of elements using inline assembly.
            mstore(part, counter) // Set the array length to the actual count.
        }
    }

    /**
     * @notice Traverses the linked list in the specified direction and returns a list of node indices.
     * @dev Constructs an array `list` containing the indices of nodes in the linked list,
     * starting from either the head or the tail, based on the `direction` parameter.
     * @param self The linked list state.
     * @param direction The traversal direction: true for forward (starting from the head), false for backward (starting from the tail).
     * @return list An array of node indices ordered according to the specified direction.
     */
    function _traversal(List storage self, bool direction) private view returns (uint256[] memory list) {
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            uint256 index;
            list = new uint256[](tmpSize);
            list[SENTINEL] = self._nodes[index][!direction];
            unchecked {
                for (uint256 i = tmpSize - 1; i > SENTINEL; i--) {
                    list[i] = self._nodes[index][direction];
                    index = list[i];
                }
            }
        }
    }

    /**
     * @notice Checks if a node exists in the linked list.
     * @dev Check if a node exists in the linked list at the specified index.
     * @param self The linked list state.
     * @param index The index of the node to check.
     * @return result True if the node exists, false otherwise.
     */
    function exist(List storage self, uint256 index) internal view returns (bool result) {
        uint256 tmpPrev = self._nodes[index][PREV];
        uint256 tmpNext = self._nodes[SENTINEL][NEXT];
        assembly {
            result := or(eq(tmpNext, index), gt(tmpPrev, 0))
        }
    }

    /**
     * @notice Retrieves the index of the next node in the list.
     * @dev Accesses the `_nodes` mapping in the `List` structure to fetch the index of the next node.
     * @param self The linked list state.
     * @param index The index of the current node.
     * @return The index of the next node.
     */
    function next(List storage self, uint256 index) internal view returns (uint256) {
        return self._nodes[index][NEXT];
    }

    /**
     * @notice Get the index of the previous node in the list.
     * @dev Accesses the `_nodes` mapping in the `List` structure to get the index of the previous node.
     * @param self The linked list state.
     * @param index The index of the current node.
     * @return The index of the previous node.
     */
    function previous(List storage self, uint256 index) internal view returns (uint256) {
        return self._nodes[index][PREV];
    }

    /**
     * @notice Inserts data into the linked list at the specified index.
     * @dev This function inserts the provided data into the linked list at the given index.
     * @param self The linked list state.
     * @param index The index at which to insert the data.
     */
    function insert(List storage self, uint256 index) internal {
        if (!exist(self, index)) {
            uint256 tmpTail = self._nodes[SENTINEL][PREV];
            uint256 tmpHead = self._nodes[SENTINEL][NEXT];
            uint256 tmpSize = self._size;
            if (tmpSize == SENTINEL) {
                self._nodes[SENTINEL][NEXT] = index;
                self._nodes[SENTINEL][PREV] = index;
                self._nodes[index][PREV] = SENTINEL;
                self._nodes[index][NEXT] = SENTINEL;
            } else if (index < tmpHead) {
                self._nodes[SENTINEL][NEXT] = index;
                self._nodes[tmpHead][PREV] = index;
                self._nodes[index][PREV] = SENTINEL;
                self._nodes[index][NEXT] = tmpHead;
            } else if (index > tmpTail) {
                self._nodes[SENTINEL][PREV] = index;
                self._nodes[tmpTail][NEXT] = index;
                self._nodes[index][PREV] = tmpTail;
                self._nodes[index][NEXT] = SENTINEL;
            } else {
                uint256 tmpCurr;
                unchecked {
                    if (index - tmpHead <= tmpTail - index) {
                        tmpCurr = tmpHead;
                        while (index > tmpCurr) {
                            tmpCurr = self._nodes[tmpCurr][NEXT];
                        }
                    } else {
                        tmpCurr = tmpTail;
                        while (index < tmpCurr) {
                            tmpCurr = self._nodes[tmpCurr][PREV];
                        }
                    }
                }
                uint256 tmpPrev = self._nodes[tmpCurr][PREV];
                self._nodes[tmpPrev][NEXT] = index;
                self._nodes[tmpCurr][PREV] = index;
                self._nodes[index][PREV] = tmpPrev;
                self._nodes[index][NEXT] = tmpCurr;
            }
            assembly {
                sstore(self.slot, add(tmpSize, 1))
            }
        }
    }

    /**
     * @notice Removes a node from the linked list at the specified index.
     * @dev This function removes the node from the linked list at the given index.
     * @param self The linked list state.
     * @param index The index of the node to remove.
     */
    function remove(List storage self, uint256 index) internal {
        if (exist(self, index)) {
            uint256 tmpPrev = self._nodes[index][PREV];
            uint256 tmpNext = self._nodes[index][NEXT];
            self._nodes[index][NEXT] = SENTINEL;
            self._nodes[index][PREV] = SENTINEL;
            self._nodes[tmpPrev][NEXT] = tmpNext;
            self._nodes[tmpNext][PREV] = tmpPrev;
            assembly {
                sstore(self.slot, sub(sload(self.slot), 1))
            }
        }
    }

    /**
     * @notice Shrinks the list by removing all nodes before the specified index.
     * @dev Updates the head of the list to the specified index, removing all nodes before it.
     * @param self The linked list state.
     * @param index The index from which to shrink the list. All nodes before this index will be removed.
     */
    function shrink(List storage self, uint256 index) internal {
        if (exist(self, index)) {
            uint256 tmpCurr = self._nodes[SENTINEL][NEXT];
            uint256 tmpSize = self._size;
            while (tmpCurr != index) {
                uint256 tmpNext = self._nodes[tmpCurr][NEXT];
                self._nodes[tmpCurr][NEXT] = SENTINEL;
                self._nodes[tmpCurr][PREV] = SENTINEL;
                tmpCurr = tmpNext;
                unchecked {
                    tmpSize--;
                }
            }
            assembly {
                sstore(self.slot, tmpSize)
            }
            self._nodes[SENTINEL][NEXT] = index;
            self._nodes[index][PREV] = SENTINEL;
        }
    }

    /**
     * @notice Shrinks the list by setting a new head without removing previous nodes.
     * @dev Updates the head pointer to the specified `index` without traversing or cleaning up previous nodes.
     * @param self The linked list state.
     * @param index The index to set as the new head of the list.
     */
    function lazyShrink(List storage self, uint256 index) internal {
        if (exist(self, index)) {
            self._nodes[SENTINEL][NEXT] = index; // forced link sentinel to new head
            self._nodes[index][PREV] = SENTINEL; // forced link previous of index to sentinel

            uint256 counter;
            while (index != SENTINEL) {
                unchecked {
                    counter++;
                }
                index = self._nodes[index][NEXT];
            }
            self._size = counter;
        }
    }

    /**
     * @notice Retrieves the index of the head node in the linked list.
     * @dev Returns the index of the head node in the linked list.
     * @param self The linked list state.
     * @return The index of the head node.
     */
    function head(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][NEXT];
    }

    /**
     * @notice Retrieves the index of the middle node in the list.
     * @dev Returns the index of the middle node in the linked list.
     * @param self The linked list state.
     * @return mid The index of the middle node.
     */
    function middle(List storage self) internal view returns (uint256 mid) {
        assembly {
            mid := sload(self.slot)
            if iszero(mid) {
                return(0x00, 0x20)
            }
        }
        uint256[] memory tmpList = firstPartition(self);
        mid = tmpList[tmpList.length - 1];
    }

    /**
     * @notice Retrieves the index of the tail node in the linked list.
     * @dev Returns the index of the tail node in the linked list.
     * @param self The linked list state.
     * @return The index of the tail node.
     */
    function tail(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][PREV];
    }

    /**
     * @notice Retrieves the size of the linked list.
     * @dev Returns the size of the linked list.
     * @param self The linked list state.
     * @return The size of the linked list.
     */
    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }

    /**
     * @notice Retrieves information about a node in the list.
     * @dev Returns information about a node in the list at the specified index.
     * @param self The linked list state.
     * @param index The index of the node.
     * @return prev The index of the previous node.
     * @return next The index of the next node.
     */
    function node(List storage self, uint256 index) internal view returns (uint256, uint256) {
        return (self._nodes[index][PREV], self._nodes[index][NEXT]);
    }

    /**
     * @notice Retrieves the indices of nodes in ascending order.
     * @dev Returns an array containing the indices of nodes in ascending order.
     * @param self The linked list state.
     * @return An array of node indices in ascending order.
     */
    function ascending(List storage self) internal view returns (uint256[] memory) {
        return _traversal(self, PREV);
    }

    /**
     * @notice Retrieves the indices of nodes in descending order.
     * @dev Returns an array containing the indices of nodes in descending order.
     * @param self The linked list state.
     * @return An array of node indices in descending order.
     */
    function descending(List storage self) internal view returns (uint256[] memory) {
        return _traversal(self, NEXT);
    }

    /**
     * @notice Retrieves the indices of nodes in the first partition of the linked list.
     * @dev Returns an array containing the indices of nodes in the first partition of the linked list.
     * @param self The linked list state.
     * @return part An array of node indices in the first partition.
     */
    function firstPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            unchecked {
                tmpSize = tmpSize == 1 ? tmpSize : tmpSize >> ONE_BIT;
            }
            part = _partition(self, tmpSize, NEXT);
        }
    }

    /**
     * @notice Retrieves the indices of nodes in the second partition of the linked list.
     * @dev Returns an array containing the indices of nodes in the second partition of the linked list.
     * @param self The linked list state.
     * @return part An array of node indices in the second partition.
     */
    function secondPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            unchecked {
                if (tmpSize & ONE_BIT == SENTINEL) {
                    tmpSize = tmpSize >> ONE_BIT;
                } else {
                    tmpSize = (tmpSize + 1) >> ONE_BIT;
                }
                part = _partition(self, tmpSize, PREV);
            }
        }
    }

    /**
     * @notice Retrieves the path of indices from a specified node to the head of the linked list.
     * @dev Returns an array containing the indices of nodes from a specified node to the head of the linked list.
     * @param self The linked list state.
     * @param index The starting index.
     * @return part An array of node indices from the starting node to the head.
     */
    function pathToHead(List storage self, uint256 index) internal view returns (uint256[] memory part) {
        if (exist(self, index)) {
            part = _path(self, index, PREV);
        }
    }

    /**
     * @notice Retrieves the path of indices from a specified node to the tail of the linked list.
     * @dev Returns an array containing the indices of nodes from a specified node to the tail of the linked list.
     * @param self The linked list state.
     * @param index The starting index.
     * @return part An array of node indices from the starting node to the tail.
     */
    function pathToTail(List storage self, uint256 index) internal view returns (uint256[] memory part) {
        if (exist(self, index)) {
            part = _path(self, index, NEXT);
        }
    }

    /**
     * @notice Retrieves the indices starting from a specified node and wrapping around to the beginning if necessary.
     * @dev Returns an array of node indices starting from a specified node and wrapping around to the beginning if necessary.
     * @param self The linked list state.
     * @param start The starting index.
     * @return part An array of node indices.
     */
    function partition(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        if (exist(self, start)) {
            uint256 tmpSize = self._size;
            part = new uint[](tmpSize);
            uint256 counter;
            unchecked {
                while (counter < tmpSize) {
                    part[counter] = start; // Add the current index to the partition.
                    counter++;
                    start = self._nodes[start][NEXT]; // Move to the next node.
                    if (start == SENTINEL) {
                        start = self._nodes[start][NEXT]; // Move to the next node.
                    }
                }
            }
        }
    }
}
