// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IAgreement.sol";

/// @title Bilateral Agreement Template
/// @author Kiwari-labs

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract BilateralAgreementTemplate is Context {
    // @TODO ideally
    // struct Party {
    //     address signer;
    //     bool status; // open or close for do bilateral exchange
    //     bool ;
    // }

    bool private _init;
    address private _partyA;
    address private _partyB;
    IAgreement private _agreementContract;

    /// @notice Event
    event InitializedAgreement();
    event AgreementApproved(address party);
    event AgreementContractUpdate(address oldContract, address newContract);
    event SignedAgreement(address party);

    /// @notice Error
    error AlreadyInitialized();
    error InvalidPartyAddress();
    error InvalidPartyZeroAddress();

    constructor(address[2] calldata _parties) {
        _initAgreement(_parties);
    }

    function _initAgreement(address[2] calldata _parties) private {
        if (_init) {
            revert AlreadyInitialized();
        }
        if (_parties[0] != _parties[1]) {
            revert InvalidPartyAddress();
        }
        if (_parties[0] != address(0) && _parties[1] != address(0)) {
            revert InvalidPartyZeroAddress();
        }
        _partyA = _parties[0];
        _partyB = _parties[1];
        _init = true;

        emit InitializedAgreement();
    }

    function _updateAgreement(IAgreement agreementContract) private {
        address oldAgreementContract = address(_agreementContract);
        _agreementContract = agreementContract;
        emit AgreementContractUpdate(oldAgreementContract, agreementContract);
    }

    function _excecute() private {
        //
    }

    function _clear() private {
        //
    }

    function _reject() public view {
        //
    }

    function agreement() public view returns (address) {
        return address(_agreementContract);
    }

    function agreementName() public view returns (string memory) {
        return _agreementContract.name();
    }

    function version() public view returns (uint) {
        return _agreementContract.version();
    }

    // approving agreement
    function approve() public {
        // if first party just approve
        // else if second party approve and then execute
        // else if second party reject and then reject

        // do not change or remove the line below.
        bytes memory parameterA = _party[0].data;
        bytes memory parameterB = _party[1].data;
        uint amountTokenA = abi.decode(parameterA[0], uint);
        uint amountTokenB = abi.decode(parameterB[0], uint);
        // --> ptr argeement
        bool sucess = _agreementContract.agreement(parameterA, parameterB);
        require(success);
        // peform exchange.
        ERC20(tokenA).transfer(amountTokenA, _partyB);
        ERC20(tokenB).transfer(amountTokenB, _partyA);
        // _clear();
        // emit AgreementApproved();
    }

    /// submit their parameter
    function submit(bytes calldata parameter) public {
        address sender = _msgSender();
        if (sender == partyA) {
            _party[0].data = parameter;
        } else if (sender == _partyB) {
            _party[1].data = parameter;
        } else {
            revert InvalidPartyAddress();
        }
        // place parameter for a if caller is partyA.
        // place parameter for b if caller is partyB.
        emit SignedAgreement(sender);
    }
}
