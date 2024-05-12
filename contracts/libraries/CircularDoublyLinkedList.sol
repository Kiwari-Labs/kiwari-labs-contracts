// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

// inspiration
// https://github.com/o0ragman0o/LibCLL/blob/master/LibCLL.sol
// https://github.com/vittominacori/solidity-linked-list/blob/master/contracts/StructuredLinkedList.sol

library CircularDoublyLinkedList {
    struct List {
        uint256 head;
        uint256 tail;
        uint256 size;
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
        uint256 _head = self.head;
        self.list[_SENTINEL][_NEXT] = index;
        self.list[_head][_PREV] = index;
        self.list[index][_PREV] = _SENTINEL;
        self.list[index][_NEXT] = _head;
        self.data[index] = data;
        self.head = index;
    }

    function _insertTail(List storage self, uint256 index, bytes memory data) private {
        uint256 _tail = self.tail;
        self.list[_SENTINEL][_PREV] = index;
        self.list[_tail][_NEXT] = index;
        self.list[index][_PREV] = _tail;
        self.list[index][_NEXT] = _SENTINEL;
        self.data[index] = data;
        self.tail = index;
    }

    function _removeHead(List storage self) private {
        uint256 _head = self.list[self.head][_NEXT];
        delete self.list[_head][_PREV];
        delete self.list[_head][_NEXT];
        self.list[_SENTINEL][_NEXT] = _head;
        self.list[_head][_PREV] = _SENTINEL;
        self.head = _head;
    }

    function _removeTail(List storage self) private {
        uint256 _tail = self.list[self.tail][_PREV];
        delete self.list[_tail][_PREV];
        delete self.list[_tail][_NEXT];
        self.list[_SENTINEL][_PREV] = _tail;
        self.list[_tail][_NEXT] = _SENTINEL;
        self.tail = _tail;
    }

    function exist(List storage self, uint256 index) internal view returns (bool) {
        if (self.list[index][_PREV] == _SENTINEL && self.list[index][_NEXT] == _SENTINEL) {
            return (self.list[_SENTINEL][_NEXT] == index);
        } else {
            return true;
        }
    }

    // function remove(List storage self, uint256[] memory indexes) internal {
    //     unchecked {
    //         for (uint i = 0; i < indexes.length; i++) {
    //             remove(self, indexes[i]);
    //         }
    //     }
    // }

    // function insert(List storage self, uint256[] memory indexes, bytes[] memory data) internal {
    //     unchecked {
    //         for (uint i = 0; i < indexes.length; i++) {
    //             insert(self, indexes[i], data[i]);
    //         }
    //     }
    // }

    function remove(List storage self, uint256 index) internal {
        if (exist(self, index) && index > 0) {
            if (index == self.head) {
                _removeHead(self);
            } else if (index == self.tail) {
                _removeTail(self);
            } else {
                _removeNode(self, index);
            }
            self.size--;
        }
    }

    function updateNodeData(List storage self, uint256 index, bytes memory data) internal {
        self.data[index] = data;
    }

    function insert(List storage self, uint256 index, bytes memory data) internal {
        if (!exist(self, index) && index > 0) {
            if (self.size == 0) {
                // If the list is empty, insert at head
                self.head = index;
                self.tail = index;
                self.list[_SENTINEL][_NEXT] = index;
                self.list[_SENTINEL][_PREV] = index;
                self.data[index] = data;
            } else if (index < self.head) {
                _insertHead(self, index, data);
            } else if (index > self.tail) {
                _insertTail(self, index, data);
            } else {
                // Inserting the index in between existing list
                uint256 current = self.head;
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
            self.size++;
        }
    }

    function first(List storage self) internal view returns (uint256) {
        return self.head;
    }

    function mid(List storage self) internal view returns (uint256) {
        uint256[] memory tmpList = firstParitionList(self);
        return tmpList[tmpList.length - 1];
    }

    function last(List storage self) internal view returns (uint256) {
        return self.tail;
    }

    function guard(List storage self) internal view returns (uint256[2] memory) {
        return [self.list[_SENTINEL][_PREV], self.list[_SENTINEL][_NEXT]];
    }

    function node(List storage self, uint256 index) internal view returns (uint256[2] memory) {
        return [self.list[index][_PREV], self.list[index][_NEXT]];
    }

    function ascendingList(List storage self) internal view returns (uint256[] memory) {
        uint256 index;
        uint256 tmpSize = self.size;
        uint256[] memory asd = new uint256[](tmpSize);
        unchecked {
            for (uint256 i = 0; i < tmpSize; i++) {
                asd[i] = self.list[index][_NEXT];
                index = self.list[index][_NEXT];
            }
        }
        return asd;
    }

    function descendingList(List storage self) internal view returns (uint256[] memory) {
        uint256 index;
        uint256 tmpSize = self.size;
        uint256[] memory des = new uint256[](tmpSize);
        unchecked {
            for (uint256 i = 0; i < tmpSize; i++) {
                des[i] = self.list[index][_PREV];
                index = self.list[index][_PREV];
            }
        }
        return des;
    }

    function firstParitionList(List storage self) internal view returns (uint256[] memory) {
        uint256 index;
        uint256 tmpSize = self.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = self.list[index][_NEXT];
            index = self.list[index][_NEXT];
        }
        return part;
    }

    function secondPartitionList(List storage self) internal view returns (uint256[] memory) {
        uint256 index;
        uint256 tmpSize = self.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = self.list[index][_PREV];
            index = self.list[index][_PREV];
        }
        return part;
    }
    // @TODO fix the potential issue
    function partition(List storage self, uint256 start) internal view returns (uint256[] memory) {
        uint256 index = start;
        // uint256[] memory chunk;
        uint256 counter;
        while (index != _SENTINEL) {
            index = self.list[start][_NEXT];
            // chunk[i] = index;
            counter++;
        }
        index = start;
        uint256[] memory chunk = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            chunk[i] = self.list[index][_NEXT];
            index = self.list[index][_NEXT];
        }
        return chunk;
    }

    function length(List storage self) internal view returns (uint256) {
        return self.size;
    }
}