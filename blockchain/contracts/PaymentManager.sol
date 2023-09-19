// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./TradeManager.sol";

contract PaymentManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum PaymentStatus{ INITIALIZED, PENDING, FINALIZED }

    event PaymentRegistered(uint256 indexed id, address payer, address supplier);
    event PaymentTargetRegistered(uint256 indexed id, uint256 paymentId, uint256 orderId, uint256 orderLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct PaymentTarget {
        uint256 id;
        uint256 orderId;
        uint256 orderLineId;
        bool exists;
    }

    struct Payment {
        uint256 id;
        address payer;
        address supplier;
        uint256 amount;
        uint256 decimals;
        string fiat;
        uint256[] paymentTargetsIds;
        mapping(uint256 => PaymentTarget) paymentTargets;
        PaymentStatus status;
        bool exists;
    }

    // payer => payment id => payment
    mapping(address => mapping(uint256 => Payment)) private payments;

    // payer => payment id counter (the ids are different per each payer, but not unique in general)
    mapping(address => Counters.Counter) private paymentsCounter;
    // payer => payment target id counter
    mapping(address => Counters.Counter) private paymentTargetsCounter;

    // payer => order id => orderline id => [payment id]
    mapping(address => mapping(uint256 => mapping(uint256 => uint256[]))) private orderLinePayments;

    TradeManager orderManager;
    EnumerableType fiatManager;

    constructor(address[] memory admins, address orderManagerAddress, address fiatManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        orderManager = TradeManager(orderManagerAddress);
        fiatManager = EnumerableType(fiatManagerAddress);
    }

    function registerPayment(address payer, address supplier, uint256 amount, uint256 decimals, string memory fiat) public {
        require(payer == msg.sender || supplier == msg.sender, "Sender is neither payer nor supplier");
        require(amount > 0, "Payment amount must be greater than 0");
        require(fiatManager.contains(fiat), "The fiat of the payment isn't registered");

        Counters.Counter storage paymentCounter = paymentsCounter[payer];
        uint256 paymentId = paymentCounter.current() + 1;
        paymentCounter.increment();
        Payment storage newPayment = payments[payer][paymentId];
        newPayment.id = paymentId;
        newPayment.payer = payer;
        newPayment.supplier = supplier;
        newPayment.amount = amount;
        newPayment.decimals = decimals;
        newPayment.fiat = fiat;
        newPayment.status = PaymentStatus.INITIALIZED;
        newPayment.exists = true;

        emit PaymentRegistered(paymentId, payer, supplier);
    }

    function getPaymentInfo(address payer, uint256 paymentId) public view returns (address payerAddress, address supplier, uint256 amount, uint256 decimals, string memory fiat, uint256[] memory paymentTargetsIds) {
        require(payments[payer][paymentId].exists, "Payment does not exist");

        return (payments[payer][paymentId].payer, payments[payer][paymentId].supplier, payments[payer][paymentId].amount, payments[payer][paymentId].decimals, payments[payer][paymentId].fiat, payments[payer][paymentId].paymentTargetsIds);
    }

    function getPaymentStatus(address payer, uint256 paymentId) public view returns (PaymentStatus) {
        require(payments[payer][paymentId].exists, "Payment does not exist");

        return payments[payer][paymentId].status;
    }

    function getPaymentTarget(address payer, uint256 payment, uint256 paymentTargetId) public view returns (uint256 orderId, uint256 orderLineId) {
        require(payments[payer][payment].exists, "Payment does not exist");
        require(payments[payer][payment].paymentTargets[paymentTargetId].exists, "Payment target does not exist");

        PaymentTarget memory paymentTarget = payments[payer][payment].paymentTargets[paymentTargetId];

        return (paymentTarget.orderId, paymentTarget.orderLineId);
    }

    function addPaymentTarget(uint256 paymentId, address payer, uint256 orderId, uint256 orderLineId) public {
        Payment storage payment = payments[payer][paymentId];
        require(payment.exists, "Payment does not exist");
        require(orderManager.tradeExists(payment.supplier, orderId), "Trying to set an order that does not exist");
        require(orderManager.tradeLineExists(payment.supplier, orderId, orderLineId), "Trying to set an order line that does not exist");
        require(payment.status != PaymentStatus.FINALIZED, "Payment is already finalized");
        require(payment.payer == msg.sender || payment.supplier == msg.sender, "Sender is neither payer nor supplier");

        Counters.Counter storage paymentTargetCounter = paymentTargetsCounter[payer];
        uint256 paymentTargetId = paymentTargetCounter.current() + 1;
        paymentTargetCounter.increment();

        PaymentTarget storage paymentTarget = payment.paymentTargets[paymentTargetId];
        paymentTarget.id = paymentTargetId;
        paymentTarget.orderId = orderId;
        paymentTarget.orderLineId = orderLineId;
        paymentTarget.exists = true;

        payment.status = PaymentStatus.PENDING;
        payment.paymentTargetsIds.push(paymentTargetId);

        orderLinePayments[payer][orderId][orderLineId].push(paymentId);

        emit PaymentTargetRegistered(paymentTargetId, paymentId, orderId, orderLineId);
    }

    function finalizePayment(address payer, uint256 paymentId) public {
        Payment storage payment = payments[payer][paymentId];
        require(payment.exists, "Payment does not exist");
        require(payment.status == PaymentStatus.PENDING, "Payment in wrong status");
        require(payment.payer == msg.sender || payment.supplier == msg.sender, "Sender is neither payer nor supplier");

        payment.status = PaymentStatus.FINALIZED;
    }

    function getOrderLinePayments(address payer, uint256 orderId, uint256 orderLineId) public view returns (uint256[] memory paymentIds) {
        require(orderManager.tradeExists(payer, orderId), "Trying to retrieve an order that does not exist");
        require(orderManager.tradeLineExists(payer, orderId, orderLineId), "Trying to retrieve an order line that does not exist");

        return orderLinePayments[payer][orderId][orderLineId];
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
