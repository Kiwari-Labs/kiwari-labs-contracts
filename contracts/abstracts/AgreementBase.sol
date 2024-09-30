// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title Agreement Template
/// @author Kiwari Labs
/// @notice this contract is abstract contract do not modify this contract.

import "../interfaces/IAgreement.sol";

abstract contract AgreementBase is IAgreement {
    uint32 private _version = 100;
    string private _name;

    /// @notice Events
    event AgreementComplete();
    event BumpMajorVersion(uint256 formVersion, uint256 toVersion);
    event BumpMinorVersion(uint256 formVersion, uint256 toVersion);
    event BumpPatchVersion(uint256 formVersion, uint256 toVersion);

    /// @notice Custom error definitions
    error AgreementFailed(bytes x, bytes y);

    constructor(string memory name_) {
        _name = name_;
    }

    /// @notice Increment the major version of the agreement
    /// @dev Use this when major changes are made, such as changing the proxy address, external address or ownership structure.
    function _bumpMajorVersion() internal {
        uint256 oldVersion = _version;
        _version += 100;
        emit BumpMajorVersion(oldVersion, _version);
    }

    /// @notice Increment the minor version of the agreement
    /// @dev Use this for medium-impact changes like updating or parameter configurations.
    function _bumpMinorVersion() internal {
        uint256 oldVersion = _version;
        _version += 10;
        emit BumpMinorVersion(oldVersion, _version);
    }

    /// @notice Increment the minor version of the agreement
    /// @dev Use this for minor, non-breaking changes such as routine update parameter fixes adjustments.
    function _bumpPatchVersion() internal {
        uint256 oldVersion = _version;
        _version += 1;
        emit BumpPatchVersion(oldVersion, _version);
    }

    /// @notice Returns the current version of the agreement
    /// @return The version number of the agreement
    function version() public view returns (uint256) {
        return _version;
    }

    /// @notice Returns the name of the agreement
    /// @return The name of the agreement
    function name() public view returns (string memory) {
        return _name;
    }

    /// @inheritdoc IAgreement
    function agreement(bytes memory x, bytes memory y) public override returns (bool) {
        if (!_verifyAgreement(x, y)) {
            revert AgreementFailed(x, y);
        }
        emit AgreementComplete();
        return true;
    }

    /// @dev Internal function to verify the agreement between party A and party B
    /// @param x The input parameters provided by party A
    /// @param y The input parameters provided by party B
    /// @return True if the agreement is valid, otherwise false
    function _verifyAgreement(bytes memory x, bytes memory y) internal virtual returns (bool) {}
}
