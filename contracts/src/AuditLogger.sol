// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuditLogger {
    enum EventType {
        PAYMENT_EXECUTED,
        POLICY_DECISION,
        SESSION_KEY_REGISTERED,
        SESSION_KEY_REVOKED,
        SESSION_KEY_USED,
        WALLET_CREATED,
        WALLET_PAUSED,
        WALLET_RESUMED
    }

    struct AuditEntry {
        uint256 timestamp;
        EventType eventType;
        address actor;
        address target;
        uint256 amount;
        bytes metadata;
        bytes32 txHash;
    }

    struct PaymentRecord {
        address from;
        address to;
        uint256 amount;
        address token;
        bytes32 taskId;
        bytes32 agentId;
        string reason;
        string category;
        bytes32 txHash;
    }

    event AuditLogged(
        uint256 indexed entryId,
        EventType eventType,
        address indexed actor,
        address indexed target,
        uint256 amount,
        bytes32 txHash
    );

    event PaymentLogged(
        bytes32 indexed taskId,
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        bytes32 agentId
    );

    function logPayment(PaymentRecord calldata record) external returns (uint256 entryId);

    function logPolicyDecision(
        address wallet,
        bool allowed,
        string calldata reason,
        bytes32 txHash
    ) external returns (uint256 entryId);

    function logSessionKeyEvent(
        EventType eventType,
        address wallet,
        address sessionKey,
        bytes32 txHash
    ) external returns (uint256 entryId);

    function getAuditTrail(
        address wallet,
        uint256 startTime,
        uint256 endTime,
        EventType eventType
    ) external view returns (AuditEntry[] memory);

    function getPaymentRecords(
        bytes32 taskId,
        address agentId
    ) external view returns (PaymentRecord[] memory);
}

contract AuditLogger is IAuditLogger {
    uint256 private _nextEntryId;
    mapping(uint256 => AuditEntry) private _auditEntries;
    mapping(bytes32 => PaymentRecord[]) private _paymentRecordsByTask;
    mapping(address => uint256[]) private _walletAuditEntries;

    function logPayment(PaymentRecord calldata record) external override returns (uint256) {
        uint256 entryId = _nextEntryId++;
        _auditEntries[entryId] = AuditEntry({
            timestamp: block.timestamp,
            eventType: EventType.PAYMENT_EXECUTED,
            actor: record.from,
            target: record.to,
            amount: record.amount,
            metadata: abi.encode(record.taskId, record.agentId, record.reason, record.category),
            txHash: record.txHash
        });

        _walletAuditEntries[record.from].push(entryId);
        _paymentRecordsByTask[record.taskId].push(record);

        emit AuditLogged(entryId, EventType.PAYMENT_EXECUTED, record.from, record.to, record.amount, record.txHash);
        emit PaymentLogged(record.taskId, record.from, record.to, record.amount, record.token, record.agentId);

        return entryId;
    }

    function logPolicyDecision(
        address wallet,
        bool allowed,
        string calldata reason,
        bytes32 txHash
    ) external override returns (uint256) {
        uint256 entryId = _nextEntryId++;
        _auditEntries[entryId] = AuditEntry({
            timestamp: block.timestamp,
            eventType: EventType.POLICY_DECISION,
            actor: wallet,
            target: address(0),
            amount: 0,
            metadata: abi.encode(allowed, reason),
            txHash: txHash
        });

        _walletAuditEntries[wallet].push(entryId);
        return entryId;
    }

    function logSessionKeyEvent(
        EventType eventType,
        address wallet,
        address sessionKey,
        bytes32 txHash
    ) external override returns (uint256) {
        require(
            eventType == EventType.SESSION_KEY_REGISTERED ||
            eventType == EventType.SESSION_KEY_REVOKED ||
            eventType == EventType.SESSION_KEY_USED,
            "invalid event type"
        );

        uint256 entryId = _nextEntryId++;
        _auditEntries[entryId] = AuditEntry({
            timestamp: block.timestamp,
            eventType: eventType,
            actor: wallet,
            target: sessionKey,
            amount: 0,
            metadata: "",
            txHash: txHash
        });

        _walletAuditEntries[wallet].push(entryId);
        return entryId;
    }

    function getAuditTrail(
        address wallet,
        uint256 startTime,
        uint256 endTime,
        EventType eventType
    ) external view override returns (AuditEntry[] memory) {
        uint256[] storage entryIds = _walletAuditEntries[wallet];
        uint256 count = 0;

        // First pass: count matching entries
        for (uint256 i = 0; i < entryIds.length; i++) {
            AuditEntry storage entry = _auditEntries[entryIds[i]];
            if (entry.timestamp >= startTime && entry.timestamp <= endTime &&
                (eventType == EventType(0) || entry.eventType == eventType)) {
                count++;
            }
        }

        // Second pass: collect entries
        AuditEntry[] memory result = new AuditEntry[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < entryIds.length; i++) {
            AuditEntry storage entry = _auditEntries[entryIds[i]];
            if (entry.timestamp >= startTime && entry.timestamp <= endTime &&
                (eventType == EventType(0) || entry.eventType == eventType)) {
                result[index] = entry;
                index++;
            }
        }

        return result;
    }

    function getPaymentRecords(
        bytes32 taskId,
        address agentId
    ) external view override returns (PaymentRecord[] memory) {
        PaymentRecord[] storage records = _paymentRecordsByTask[taskId];
        if (agentId == address(0)) {
            return records;
        }

        // Filter by agentId
        uint256 count = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].agentId == agentId) {
                count++;
            }
        }

        PaymentRecord[] memory result = new PaymentRecord[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].agentId == agentId) {
                result[index] = records[i];
                index++;
            }
        }

        return result;
    }
}