// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.5.0 <0.9.0;

/// @title Bonsai (盆栽) is an implementation of Black-Red Tree (BST) in Solidity.
/// @author Kiwari Labs
// inspiration
// https://github.com/bokkypoobah/BokkyPooBahsTreeLibrary/
// https://github.com/saurfang/solidity-treemap/

library BlackRedTree {
    struct Node {
        uint256 parent;
        uint256 left;
        uint256 right;
        bool red;
    }

    struct Tree {
        uint256 root;
        uint256 head;
        uint256 tail;
        uint256 size;
        mapping(uint256 => Node) nodes;
    }

    uint256 private constant EMPTY = 0;

    function _insert(Tree storage self, uint256 index) private {
        // @TODO
    }

    function _remove(Tree storage self, uint256 index) private {
        // @TODO
    }

    function head(Tree storage self) internal view returns (uint256) {
        return self.head;
    }

    function middle(Tree storage self) internal view returns (uint256) {
        // @TODO
        return EMPTY;
    }

    function root(Tree storage self) internal view returns (uint256) {
        return self.root;
    }

    function guard(Tree storage self) internal view returns (uint256 [2] memory) {
        return [self.head, self.tail];
    }

    function last(Tree storage self) internal view returns (uint256) {
        return self.tail;
    }

    function exist(
        Tree storage self,
        uint256 index
    ) internal view returns (bool) {
        if (self.size > EMPTY) {
            return (self.nodes[index].parent > EMPTY) || (index == self.root);
        } else {
            return false;
        }
    }

    function node(Tree storage self, uint256 index) internal view returns (Node memory) {
        return self.nodes[index];
    }

    function insert(Tree storage self, uint256 index) internal {
        // @TODO
        require(!exist(self, index),"exist");
        _insert(self, index);
        self.size++;
    }

    function remove(Tree storage self, uint256 index) internal {
        // @TODO
        require(exist(self, index),"not exist");
        _remove(self, index);
        self.size--;
    }

    function size(Tree storage self) internal view returns (uint256) {
        return self.size;
    }

    function ascending(
        Tree storage self
    ) internal view returns (uint256[] memory asc) {
        // @TODO
        unchecked {
            // uint256 tmpSize = self.size;
            // asc = new uint256[](tmpSize);
            // uint256 index = self.head;
            // asc[0] = index;
            // for  (uint256 i = tmpSize - 1; i > 0; i--) {
            //     uint256 key = _next(self, next);
            //     asc[i] = key;
            //     index = key;
            // }
        }
        return asc;
    }

    function deascending(
        Tree storage self
    ) internal view returns (uint256[] memory des) {
        // @TODO
        return des;
    }
}
