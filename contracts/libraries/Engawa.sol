// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title Engawa (縁側) is an implementation of Sorted Circular Doubly Linked SCDLLS with Sentinel node in Solidity.
/// @author Kiwari
// inspiration
// https://github.com/o0ragman0o/LibCLL/blob/master/LibCLL.sol
// https://github.com/vittominacori/solidity-linked-list/blob/master/contracts/StructuredLinkedList.sol

library CircularDoublyLinkedList {
    struct List {
        uint256 _head;
        uint256 _tail;
        uint256 _size;
        mapping(uint256 => mapping(bool => uint256)) _list;
        mapping(uint256 => bytes) _data;
    }

    uint8 private constant _SENTINEL = 0;
    bool private constant _PREV = false;
    bool private constant _NEXT = true;

    /// @notice Insert data at the head of the list.
    /// @dev This function inserts data at the head of the list.
    /// @param self The list.
    /// @param index The index at which to insert the data.
    /// @param data The data to insert.
    function _insertHead(List storage self, uint256 index, bytes memory data) private {
        uint256 _head = self._head;
        self._list[_SENTINEL][_NEXT] = index;
        self._list[_head][_PREV] = index;
        self._list[index][_PREV] = _SENTINEL;
        self._list[index][_NEXT] = _head;
        self._data[index] = data;
        self._head = index;
    }

    /// @notice Insert data into the list at a specified index.
    /// @dev This function inserts data into the list at a specified index.
    /// @param self The list.
    /// @param index The index at which to insert the data.
    /// @param data The data to insert.
    function _insertNode(List storage self, uint256 index, bytes memory data) private {
        uint256 current = self._head;
        while (index > current) {
            current = self._list[current][_NEXT];
        }
        uint256 prevCurrent = self._list[current][_PREV];
        self._list[prevCurrent][_NEXT] = index;
        self._list[current][_PREV] = index;
        self._list[index][_PREV] = prevCurrent;
        self._list[index][_NEXT] = current;
        self._data[index] = data;
    }

    /// @notice Insert data at the tail of the list.
    /// @dev This function inserts data at the tail of the list.
    /// @param self The list.
    /// @param index The index at which to insert the data.
    /// @param data The data to insert.
    function _insertTail(List storage self, uint256 index, bytes memory data) private {
        uint256 _tail = self._tail;
        self._list[_SENTINEL][_PREV] = index;
        self._list[_tail][_NEXT] = index;
        self._list[index][_PREV] = _tail;
        self._list[index][_NEXT] = _SENTINEL;
        self._data[index] = data;
        self._tail = index;
    }

    /// @notice Remove the head node from the list.
    /// @dev This function removes the head node from the list.
    /// @param self The list.
    function _removeHead(List storage self) private {
        uint256 _head = self._list[self._head][_NEXT];
        self._list[_SENTINEL][_NEXT] = _head;
        self._list[_head][_PREV] = _SENTINEL;
        delete self._list[self._head][_PREV];
        delete self._list[self._head][_NEXT];
        delete self._data[self._head];
        self._head = _head;
    }

    /// @notice Remove a node from the list at a specified index.
    /// @dev This function removes a node from the list at a specified index.
    /// @param self The list.
    /// @param index The specified index of the node to remove.
    function _removeNode(List storage self, uint256 index) private {
        uint256 prev;
        uint256 next;
        (prev, , next) = node(self, index);
        self._list[prev][_NEXT] = next;
        self._list[next][_PREV] = prev;
        delete self._list[index][_PREV];
        delete self._list[index][_NEXT];
        delete self._data[index];
    }

    /// @notice Remove the tail node from the list.
    /// @dev This function removes the tail node from the list.
    /// @param self The list.
    function _removeTail(List storage self) private {
        uint256 _tail = self._list[self._tail][_PREV];
        self._list[_SENTINEL][_PREV] = _tail;
        self._list[_tail][_NEXT] = _SENTINEL;
        delete self._list[self._tail][_PREV];
        delete self._list[self._tail][_NEXT];
        delete self._data[self._tail];
        self._tail = _tail;
    }

    /// @notice Check if a node exists in the list.
    /// @dev This function checks if a node exists in the list by the specified index.
    /// @param self The list.
    /// @param index The index of the node to check for existence.
    /// @return True if the node exists, false otherwise.
    function exist(List storage self, uint256 index) internal view returns (bool) {
        if (self._list[index][_PREV] == _SENTINEL && self._list[index][_NEXT] == _SENTINEL) {
            // In case the list has only one element.
            return (self._list[_SENTINEL][_NEXT] == index);
        } else {
            return true;
        }
    }

    /// @notice Insert data into the list at the specified index.
    /// @dev This function inserts data into the list at the specified index.
    /// @param self The list.
    /// @param index The index at which to insert the data.
    /// @param data The data to insert.
    function insert(List storage self, uint256 index, bytes memory data) internal {
        // Check if the node does not exist and the index is valid.
        if (!exist(self, index) && index > 0) {
            if (self._size == 0) {
                // If the list is empty, insert it at the head.
                self._head = index;
                self._tail = index;
                self._list[_SENTINEL][_NEXT] = index;
                self._list[_SENTINEL][_PREV] = index;
                self._data[index] = data;
            } else if (index < self._head) {
                // If the index is before the current head, insert at the head.
                _insertHead(self, index, data);
            } else if (index > self._tail) {
                // If the index is after the current tail, insert at the tail.
                _insertTail(self, index, data);
            } else {
                // Otherwise, insert in between existing nodes.
                _insertNode(self, index, data);
            }
            // Increment the size of the list.
            self._size++;
        }
    }

    /// @notice Remove a node from the list at the specified index.
    /// @dev This function removes a node from the list at the specified index.
    /// @param self The list.
    /// @param index The index of the node to remove.
    function remove(List storage self, uint256 index) internal {
        // Check if the node exists and the index is valid.
        if (exist(self, index) && index > 0) {
            if (index == self._head) {
                // If the index corresponds to the head node, remove the head.
                _removeHead(self);
            } else if (index == self._tail) {
                // If the index corresponds to the tail node, remove the tail.
                _removeTail(self);
            } else {
                // Otherwise, remove the node from between existing nodes.
                _removeNode(self, index);
            }
            // Decrement the size of the list.
            self._size--;
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

    /// @notice Get the index of the head node in the list.
    /// @dev This function returns the index of the head node in the list.
    /// @param self The list.
    /// @return The index of the head node.
    function head(List storage self) internal view returns (uint256) {
        return self._head;
    }

    /// @notice Get the index of the middle node in the list.
    /// @dev This function returns the index of the middle node in the list.
    /// @param self The list.
    /// @return The index of the middle node.
    function middle(List storage self) internal view returns (uint256) {
        uint256[] memory tmpList = firstPartition(self);
        return tmpList[tmpList.length - 1];
    }

    /// @notice Get the index of the tail node in the list.
    /// @dev This function returns the index of the tail node in the list.
    /// @param self The list.
    /// @return The index of the tail node.
    function tail(List storage self) internal view returns (uint256) {
        return self._tail;
    }

    /// @notice Get the size of the list.
    /// @dev This function returns the size of the list.
    /// @param self The list.
    /// @return The size of the list.
    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }

    /// @notice Get the indices of the previous and next nodes of the sentinel node.
    /// @dev This function returns an array containing the indices of the previous and next nodes of the sentinel node.
    /// @param self The list.
    /// @return An array containing the indices of the previous and next nodes of the sentinel node.
    function guard(List storage self) internal view returns (uint256[2] memory) {
        return [self._list[_SENTINEL][_PREV], self._list[_SENTINEL][_NEXT]];
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
        return (self._list[index][_PREV], self._data[index], self._list[index][_NEXT]);
    }

    /// @notice Get the indices of nodes in ascending order.
    /// @dev This function returns an array containing the indices of nodes in ascending order.
    /// @param self The list.
    /// @return asc An array containing the indices of nodes in ascending order.
    function ascending(List storage self) internal view returns (uint256[] memory asc) {
        uint256 index;
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            asc = new uint256[](tmpSize);
            asc[0] = self._list[index][_NEXT];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    asc[i] = self._list[index][_PREV];
                    index = self._list[index][_PREV];
                }
            }
        }
        return asc;
    }

    /// @notice Get the indices of nodes in descending order.
    /// @dev This function returns an array containing the indices of nodes in descending order.
    /// @param self The list.
    /// @return des An array containing the indices of nodes in descending order.
    function descending(List storage self) internal view returns (uint256[] memory des) {
        uint256 index;
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            des = new uint256[](tmpSize);
            des[0] = self._list[index][_PREV];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    des[i] = self._list[index][_NEXT];
                    index = self._list[index][_NEXT];
                }
            }
        }
        return des;
    }

    /// @notice Get the indices of nodes in the first partition of the list.
    /// @dev This function returns an array containing the indices of nodes in the first partition of the list.
    /// @param self The list.
    /// @return part An array containing the indices of nodes in the first partition.
    function firstPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            tmpSize = tmpSize / 2;
            part = new uint256[](tmpSize);
            uint256 index;
            unchecked {
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self._list[index][_NEXT];
                    index = self._list[index][_NEXT];
                }
            }
            return part;
        }
        return part;
    }

    /// @notice Get the indices of nodes in the second partition of the list.
    /// @dev This function returns an array containing the indices of nodes in the second partition of the list.
    /// @param self The list.
    /// @return part An array containing the indices of nodes in the second partition.
    function secondPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            // To fix the indivisible calculation.
            if (self._size % 2 == 0) {
                tmpSize = self._size / 2;
            } else {
                tmpSize = (self._size + 1) / 2;
            }
            part = new uint256[](tmpSize);
            uint256 index;
            unchecked {
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self._list[index][_PREV];
                    index = self._list[index][_PREV];
                }
            }
            return part;
        }
        return part;
    }

    /// @notice Get the path of indices from a specified node to the head of the list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the head of the list.
    /// @param self The list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the head.
    function pathToHead(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize == 0 || !exist(self, start)) {
            return part;
        }
        part = new uint[](tmpSize);
        uint256 index = start;
        uint256 counter;
        unchecked {
            while (index != _SENTINEL && counter < tmpSize) {
                part[counter] = index; // Add the current index to the partition.
                counter++;
                index = self._list[index][_PREV]; // Move to the next node.
            }
        }
        // Resize the array to the actual count of elements using inline assembly.
        assembly {
            mstore(part, counter) // Set the array length to the actual count.
        }
        return part;
    }

    /// @notice Get the path of indices from a specified node to the tail of the list.
    /// @dev This function returns an array containing the indices of nodes from a specified node to the tail of the list.
    /// @param self The list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes from the starting node to the tail.
    function pathToTail(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize == 0 || !exist(self, start)) {
            return part;
        }
        part = new uint[](tmpSize);
        uint256 index = start;
        uint256 counter;
        unchecked {
            while (index != _SENTINEL && counter < tmpSize) {
                part[counter] = index; // Add the current index to the partition.
                counter++;
                index = self._list[index][_NEXT]; // Move to the next node.
            }
        }
        // Resize the array to the actual count of elements using inline assembly.
        assembly {
            mstore(part, counter) // Set the array length to the actual count.
        }
        return part;
    }

    /// @notice Get the indices starting from a specified node and wrapping around to the beginning if necessary.
    /// @dev This function returns an array containing the indices of nodes starting from a specified node and wrapping around to the beginning if necessary.
    /// @param self The list.
    /// @param start The starting index.
    /// @return part An array containing the indices of nodes.
    function partition(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize == 0 || !exist(self, start)) {
            return part;
        }
        part = new uint[](tmpSize);
        uint256 index = start;
        uint256 counter;
        unchecked {
            while (counter < tmpSize) {
                part[counter] = index; // Add the current index to the partition.
                counter++;
                index = self._list[index][_NEXT]; // Move to the next node.
                if (index == _SENTINEL) {
                    index = self._list[index][_NEXT]; // Move to the next node.
                }
            }
        }
        return part;
    }
}
