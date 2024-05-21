// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

library CircularDoublyLinkedList {
    struct List {
        uint256 _head;
        uint256 _tail;
        uint256 _size;
        mapping(uint256 => mapping(bool => uint256)) list;
        mapping(uint256 => bytes) data;
    }

    uint8 private constant _SENTINEL = 0;
    bool private constant _PREV = false;
    bool private constant _NEXT = true;

    function _removeNode(List storage self, uint256 index) private {
        uint256[2] memory tmp = node(self, index);
        self.list[tmp[0]][_NEXT] = tmp[1];
        self.list[tmp[1]][_PREV] = tmp[0];
        delete self.list[index][_PREV];
        delete self.list[index][_NEXT];
    }

    function _insertHead(List storage self, uint256 index, bytes memory data) private {
        uint256 _head = self._head;
        self.list[_SENTINEL][_NEXT] = index;
        self.list[_head][_PREV] = index;
        self.list[index][_PREV] = _SENTINEL;
        self.list[index][_NEXT] = _head;
        self.data[index] = data;
        self._head = index;
    }

    function _insertTail(List storage self, uint256 index, bytes memory data) private {
        uint256 _tail = self._tail;
        self.list[_SENTINEL][_PREV] = index;
        self.list[_tail][_NEXT] = index;
        self.list[index][_PREV] = _tail;
        self.list[index][_NEXT] = _SENTINEL;
        self.data[index] = data;
        self._tail = index;
    }

    function _removeHead(List storage self) private {
        uint256 _head = self.list[self._head][_NEXT];
        delete self.list[_head][_PREV];
        delete self.list[_head][_NEXT];
        self.list[_SENTINEL][_NEXT] = _head;
        self.list[_head][_PREV] = _SENTINEL;
        self._head = _head;
    }

    function _removeTail(List storage self) private {
        uint256 _tail = self.list[self._tail][_PREV];
        delete self.list[_tail][_PREV];
        delete self.list[_tail][_NEXT];
        self.list[_SENTINEL][_PREV] = _tail;
        self.list[_tail][_NEXT] = _SENTINEL;
        self._tail = _tail;
    }

    function exist(List storage self, uint256 index) internal view returns (bool) {
        if (self.list[index][_PREV] == _SENTINEL && self.list[index][_NEXT] == _SENTINEL) {
            return (self.list[_SENTINEL][_NEXT] == index);
        } else {
            return true;
        }
    }

    function remove(List storage self, uint256[] memory indexes) internal {
        unchecked {
            for (uint i = 0; i < indexes.length; i++) {
                remove(self, indexes[i]);
            }
        }
    }

    function insert(List storage self, uint256[] memory indexes, bytes[] memory data) internal {
        unchecked {
            for (uint i = 0; i < indexes.length; i++) {
                insert(self, indexes[i], data[i]);
            }
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
        self.data[index] = data;
    }

    function insert(List storage self, uint256 index, bytes memory data) internal {
        if (!exist(self, index) && index > 0) {
            if (self._size == 0) {
                // If the list is empty, insert at head
                self._head = index;
                self._tail = index;
                self.list[_SENTINEL][_NEXT] = index;
                self.list[_SENTINEL][_PREV] = index;
                self.data[index] = data;
            } else if (index < self._head) {
                _insertHead(self, index, data);
            } else if (index > self._tail) {
                _insertTail(self, index, data);
            } else {
                // Inserting the index in between existing list
                uint256 current = self._head;
                while (index > current) {
                    current = self.list[current][_NEXT];
                }
                uint256 prevCurrent = self.list[current][_PREV];
                self.list[prevCurrent][_NEXT] = index;
                self.list[current][_PREV] = index;
                self.list[index][_PREV] = prevCurrent;
                self.list[index][_NEXT] = current;
                self.data[index] = data;
            }
            self._size++;
        }
    }

    function head(List storage self) internal view returns (uint256) {
        return self._head;
    }

    function middle(List storage self) internal view returns (uint256) {
        uint256[] memory tmpList = firstParitionList(self);
        return tmpList[tmpList.length - 1];
    }

    function tail(List storage self) internal view returns (uint256) {
        return self._tail;
    }

    function guard(List storage self) internal view returns (uint256[2] memory) {
        return [self.list[_SENTINEL][_PREV], self.list[_SENTINEL][_NEXT]];
    }

    function node(List storage self, uint256 index) internal view returns (uint256[2] memory) {
        return [self.list[index][_PREV], self.list[index][_NEXT]];
    }

    function ascendingList(List storage self) internal view returns (uint256[] memory asd) {
        uint256 index;
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            asd = new uint256[](tmpSize);
            asd[0] = self.list[index][_NEXT];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    asd[i] = self.list[index][_PREV];
                    index = self.list[index][_PREV];
                }
            }
        }
        return asd;
    }

    function descendingList(List storage self) internal view returns (uint256[] memory des) {
        uint256 index;
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            des = new uint256[](tmpSize);
            des[0] = self.list[index][_PREV];
            unchecked {
                for (uint256 i = tmpSize - 1; i > 0; i--) {
                    des[i] = self.list[index][_NEXT];
                    index = self.list[index][_NEXT];
                }
            }
        }
        return des;
    }

    function firstParitionList(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            tmpSize = tmpSize / 2;
            part = new uint256[](tmpSize);
            uint256 index;
            unchecked {
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self.list[index][_NEXT];
                    index = self.list[index][_NEXT];
                }
            }
            return part;
        }
        return part;
    }

    function secondPartitionList(List storage self) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize > 0) {
            tmpSize = self._size / 2;
            part = new uint256[](tmpSize);
            uint256 index;
            unchecked {
                for (uint256 i = 0; i < tmpSize; i++) {
                    part[i] = self.list[index][_PREV];
                    index = self.list[index][_PREV];
                }
            }
            return part;
        }
        return part;
    }

    function partitionListGivenToLast(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize == 0 || !exist(self, start)) {
            return part;
        }
        part = new uint[](tmpSize);
        uint256 index = start;
        uint256 counter;
        unchecked {
            while (index != _SENTINEL && counter < tmpSize) {
                part[counter] = index; // Add the current index to the partition
                counter++;
                index = self.list[index][_NEXT]; // Move to the next node
            }
        }
        // Resize the array to the actual count of elements using inline assembly
        assembly {
            mstore(part, counter) // Set the array length to the actual count
        }
        return part;
    }
    
    function partitionList(List storage self, uint256 start) internal view returns (uint256[] memory part) {
        uint256 tmpSize = self._size;
        if (tmpSize == 0 || !exist(self, start)) {
            return part;
        }
        part = new uint[](tmpSize);
        uint256 index = start;
        uint256 counter;
        unchecked {
            while (counter < tmpSize) {
                part[counter] = index; // Add the current index to the partition
                counter++;
                index = self.list[index][_NEXT]; // Move to the next node
            }
        }
        return part;
    }

    function size(List storage self) internal view returns (uint256) {
        return self._size;
    }
}
