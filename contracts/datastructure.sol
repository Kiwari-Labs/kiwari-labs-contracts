pragma solidity ^0.8.0;

contract DoublyLinkedListWithSentinel {
    struct Node {
        uint256 prev;
        uint256 next;
    }

    uint256 private constant _SENTINEL = 0;

    uint256 private _head;
    uint256 private _middle;
    uint256 private _tail;
    uint256 private _size;

    mapping(uint256 => Node) private _nodes;

    function _insertNode(uint256 index, uint256 prev, uint256 next) private {
        _nodes[index] = Node(prev, next);
    }

    function _updatePrev(uint256 index, uint256 newPrev) private {
        _nodes[index].prev = newPrev;
    }

    function _updateNext(uint256 index, uint256 newNext) private {
        _nodes[index].next = newNext;
    }

    function _insertMiddle(uint256 index) private {
        _middle = index;
    }

    function _insertHead(uint256 index) private {
        _updatePrev(_head, index);
        _updateNext(_SENTINEL, index);
        _insertNode(index, _SENTINEL, _head);
        _head = index;
    }

    function _insertTail(uint256 index) private {
        _updateNext(_tail, index);
        _updatePrev(_SENTINEL, index);
        _insertNode(index, _tail, _SENTINEL);
        _tail = index;
    }

    function insert(uint256[] memory indexes) public {
        for (uint i = 0; i < indexes.length; i++) {
            insert(indexes[i]);
        }
    }

    function insert(uint256 value) public {
        if (_size == 0) {
            _insertHead(value);
            _insertTail(value);
            _insertMiddle(value);
        } else if (value <= _nodes[_head].next) {
            _insertHead(value);
            if (_size % 2 != 0) {
                _insertMiddle(_head);
            }
        } else if (value >= _nodes[_tail].prev) {
            _insertTail(value);
            if (_size % 2 == 0) {
                _insertMiddle(_tail);
            }
        } else {
            uint256 current = _head;
            while (current != _SENTINEL && value > current) {
                current = _nodes[current].next;
            }
            _insertNode(value, _nodes[current].prev, current);
            _updateNext(_nodes[current].prev, value);
            _updatePrev(current, value);
            if (_size % 2 == 0) {
                _insertMiddle(_nodes[_middle].next);
            }
        }
        _size++;
    }

    function head() public view returns (uint256) {
        return _head;
    }

    function middle() public view returns (uint256) {
        return _middle;
    }

    function tail() public view returns (uint256) {
        return _tail;
    }

    function sentinel() public pure returns (uint256) {
        return _SENTINEL;
    }

    function node(uint256 index) public view returns (Node memory) {
        return _nodes[index];
    }

    function ascendingList() public view returns (uint256[] memory) {
        uint256 index = _head;
        uint256[] memory asc = new uint256[](_size);
        for (uint256 i = 0; i < _size; i++) {
            asc[i] = index;
            index = _nodes[index].next;
        }
        return asc;
    }

    function descendingList() public view returns (uint256[] memory) {
        uint256 index = _tail;
        uint256[] memory des = new uint256[](_size);
        for (uint256 i = 0; i < _size; i++) {
            des[i] = index;
            index = _nodes[index].prev;
        }
        return des;
    }

    function size() public view returns (uint256) {
        return _size;
    }
}
