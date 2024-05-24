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

    function _insertHead(List storage self, uint256 index, bytes memory data) private {
        uint256 _head = self._head;
        self._list[_SENTINEL][_NEXT] = index;
        self._list[_head][_PREV] = index;
        self._list[index][_PREV] = _SENTINEL;
        self._list[index][_NEXT] = _head;
        self._data[index] = data;
        self._head = index;
    }

    function _insertNode(List storage self, uint256 index, bytes memory data) private {
        // Inserting the index in between existing list.
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

    function _insertTail(List storage self, uint256 index, bytes memory data) private {
        uint256 _tail = self._tail;
        self._list[_SENTINEL][_PREV] = index;
        self._list[_tail][_NEXT] = index;
        self._list[index][_PREV] = _tail;
        self._list[index][_NEXT] = _SENTINEL;
        self._data[index] = data;
        self._tail = index;
    }

    function _removeHead(List storage self) private {
        uint256 _head = self._list[self._head][_NEXT];
        self._list[_SENTINEL][_NEXT] = _head;
        self._list[_head][_PREV] = _SENTINEL;
        delete self._list[self._head][_PREV];
        delete self._list[self._head][_NEXT];
        delete self._data[self._head];
        self._head = _head;
    }

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

    function _removeTail(List storage self) private {
        uint256 _tail = self._list[self._tail][_PREV];
        self._list[_SENTINEL][_PREV] = _tail;
        self._list[_tail][_NEXT] = _SENTINEL;
        delete self._list[self._tail][_PREV];
        delete self._list[self._tail][_NEXT];
        delete self._data[self._tail];
        self._tail = _tail;
    }

    function exist(List storage self, uint256 index) internal view returns (bool) {
        if (self._list[index][_PREV] == _SENTINEL && self._list[index][_NEXT] == _SENTINEL) {
            // In case the list has only one element.
            return (self._list[_SENTINEL][_NEXT] == index);
        } else {
            return true;
        }
    }

    function insert(List storage self, uint256 index, bytes memory data) internal {
        if (!exist(self, index) && index > 0) {
            if (self._size == 0) {
                // If the list is empty, insert at head.
                self._head = index;
                self._tail = index;
                self._list[_SENTINEL][_NEXT] = index;
                self._list[_SENTINEL][_PREV] = index;
                self._data[index] = data;
            } else if (index < self._head) {
                _insertHead(self, index, data);
            } else if (index > self._tail) {
                _insertTail(self, index, data);
            } else {
                _insertNode(self, index, data);
            }
            self._size++;
        }
    }

    function remove(List storage self, uint256 index) internal {
        if (exist(self, index) && index > 0) {
            if (index == self._head) {
                _removeHead(self);
            } else if (index == self._tail) {
                _removeTail(self);
            } else {
                _removeNode(self, index);
            }
            self._size--;
        }
    }

    function updateNodeData(List storage self, uint256 index, bytes memory data) internal {
        if (exist(self, index)) {
            self._data[index] = data;
        }
    }

    function head(List storage self) internal view returns (uint256) {
        return self._head;
    }

    function middle(List storage self) internal view returns (uint256) {
        uint256[] memory tmpList = firstPartition(self);
        return tmpList[tmpList.length - 1];
    }

    function tail(List storage self) internal view returns (uint256) {
        return self._tail;
    }

    function guard(List storage self) internal view returns (uint256[2] memory) {
        return [self._list[_SENTINEL][_PREV], self._list[_SENTINEL][_NEXT]];
    }

    function node(
        List storage self,
        uint256 index
    ) internal view returns (uint256 prev, bytes memory data, uint256 next) {
        return (self._list[index][_PREV], self._data[index], self._list[index][_NEXT]);
    }

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

    function secondPartition(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
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

    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }
}
