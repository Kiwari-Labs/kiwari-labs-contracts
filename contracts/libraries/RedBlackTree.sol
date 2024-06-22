// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title Rairakku (ライラック) is an implementation of Red-Black Tree (RBT).
/// @author Kiwari Labs
// inspiration
// https://github.com/bokkypoobah/BokkyPooBahsTreeLibrary/
// https://github.com/rob-Hitchens/OrderStatisticsTree
// https://github.com/saurfang/solidity-treemap/

library SortedCircularDoublyLinkedList {
    struct Node {
        uint256 parent;
        mapping(bool => uint256) leaf;
    }

    struct Tree {
        uint256 root;
        uint256 size;
        mapping(uint256 => bool) red;
        mapping(uint256 => Node) nodes;
    }

    bool private constant LEFT = false;
    bool private constant RIGHT = true;
    uint8 private constant SENTINEL = 0;

    function _leaf(
        Tree storage self,
        uint256 index,
        bool direction
    ) private view returns (uint256) {
        while (self.nodes[index].leaf[direction] > SENTINEL) {
            index = self.nodes[index].leaf[direction];
        }
        return index;
    }

    function _next(
        Tree storage self,
        uint256 index
    ) private view returns (uint256 cursor) {
        Node storage node = self.nodes[index];
        uint256 tmpRight = node.leaf[RIGHT];
        if (tmpRight > SENTINEL) {
            cursor = _leaf(self, tmpRight, LEFT);
        } else {
            cursor = node.parent;
            while (
                cursor > SENTINEL && index == self.nodes[cursor].leaf[RIGHT]
            ) {
                index = cursor;
                cursor = self.nodes[cursor].parent;
            }
        }
    }

    function _prev(
        Tree storage self,
        uint256 index
    ) private view returns (uint256 cursor) {
        Node storage node = self.nodes[index];
        uint256 tmpLeft = node.leaf[LEFT];
        if (tmpLeft > SENTINEL) {
            cursor = _leaf(self, tmpLeft, RIGHT);
        } else {
            cursor = node.parent;
            while (
                cursor > SENTINEL && index == self.nodes[cursor].leaf[LEFT]
            ) {
                index = cursor;
                cursor = self.nodes[cursor].parent;
            }
        }
    }

    function _rotate(Tree storage self, uint256 index, bool direction) private {
        bool reverse = !direction;
        Node storage node = self.nodes[index];
        uint256 cursor = self.nodes[index].leaf[direction];
        uint256 indexParent = self.nodes[index].parent;
        uint256 cursorLeft = self.nodes[cursor].leaf[reverse];
        self.nodes[index].leaf[direction] = cursorLeft;
        if (cursorLeft > SENTINEL) {
            self.nodes[cursorLeft].parent = index;
        }
        self.nodes[cursor].parent = indexParent;
        if (indexParent == SENTINEL) {
            self.root = cursor;
        } else if (index == self.nodes[indexParent].leaf[reverse]) {
            self.nodes[indexParent].leaf[reverse] = cursor;
        } else {
            self.nodes[indexParent].leaf[direction] = cursor;
        }
        self.nodes[cursor].leaf[reverse] = index;
        self.nodes[index].parent = cursor;
    }

    function _insertFixup(Tree storage self, uint256 index) private {
        uint256 cursor;
        uint256 memRoot = self.root;
        while (index > memRoot && self.red[self.nodes[index].parent]) {
            uint256 indexParent = self.nodes[index].parent;
            if (
                indexParent ==
                self.nodes[self.nodes[indexParent].parent].leaf[LEFT]
            ) {
                cursor = self.nodes[self.nodes[indexParent].parent].leaf[RIGHT];
                if (self.red[cursor]) {
                    self.red[indexParent] = false;
                    self.red[cursor] = false;
                    self.red[self.nodes[indexParent].parent] = true;
                    index = self.nodes[indexParent].parent;
                } else {
                    if (index == self.nodes[indexParent].leaf[RIGHT]) {
                        index = indexParent;
                        _rotate(self, index, RIGHT);
                    }
                    indexParent = self.nodes[index].parent;
                    self.red[indexParent] = false;
                    self.red[self.nodes[indexParent].parent] = true;
                    _rotate(self, self.nodes[indexParent].parent, LEFT);
                }
            } else {
                cursor = self.nodes[self.nodes[indexParent].parent].leaf[LEFT];
                if (self.red[cursor]) {
                    self.red[indexParent] = false;
                    self.red[cursor] = false;
                    self.red[self.nodes[indexParent].parent] = true;
                    index = self.nodes[indexParent].parent;
                } else {
                    if (index == self.nodes[indexParent].leaf[LEFT]) {
                        index = indexParent;
                        _rotate(self, index, LEFT);
                    }
                    indexParent = self.nodes[index].parent;
                    self.red[indexParent] = false;
                    self.red[self.nodes[indexParent].parent] = true;
                    _rotate(self, self.nodes[indexParent].parent, RIGHT);
                }
            }
        }
        self.red[memRoot] = false;
    }

    function _replaceParent(Tree storage self, uint256 a, uint256 b) private {
        b = self.nodes[b].parent;
        self.nodes[a].parent = b;
        if (b == SENTINEL) {
            self.root = a;
        } else {
            Node storage ptr = self.nodes[b];
            if (b == ptr.leaf[LEFT]) {
                ptr.leaf[LEFT] = a;
            } else {
                ptr.leaf[RIGHT] = a;
            }
        }
    }

    function _removeFixup(Tree storage self, uint256 index) private {
        uint256 cursor;
        uint256 memRoot = self.root;
        while (index > memRoot && !self.red[index]) {
            uint256 indexParent = self.nodes[index].parent;
            if (index == self.nodes[indexParent].leaf[LEFT]) {
                cursor = self.nodes[indexParent].leaf[RIGHT];
                if (self.red[cursor]) {
                    self.red[cursor] = false;
                    self.red[indexParent] = true;
                    _rotate(self, indexParent, RIGHT);
                    cursor = self.nodes[indexParent].leaf[RIGHT];
                }
                Node storage memNode = self.nodes[cursor];
                if (
                    !self.red[memNode.leaf[LEFT]] &&
                    !self.red[memNode.leaf[RIGHT]]
                ) {
                    self.red[cursor] = true;
                    index = indexParent;
                } else {
                    if (!self.red[memNode.leaf[RIGHT]]) {
                        self.red[memNode.leaf[LEFT]] = false;
                        self.red[cursor] = true;
                        _rotate(self, cursor, LEFT);
                        cursor = self.nodes[indexParent].leaf[RIGHT];
                    }
                    self.red[cursor] = self.red[indexParent];
                    self.red[indexParent] = false;
                    self.red[self.nodes[cursor].leaf[RIGHT]] = false;
                    _rotate(self, indexParent, RIGHT);
                    index = memRoot;
                }
            } else {
                cursor = self.nodes[indexParent].leaf[LEFT];
                if (self.red[cursor]) {
                    self.red[cursor] = false;
                    self.red[indexParent] = true;
                    _rotate(self, indexParent, LEFT);
                    cursor = self.nodes[indexParent].leaf[LEFT];
                }
                Node storage memNode = self.nodes[cursor];
                if (
                    !self.red[memNode.leaf[LEFT]] &&
                    !self.red[memNode.leaf[RIGHT]]
                ) {
                    self.red[cursor] = true;
                    index = indexParent;
                } else {
                    if (!self.red[memNode.leaf[LEFT]]) {
                        self.red[memNode.leaf[RIGHT]] = false;
                        self.red[cursor] = true;
                        _rotate(self, cursor, RIGHT);
                        cursor = self.nodes[indexParent].leaf[LEFT];
                    }
                    self.red[cursor] = self.red[indexParent];
                    self.red[indexParent] = false;
                    self.red[self.nodes[cursor].leaf[LEFT]] = false;
                    _rotate(self, indexParent, LEFT);
                    index = memRoot;
                }
            }
        }
        self.red[index] = false;
    }

    function ascending(
        Tree storage self
    ) internal view returns (uint256[] memory asc) {
        uint256 tmpSize = self.size;
        if (tmpSize > SENTINEL) {
            asc = new uint256[](tmpSize);
            uint256 index = self.nodes[SENTINEL].leaf[LEFT];
            unchecked {
                for (uint256 i = SENTINEL; i < tmpSize; i++) {
                    asc[i] = index;
                    index = _next(self, index);
                }
            }
        }
    }

    function descending(
        Tree storage self
    ) internal view returns (uint256[] memory dsc) {
        uint256 tmpSize = self.size;
        if (tmpSize > SENTINEL) {
            dsc = new uint256[](tmpSize);
            uint256 index = self.nodes[SENTINEL].leaf[RIGHT];
            unchecked {
                for (uint256 i = SENTINEL; i < tmpSize; i++) {
                    dsc[i] = index;
                    index = _prev(self, index);
                }
            }
        }
    }

    function head(Tree storage self) internal view returns (uint256) {
        return self.nodes[SENTINEL].leaf[LEFT];
    }

    function tail(Tree storage self) internal view returns (uint256) {
        return self.nodes[SENTINEL].leaf[RIGHT];
    }

    function size(Tree storage self) internal view returns (uint256) {
        return self.size;
    }

    function exist(
        Tree storage self,
        uint256 index
    ) internal view returns (bool) {
        return
            (index > SENTINEL) &&
            ((index == self.root) || (self.nodes[index].parent != SENTINEL));
    }

    function node(
        Tree storage self,
        uint256 index
    ) internal view returns (uint256 prev, uint256 next) {
        if (exist(self, index)) {
            prev = _prev(self, index);
            next = _next(self, index);
        }
    }

    function insert(Tree storage self, uint256 index) internal {
        if (!exist(self, index) && (index > SENTINEL)) {
            uint256 cursor;
            uint256 probe = self.root;
            while (probe > SENTINEL) {
                cursor = probe;
                if (index < probe) {
                    probe = self.nodes[probe].leaf[LEFT];
                } else {
                    probe = self.nodes[probe].leaf[RIGHT];
                }
            }
            Node storage ptr = self.nodes[index];
            ptr.parent = cursor;
            ptr.leaf[LEFT] = SENTINEL;
            ptr.leaf[RIGHT] = SENTINEL;
            self.red[index] = true;
            if (cursor == SENTINEL) {
                self.root = index;
                self.nodes[SENTINEL].leaf[LEFT] = index;
                self.nodes[SENTINEL].leaf[RIGHT] = index;
            } else if (index < cursor) {
                self.nodes[cursor].leaf[LEFT] = index;
                if (cursor == self.nodes[SENTINEL].leaf[LEFT]) {
                    self.nodes[SENTINEL].leaf[LEFT] = index;
                }
            } else {
                self.nodes[cursor].leaf[RIGHT] = index;
                if (cursor == self.nodes[SENTINEL].leaf[RIGHT]) {
                    self.nodes[SENTINEL].leaf[RIGHT] = index;
                }
            }
            _insertFixup(self, index);
            unchecked {
                self.size++;
            }
        }
    }

    function remove(Tree storage self, uint256 index) internal {
        if (exist(self, index) && (index > SENTINEL)) {
            uint256 probe;
            uint256 cursor;
            if (index == self.nodes[SENTINEL].leaf[LEFT]) {
                self.nodes[SENTINEL].leaf[LEFT] = _next(self, index);
            }
            if (index == self.nodes[SENTINEL].leaf[RIGHT]) {
                self.nodes[SENTINEL].leaf[RIGHT] = _prev(self, index);
            }
            if (
                self.nodes[index].leaf[LEFT] == SENTINEL ||
                self.nodes[index].leaf[RIGHT] == SENTINEL
            ) {
                cursor = index;
            } else {
                cursor = self.nodes[index].leaf[RIGHT];
                while (self.nodes[cursor].leaf[LEFT] > SENTINEL) {
                    cursor = self.nodes[cursor].leaf[LEFT];
                }
            }
            if (self.nodes[cursor].leaf[LEFT] > SENTINEL) {
                probe = self.nodes[cursor].leaf[LEFT];
            } else {
                probe = self.nodes[cursor].leaf[RIGHT];
            }
            uint256 yParent = self.nodes[cursor].parent;
            self.nodes[probe].parent = yParent;
            if (yParent > SENTINEL) {
                if (cursor == self.nodes[yParent].leaf[LEFT]) {
                    self.nodes[yParent].leaf[LEFT] = probe;
                } else {
                    self.nodes[yParent].leaf[RIGHT] = probe;
                }
            } else {
                self.root = probe;
            }
            bool doFixup = !self.red[cursor];
            if (cursor > index) {
                _replaceParent(self, cursor, index);
                self.nodes[cursor].leaf[LEFT] = self.nodes[index].leaf[LEFT];
                self.nodes[self.nodes[cursor].leaf[LEFT]].parent = cursor;
                self.nodes[cursor].leaf[RIGHT] = self.nodes[index].leaf[RIGHT];
                self.nodes[self.nodes[cursor].leaf[RIGHT]].parent = cursor;
                self.red[cursor] = self.red[index];
                (cursor, index) = (index, cursor);
            }
            if (doFixup) {
                _removeFixup(self, probe);
            }
            delete self.nodes[cursor];
            self.red[cursor] = false;
            unchecked {
                self.size--;
            }
        }
    }
}
