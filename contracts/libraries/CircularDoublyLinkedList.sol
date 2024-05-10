// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

library CircularDoublyLinkedList {
    struct Node {
        uint256 prev;
        uint256 next;
        bytes data;
    }

    struct List {
        uint256 head;
        uint256 middle;
        uint256 tail;
        uint256 size;
        mapping(uint256 => Node) nodes;
    }

    uint8 private constant _sentinel = 0;

    function _insertNode(List storage list, uint256 index, uint256 prev, uint256 next, bytes memory data) private {
        list.nodes[index] = Node(prev, next, data);
        list.size++;
    }

    function _removeNode(List storage list, uint256 index) private {
        list.nodes[list.nodes[index].prev].next = list.nodes[index].next;
        list.nodes[list.nodes[index].next].prev = list.nodes[index].prev;
        delete list.nodes[index];
        list.size--;
    }

    function _updatePrev(List storage list, uint256 index, uint256 newPrev) private {
        list.nodes[index].prev = newPrev;
    }

    function _updateNext(List storage list, uint256 index, uint256 newNext) private {
        list.nodes[index].next = newNext;
    }

    function _insertHead(List storage list, uint256 index, bytes memory data) private {
        list.nodes[_sentinel].next = index;
        list.nodes[list.head].prev = index;
        _insertNode(list, index, _sentinel, list.head, data);
        list.head = index;
    }

    function _insertTail(List storage list, uint256 index, bytes memory data) private {
        list.nodes[_sentinel].prev = index;
        list.nodes[list.tail].next = index;
        _insertNode(list, index, list.tail, _sentinel, data);
        list.tail = index;
    }

    function _removeHead(List storage list) private {
        uint256 newHead = list.nodes[list.head].next;
        list.nodes[_sentinel].next = newHead;
        list.nodes[newHead].prev = _sentinel;
        delete list.nodes[list.head];
        list.head = newHead;
        list.size--;
    }

    function _removeTail(List storage list) private {
        uint256 newTail = list.nodes[list.tail].prev;
        list.nodes[_sentinel].prev = newTail;
        list.nodes[newTail].next = _sentinel;
        delete list.nodes[list.tail];
        list.tail = newTail;
        list.size--;
    }

    function exist(List storage list, uint256 index) internal view returns (bool) {
        if ((index > 0) && (index == list.head || index == list.tail)) {
            return true;
        } else {
            return list.nodes[index].prev != _sentinel && list.nodes[index].next != _sentinel;
        }
    }

    function remove(List storage list, uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            remove(list, indexes[i]);
        }
    }

    function remove(List storage list, uint256 index) internal {
        if (exist(list, index) && index > 0) {
            if (index == list.head) {
                _removeHead(list);
            } else if (index == list.tail) {
                _removeTail(list);
            } else {
                _removeNode(list, index);
            }
        }
    }

    function updateNodeData(List storage list, uint256 index, bytes memory data) internal {
        list.nodes[index].data = data;
    }

    function insert(List storage list, uint256[] memory indexes, bytes[] memory data) internal {
        for (uint i = 0; i < indexes.length; i++) {
            insert(list, indexes[i], data[i]);
        }
    }

    function insert(List storage list, uint256 index, bytes memory data) internal {
        if (!exist(list, index) && index > 0) {
            if (list.size == 0) {
                // If the list is empty, insert at head
                list.head = index;
                list.tail = index;
                list.nodes[_sentinel].next = index;
                list.nodes[_sentinel].prev = index;
                list.nodes[index].data = data;
                list.size++;
            } else if (index < list.head) {
                _insertHead(list, index, data);
            } else if (index > list.tail) {
                _insertTail(list, index, data);
            } else {
                // Inserting the index in between existing nodes
                uint256 current = list.head;
                while (index > current) {
                    current = list.nodes[current].next;
                }
                _insertNode(list, index, list.nodes[current].prev, current, data);
                list.nodes[list.nodes[current].prev].next = index;
                list.nodes[current].prev = index;
            }
        }
    }

    function first(List storage list) internal view returns (uint256) {
        return list.head;
    }

    function mid(List storage list) internal view returns (uint256) {
        uint256[] memory tmpList = firstParitionList(list);
        return tmpList[tmpList.length - 1];
    }

    function last(List storage list) internal view returns (uint256) {
        return list.tail;
    }

    function guard(List storage list) internal view returns (Node memory) {
        return list.nodes[_sentinel];
    }

    function node(List storage list, uint256 index) internal view returns (Node memory) {
        return list.nodes[index];
    }

    function ascendingList(List storage list) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = list.size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = list.nodes[index].next;
            index = list.nodes[index].next;
        }
        return asd;
    }

    function descendingList(List storage list) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = list.size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = list.nodes[index].prev;
            index = list.nodes[index].prev;
        }
        return des;
    }

    function firstParitionList(List storage list) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = list.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = list.nodes[index].prev;
            index = list.nodes[index].prev;
        }
        return part;
    }

    function secondPartitionList(List storage list) internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = list.size / 2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = list.nodes[index].prev;
            index = list.nodes[index].prev;
        }
        return part;
    }

    function partition(List storage list, uint256 start, uint256 end) internal view returns (uint256[] memory) {
        uint256 index = start;
        uint256[] memory chunk;
        uint256 i;
        while (index != end) {
            index = list.nodes[start].next;
            chunk[i] = index;
            i++;
        }
        return chunk;
    }

    function length(List storage list) internal view returns (uint256) {
        return list.size;
    }
}
