pragma solidity >0.8.0;

contract DoublyLinkedList {
    struct Node {
        uint256 prev;
        uint256 next;
    }

    uint256 private _head;
    uint256 private _middle;
    uint256 private _tail;
    uint256 private _size;

    mapping(uint256 => Node) private _nodes;

    // function _insertNode(uint256 index, uint256 prev, uint256 next) private {
    //     _nodes[index] = Node(prev, next);
    // }

    function _updatePrev(uint256 value, uint256 newPrev) internal {
        _nodes[value].prev = newPrev;
    }

    function _updateNext(uint256 value, uint256 newNext) internal {
        _nodes[value].next = newNext;
    }

    function _updatemiddle(uint256 value) internal {
        _middle = value;
    }

    function _insertNewValue(uint256 value, uint256 prev, uint256 next) internal {
        _nodes[value].prev = prev;
        _nodes[value].next = next;
    }

    function _insertHead(uint256 value) internal {
        _nodes[_head].prev = value;
        _nodes[value].prev = 0;
        _nodes[value].next = _head;
        _head = value;
    }

    function _insertTail(uint256 value) internal {
        _nodes[_tail].next = value;
        _nodes[value].prev = _tail;
        _nodes[value].next = 0;
        _tail = value;
    }

    /// @custom:overloading-method add multiple index
    function insert(uint256[] memory indexes) public {
        for (uint i = 0; i < indexes.length; i++) {
            insert(indexes[i]);
        }
    }

    /// @custom:overloading-method add single index
    function insert(uint256 value) public {
        uint256 tempHead = _head;
        uint256 tempTail = _tail;
        uint256 tempmiddle = _middle;
        if (tempHead == 0 && tempTail == 0) {
            _insertHead(value);
            _insertTail(value);
            _middle = value;
        } else {
            if (value < tempHead) {
                _insertHead(value);
            }
            if (value > tempTail) {
                _insertTail(value);
            }
            // fix the bug
            if (value > tempHead && value < tempmiddle) {
                while (_nodes[tempHead].next < tempmiddle) {
                    tempHead = _nodes[tempHead].next;
                }
                _updateNext(tempHead, value);
                _insertNewValue(value, tempHead, tempmiddle);
                _middle = value;
            }
            if (value < tempTail && value > tempmiddle) {
                while (_nodes[tempTail].prev > tempmiddle) {
                    tempTail = _nodes[tempTail].prev;
                }
                _updatePrev(tempTail, value);
                _insertNewValue(value, tempmiddle, tempHead);
                _middle = value;
            }
        }
        // avoid size increase if duplicate in list.
        _size++;
    }

    function head() public view returns (uint256) {
        return _head;
    }

    function tail() public view returns (uint256) {
        return _tail;
    }

    function middle() public view returns (uint256) {
        return _middle;
    }

    function get(uint256 index) public view returns (Node memory) {
        return _nodes[index];
    }

    function getSortedList() public view returns (uint256 [] memory) {
        uint256[] memory sorted = new uint256[](_size);
        uint256 index = _head;
        for (uint256 i = 0; i < _size; i++) {
            sorted[i] = _nodes[index].next;
            index = _nodes[index].next;
        }
        return sorted;
    }

    function getSize() public view returns (uint256) {
        return _size;
    }
}
