// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title A lightweight version of Engawa.
/// @author Kiwari Labs
/// @notice This version reduce gas by remove embedded bytes data from node and less overhead compared to the original version.

library SortedCircularDoublyLinkedList {
    struct List {
        uint256 _size;
        mapping(uint256 => mapping(bool => uint256)) _nodes;
    }

    uint8 private constant ONE_BIT = 1;
    uint8 private constant SENTINEL = 0;
    bool private constant PREV = false;
    bool private constant NEXT = true;

    /// @param self The linked list.
    /// @param direction The direction NEXT or PREV
    /// @return part An array containing the indices of nodes into partition.
    function _partition(
        List storage self,
        uint256 listSize,
        bool direction
    ) private view returns (uint256[] memory part) {
        part = new uint256[](listSize);
        uint256 index;
        for (uint256 i = 0; i < listSize; i++) {
            part[i] = self._nodes[index][direction];
            index = part[i];
        }
    }

    /// @param self The linked list.
    /// @param index The starting index.
    /// @param direction The direction NEXT or PREV
    /// @return part An array containing the indices of nodes from start to head or tail.
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
        // Resize the array to the actual count of elements using inline assembly.
        assembly {
            mstore(part, counter) // Set the array length to the actual count.
        }
    }

    /// @param self The linked list.
    /// @param index The index at which to insert the data.
    /// @param prev The previous node before the index.
    /// @param next The next node after the index.
    function _setNode(List storage self, uint256 index, uint256 prev, uint256 next) private {
        self._nodes[index][PREV] = prev;
        self._nodes[index][NEXT] = next;
    }

    /// @notice Check if a node exists in the list.
    /// @dev This function checks if a node exists in the list by the specified index.
    /// @param self The list.
    /// @param index The index of the node to check for existence.
    /// @return result if the node exists true if exist, false otherwise.
    function exist(List storage self, uint256 index) internal view returns (bool result) {
        // @TODO change to sload inline-assembly.
        uint256 tmpPrev = self._nodes[index][PREV];
        uint256 tmpNext = self._nodes[SENTINEL][NEXT];
        assembly {
            result := or(eq(tmpNext, index), gt(tmpPrev, 0))
        }
    }

    /// @notice Insert data into the list at the specified index.
    /// @dev This function inserts data into the list at the specified index.
    /// @param self The list.
    /// @param index The index at which to insert the data.
    function insert(List storage self, uint256 index) internal {
        // @TODO make it into inline-assembly.
        if (!exist(self, index)) {
            (uint256 tmpTail, uint256 tmpHead) = node(self, SENTINEL);
            if (self._size == 0) {
                _setNode(self, SENTINEL, index, index);
                _setNode(self, index, SENTINEL, SENTINEL);
            } else if (index < tmpHead) {
                self._nodes[SENTINEL][NEXT] = index;
                self._nodes[tmpHead][PREV] = index;
                _setNode(self, index, SENTINEL, tmpHead);
            } else if (index > tmpTail) {
                self._nodes[SENTINEL][PREV] = index;
                self._nodes[tmpTail][NEXT] = index;
                _setNode(self, index, tmpTail, SENTINEL);
            } else {
                uint256 tmpCurr;
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
                uint256 tmpPrev = self._nodes[tmpCurr][PREV];
                self._nodes[tmpPrev][NEXT] = index;
                self._nodes[tmpCurr][PREV] = index;
                _setNode(self, index, tmpPrev, tmpCurr);
            }
            assembly {
                sstore(self.slot, add(sload(self.slot), 1))
            }
        }
    }

    /// @notice Remove a node from the list at the specified index.
    /// @dev This function removes a node from the list at the specified index.
    /// @param self The list.
    /// @param index The index of the node to remove.
    function remove(List storage self, uint256 index) internal {
        // Check if the node exists and the index is valid.
        // @TODO make it into inline-assembly.
        if (exist(self, index)) {
            // remove the node from between existing nodes.
            (uint256 tmpPrev, uint256 tmpNext) = node(self, SENTINEL);
            _setNode(self, index, SENTINEL, SENTINEL);
            self._nodes[tmpPrev][NEXT] = tmpNext;
            self._nodes[tmpNext][PREV] = tmpPrev;
            assembly {
                sstore(self.slot, sub(sload(self.slot), 1))
            }
        }
    }

    /// @notice Shrinks the list by removing all nodes before the specified index.
    /// @dev This function updates the head of the list to the specified index, removing all previous nodes.
    /// @param self The list.
    /// @param index The index from which to shrink the list. All nodes before this index will be removed.
    function shrink(List storage self, uint256 index) internal {
        if (exist(self, index)) {
            uint256 tmpCurr = self._nodes[SENTINEL][NEXT];
            while (tmpCurr != index) {
                uint256 tmpNext = self._nodes[tmpCurr][NEXT];
                _setNode(self, tmpCurr, SENTINEL, SENTINEL);
                tmpCurr = tmpNext;
                assembly {
                    sstore(self.slot, sub(sload(self.slot), 1))
                }
            }
            self._nodes[SENTINEL][NEXT] = index;
            self._nodes[index][PREV] = SENTINEL;
        }
    }

    /// @notice Get the index of the head node in the list.
    /// @dev This function returns the index of the head node in the list.
    /// @param self The list.
    /// @return The index of the head node.
    function head(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][NEXT];
    }

    /// @notice Get the index of the middle node in the list.
    /// @dev This function returns the index of the middle node in the list.
    /// @param self The list.
    /// @return mid The index of the middle node.
    function middle(List storage self) internal view returns (uint256 mid) {
        assembly {
            mid := sload(self.slot)
            if iszero(mid) {
                return(0x00, 0x20)
            }
        }
        uint256[] memory tmpList = firstPartition(self);
        return tmpList[tmpList.length - 1];
    }

    /// @notice Get the index of the tail node in the list.
    /// @dev This function returns the index of the tail node in the list.
    /// @param self The list.
    /// @return The index of the tail node.
    function tail(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][PREV];
    }

    /// @notice Get the size of the list.
    /// @dev This function returns the size of the list.
    /// @param self The list.
    /// @return The size of the list.
    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }

    /// @notice Get information about a node in the list.
    /// @dev This function returns information about a node in the list by the specified index.
    /// @param self The list.
    /// @param index The index of the node.
    /// @return prev The index of the previous node.
    /// @return next The index of the next node.
    function node(List storage self, uint256 index) internal view returns (uint256 prev, uint256 next) {
        return (self._nodes[index][PREV], self._nodes[index][NEXT]);
    }

    /// @notice Get the indices of nodes in ascending order.
    /// @dev This function returns an array containing the indices of nodes in ascending order.
    /// @param self The list.
    /// @return asc An array containing the indices of nodes in ascending order.
    function ascending(List storage self) internal view returns (uint256[] memory asc) {
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            uint256 index;
            asc = new uint256[](tmpSize);
            asc[SENTINEL] = self._nodes[index][NEXT];
            unchecked {
                for (uint256 i = tmpSize - 1; i > SENTINEL; i--) {
                    asc[i] = self._nodes[index][PREV];
                    index = asc[i];
                }
            }
        }
    }

    /// @notice Get the indices of nodes in descending order.
    /// @dev This function returns an array containing the indices of nodes in descending order.
    /// @param self The list.
    /// @return des An array containing the indices of nodes in descending order.
    function descending(List storage self) internal view returns (uint256[] memory des) {
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            uint256 index;
            des = new uint256[](tmpSize);
            des[SENTINEL] = self._nodes[index][PREV];
            unchecked {
                for (uint256 i = tmpSize - 1; i > SENTINEL; i--) {
                    des[i] = self._nodes[index][NEXT];
                    index = des[i];
                }
            }
        }
    }

    /// @notice Get the indices of nodes in the first partition of the list.
    /// @dev This function returns an array containing the indices of nodes in the first partition of the list.
    /// @param self The list.
    /// @return part An array containing the indices of nodes in the first partition.
    function firstPartition(List storage self) internal view returns (uint256[] memory part) {
        // @TODO make it into inline-assembly.
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            unchecked {
                tmpSize = tmpSize == 1 ? tmpSize : tmpSize >> ONE_BIT;
                part = _partition(self, tmpSize, NEXT);
            }
        }
    }

    /// @notice Get the indices of nodes in the second partition of the list.
    /// @dev This function returns an array containing the indices of nodes in the second partition of the list.
    /// @param self The list.
    /// @return part An array containing the indices of nodes in the second partition.
    function secondPartition(List storage self) internal view returns (uint256[] memory part) {
        // @TODO make it into inline-assembly.
        uint256 tmpSize = self._size;
        if (tmpSize > SENTINEL) {
            // To fix the indivisible calculation.
            unchecked {
                if (tmpSize & 1 == SENTINEL) {
                    tmpSize = tmpSize >> ONE_BIT;
                } else {
                    tmpSize = (tmpSize + 1) >> ONE_BIT;
                }
                part = _partition(self, tmpSize, PREV);
            }
        }
    }

    /// @notice Get the path of indices from a specified node to the head of the list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the head of the list.
    /// @param self The list.
    /// @param index The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the head.
    function pathToHead(List storage self, uint256 index) internal view returns (uint256[] memory part) {
        if (exist(self, index)) {
            part = _path(self, index, PREV);
        }
    }

    /// @notice Get the path of indices from a specified node to the tail of the list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the tail of the list.
    /// @param self The list.
    /// @param index The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the tail.
    function pathToTail(List storage self, uint256 index) internal view returns (uint256[] memory part) {
        if (exist(self, index)) {
            part = _path(self, index, NEXT);
        }
    }

    /// @notice Get the indices starting from a specified node and wrapping around to the beginning if necessary.
    /// @dev This function returns an array containing the indices of nodes starting from a specified node and wrapping around to the beginning if necessary.
    /// @param self The list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes.
    function partition(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        // @TODO make it into inline-assembly.
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
