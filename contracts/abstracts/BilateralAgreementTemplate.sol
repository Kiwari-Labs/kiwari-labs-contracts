// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IAgreement.sol";

/// @title Bilateral Agreement Template
/// @author Kiwari-labs
/// @notice Before approving the agreement make sure each party deposit token meet the requirement.

// Diagram Highlevel of Smart Contract
//                 +----------------------+        +-----------------+
//                 |                      |        |                 | ([] approve)
//    Party ------>|  Bilateral Contract  |------->|   Agreement A   | ([] reject)
//                 |                      |   |    |    (V1.0.0)     |
//                 +----------------------+   |    +-----------------+
//                                            |    +-----------------+
//                                            |    |                 | ([] approve)
//                                            |--->|   Agreement B   | ([] reject)
//                                                 |     (V1.0.1)    |
//                                                 +-----------------+

// - initialized(); // for constructor, initialized contract
// - agreeementName(); // return name of agreement contract
// - agreementVersion(); // return version of agreement contract
// - voteForApprove(bool vote); // approve agreement choice (approve or reject)
// - voteForChange(bool vote);  // change agreement contract
// - proposeForChange(address contractAddress); // propose for change contract agreement
// - submit(bytes params); // submit parameter for agreement
// - parameter(address party); // parameter of party
// - refund(); // only available if the agreement not passed claim()?

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
    event Refunded(address party, address token, uint256 amount);

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

    // @TODO if one party not meet the agreement balance of the contract not enough. the transfer maybe stuck
    // potentially create DoS of smart contract agreement can't be clear
    function _refundTokens(address sender) private {
        Party[2] memory party = _party;
        bytes memory parameterA = party[0].data;
        bytes memory parameterB = party[1].data;

        (address tokenA, uint256 amountTokenA) = abi.decode(parameterA, (address, uint256));
        (address tokenB, uint256 amountTokenB) = abi.decode(parameterB, (address, uint256));

        IERC20(tokenA).transfer(party[0].account, amountTokenA);
        IERC20(tokenB).transfer(party[1].account, amountTokenB);

        // emit Refunded(partyAddress, token, amount);
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
            _clear();
        } else {
            revert ExecutionFailed();
        }
    }

    function _clear() private {
        // clear state and parameter.
        _party[0].approve = STATE.NULL;
        _party[1].approve = STATE.NULL;
        _party[0].data = "";
        _party[1].data = "";
    }

    function _updateAgreement(IAgreement agreementContract) internal {
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

    function status() public view returns (bool) {
        Party[2] memory party = _party;
        if (party[0].approve == STATE.APPROVED || party[1].approve == STATE.APPROVED) {
            return true;
        }
    }

    function claim() public {
        address sender = _msgSender();
        // @TODO check if the state of agreement is reject
        // claim their token back as refunded
        // _refundTokens(sender);
    }

    /// @notice Submits a parameter on behalf of a party in the agreement.
    /// @dev The function verifies the caller is one of the two parties in the agreement.
    ///      If the caller is party A, their `parameter` is stored in `party[0].data`.
    ///      If the caller is party B, their `parameter` is stored in `party[1].data`.
    ///      If the caller is neither party, the transaction is reverted with an `InvalidPartyAddress` error.
    /// @param parameter The parameter to be submitted by the party.
    /// @custom:requirements The caller must be either `party[0].account` or `party[1].account`.
    /// @custom:events Emits a `SubmitAgreementParameter` event with the sender's address.
    /// @custom:throws InvalidPartyAddress if the caller is not one of the agreement parties.
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
        emit SubmitAgreementParameter(sender);
    }

    /// @notice Returns the address of the agreement contract.
    /// @dev This function retrieves the address of the internal `_agreementContract`.
    /// @return The address of the `_agreementContract`.
    function agreement() public view returns (address) {
        return address(_agreementContract);
    }

    /// @notice Returns the name of the agreement contract.
    /// @dev This function calls the `name()` function from the `_agreementContract`.
    /// @return The name of the agreement contract as a string.
    function agreementName() public view returns (string memory) {
        return _agreementContract.name();
    }

    /// @notice Returns the version of the agreement contract.
    /// @dev This function calls the `version()` function from the `_agreementContract`.
    /// @return The version number of the agreement contract as an unsigned integer.
    function version() public view returns (uint) {
        return _agreementContract.version();
    }
}
