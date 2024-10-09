// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title Bilateral Agreement Template
/// @author Kiwari Labs
/// @dev Bilateral Agreement Template for exchange ERC20 between party applied multi-signature approach
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

abstract contract BilateralAgreementBase is Context {
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
    /// @notice Maps transaction indices to confirmation status of each address.
    mapping(uint256 => mapping(address => bool)) private _transactionConfirmed;

    /// @notice Events
    event Initialized();
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);
    event TransactionFinalized(uint256 indexed index);
    event TransactionRecorded(
        uint256 indexed index,
        address indexed sender,
        TRANSACTION_TYPE indexed transactionType,
        bytes data
    );
    event TransactionRejected(uint256 indexed index, address indexed sender);
    event TransactionRevoked(uint256 indexed index, address indexed sender);

    /// @notice Custom error definitions
    error ContractAlreadyInitialized();
    error InvalidPartyAddress();
    error InvalidAgreementAddress();
    error AddressCannotBeZero();
    error Unauthorized();
    error TransactionAlreadyConfirmed();
    error TransactionAlreadyExecuted();
    error TransactionExecutionFailed();
    error TransactionDoesNotExist();
    error TransactionNotSubmitted();
    error TransactionAlreadySubmitted();

    /// @notice Modifiers
    modifier transactionWriter(address sender) {
        if (sender != _parties[0] && sender != _parties[1]) {
            revert Unauthorized();
        }
        _;
    }

    modifier transactionExists(uint256 index) {
        if (index >= _transactions.length) {
            revert TransactionDoesNotExist();
        }
        _;
    }

    modifier transactionExecuted(uint256 index) {
        if (_transactions[index].executed) {
            revert TransactionAlreadyExecuted();
        }
        _;
    }

    constructor(address[2] memory parties_, IAgreement _agreementImplementation) {
        _initialize(parties_);
        _updateImplementation(address(_agreementImplementation));
    }

    /// @notice Initializes the contract with two parties involved in the bilateral agreement.
    /// @dev This function is used to set up the initial parties for the agreement.
    /// It can only be called once, as it checks if the contract has already been initialized.
    /// The two parties involved must have distinct addresses, and neither can be the zero address.
    /// @param parties The array of two addresses representing the parties involved in the agreement.
    /// parties[0] represents the first party, and parties[1] represents the second party.
    function _initialize(address[2] memory parties) private {
        if (_initialized) {
            revert ContractAlreadyInitialized();
        }
        address partyA = parties[0];
        address partyB = parties[1];
        if (partyA == partyB) {
            revert InvalidPartyAddress();
        }
        if (partyA == address(0) || partyB == address(0)) {
            revert AddressCannotBeZero();
        }
        _parties[0] = partyA;
        _parties[1] = partyB;
        _initialized = true;
        // init empty transaction first for easier handling
        Transaction memory newTransaction;
        newTransaction.executed = true;
        _transactions.push(newTransaction);

        emit Initialized();
    }

    /// @notice Submits a new transaction for approval by the parties.
    /// @dev This function allows one of the parties to submit a transaction of a specific type.
    /// If this is the first transaction or the previous one has been executed, a new transaction is created.
    /// If there’s already a transaction that has not yet been executed, the function updates it.
    /// The function transfers tokens from the sender to the contract as part of the transaction data.
    /// @param sender The address of the party submitting the transaction.
    /// @param transactionType The type of transaction being submitted (e.g., LOGIC_CHANGE).
    /// @param data The encoded transaction data, which includes the token address and value for transfer.
    function _submitTransaction(
        address sender,
        TRANSACTION_TYPE transactionType,
        bytes calldata data
    ) private transactionWriter(sender) {
        uint256 transactionIndexCache = _getCurrentIndex();
        bool transactionCreation;
        uint8 party = (sender == _parties[0]) ? 0 : 1;
        if (_transactions[transactionIndexCache].executed) {
            transactionCreation = true;
        }
        if (transactionCreation) {
            Transaction memory newTransaction;
            newTransaction.transactionType = transactionType;
            newTransaction.confirmations = 1;
            newTransaction.data[party] = data;
            _transactions.push(newTransaction);
            transactionIndexCache = _getCurrentIndex();
            _transactionConfirmed[transactionIndexCache][sender] = true;
            (address token, uint256 value) = abi.decode(data, (address, uint256));
            IERC20(token).transferFrom(sender, address(this), value);
        } else {
            _transactions[transactionIndexCache].data[party] = data;
            _transactionConfirmed[transactionIndexCache][sender] = true;
            (address token, uint256 value) = abi.decode(data, (address, uint256));
            IERC20(token).transferFrom(sender, address(this), value);
            _excecuteTransaction(transactionIndexCache);
            emit TransactionRecorded(transactionIndexCache, sender, transactionType, data);
        }
        emit TransactionRecorded(transactionIndexCache, sender, transactionType, data);
    }

    /// @notice there is no retention period, second party can only submit transaction but not possible to revoke.
    /// @notice Allows the sender to revoke a previously submitted transaction.
    /// @dev The second party cannot revoke the transaction as there is no retention period.
    /// Only the first party can revoke a transaction before execution if it has been confirmed.
    /// The function checks if the sender has confirmed the transaction and, if so, decrements the confirmation count.
    /// If the transaction type is `DEFAULT`, the token and value associated with the transaction will be refunded to the sender.
    /// @param sender The address of the party attempting to revoke the transaction.
    /// @param index The index of the transaction to be revoked.
    function _revokeTransaction(
        address sender,
        uint256 index
    ) private transactionExists(index) transactionExecuted(index) transactionWriter(sender) {
        uint8 party = (sender == _parties[0]) ? 0 : 1;
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
            revert TransactionNotSubmitted();
        }
    }

    /// @notice Allows the sender to reject a transaction if it has only one confirmation.
    /// @dev This function enables a party to reject the transaction initiated by the counterparty if certain conditions are met.
    /// It ensures that the transaction has not been confirmed by the sender and that the number of confirmations is exactly one.
    /// If valid, the transaction is marked as executed, and the token and value are transferred to the counterparty.
    /// @param sender The address of the party rejecting the transaction.
    /// @param index The index of the transaction to be rejected.
    function _rejectTransaction(
        address sender,
        uint256 index
    ) private transactionExists(index) transactionWriter(sender) {
        uint8 counterparty = (sender == _parties[0]) ? 1 : 0;
        Transaction memory transactionCache = _transactions[index];
        if (!_transactionConfirmed[index][sender] && (transactionCache.confirmations == 1)) {
            _transactions[index].executed = true;
            (address token, uint256 value) = abi.decode(transactionCache.data[counterparty], (address, uint256));
            IERC20(token).transfer(_parties[counterparty], value);
            emit TransactionRejected(index, sender);
        } else {
            revert TransactionAlreadyConfirmed();
        }
    }

    /// @notice Executes the transaction at the specified index, based on the transaction type.
    /// @dev This function is responsible for executing transactions.
    /// For `DEFAULT` transaction types, it decodes token information and facilitates token transfers between the two parties if the agreement is successful.
    /// For other transaction types, it decodes and updates the contract's implementation if both parties agree on the same implementation.
    /// The transaction is marked as executed and the confirmations count is updated to 2.
    /// @param index The index of the transaction to be executed.
    function _excecuteTransaction(uint256 index) private transactionExists(index) transactionExecuted(index) {
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

    /// @notice Retrieves the current transaction index.
    /// @dev If the transaction list is not empty, it returns the index of the latest transaction. Otherwise, it returns 0.
    /// @return The current transaction index.
    function _getCurrentIndex() internal view returns (uint256) {
        uint256 index = _transactions.length;
        if (index > 0) {
            index -= 1;
        }
        return index;
    }

    /// @notice Returns the transaction at the specified index.
    /// @dev Retrieves a transaction from the internal transaction list based on the provided index.
    /// @param index The index of the transaction to retrieve.
    /// @return The `Transaction` object corresponding to the given index.
    function _getTranasaction(uint256 index) internal view virtual returns (Transaction memory) {
        return _transactions[index];
    }

    /// @notice Updates the contract's implementation to the specified address.
    /// @dev This function changes the current implementation to a new one if the address is valid.
    /// @param implement The address of the new implementation.
    function _updateImplementation(address implement) internal {
        address implementationCache = address(_implemetation);
        if (implement == address(0)) {
            revert AddressCannotBeZero();
        }
        if (implementationCache == implement) {
            revert InvalidAgreementAddress();
        }
        _implemetation = IAgreement(implement);
        emit ImplementationUpdated(implementationCache, implement);
    }

    /// @notice Retrieves the transaction at the specified index.
    /// @dev This function calls the internal `_getTranasaction` function to fetch the `Transaction` object.
    /// @param index The index of the transaction to retrieve.
    /// @return The `Transaction` object corresponding to the given index.
    function transaction(uint256 index) public view returns (Transaction memory) {
        if (_transactions.length == 0) {
            Transaction memory empty;
            return empty;
        }
        return _getTranasaction(index);
    }

    /// @notice Returns the number of transactions stored in the contract.
    /// @dev This function retrieves the length of the `_transactions` array, which holds all transactions.
    /// @return The total number of transactions in the contract.
    function transactionLength() public view returns (uint256) {
        return _transactions.length - 1;
    }

    /// @notice Checks the execution status of the latest transaction.
    /// @dev This function determines if the most recent transaction has been executed by checking the `executed` status.
    /// @return `true` if the current transaction has been executed; otherwise, `false`.
    function status() public view returns (bool) {
        return _transactions[_getCurrentIndex()].executed;
    }

    /// @notice Submits a transaction to approve an agreement.
    /// @dev This function calls the `_submitTransaction` function with the sender's address and the provided data.
    /// @param data The encoded data required for the transaction approval.
    function approveAgreement(bytes calldata data) public {
        address sender = _msgSender();
        _submitTransaction(sender, TRANSACTION_TYPE.DEFAULT, data);
    }

    /// @notice Submits a transaction to approve a logic change.
    /// @dev This function calls the `_submitTransaction` function with the sender's address and the provided data.
    /// @param data The encoded data required for the transaction approval.
    function approveChange(bytes calldata data) public {
        _submitTransaction(_msgSender(), TRANSACTION_TYPE.LOGIC_CHANGE, data);
    }

    /// @notice Revokes the most recent transaction submitted by the sender.
    /// @dev This function calls the `_revokeTransaction` function with the sender's address and the current transaction index.
    function revokeTransaction() public {
        _revokeTransaction(_msgSender(), _getCurrentIndex());
    }

    /// @notice Rejects the most recent transaction submitted by the sender.
    /// @dev This function calls the `_rejectTransaction` function with the sender's address and the current transaction index.
    function rejectTransaction() public {
        _rejectTransaction(_msgSender(), _getCurrentIndex());
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
