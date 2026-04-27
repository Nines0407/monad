# Smart Contracts Development Task Specification

## Overview
Develop the smart contract layer for the Agentic Payment System on Monad blockchain. This layer provides the foundational security and logic for non-custodial AI Agent payments using ERC-4337 account abstraction, session keys, and policy-based authorization.

## Components & Subtasks

### 1. ERC-4337 Agent Wallet (IAgentWallet)
**Objective**: Implement the core wallet contract that enables AI Agents to execute transactions via UserOperations without holding private keys.

**Key Functions**:
- `executeUserOp()` - Process ERC-4337 UserOperations with session key validation
- `validateUserOp()` - Signature verification and nonce management
- EntryPoint integration - Compatibility with Monad's ERC-4337 infrastructure

**Requirements**:
- Inherit from OpenZeppelin's `BaseAccount` or `Account` contracts
- Support batch transactions for efficiency
- Implement gas sponsorship mechanisms
- Include emergency pause/resume functionality

**Dependencies**: None (foundational contract)

**Acceptance Criteria**:
- Passes ERC-4337 compliance tests
- Handles at least 100 UserOperations per block
- Gas optimization: < 200k gas per simple transfer
- 100% test coverage for core functions

**Estimated Effort**: 2 weeks

### 2. Session Key Manager (ISessionKeyManager)
**Objective**: Manage temporary, limited-authority keys for AI Agents with encoded permissions and automatic expiration.

**Key Functions**:
- `registerSessionKey()` - Create new session key with encoded permissions
- `revokeSessionKey()` - Immediate revocation capability
- `isSessionKeyValid()` - Check validity and remaining permissions
- `rotateSessionKeys()` - Automated key rotation

**Data Structures**:
- `SessionKeyPermissions`: maxAmount, allowedRecipients[], allowedFunctions[], expiry, requireApproval
- `SessionKeyMetadata`: creationTime, lastUsed, usageCount, revoked flag

**Requirements**:
- Permission encoding using bitmasks or structured data
- Time-based and usage-based expiration
- Integration with policy engine for dynamic validation
- Event emission for all key operations

**Dependencies**: IAgentWallet (uses wallet as owner)

**Acceptance Criteria**:
- Supports 1000+ active session keys per wallet
- Key validation < 10k gas
- Revocation takes effect immediately (< 1 block)
- Complete audit trail of all key operations

**Estimated Effort**: 1.5 weeks

### 3. Policy Engine (IPolicyEngine)
**Objective**: Evaluate payment requests against configurable security policies before execution.

**Key Functions**:
- `evaluate()` - Check request against all applicable policies
- `addPolicy()` / `removePolicy()` - Policy management
- `checkCompliance()` - Verify policy adherence post-execution
- `getViolations()` - Identify policy violations in requests

**Policy Types**:
- Amount limits (per-transaction, daily, weekly)
- Recipient whitelists/blacklists
- Token restrictions
- Time-based controls (time windows, cooldowns)
- Manual approval thresholds
- Risk scoring rules

**Requirements**:
- Gas-efficient evaluation (optimized for multiple concurrent checks)
- Policy priority system (conflict resolution)
- Support for complex boolean logic (AND/OR/NOT)
- Off-chain simulation capability via `eth_call`

**Dependencies**: IAgentWallet (attached to wallet), SessionKeyManager (permission integration)

**Acceptance Criteria**:
- Policy evaluation < 50k gas for 10 active policies
- Supports hierarchical policy inheritance
- Real-time policy updates (no redeployment needed)
- Integration with manual approval workflows

**Estimated Effort**: 2 weeks

### 4. Audit Logger (IAuditLogger)
**Objective**: Record immutable audit trail of all payment activities on-chain.

**Key Functions**:
- `logPayment()` - Record successful payment execution
- `logPolicyDecision()` - Store policy evaluation results
- `logSessionKeyEvent()` - Track key lifecycle events
- `getAuditTrail()` - Retrieve filtered audit records

**Data Structures**:
- `AuditEntry`: timestamp, eventType, actor, target, amount, metadata, txHash
- `PaymentRecord`: full context including taskId, agentId, reason, category

**Requirements**:
- Efficient storage using indexed events and compact encoding
- Support for querying by time range, agent, task, or recipient
- Immutable once written (no modifications)
- Integration with off-chain database for full-text search

**Dependencies**: IAgentWallet (receives events from wallet)

**Acceptance Criteria**:
- Audit entry cost < 30k gas
- Supports 10,000+ entries per wallet
- All critical events captured (coverage > 99%)
- Indexed for efficient querying

**Estimated Effort**: 1 week

## Integration Requirements

### Contract Interactions
1. **Wallet → SessionKeyManager**: Wallet delegates key validation to manager
2. **Wallet → PolicyEngine**: Wallet requests policy evaluation before execution
3. **All → AuditLogger**: All components emit events to logger

### Deployment Sequence
1. Deploy AuditLogger (lowest dependency)
2. Deploy SessionKeyManager
3. Deploy PolicyEngine
4. Deploy IAgentWallet (references all above)
5. Set up cross-references between contracts

### Testing Strategy
- Unit tests for each contract in isolation
- Integration tests for contract interactions
- Gas profiling and optimization
- Security audit (formal verification recommended)

## Development Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Hardhat/Foundry project structure
- [ ] Implement IAgentWallet skeleton with ERC-4337 basics
- [ ] Create SessionKeyPermissions data structure
- [ ] Write initial unit tests for wallet

### Phase 2: Core Logic (Week 2)
- [ ] Complete IAgentWallet with UserOperation execution
- [ ] Implement SessionKeyManager with permission encoding
- [ ] Add emergency pause/resume functionality
- [ ] Integrate wallet with SessionKeyManager

### Phase 3: Policy System (Week 3)
- [ ] Implement PolicyEngine with rule evaluation
- [ ] Create policy management functions
- [ ] Add support for manual approval workflows
- [ ] Integrate PolicyEngine with wallet

### Phase 4: Audit & Optimization (Week 4)
- [ ] Implement AuditLogger with efficient storage
- [ ] Add event emission across all components
- [ ] Gas optimization and profiling
- [ ] Final integration testing

## Success Metrics
- **Security**: Zero critical vulnerabilities in audit
- **Gas Efficiency**: < 300k gas for complete payment flow
- **Scalability**: Support 1000+ concurrent session keys
- **Test Coverage**: > 90% for all contracts
- **ERC-4337 Compliance**: Full compatibility with Monad infrastructure

## Dependencies on Other Teams
- **Client Team**: Provide test vectors for UserOperation signing
- **Integration Team**: Define exact MCP Server requirements
- **Audit Team**: Coordinate on database schema for off-chain storage

## Risk Mitigation
- **Complexity Risk**: Start with minimal viable implementation, then add features
- **Gas Cost Risk**: Continuous profiling and optimization throughout development
- **Security Risk**: Multiple rounds of auditing (internal + external)
- **Integration Risk**: Early alignment with client SDK team on interfaces