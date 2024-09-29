// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title Bilateral Agreement Template
/// @author Kiwari Labs
/// @dev Bilateral Agreement Template applied multi-signature approach
/// @notice Before approving the agreement make sure each party deposit token meet the requirement.

// Highlevel diagram of the smart contract
//    +----------------------+        +-----------------+
//    |                      |        |                 |
//    |  Bilateral Contract  |------->|   Agreement A   |
//    |                      |   |    |    (V1.0.0)     |
//    +----------------------+   |    +-----------------+
//                               |    +-----------------+
//                               |    |                 |
//                               |--->|   Agreement B   |
//                                    |     (V1.0.1)    |
//                                    +-----------------+

import "../interfaces/IAgreement.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract BilateralAgreementTemplate is Context {
    enum TRANSACTION_TYPE {
        DEFAULT,
        LOGIC_CHANGE
    }

    struct Transaction {
        TRANSACTION_TYPE transactionType;
        bool executed;
        uint8 confirmations;
        bytes[2] data;
    }

    bool private _initialized;
    IAgreement private _implemetation;
    Transaction[] private _transactions;
    address[2] _parties;
    mapping(uint256 => mapping(address => bool)) private _transactionConfirmed;

    event Initialized();
    event ImplementationUpdated(address oldImplementation, address newImplementation);
    event TransactionFinalized(uint256 indexed index);
    event TransactionRecorded(
        uint256 indexed index,
        address indexed sender,
        TRANSACTION_TYPE indexed transactionType,
        bytes data
    );
    event TransactionRejected(uint256 indexed index, address indexed sender);
    event TransactionRevoked(uint256 indexed index, address indexed sender);

    /// @notice Error
    error ContractInitialized();
    error InvalidPartyAddress();
    error InvalidAgreementAddress();
    error AddressZero();

    error Unauthorized();
    error TransactionExecuted();
    error TransactionExecutionFailed();
    error TransactionNotExist();
    error TransactionNotSubmited();
    error TransactionSubmited();

    modifier transactionWriter(address sender) {
        if (sender != _parties[0] && sender != _parties[1]) {
            revert Unauthorized();
        }
        _;
    }

    modifier transactionReader(address sender) {
        // @TODO do we need observer ?
        // if ((sender != _parties[0] && sender != _parties[1]) && sender != IObserver.observer(sender)) {
        //     revert Unauthorized();
        // }
        _;
    }

    modifier transactionExist(uint256 index) {
        if (index < _transactions.length) {
            revert TransactionNotExist();
        }
        _;
    }

    modifier transactionExecuted(uint256 index) {
        if (_transactions[index].executed) {
            revert TransactionExecuted();
        }
        _;
    }

    constructor(address[2] memory parties_, IAgreement _agreementImplementation) {
        _initialize(parties_);
        _updateImplementation(address(_agreementImplementation));
    }

    function _initialize(address[2] memory parties) private {
        if (_initialized) {
            revert ContractInitialized();
        }
        address partyA = parties[0];
        address partyB = parties[1];
        if (partyA == partyB) {
            revert InvalidPartyAddress();
        }
        if (partyA != address(0) && partyB != address(0)) {
            revert AddressZero();
        }
        _parties[0] = partyA;
        _parties[1] = partyB;
        _initialized = true;

        emit Initialized();
    }

    function _updateImplementation(address implement) internal {
        address implementationCache = address(implement);
        if (implement == address(0)) {
            revert AddressZero();
        }
        if (implementationCache == implement) {
            revert InvalidAgreementAddress();
        }
        _implemetation = IAgreement(implement);
        emit ImplementationUpdated(implementationCache, implement);
    }

    function _submitTransaction(
        address sender,
        TRANSACTION_TYPE transactionType,
        bytes calldata data
    ) private transactionWriter(sender) {
        uint256 transactionLengthCache = _transactions.length;
        bool transactionCreation = _transactions[transactionLengthCache].executed;
        uint8 party = sender == _parties[0] ? 0 : 1;
        if (transactionLengthCache == 0) {
            transactionCreation = true;
        }
        if (transactionCreation) {
            Transaction memory newTransaction;
            newTransaction.transactionType = transactionType;
            newTransaction.confirmations = 1;
            newTransaction.data[party] = data;
            _transactions.push(newTransaction);
            transactionLengthCache = _transactions.length;
            _transactionConfirmed[transactionLengthCache][sender] = true;
            (address token, uint256 value) = abi.decode(data, (address, uint256));
            IERC20(token).transferFrom(sender, address(this), value);
        } else {
            transactionLengthCache -= 1;
            _transactions[transactionLengthCache].data[party] = data;
            _transactionConfirmed[transactionLengthCache][sender] = true;
            (address token, uint256 value) = abi.decode(data, (address, uint256));
            IERC20(token).transferFrom(sender, address(this), value);
            _excecuteTransaction(transactionLengthCache);
        }
        emit TransactionRecorded(transactionLengthCache, sender, transactionType, data);
    }

    /// @notice there is no retention period, second party can only submit transaction but not possible to revoke.
    function _revokeTransaction(
        address sender,
        uint256 index
    ) private transactionExist(index) transactionExecuted(index) transactionWriter(sender) {
        uint8 party = sender == _parties[0] ? 0 : 1;
        if (_transactionConfirmed[index][sender]) {
            _transactions[index].confirmations -= 1;
            if (_transactions[index].transactionType == TRANSACTION_TYPE.DEFAULT) {
                (address token, uint256 value) = abi.decode(_transactions[index].data[party], (address, uint256));
                IERC20(token).transfer(sender, value);
            }
            _transactions[index].data[party] = abi.encodePacked("");
            _transactionConfirmed[index][sender] = false;
            emit TransactionRevoked(index, sender);
        } else {
            revert TransactionNotSubmited();
        }
    }

    function _rejectTransaction(
        address sender,
        uint256 index
    ) private transactionExist(index) transactionWriter(sender) {
        // @TODO to reject transaction require at least 1 confirmation
        if (!_transactionConfirmed[index][sender] && (_transactions[index].confirmations == 1)) {
            _transactions[index].executed = true;
            emit TransactionRejected(index, sender);
        } else {
            // revert
        }
    }

    /// @notice do not change or make modified the _excecuteTransaction function below.
    function _excecuteTransaction(uint256 index) private transactionExist(index) transactionExecuted(index) {
        Transaction memory transactionCache = _transactions[index];
        if (transactionCache.transactionType == TRANSACTION_TYPE.DEFAULT) {
            bytes memory parameterACache = transactionCache.data[0];
            bytes memory parameterBCache = transactionCache.data[1];
            (address tokenA, uint256 amountTokenA) = abi.decode(parameterACache, (address, uint256));
            (address tokenB, uint256 amountTokenB) = abi.decode(parameterBCache, (address, uint256));
            bool success = _implemetation.agreement(parameterACache, parameterBCache);
            if (success) {
                IERC20(tokenA).transfer(_parties[1], amountTokenA);
                IERC20(tokenB).transfer(_parties[0], amountTokenB);
            } else {
                revert TransactionExecutionFailed();
            }
        } else {
            bytes memory parameterA = transactionCache.data[0];
            bytes memory parameterB = transactionCache.data[1];
            address implementationA = abi.decode(parameterA, (address));
            address implementationB = abi.decode(parameterB, (address));
            if (implementationA == implementationB) {
                _updateImplementation(implementationA);
            } else {
                revert TransactionExecutionFailed();
            }
        }
        _transactions[index].executed = true;
        _transactions[index].confirmations = 2;
        emit TransactionFinalized(index);
    }

    // onlyReader can retrieve data
    function transaction(uint256 index) public view returns (Transaction memory) {
        // @TODO
        // _getTranasaction(sender, index); // TransactionReader(sender)
    }

    function status() public view returns (bool) {
        // @TODO
    }

    /// @notice Submits a parameter on behalf of a party in the agreement.
    /// @dev The function verifies the caller is one of the two parties in the agreement.
    ///      If the caller is party A, their `parameter` is stored in `party[0].data`.
    ///      If the caller is party B, their `parameter` is stored in `party[1].data`.
    ///      If the caller is neither party, the transaction is reverted with an `InvalidPartyAddress` error.
    /// @param data The parameter to be submitted by the party.
    /// @custom:requirements The caller must be either `party[0].account` or `party[1].account`.
    /// @custom:events Emits a `SubmitAgreementParameter` event with the sender's address.
    /// @custom:throws InvalidPartyAddress if the caller is not one of the agreement parties.
    function approveAgreement(bytes calldata data) public {
        address sender = _msgSender();
        _submitTransaction(sender, TRANSACTION_TYPE.DEFAULT, data);
    }

    function approveChange(bytes calldata data) public {
        address sender = _msgSender();
        _submitTransaction(sender, TRANSACTION_TYPE.LOGIC_CHANGE, data);
    }

    function revokeTransaction() public {
        address sender = _msgSender();
        uint256 transactionLengthCache = _transactions.length;
        if (transactionLengthCache > 0) {
            transactionLengthCache -= 1;
        }
        _revokeTransaction(sender, transactionLengthCache);
    }

    function rejectTransaction() public {
        address sender = _msgSender();
        uint256 transactionLengthCache = _transactions.length;
        if (transactionLengthCache > 0) {
            transactionLengthCache -= 1;
        }
        _rejectTransaction(sender, transactionLengthCache);
    }

    /// @notice Returns the address of the agreement contract.
    /// @dev This function retrieves the address of the internal `_agreementContract`.
    /// @return The address of the `_agreementContract`.
    function implementation() public view returns (address) {
        return address(_implemetation);
    }

    /// @notice Returns the name of the agreement contract.
    /// @dev This function calls the `name()` function from the `_agreementContract`.
    /// @return The name of the agreement contract as a string.
    function name() public view returns (string memory) {
        return _implemetation.name();
    }

    /// @notice Returns the version of the agreement contract.
    /// @dev This function calls the `version()` function from the `_agreementContract`.
    /// @return The version number of the agreement contract as an unsigned integer.
    function version() public view returns (uint) {
        return _implemetation.version();
    }
}
