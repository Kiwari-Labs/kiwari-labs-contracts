pragma solidity >0.8.0;

contract DoublyLinkedListWithSentinel {
    struct Node {
        uint256 prev;
        uint256 next;
        // bytes data; // reserve
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

    function _updatePrev(uint256 index, uint256 newPrev) internal {
        _nodes[index].prev = newPrev;
    }

    function _updateNext(uint256 index, uint256 newNext) internal {
        _nodes[index].next = newNext;
    }

    function _insertMiddle(uint256 index) internal {
        // TODO maintain middle
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
        // TODO
    }

    function _removeTail() internal {
        // TODO
    }

    function _remove(uint256 index) internal {
        // TODO
    }

    /// @custom:overloading-method add multiple index
    function insert(uint256[] memory indexes) public {
        for (uint i = 0; i < indexes.length; i++) {
            insert(indexes[i]);
        }
    }

    /// @custom:overloading-method add single index
    function insert(uint256 value) public {
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

    function ascendingList(uint256 index) public view returns (uint256[] memory) {
        uint256 tmpIndex = index;
        uint256 tmpSize = _size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = _nodes[tmpIndex].next;
            tmpIndex = _nodes[tmpIndex].next;
        }
        return asd;
    }

    function ascendingList() public view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory asd = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            asd[i] = _nodes[index].next;
            index = _nodes[index].next;
        }
        return asd;
    }

    function descendingList(uint256 index) public view returns (uint256[] memory) {
        uint256 tmpIndex = index;
        uint256 tmpSize = _size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[tmpIndex].prev;
            tmpIndex = _nodes[tmpIndex].prev;
        }
        return des;
    }

    function descendingList() public view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return des;
    }

    function firstParitionList() public view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size/2;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return des;
    }

    function secondPartitionList() public view returns (uint256[] memory) {
        uint256 index = _sentinel;
        uint256 tmpSize = _size/2;
        uint256[] memory des = new uint256[](tmpSize);
        for (uint256 i = 0; i < tmpSize; i++) {
            des[i] = _nodes[index].prev;
            index = _nodes[index].prev;
        }
        return des;
    }

    function size() public view returns (uint256) {
        return _size;
    }
}
