// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IAgreement.sol";

/// @title Bilateral Agreement Template
/// @author Kiwari-labs
/// @notice Before approving the agreement make sure each party deposit token meet the requirement.

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract BilateralAgreementTemplate is Context {
    enum STATE {
        NULL,
        APPROVED,
        REJECTED
    }

    struct Party {
        address account;
        STATE approve;
        bytes data;
    }

    bool private _init;
    IAgreement private _agreementContract;
    Party[2] _party;

    /// @notice Event
    event InitializedAgreement();
    event AgreementApproved(address party);
    event AgreementContractUpdate(address oldContract, address newContract);
    event SubmitAgreementParameter(address party);

    /// @notice Error
    error AlreadyApproved();
    error AlreadyInitialized();
    error InvalidPartyAddress();
    error InvalidPartyZeroAddress();
    error InvalidAgreementAddress();
    error InvalidAgreementZeroAddress();
    error ParameterEmpty();
    error ExecutionFailed();

    constructor(address[2] memory _parties, IAgreement _agreementImplementation) {
        _initAgreement(_parties);
        _updateAgreement(_agreementImplementation);
    }

    function _action(address sender, STATE types) private {
        Party[2] memory party = _party;
        if (sender == party[0].account || sender == party[1].account) {
            if (sender == party[0].account) {
                if (party[0].approve == STATE.NULL) {
                    party[0].approve = types;
                } else {
                    revert AlreadyApproved();
                }
            } else {
                if (party[0].approve == STATE.NULL) {
                    party[0].approve = types;
                } else {
                    revert AlreadyApproved();
                }
            }
            emit AgreementApproved(sender);
        } else {
            revert InvalidPartyAddress();
        }
    }

    function _initAgreement(address[2] memory _parties) private {
        if (_init) {
            revert AlreadyInitialized();
        }
        if (_parties[0] != _parties[1]) {
            revert InvalidPartyAddress();
        }
        if (_parties[0] != address(0) && _parties[1] != address(0)) {
            revert InvalidPartyZeroAddress();
        }
        _party[0].account = _parties[0];
        _party[1].account = _parties[1];
        _init = true;

        emit InitializedAgreement();
    }

    function _updateAgreement(IAgreement agreementContract) private {
        address oldAgreementContract = address(_agreementContract);
        address newAgreementContract = address(agreementContract);
        if (address(agreementContract) == address(0)) {
            revert InvalidAgreementZeroAddress();
        }
        if (oldAgreementContract == newAgreementContract) {
            revert InvalidAgreementAddress();
        }
        _agreementContract = agreementContract;
        emit AgreementContractUpdate(oldAgreementContract, newAgreementContract);
    }

    /// @notice do not change or make modified the _execute function below.
    function _excecute() private {
        Party[2] memory party = _party;
        bytes memory parameterA = party[0].data;
        bytes memory parameterB = party[1].data;
        (address tokenA, uint256 amountTokenA) = abi.decode(parameterA, (address, uint256));
        (address tokenB, uint256 amountTokenB) = abi.decode(parameterB, (address, uint256));
        bool success = _agreementContract.agreement(parameterA, parameterB);
        if (success) {
            IERC20(tokenA).transfer(party[1].account, amountTokenA);
            IERC20(tokenB).transfer(party[0].account, amountTokenB);
            // _clear();
        } else {
            revert ExecutionFailed();
        }
    }

    function _clear() private {
        // clear state and parameter.
    }

    function approve() public {
        // @TODO check is both parameter agreement from partyA and partyB aleardy paste before approve.
        address sender = _msgSender();
        _action(sender, STATE.APPROVED);
        // if partyA or partyB approved second party execute if approved
    }

    function reject() public {
        // @TODO check is both parameter agreement from partyA and partyB aleardy paste before reject.
        address sender = _msgSender();
        _action(sender, STATE.REJECTED);
        // if partyA or partyB reject second party clear if approved or reject
    }

    // @TODO if one party not meet the agreement balance of the contract not enough. the transfer maybe stuck
    // potentially create DoS of smart contract agreement can't be clear
    function _refundTokens() private {
        Party[2] memory party = _party;
        bytes memory parameterA = party[0].data;
        bytes memory parameterB = party[1].data;

        (address tokenA, uint256 amountTokenA) = abi.decode(parameterA, (address, uint256));
        (address tokenB, uint256 amountTokenB) = abi.decode(parameterB, (address, uint256));

        IERC20(tokenA).transfer(party[0].account, amountTokenA);
        IERC20(tokenB).transfer(party[1].account, amountTokenB);

        // emit Refunded(partyAddress, amount);
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

    function submit(bytes calldata parameter) public {
        address sender = _msgSender();
        Party[2] memory party = _party;
        if (sender == party[0].account) {
            party[0].data = parameter;
        } else if (sender == party[1].account) {
            party[1].data = parameter;
        } else {
            revert InvalidPartyAddress();
        }
        // place parameter for a if caller is partyA.
        // place parameter for b if caller is partyB.
        emit SubmitAgreementParameter(sender);
    }
}
