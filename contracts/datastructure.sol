pragma solidity >0.8.0;

// [133,119,238,14,147,10,6,62,158,154,27]

contract DataStructure {
    struct List {
        uint256 prev;
        uint256 next;
    }

    uint256 public head;
    uint256 public pivot;
    uint256 public tail;

    mapping(uint256 => List) private _list;
    uint8 private constant SAFE = 0;

    function insert(uint256 value) public {
        uint256 tempHead = head;
        uint256 tempTail = tail;
        uint256 tempPivot = pivot;
        if (tempHead == SAFE && tempTail == SAFE) {
            _insertHead(value);
            _insertTail(value);
            pivot = value;
        } else {
            if (value < tempHead) {
                _insertHead(value);
            }
            if (value > tempTail) {
                _insertTail(value);
            }
            // logic bug
            // first partition
            // if (value < tempPivot && value > tempHead) {
            //     // use tempPivot as temporary tail
            //     while (_list[tempHead].next < tempPivot) {
            //         tempHead = _list[tempHead].next;
            //     }
            //     _updateNext(tempHead, value);
            //     _insertNewValue(value, tempHead, tempPivot);
            // }
            // // update second partition
            // if (value > tempPivot && value < tempTail) {
            //     // use tempPivot as temporary head
            //     while (_list[tempTail].prev > tempPivot) {
            //         tempTail = _list[tempTail].prev;
            //     }
            //     _updatePrev(tempTail, value);
            //     _insertNewValue(value, tempPivot, tempHead);
            // }
            pivot = value;
        }
    }

    function _insertHead(uint256 value) internal {
        _list[head].prev = value;
        _list[value].next = head;
        head = value;
    }

    function _insertTail(uint256 value) internal {
        _list[tail].prev = value;
        _list[value].next = tail;
        tail = value;
    }

    function _insertNewValue(uint256 value, uint256 prev, uint256 next) internal {
        _list[value].prev = prev;
        _list[value].next = next;
    }

    function _updatePrev(uint256 value, uint256 newPrev) internal {
        _list[value].prev = newPrev;
    }

    function _updateNext(uint256 value, uint256 newNext) internal {
        _list[value].next = newNext;
    }

    function query(uint256 value) public view returns (List memory) {
        return _list[value];
    }

    /// @custom:overloading method
    function insert(uint256[] memory value) public {
        for (uint i = 0; i < value.length; i++) {
            insert(value[i]);
        }
    }
}
