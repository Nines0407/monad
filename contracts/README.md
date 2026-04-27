# Smart Contracts for Agentic Payment System

This directory contains the smart contracts for the Agentic Payment System on Monad blockchain, implementing ERC-4337 account abstraction with session keys and policy-based authorization.

## Contracts

### 1. AgentWallet (ERC-4337 Account)
The core wallet contract that enables AI Agents to execute transactions via UserOperations without holding private keys.

**Key Features**:
- ERC-4337 compliant account abstraction
- Session key validation delegation
- Policy engine integration
- Emergency pause/resume functionality
- Gas sponsorship support

**Interfaces**:
- `executeUserOp()` - Process ERC-4337 UserOperations
- `validateUserOp()` - Signature verification and nonce management
- `pause()` / `resume()` - Emergency controls

### 2. SessionKeyManager
Manages temporary, limited-authority keys for AI Agents with encoded permissions and automatic expiration.

**Key Features**:
- Permission encoding (amount limits, recipient whitelists, function restrictions)
- Time-based and usage-based expiration
- Immediate revocation capability
- Automated key rotation

**Data Structures**:
- `SessionKeyPermissions`: maxAmount, allowedRecipients[], allowedFunctions[], expiry, requireApproval
- `SessionKeyMetadata`: creationTime, lastUsed, usageCount, revoked flag

### 3. PolicyEngine
Evaluates payment requests against configurable security policies before execution.

**Policy Types**:
- Amount limits (per-transaction, daily, weekly)
- Recipient whitelists/blacklists
- Token restrictions
- Time-based controls (time windows, cooldowns)
- Manual approval thresholds
- Risk scoring rules

**Key Functions**:
- `evaluate()` - Check request against all applicable policies
- `addPolicy()` / `removePolicy()` - Policy management
- `checkCompliance()` - Verify policy adherence post-execution

### 4. AuditLogger
Records immutable audit trail of all payment activities on-chain.

**Events Logged**:
- Payment executions
- Policy decisions
- Session key lifecycle events
- Wallet operations (pause/resume)

**Data Structures**:
- `AuditEntry`: timestamp, eventType, actor, target, amount, metadata, txHash
- `PaymentRecord`: full context including taskId, agentId, reason, category

## Development

### Prerequisites
- Foundry (forge, cast, anvil)
- Solidity 0.8.20+
- Node.js 18+

### Setup
```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

### Testing
Test coverage requirements:
- 90%+ coverage for all contracts
- Gas optimization: < 200k gas per simple transfer
- ERC-4337 compliance tests

Run tests:
```bash
forge test --match-contract "Test.*" --coverage
```

### Deployment
Deploy to Monad testnet:
```bash
forge create --rpc-url $MONAD_RPC_URL \
  --private-key $DEPLOYER_KEY \
  src/AgentWallet.sol:AgentWallet
```

## Architecture

### Contract Interactions
1. **Wallet → SessionKeyManager**: Wallet delegates key validation to manager
2. **Wallet → PolicyEngine**: Wallet requests policy evaluation before execution
3. **All → AuditLogger**: All components emit events to logger

### Deployment Sequence
1. Deploy AuditLogger (lowest dependency)
2. Deploy SessionKeyManager
3. Deploy PolicyEngine
4. Deploy AgentWallet (references all above)
5. Set up cross-references between contracts

## Gas Optimization

Target gas costs:
- Simple transfer: < 200k gas
- Session key validation: < 10k gas
- Policy evaluation (10 policies): < 50k gas
- Audit entry: < 30k gas

## Security Considerations

- All contracts are non-upgradable (immutable logic)
- Emergency pause functionality for critical issues
- Comprehensive audit trail for all operations
- Policy-based authorization with fine-grained controls
- Session keys with limited permissions and automatic expiration

## Audit & Compliance

- ERC-4337 compliance verified
- Gas efficiency benchmarks
- Security audit recommendations implemented
- Immutable audit trail for regulatory compliance

## License

MIT
