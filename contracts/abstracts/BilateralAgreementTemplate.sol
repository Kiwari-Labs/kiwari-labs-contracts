// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IAgreement.sol";

/// @title Bilateral Agreement Template
/// @author Kiwari-labs
/// @notice Before approving the agreement make sure each party deposit token meet the requirement.

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract BilateralAgreementTemplate is Context {

    enum STATE { NULL, APPROVED, REJECTED }

    struct Party {
        address account;
        bool approved;
        bytes data;
    }
    
    address private _partyA;
    address private _partyB;
    
    bool private _init;
    IAgreement private _agreementContract;
    Party [2] _party;

    /// @notice Event
    event InitializedAgreement();
    event AgreementApproved(address party);
    event AgreementContractUpdate(address oldContract, address newContract);
    event SignedAgreement(address party);

    /// @notice Error
    error AlreadyInitialized();
    error InvalidPartyAddress();
    error InvalidPartyZeroAddress();
    error InvalidAgreementZeroAddress();

    constructor(address[2] calldata _parties, IAgreement _agreementContract) {
        _initAgreement(_parties);
        _updateAgreement(_agreementContract);
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
        if (agreementContract == address(0)) {
            revert InvalidAgreementZeroAddress();
        }
        address oldAgreementContract = address(_agreementContract);
        _agreementContract = agreementContract;
        emit AgreementContractUpdate(oldAgreementContract, agreementContract);
    }

    function _excecute() private {
        //
    }

    function _clear() private {
        delete _party;
    }

    function _reject(address sender) public view {
        Party [2] memory party = _party;
        if (sender == party[0].account) {
            party[0].approve = STATE.REJECTED;
        } else if (sender == party[1].account) {
            party[1].approve = STATE.REJECTED;
        } else {
            revert InvalidPartyAddress();
        }
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
        // refund token back to sender of each party
        // ERC20(tokenA).transfer(amountTokenA, _partyA);
        // ERC20(tokenA).transfer(amountTokenB, _partyB);
        Party [2] memory party = _party;
        // do not change or remove the line below.
        bytes memory parameterA = party[0].data;
        bytes memory parameterB = party[1].data;
        uint amountTokenA = abi.decode(parameterA[0], uint);
        uint amountTokenB = abi.decode(parameterB[0], uint);
        address tokenA = abi.decode(parameterA[0], address);
        address tokenB = abi.decode(parameterB[1], address);
        // --> ptr argeement
        bool success = _agreementContract.agreement(parameterA, parameterB);
        require(success);
        // peform exchange.
        IERC20(tokenA).transfer(amountTokenA, party[1].account);
        IERC20(tokenB).transfer(amountTokenB, party[0].account);
        // _clear();
        // emit AgreementApproved();
    }

    /// submit their parameter
    function submit(bytes calldata parameter) public {
        address sender = _msgSender();
        Party [2] memory party = _party;
        if (sender == party[0].account) {
            party[0].data = parameter;
        } else if (sender == party[1].account) {
            party[1].data = parameter;
        } else {
            revert InvalidPartyAddress();
        }
        // place parameter for a if caller is partyA.
        // place parameter for b if caller is partyB.
        emit SignedAgreement(sender);
    }
}
