pragma solidity >0.8.0;

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
            // first partition
            if (value < tempPivot && value > tempHead) {
                // use tempPivot as temporary tail
                // TODO code flaw?
                while (_list[tempHead].next < tempPivot) {
                    tempHead = _list[tempHead].next;
                }
                _list[tempHead].next = value;
                _list[value].prev = tempHead;
                _list[value].next = tempPivot;
            }
            // update second partition
            if (value > tempPivot && value < tempTail) {
                // use tempPivot as temporary head
                // TODO code flaw?
                while (_list[tempTail].prev > tempPivot) {
                    tempTail = _list[tempTail].prev;
                }
                _list[tempTail].prev = value;
                _list[value].next = tempTail;
                _list[value].prev = tempPivot;
            }
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
        head = value;
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
