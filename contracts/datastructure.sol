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
    uint256 private constant _safe = 0;

    function insert(uint256 value) public {
        if (head == _safe && tail == _safe) {
            // intialize list
            head = value;
            tail = value;
            // can be ingore cause _list[value].prev and _list[value].next are equal to _safe by default
            pivot = value;
        } else {
            if (value < head) {
                _list[head].prev = value;
                _list[value].next = head;
                // _list[value].prev is equal to _safe by default
                head = value;
            }
            if (value > tail) {
                _list[tail].next = value;
                _list[value].prev = tail;
                // _list[value].next is equa; to _safe by default
                tail = value;
            }
            // first partition
            if (value < pivot && value > head) {
                // use pivot as temporary tail
                uint256 tempHead = head;
                while(_list[tempHead].next < pivot) {
                    tempHead = _list[tempHead].next;
                }
                _list[tempHead].next = value;
                _list[value].prev = tempHead;
                _list[value].next = pivot;
            }
            // update second partition
            if (value > pivot && value < head) {
                // use pivot as temporary head
                uint256 tempTail = tail;
                while(_list[tempTail].prev > pivot) {
                    tempTail = _list[tempTail].prev;
                }
                _list[tempTail].prev = value;
                _list[value].next = tempTail;
                _list[value].prev = pivot;
            }
            pivot = value;
        }
    }

    function query(uint256 value) public view returns (List memory) {
        return _list[value];
    }

    /// @custom:overloading method
    function insert(uint256 [] memory value) public {
        for(uint i = 0; i < value.length; i++) {
            insert(value[i]);
        }
    }

}