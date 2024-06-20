// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title Engawa (縁側) is an implementation of Sorted Circular Doubly Linked List with Sentinel node (SCDLLS) in Solidity.
/// @author Kiwari Labs
// inspiration
// https://github.com/o0ragman0o/LibCLL/blob/master/
// https://github.com/vittominacori/solidity-linked-list/

library SortedCircularDoublyLinkedList {
    struct List {
        uint256 _size;
        mapping(uint256 => mapping(bool => uint256)) _nodes;
        mapping(uint256 => bytes) _data;
    }

    uint8 private constant ONE_BIT = 1;
    uint8 private constant SENTINEL = 0;
    bool private constant PREV = false;
    bool private constant NEXT = true;
    bytes private constant EMPTY = abi.encode("");

    /// @notice Check if a node exists in the linked list.
    /// @dev This function checks if a node exists in the linked list by the specified index.
    /// @param self The linked list.
    /// @param index The index of the node to check for existence.
    /// @return result if the node exists, false otherwise.
    function exist(List storage self, uint256 index) internal view returns (bool result) {
        result = (self._nodes[index][PREV] > 0 || self._nodes[SENTINEL][NEXT] == index);
    }

    /// @notice Insert data into the linked list at the specified index.
    /// @dev This function inserts data into the linked list at the specified index.
    /// @param self The linked list.
    /// @param index The index at which to insert the data.
    /// @param data The data to insert.
    function insert(List storage self, uint256 index, bytes memory data) internal {
        if (!exist(self, index)) {
            uint256 tmpTail = self._nodes[SENTINEL][PREV];
            uint256 tmpHead = self._nodes[SENTINEL][NEXT];
            self._data[index] = data;
            if (self._size == 0) {
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
                self._nodes[index][PREV] = tmpPrev;
                self._nodes[index][NEXT] = tmpCurr;
            }
            unchecked {
                self._size++;
            }
        }
    }

    /// @notice Remove a node from the linked list at the specified index.
    /// @dev This function removes a node from the linked list at the specified index.
    /// @param self The linked list.
    /// @param index The index of the node to remove.
    function remove(List storage self, uint256 index) internal {
        // Check if the node exists and the index is valid.
        if (exist(self, index)) {
            // remove the node from between existing nodes.
            uint256 tmpPrev = self._nodes[index][PREV];
            uint256 tmpNext = self._nodes[index][NEXT];
            self._nodes[tmpPrev][NEXT] = tmpNext;
            self._nodes[tmpNext][PREV] = tmpPrev;
            self._nodes[index][NEXT] = SENTINEL;
            self._nodes[index][PREV] = SENTINEL;
            self._data[index] = EMPTY;
            unchecked {
                self._size--;
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
                self._nodes[tmpCurr][NEXT] = SENTINEL;
                self._nodes[tmpCurr][PREV] = SENTINEL;
                self._data[tmpCurr] = EMPTY;
                tmpCurr = tmpNext;
                unchecked {
                    self._size--;
                }
            }
            self._nodes[SENTINEL][NEXT] = index;
            self._nodes[index][PREV] = SENTINEL;
        }
    }

    /// @notice Update the data of a node in the list.
    /// @dev This function updates the data of a node in the list at the specified index.
    /// @param self The list.
    /// @param index The target index of the node that wants to update.
    /// @param data The new data to assign to the node.
    function updateNodeData(List storage self, uint256 index, bytes memory data) internal {
        if (exist(self, index)) {
            self._data[index] = data;
        }
    }

    /// @notice Get the index of the head node in the linked list.
    /// @dev This function returns the index of the head node in the linked list.
    /// @param self The linked list.
    /// @return The index of the head node.
    function head(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][NEXT];
    }

    /// @notice Get the index of the middle node in the list.
    /// @dev This function returns the index of the middle node in the list.
    /// @param self The list.
    /// @return mid The index of the middle node.
    function middle(List storage self) internal view returns (uint256 mid) {
        if (self._size > 0) {
            uint256[] memory tmpList = firstPartition(self);
            mid = tmpList[tmpList.length - 1];
        }
    }

    /// @notice Get the index of the tail node in the linked list.
    /// @dev This function returns the index of the tail node in the linked list.
    /// @param self The linked list.
    /// @return The index of the tail node.
    function tail(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][PREV];
    }

    /// @notice Get the size of the linked list.
    /// @dev This function returns the size of the linked list.
    /// @param self The linked list.
    /// @return The size of the linked list.
    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }

    /// @notice Get information about a node in the list.
    /// @dev This function returns information about a node in the list by the specified index.
    /// @param self The list.
    /// @param index The index of the node.
    /// @return prev The index of the previous node.
    /// @return data The data of the node.
    /// @return next The index of the next node.
    function node(
        List storage self,
        uint256 index
    ) internal view returns (uint256 prev, bytes memory data, uint256 next) {
        return (self._nodes[index][PREV], self._data[index], self._nodes[index][NEXT]);
    }

    /// @notice Get the indices of nodes in ascending order.
    /// @dev This function returns an array containing the indices of nodes in ascending order.
    /// @param self The linked list.
    /// @return asc An array containing the indices of nodes in ascending order.
    function ascending(List storage self) internal view returns (uint256[] memory asc) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            uint256 index;
            asc = new uint256[](tmpSize);
            asc[0] = self._nodes[index][NEXT];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    asc[i] = self._nodes[index][PREV];
                    index = asc[i];
                }
            }
        }
    }

    /// @notice Get the indices of nodes in descending order.
    /// @dev This function returns an array containing the indices of nodes in descending order.
    /// @param self The linked list.
    /// @return des An array containing the indices of nodes in descending order.
    function descending(List storage self) internal view returns (uint256[] memory des) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            uint256 index;
            des = new uint256[](tmpSize);
            des[0] = self._nodes[index][PREV];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    des[i] = self._nodes[index][NEXT];
                    index = des[i];
                }
            }
        }
    }

    /// @notice Get the indices of nodes in the first partition of the linked list.
    /// @dev This function returns an array containing the indices of nodes in the first partition of the linked list.
    /// @param self The linked list.
    /// @return part An array containing the indices of nodes in the first partition.
    function firstPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            unchecked {
                tmpSize = tmpSize == 1 ? tmpSize : tmpSize >> ONE_BIT;
                part = new uint256[](tmpSize);
                uint256 index;
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self._nodes[index][NEXT];
                    index = part[i];
                }
            }
        }
    }

    /// @notice Get the indices of nodes in the second partition of the linked list.
    /// @dev This function returns an array containing the indices of nodes in the second partition of the linked list.
    /// @param self The linked list.
    /// @return part An array containing the indices of nodes in the second partition.
    function secondPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            // To fix the indivisible calculation.
            unchecked {
                if (tmpSize & 1 == 0) {
                    tmpSize = tmpSize >> ONE_BIT;
                } else {
                    tmpSize = (tmpSize + 1) >> ONE_BIT;
                }
                part = new uint256[](tmpSize);
                uint256 index;
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self._nodes[index][PREV];
                    index = part[i];
                }
            }
        }
    }

    /// @notice Get the path of indices from a specified node to the head of the linked list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the head of the linked list.
    /// @param self The linked list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the head.
    function pathToHead(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        if (!exist(self, start)) {
            return part;
        }
        uint256 tmpSize = self._size;
        part = new uint[](tmpSize);
        uint256 counter;
        unchecked {
            while (start != SENTINEL && counter < tmpSize) {
                part[counter] = start; // Add the current index to the partition.
                counter++;
                start = self._nodes[start][PREV]; // Move to the next node.
            }
        }
        // Resize the array to the actual count of elements using inline assembly.
        assembly {
            mstore(part, counter) // Set the array length to the actual count.
        }
    }

    /// @notice Get the path of indices from a specified node to the tail of the linked list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the tail of the linked list.
    /// @param self The linked list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the tail.
    function pathToTail(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        if (!exist(self, start)) {
            return part;
        }
        uint256 tmpSize = self._size;
        part = new uint[](tmpSize);
        uint256 counter;
        unchecked {
            while (start != SENTINEL && counter < tmpSize) {
                part[counter] = start; // Add the current index to the partition.
                counter++;
                start = self._nodes[start][NEXT]; // Move to the next node.
            }
        }
        // Resize the array to the actual count of elements using inline assembly.
        assembly {
            mstore(part, counter) // Set the array length to the actual count.
        }
    }

    /// @notice Get the indices starting from a specified node and wrapping around to the beginning if necessary.
    /// @dev This function returns an array containing the indices of nodes starting from a specified node and wrapping around to the beginning if necessary.
    /// @param self The linked list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes.
    function partition(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        if (!exist(self, start)) {
            return part;
        }
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
