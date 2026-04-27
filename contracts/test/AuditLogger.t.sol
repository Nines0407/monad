// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AuditLogger} from "../src/AuditLogger.sol";

contract AuditLoggerTest is Test {
    AuditLogger public logger;
    address public wallet = address(0x111);
    address payable public recipient = payable(address(0x222));
    bytes32 public taskId = keccak256("task1");
    bytes32 public agentId = keccak256("agent1");

    function setUp() public {
        logger = new AuditLogger();
    }

    function test_LogPayment() public {
        AuditLogger.PaymentRecord memory record = AuditLogger.PaymentRecord({
            from: wallet,
            to: recipient,
            amount: 100 ether,
            token: address(0),
            taskId: taskId,
            agentId: agentId,
            reason: "payment for service",
            category: "service",
            txHash: keccak256("tx1")
        });

        uint256 entryId = logger.logPayment(record);

        // Verify audit trail includes the payment
        AuditLogger.AuditEntry[] memory entries = logger.getAuditTrail(wallet, 0, block.timestamp, AuditLogger.EventType(0));
        assertEq(entries.length, 1);
        assertEq(entries[0].eventType, AuditLogger.EventType.PAYMENT_EXECUTED);
        assertEq(entries[0].amount, 100 ether);
    }

    function test_LogPolicyDecision() public {
        uint256 entryId = logger.logPolicyDecision(wallet, true, "approved", keccak256("tx2"));

        AuditLogger.AuditEntry[] memory entries = logger.getAuditTrail(wallet, 0, block.timestamp, AuditLogger.EventType.POLICY_DECISION);
        assertEq(entries.length, 1);
        assertTrue(entries[0].eventType == AuditLogger.EventType.POLICY_DECISION);
    }

    function test_LogSessionKeyEvent() public {
        uint256 entryId = logger.logSessionKeyEvent(
            AuditLogger.EventType.SESSION_KEY_REGISTERED,
            wallet,
            address(0x333),
            keccak256("tx3")
        );

        AuditLogger.AuditEntry[] memory entries = logger.getAuditTrail(
            wallet,
            0,
            block.timestamp,
            AuditLogger.EventType.SESSION_KEY_REGISTERED
        );
        assertEq(entries.length, 1);
        assertEq(entries[0].target, address(0x333));
    }

    function test_GetPaymentRecords() public {
        AuditLogger.PaymentRecord memory record = AuditLogger.PaymentRecord({
            from: wallet,
            to: recipient,
            amount: 100 ether,
            token: address(0),
            taskId: taskId,
            agentId: agentId,
            reason: "test",
            category: "test",
            txHash: keccak256("tx4")
        });

        logger.logPayment(record);

        AuditLogger.PaymentRecord[] memory records = logger.getPaymentRecords(taskId, agentId);
        assertEq(records.length, 1);
        assertEq(records[0].amount, 100 ether);
        assertEq(records[0].reason, "test");
    }

    function test_GetAuditTrail_TimeFilter() public {
        // Log first entry
        logger.logPolicyDecision(wallet, true, "approved", keccak256("tx5"));

        // Move time forward
        vm.warp(block.timestamp + 1000);

        // Log second entry
        logger.logPolicyDecision(wallet, false, "denied", keccak256("tx6"));

        // Query only first entry
        AuditLogger.AuditEntry[] memory entries = logger.getAuditTrail(wallet, 0, block.timestamp - 500, AuditLogger.EventType(0));
        assertEq(entries.length, 1);
    }
}