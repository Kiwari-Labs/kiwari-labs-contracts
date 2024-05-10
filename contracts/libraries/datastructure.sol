// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

// @TODO auto selective direction ordered list
// revised insert and remove
// 
// https://github.com/o0ragman0o/LibCLL/blob/master/LibCLL.sol
// https://github.com/vittominacori/solidity-linked-list/blob/master/contracts/StructuredLinkedList.sol

library CircularDoublyLinkedList {
    struct List {
        uint256 head;
        uint256 middle;
        uint256 tail;
        uint256 size;
        mapping(uint256 => mapping(bool => uint256)) list;
        mapping(uint256 => bytes) data;
    }

    uint8 private constant _SENTINEL = 0;
    bool private constant _PREV = false;
    bool private constant _NEXT = true;

    function _insertNode(List storage self, uint256 index, uint256 prev, uint256 next, bytes memory data) private {
        self.nodes[index] = Node(prev, next, data);
        self.size++;
    }

    function _removeNode(List storage self, uint256 index) private {
        self.nodes[self.nodes[index].prev].next = self.nodes[index].next;
        self.nodes[self.nodes[index].next].prev = self.nodes[index].prev;
        delete self.nodes[index];
        self.size--;
    }

    function _updatePrev(List storage self, uint256 index, uint256 newPrev) private {
        self.nodes[index].prev = newPrev;
    }

    function _updateNext(List storage self, uint256 index, uint256 newNext) private {
        self.nodes[index].next = newNext;
    }

    function _insertHead(List storage self, uint256 index, bytes memory data) private {
        self.nodes[_sentinel].next = index;
        self.nodes[self.head].prev = index;
        _insertNode(self, index, _sentinel, self.head, data);
        self.head = index;
    }

    function _insertTail(List storage self, uint256 index, bytes memory data) private {
        self.nodes[_sentinel].prev = index;
        self.nodes[self.tail].next = index;
        _insertNode(self, index, self.tail, _sentinel, data);
        self.tail = index;
    }

    function _removeHead(List storage self) private {
        uint256 newHead = self.nodes[self.head].next;
        self.nodes[_sentinel].next = newHead;
        self.nodes[newHead].prev = _sentinel;
        delete self.nodes[self.head];
        self.head = newHead;
        self.size--;
    }

    function _removeTail(List storage self) private {
        uint256 newTail = self.nodes[self.tail].prev;
        self.nodes[_sentinel].prev = newTail;
        self.nodes[newTail].next = _sentinel;
        delete self.nodes[self.tail];
        self.tail = newTail;
        self.size--;
    }

    function exist(List storage self, uint256 index) internal view returns (bool) {
        if ((index > 0) && (index == self.head || index == self.tail)) {
            return true;
        } else {
            return self.nodes[index].prev != _sentinel && self.nodes[index].next != _sentinel;
        }
    }

    function remove(List storage self, uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            remove(self, indexes[i]);
        }
    }

    function remove(List storage self, uint256 index) internal {
        if (exist(self, index) && index > 0) {
            if (index == self.head) {
                _removeHead(self);
            } else if (index == self.tail) {
                _removeTail(self);
            } else {
                _removeNode(self, index);
            }
        }
    }

    function updateNodeData(List storage self, uint256 index, bytes memory data) internal {
        self[index] = data;
    }

    function insert(List storage self, uint256[] memory indexes, bytes[] memory data) internal {
        for (uint i = 0; i < indexes.length; i++) {
            insert(self, indexes[i], data[i]);
        }
    }

    function insert(List storage self, uint256 index, bytes memory data) internal {
        if (!exist(self, index) && index > 0) {
            if (self.size == 0) {
                // If the list is empty, insert at head
                self.head = index;
                self.tail = index;
                self.nodes[_sentinel].next = index;
                self.nodes[_sentinel].prev = index;
                self.nodes[index].data = data;
                self.size++;
            } else if (index < self.head) {
                _insertHead(self, index, data);
            } else if (index > self.tail) {
                _insertTail(self, index, data);
            } else {
                // Inserting the index in between existing nodes
                uint256 current = self.head;
                while (index > current) {
                    current = self.nodes[current].next;
                }
                _insertNode(self, index, self.nodes[current].prev, current, data);
                self.nodes[self.nodes[current].prev].next = index;
                self.nodes[current].prev = index;
            }
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

    function guard(List storage self) internal view returns (uint256 [2]) {
        return [self.nodes[_sentinel][_PREV],self.nodes[_sentinel][_NEXT]];
    }

    function node(List storage self, uint256 index) internal view returns (Node memory) {
        return self.nodes[index];
    }

    function ascendingList(List storage self) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = self.size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = self.list[index][_NEXT];
            index = self.list[_NEXT].next;
        }
        return asd;
    }

    function descendingList(List storage self) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = self.size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = self.list[index][_PREV];
            index = self.list[index][_PREV];
        }
        return des;
    }

    function firstParitionList(List storage self) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = self.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = self.list[index][_NEXT];
            index = self.list[index][_NEXT];
        }
        return part;
    }

    function secondPartitionList(List storage self) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = self.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = self.list[index][_PREV];
            index = self.list[index][_PREV];
        }
        return part;
    }

    function partition(List storage self, uint256 start, uint256 end) internal view returns (uint256[] memory) {
        uint256 index = start;
        uint256[] memory chunk;
        uint256 i;
        while (index != end) {
            index = self.nodes[start].next;
            chunk[i] = index;
            i++;
        }
        return chunk;
    }

    function length(List storage self) internal view returns (uint256) {
        return self.size;
    }
}
