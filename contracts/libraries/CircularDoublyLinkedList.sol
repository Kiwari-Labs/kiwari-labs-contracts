// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

library CircularDoublyLinkedList {
    struct Node {
        uint256 prev;
        uint256 next;
        // bytes data; // reserve for data
    }

    struct List {
        uint256 head;
        uint256 middle;
        uint256 tail;
        uint256 size;
        mapping(uint256 => Node) nodes;
    }

    uint8 private constant _sentinel = 0;

    function _insertNode(List storage list, uint256 index, uint256 prev, uint256 next) private {
        list.nodes[index] = Node(prev, next);
    }

    function _updatePrev(List storage list, uint256 index, uint256 newPrev) private {
        list.nodes[index].prev = newPrev;
    }

    function _updateNext(List storage list, uint256 index, uint256 newNext) private {
        list.nodes[index].next = newNext;
    }

    function _insertMiddle(List storage list, uint256 index) private {
        // @TODO maintain middle
        list.middle = index;
    }

    function _insertHead(List storage list, uint256 index) private {
        _updateNext(list, _sentinel, index);
        _updatePrev(list, list.head, index);
        _insertNode(list, index, _sentinel, list.head);
        list.head = index;
    }

    function _insertTail(List storage list, uint256 index) private {
        _updatePrev(list, _sentinel, index);
        _updateNext(list, list.tail, index);
        _insertNode(list, index, list.tail, _sentinel);
        list.tail = index;
    }

    function _removeHead(List storage list) private {
        _updateNext(list, _sentinel, list.nodes[list.head].next);
        list.head = list.nodes[list.head].next;
        _updateNext(list, _sentinel, list.head);
        list.size--;
    }

    function _removeTail(List storage list) private {
        _updatePrev(list, _sentinel, list.nodes[list.tail].prev);
        list.tail = list.nodes[list.tail].prev;
        _updateNext(list, list.tail, _sentinel);
        list.size--;
    }

    /// @custom:overloading-method remove multiple index
    function remove(List storage list, uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            remove(list, indexes[i]);
        }
    }

    // @TODO maintain middle
    /// @custom:overloading-method remove single index
    function remove(List storage list, uint256 value) internal {
        if (list.size == 0) {
            // Handle If the list is empty?
        } else if (value == list.head) {
            _removeHead(list);
        } else if (value == list.tail) {
            _removeTail(list);
        } else {
            // @TODO
        }
    }

    /// @custom:overloading-method add multiple index
    function insert(List storage list, uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            insert(list, indexes[i]);
        }
    }

    // @TODO maintain middle
    /// @custom:overloading-method add single index
    function insert(List storage list, uint256 value) internal {
        if (list.size == 0) {
            // If the list is empty, insert at head
            _insertHead(list, value);
            _insertTail(list, value);
            _insertMiddle(list, value);
            list.size++;
        } else if (value <= list.head) {
            // If the value is less than or equal to the head, insert at head
            if (list.head != value) {
                _insertHead(list, value);
                list.size++;
            }
        } else if (value >= list.tail) {
            // If the value is greater than or equal to the tail, insert at tail
            if (list.tail != value) {
                _insertTail(list, value);
                list.size++;
            }
        } else {
            // Inserting the value in between existing nodes
            uint256 current = list.head;
            while (current != _sentinel && value > current) {
                if (current == value) {
                    // If value already exists, do not insert
                    return;
                }
                current = list.nodes[current].next;
            }
            if (current != value) {
                _insertNode(list, value, list.nodes[current].prev, current);
                _updateNext(list, list.nodes[current].prev, value);
                _updatePrev(list, current, value);
                list.size++;
            }
        }
    }

    function first(List storage list) internal view returns (uint256) {
        return list.head;
    }

    function mid(List storage list) internal view returns (uint256) {
        // can we use last index of first partition as the middle of list?
        // cause it's simple to implement
        // maybe insufficient in large list
        return list.middle;
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
