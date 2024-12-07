// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Sorted List
/// @author Kiwari Labs

library SortedList {
    struct List {
        uint256 _size;
        mapping(uint256 => mapping(bool => uint256)) _nodes;
    }

    uint8 private constant SENTINEL = 0;
    bool private constant PREVIOUS = false;
    bool private constant NEXT = true;

    /**
     * @notice Traverses the linked list in the specified direction and returns a list of node indices.
     * @dev This function constructs an array `list` that holds indices of nodes in the linked list,
     * starting from either the front or the back based on the `direction` parameter.
     * @param self The linked list state where the operation is performed.
     * @return array containing the indices of nodes in the linked list, ordered according to the specified direction.
     */
    function _toArray(List storage self) private view returns (uint256[] memory array) {
        // return early pattern
        uint256 length = self._size;
        if (length == 0) return array;

        uint256 element;
        array = new uint256[](length);
        array[0] = self._nodes[element][NEXT];
        unchecked {
            for (uint256 i = length - 1; i > 0; i--) {
                array[i] = self._nodes[element][PREVIOUS];
                element = array[i];
            }
        }
    }

    /// @notice Insert data into the linked list at the specified element.
    /// @dev This function inserts data into the linked list at the specified element.
    /// @param self The linked list.
    /// @param index The element at which to insert the data.
    function insert(List storage self, uint256 index, bool lazy) internal {
        if (!lazy) {
            if (contains(self, index)) {
                return;
            }
        }
        uint256 tmpTail = self._nodes[SENTINEL][PREVIOUS];
        uint256 tmpHead = self._nodes[SENTINEL][NEXT];
        uint256 tmpSize = self._size;
        if (tmpSize == SENTINEL) {
            self._nodes[SENTINEL][NEXT] = index;
            self._nodes[SENTINEL][PREVIOUS] = index;
            self._nodes[index][PREVIOUS] = SENTINEL;
            self._nodes[index][NEXT] = SENTINEL;
        } else if (index < tmpHead) {
            self._nodes[SENTINEL][NEXT] = index;
            self._nodes[tmpHead][PREVIOUS] = index;
            self._nodes[index][PREVIOUS] = SENTINEL;
            self._nodes[index][NEXT] = tmpHead;
        } else if (index > tmpTail) {
            self._nodes[SENTINEL][PREVIOUS] = index;
            self._nodes[tmpTail][NEXT] = index;
            self._nodes[index][PREVIOUS] = tmpTail;
            self._nodes[index][NEXT] = SENTINEL;
        } else {
            // @TODOfix the incorrect order insert
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
                        tmpCurr = self._nodes[tmpCurr][PREVIOUS];
                    }
                }
            }
            uint256 tmpPrev = self._nodes[tmpCurr][PREVIOUS];
            self._nodes[tmpPrev][NEXT] = index;
            self._nodes[tmpCurr][PREVIOUS] = index;
            self._nodes[index][PREVIOUS] = tmpPrev;
            self._nodes[index][NEXT] = tmpCurr;
        }
        assembly {
            sstore(self.slot, add(tmpSize, 1))
        }
    }

    /// @notice Remove a node from the linked list at the specified element.
    /// @dev This function removes a node from the linked list at the specified element.
    /// @param self The linked list.
    /// @param element The element of the node to remove.
    function remove(List storage self, uint256 element) internal {
        if (contains(self, element)) {
            // remove the node from between existing nodes.
            uint256 tmpPREVIOUS = self._nodes[element][PREVIOUS];
            uint256 tmpNext = self._nodes[element][NEXT];
            self._nodes[element][NEXT] = SENTINEL;
            self._nodes[element][PREVIOUS] = SENTINEL;
            self._nodes[tmpPREVIOUS][NEXT] = tmpNext;
            self._nodes[tmpNext][PREVIOUS] = tmpPREVIOUS;

            assembly {
                let slot := self.slot
                sstore(slot, sub(sload(slot), 1))
            }
        }
    }

    /// @notice Shrinks is the 'lazy' approach to setting a new front without cleaning up previous nodes.
    /// @dev updates the front pointer to the specified `element` without traversing and cleaning up the previous nodes.
    /// @param self The list to modify.
    /// @param element The element to set as the new front of the list.
    function shrink(List storage self, uint256 element) internal {
        if (contains(self, element)) {
            self._nodes[SENTINEL][NEXT] = element; // forced link sentinel to new front
            self._nodes[element][PREVIOUS] = SENTINEL; // forced link previous of element to sentinel

            uint256 counter;
            while (element != SENTINEL) {
                unchecked {
                    counter++;
                }
                element = self._nodes[element][NEXT];
            }

            assembly {
                sstore(self.slot, counter)
            }
        }
    }

    /// @notice Check if a node exists in the linked list.
    /// @dev This function checks if a node exists in the linked list by the specified element.
    /// @param self The linked list.
    /// @param element The element of the node to check for existence.
    /// @return result if the node exists, false otherwise.
    function contains(List storage self, uint256 element) internal view returns (bool result) {
        uint256 beforeElement = self._nodes[element][PREVIOUS];
        uint256 afterSentinel = self._nodes[SENTINEL][NEXT];

        assembly {
            result := or(eq(afterSentinel, element), gt(beforeElement, 0))
        }
    }

    /// @notice Get the element of the next node in the list.
    /// @dev Accesses the `_nodes` mapping in the `List` structure to get the element of the next node.
    /// @param self The list.
    /// @param element The element of the current node.
    /// @return The element of the next node.
    function next(List storage self, uint256 element) internal view returns (uint256) {
        return self._nodes[element][NEXT];
    }

    /// @notice Get the element of the previous node in the list.
    /// @dev Accesses the `_nodes` mapping in the `List` structure to get the element of the previous node.
    /// @param self The list.
    /// @param element The element of the current node.
    /// @return The element of the previous node.
    function previous(List storage self, uint256 element) internal view returns (uint256) {
        return self._nodes[element][PREVIOUS];
    }

    /// @notice Get the element of the front node in the linked list.
    /// @dev This function returns the element of the front node in the linked list.
    /// @param self The linked list.
    /// @return The element of the front node.
    function front(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][NEXT];
    }

    /// @notice Get the element of the back node in the linked list.
    /// @dev This function returns the element of the back node in the linked list.
    /// @param self The linked list.
    /// @return The element of the back node.
    function back(List storage self) internal view returns (uint256) {
        return self._nodes[SENTINEL][PREVIOUS];
    }

    /// @notice Get the _size of the linked list.
    /// @dev This function returns the _size of the linked list.
    /// @param self The linked list.
    /// @return The _size of the linked list.
    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }

    /// @notice Get the indices of nodes in ascending order.
    /// @dev This function returns an array containing the indices of nodes in ascending order.
    /// @param self The linked list.
    /// @return array containing the indices of nodes in ascending order.
    function toArray(List storage self) internal view returns (uint256[] memory array) {
        return _toArray(self);
    }
}
