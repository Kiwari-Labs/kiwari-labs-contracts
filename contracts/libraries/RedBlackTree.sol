// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

library RedBlackTree {
    struct Node {
        uint256 parent;
        uint256 left;
        uint256 right;
        bool red;
    }

    struct RedBlackTree {
        uint256 root;
        uint256 head;
        uint256 tail;
        uint256 size;
        mapping(uint256 => Node) nodes;
    }

    uint256 private constant EMPTY = 0;

    function _insert(RedBlackTree storage self) private {
        // @TODO
    }

    function _remove(RedBlackTree storage self) private {
        // @TODO
    }

    function head(RedBlackTree storage self) internal view returns (uint256) {
        return self.head;
    }

    function middle(RedBlackTree storage self) internal view returns (uint256) {
        // @TODO return middle
        return 0;
    }

    function root(RedBlackTree storage self) internal view returns (uint256) {
        return self.root;
    }

    function guard(RedBlackTree storage self) internal view returns (uint256 [2] calldata) {
        return [self.head,self.tail];
    }

    function last(RedBlackTree storage self) internal returns (uint256) {
        return self.tail;
    }

    function exist(
        RedBlackTree storage self,
        uint256 index
    ) internal view returns (bool) {
        if (self.size > 0) {
            return (key == self.root) || (self.nodes[key].parent > EMPTY);
        } else {
            return false;
        }
    }

    function insert(RedBlackTree storage self, uint256 index) internal {
        // @TODO
        _insert(index);
        self.size++;
    }

    function remove(RedBlackTree storage self, uint256 index) internal {
        // @TODO
        _remove(index);
        self.size--;
    }

    function size(RedBlackTree storage self) internal view returns (uint256) {
        return self.size;
    }

    function ascending(
        RedBlackTree storage self
    ) internal view returns (uint256[] memory list) {
        // @TODO
        return list;
    }

    function deascending(
        RedBlackTree storage self
    ) internal view returns (uint256[] memory list) {
        // @TODO
        return list;
    }
}
