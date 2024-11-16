// SPDX-License-Identifier: BUSL-1.1

/// @notice std::list

pragma solidity >=0.8.0 <0.9.0;

interface stdscdlist {
    function find(uint256 listId, uint256 element) external view returns (bool);
    function prev(uint256 listId, uint256 element) external view returns (uint256);
    function next(uint256 listId, uint256 element) external view returns (uint256);
    function front(uint256 listId) external view returns (uint256);
    function back(uint256 listId) external view returns (uint256);
    function middle(uint256 listId) external view returns (uint256);
    function list(uint256 listId) external view returns (uint256[] memory);
    function rlist(uint256 listId) external view returns (uint256[] memory);
    function size(uint256 listId) external view returns (uint256);
    function max_size() external view returns (uint256);
    function insert(uint256 listId, uint256 element) external returns (bool);
    function remove(uint256 listId, uint256 element) external returns (bool);
}

library libstdsclist {
    error PRECOMPILE_INTERFACE_ID_INVALID();

    function staticcall(address c, bytes memory payload) private view returns (bytes memory) {
        (bool success, bytes memory callback) = c.staticcall(payload);
        if (success) {
            return callback;
        } else {
            revert PRECOMPILE_INTERFACE_ID_INVALID();
        }
    }

    function call(address c, bytes memory payload) private returns (bytes memory) {
        (bool success, bytes memory callback) = c.call(payload);
        if (success) {
            return callback;
        } else {
            revert PRECOMPILE_INTERFACE_ID_INVALID();
        }
    }

    // element access
    function find(address precompile, uint256 listId, uint256 element) internal view returns (bool) {
        return
            abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).find, (listId, element))), (bool));
    }

    function prev(address precompile, uint256 listId, uint256 element) internal view returns (uint256) {
        return
            abi.decode(
                staticcall(precompile, abi.encodeCall(stdscdlist(precompile).prev, (listId, element))),
                (uint256)
            );
    }

    function next(address precompile, uint256 listId, uint256 element) internal view returns (uint256) {
        return
            abi.decode(
                staticcall(precompile, abi.encodeCall(stdscdlist(precompile).next, (listId, element))),
                (uint256)
            );
    }

    function front(address precompile, uint256 listId) internal view returns (uint256) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).front, listId)), (uint256));
    }

    function back(address precompile, uint256 listId) internal view returns (uint256) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).back, listId)), (uint256));
    }

    function middle(address precompile, uint256 listId) internal view returns (uint256) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).middle, listId)), (uint256));
    }

    // iterators
    /// @dev return sorted list
    function list(address precompile, uint256 listId) internal view returns (uint256[] memory) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).list, listId)), (uint256[]));
    } // previously ascending(), toArray()

    /// @dev return sorted list in reserve
    function rlist(address precompile, uint256 listId) internal view returns (uint256[] memory) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).rlist, listId)), (uint256[]));
    } // previously deascending()

    function size(address precompile, uint256 listId) internal view returns (uint256) {
        return abi.decode(staticcall(precompile, abi.encodeCall(stdscdlist(precompile).size, listId)), (uint256));
    }

    /// @dev return maximum size
    function max_size(address precompile) internal view returns (uint256) {
        return
            abi.decode(
                staticcall(precompile, abi.encodeWithSelector(stdscdlist(precompile).max_size.selector)),
                (uint256)
            );
    }

    // modifiers
    /// @dev insert sepecifc element if not exist
    function insert(address precompile, uint256 listId, uint256 element) internal returns (bool) {
        return abi.decode(call(precompile, abi.encodeCall(stdscdlist(precompile).insert, (listId, element))), (bool));
    }

    /// @dev remove sepecifc element if exist
    function remove(address precompile, uint256 listId, uint256 element) internal returns (bool) {
        return abi.decode(call(precompile, abi.encodeCall(stdscdlist(precompile).remove, (listId, element))), (bool));
    }
}

contract Example {
    using libstdsclist for address;

    address private linklist;

    constructor(address precompileSCDLL) {
        linklist = precompileSCDLL;
    }

    function _compositeKey(uint key1, uint key2) private pure returns (uint key) {
        key = uint(keccak256(abi.encode(key1, key2)));
    }

    function find(uint256 listId, uint256 element) public view returns (bool) {
        return linklist.find(listId, element);
    }

    function findFromCompositeKey(uint key1, uint key2, uint256 element) public view returns (bool) {
        return linklist.find(_compositeKey(key1, key2), element);
    }
}
