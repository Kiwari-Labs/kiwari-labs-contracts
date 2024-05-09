pragma solidity >0.8.0;

contract DoublyLinkedListWithSentinel {
    struct Node {
        uint256 prev;
        uint256 next;
    }

    uint8 private constant _sentinel = 0;

    uint256 private _head;
    uint256 private _middle;
    uint256 private _tail;
    uint256 private _size;

    // make mapping into list
    mapping(uint256 => Node) private _nodes;

    function _insertNode(uint256 index, uint256 prev, uint256 next) private {
        _nodes[index] = Node(prev, next);
    }

    // TODO
    // function _insertAfter() private {
    //
    // }

    // TODO
    // function _insertBefore() private {
    //
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

    function _insertHead(uint256 value) internal {
        _updatePrev(_head, value);
        _insertNode(value, _sentinel, _head);
        _head = value;
        _size++;
    }

    function _insertTail(uint256 value) internal {
        _updateNext(_tail, value);
        _insertNode(value, _tail, _sentinel);
        _tail = value;
        _size++;
    }

    /// @custom:overloading-method add multiple index
    function insert(uint256[] memory indexes) public {
        for (uint i = 0; i < indexes.length; i++) {
            insert(indexes[i]);
        }
    }

    /// @custom:overloading-method add single index
    function insert(uint256 value) public {
        uint256 tmpSize = _size;
        uint256 tempHead = _head;
        uint256 tempTail = _tail;
        uint256 tempmiddle = _middle;
        if (tmpSize == 0) {
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
                _insertNode(value, tempHead, tempmiddle);
                _middle = value;
            }
            if (value < tempTail && value > tempmiddle) {
                while (_nodes[tempTail].prev > tempmiddle) {
                    tempTail = _nodes[tempTail].prev;
                }
                _updatePrev(tempTail, value);
                _insertNode(value, tempmiddle, tempHead);
                _middle = value;
            }
        }
        // avoid size increase if duplicate in list.
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

    function sentinel() public view returns (Node memory) {
        return _nodes[_sentinel];
    }

    function node(uint256 index) public view returns (Node memory) {
        return _nodes[index];
    }

    function ascendingList() public view returns (uint256 [] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = _nodes[index].next;
            index = _nodes[index].next;
        }
        return asd;
    }

    function descendingList() public view  returns (uint256 [] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return des;
    }

    // TODO refactor to determistic size array would be greate.
    function firstParitionList() public view returns (uint256 [] memory) {
       uint256 index = _sentinel;
       uint256[] memory part;
       uint256 i;
       while (_nodes[index].next != _middle) {
            part[i] = index;
            index = _nodes[index].next;
            i++;
       }
       return part;
    }

    // TODO refactor to determistic size array would be greate.
    function secondPartitionList() public view returns (uint256 [] memory) {
        uint256 index = _sentinel;
        uint256[] memory part;
        uint256 i;
        while (_nodes[index].prev != _middle) {
            part[i] = index;
            index = _nodes[index].prev;
            i++;
        }
        return part;
    }

    function size() public view returns (uint256) {
        return _size;
    }
}
