// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

library CircularDoublyLinkedList {
     struct Node {
        uint256 prev;
        uint256 next;
        // bytes data; // reserve
    }

    uint8 private constant _sentinel = 0;

    // Library cannot have non-constant state variables
    uint256 private _head;
    uint256 private _middle;
    uint256 private _tail;
    uint256 private _size;

    // Library cannot have non-constant state variables
    mapping(uint256 => Node) private _nodes;

    function _insertNode(uint256 index, uint256 prev, uint256 next) private {
        _nodes[index] = Node(prev, next);
    }

    function _updatePrev(uint256 index, uint256 newPrev) internal {
        _nodes[index].prev = newPrev;
    }

    function _updateNext(uint256 index, uint256 newNext) internal {
        _nodes[index].next = newNext;
    }

    // TODO maintain middle
    function _insertMiddle(uint256 index) internal {
        _middle = index;
    }

    function _insertHead(uint256 index) internal {
        _updateNext(_sentinel, index);
        _updatePrev(_head, index);
        _insertNode(index, _sentinel, _head);
        _head = index;
    }

    function _insertTail(uint256 index) internal {
        _updatePrev(_sentinel, index);
        _updateNext(_tail, index);
        _insertNode(index, _tail, _sentinel);
        _tail = index;
    }

    function _removeHead() internal {
        _updateNext(_sentinel, _nodes[_head].next);
        _head = _nodes[_head].next;
        _updateNext(_sentinel, _head);
        _size--;
    }

    function _removeTail() internal {
        _updatePrev(_sentinel, _nodes[_tail].prev);
        _tail = _nodes[_tail].prev;
        _updateNext(_tail, _sentinel);
        _size--;
    }

    /// @custom:overloading-method remove multiple index
    function remove(uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            remove(indexes[i]);
        }
    }

    /// @custom:overloading-method remove single index
    function remove(uint256 value) internal {
        if (_size == 0) {
            // Handle If the list is empty?
        } else if (value == _head) {
            _removeHead();
        } else if (value == _tail) {
            _removeTail();
        } else {
            // TODO
        }
    }

    /// @custom:overloading-method add multiple index
    function insert(uint256[] memory indexes) internal {
        for (uint i = 0; i < indexes.length; i++) {
            insert(indexes[i]);
        }
    }

    /// @custom:overloading-method add single index
    function insert(uint256 value) internal {
        if (_size == 0) {
            // If the list is empty, insert at head
            _insertHead(value);
            _insertTail(value);
            _insertMiddle(value);
            _size++;
        } else if (value <= _head) {
            // If the value is less than or equal to the head, insert at head
            if (_head != value) {
                _insertHead(value);
                _size++;
            }
        } else if (value >= _tail) {
            // If the value is greater than or equal to the tail, insert at tail
            if (_tail != value) {
                _insertTail(value);
                _size++;
            }
        } else {
            // Inserting the value in between existing nodes
            uint256 current = _head;
            while (current != _sentinel && value > current) {
                if (current == value) {
                    // If value already exists, do not insert
                    return;
                }
                current = _nodes[current].next;
            }
            if (current != value) {
                _insertNode(value, _nodes[current].prev, current);
                _updateNext(_nodes[current].prev, value);
                _updatePrev(current, value);
                _size++;
            }
        }
    }

    function head() internal view returns (uint256) {
        return _head;
    }

    function middle() internal view returns (uint256) {
        return _middle;
    }

    function tail() internal view returns (uint256) {
        return _tail;
    }

    function sentinel() internal view returns (Node memory) {
        return _nodes[_sentinel];
    }

    function node(uint256 index) internal view returns (Node memory) {
        return _nodes[index];
    }

    function ascendingList() internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = _nodes[index].next;
            index = _nodes[index].next;
        }
        return asd;
    }

    function descendingList() internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return des;
    }

    function firstParitionList() internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size/2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return part;
    }

    function secondPartitionList() internal view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size/2;
        uint256[] memory part = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            part[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return part;
    }

    function size() internal view returns (uint256) {
        return _size;
    }
}