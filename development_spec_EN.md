# Agentic Payment System - Development Specification

## Project Overview
Build an **Agent-native secure payment system** on Monad chain enabling AI Agents to autonomously execute on-chain payments with user authorization, ensuring security, control, and auditability. Final product integrates with AI Agent environments (Claude Code, OpenClaw, Codex, Manus).

## Core Requirements

### 1. Decentralization (Mandatory)
- **Non-custodial scheme**: User holds private keys, Agent never accesses real keys
- **Smart contract wallet**: Based on ERC-4337 or similar account abstraction standard
- **Permission delegation**: Temporary permissions via Session Key mechanism
- **Cross-platform support**: Mac/Linux/Windows, AMD/Intel/Apple M architectures
- **Open source**: MIT/Apache 2.0 license

### 2. Security Configuration (Mandatory)
- **Limits management**:
  - Per-transaction maximum
  - Daily/weekly budget limits
  - Time-based consumption controls
- **Whitelist mechanisms**:
  - Allowed recipient addresses
  - Allowed smart contracts
  - Allowed token types
  - Verified vendor list
- **Method-level restrictions**:
  - Specific contract function call permissions
  - Dangerous operation blocking (e.g., unlimited approve)
- **Manual confirmation**:
  - Threshold-triggered human approval
  - Notifications via Telegram/App/browser extension
- **Emergency measures**:
  - One-click pause all Agent permissions
  - Immediate Session Key revocation

### 3. Agent-native Design (Mandatory)
- **Permission request flow**: Agent explicitly requests payment permissions with reason and context
- **Temporary authorization**: Task-based short-term authorization, auto-expires post-task
- **Payment context**: Records associated with Task ID, Agent ID, user goals
- **Failure handling**: Retry logic, alternative payment paths on failure
- **Integration interfaces**:
  - MCP Server protocol
  - CLI tool
  - TypeScript SDK
- **Design criterion**: System unusable outside AI Agent environments

### 4. Auditable & Explainable (Mandatory)
- **Structured payment records**:
  - Task ID, Agent ID, User ID
  - Recipient address, amount, asset type
  - Payment reason, task context
  - Triggered security policies
  - Manual confirmation status
  - Execution result (success/failure/error)
  - Timestamp, transaction hash
- **Audit interface**:
  - View by time, Agent, task
  - CSV/JSON export
  - Key metadata on-chain storage

### 5. Recovery & Permission Management (Mandatory)
- **Wallet recovery**:
  - Social recovery (multiple guardians)
  - Hardware wallet backup
- **Permission adjustment**:
  - Real-time Agent permission modification
  - Batch permission management
- **Session Key rotation**:
  - Regular automatic rotation
  - Manual revocation on compromise
- **Multi-Agent management**:
  - Differentiated permissions per Agent
  - Long-term vs temporary Agent distinction
  - Role-based permission control

## Architecture Design

### System Components
```
1. Smart Contract Wallet (On Monad)
   - Main contract: User account logic
   - Session Key manager
   - Policy Engine contract
   - Audit log contract

2. Local Agent Client
   - Key management (local encrypted storage)
   - Session Key generator
   - Policy checker
   - Transaction constructor

3. Policy Server (Optional)
   - Central policy management
   - Risk analysis engine
   - Manual approval interface

4. Audit Service
   - Payment record database
   - Query API
   - Export functionality

5. Integration Interfaces
   - MCP Server
   - CLI tool
   - TypeScript/JavaScript SDK
```

### Data Flow
```
Agent payment request → Local policy check → Session Key signature request → 
→ Transaction construction → Send to Monad network → Audit log recording → 
→ Return result to Agent
```

### Security Boundaries
- **Private keys never leave user device**
- **Session Keys exist only in memory**
- **All policies verified before signing**
- **Critical operations require secondary confirmation**

## Tech Stack

### Primary (First Step Installation)
- **MonSkill**: Monad official AI development Skill
  - URL: https://skills.devnads.com/
  - Contains chain config, contract templates, deployment tools, SDK

### Core Dependencies
- **MPP (Monad Payment Protocol)**: Core payment functionality
  - Docs: https://mpp.dev/
  - TypeScript SDK: https://github.com/monad-crypto/monad-ts/tree/main/packages/mpp

- **x402**: Machine-payable API protocol (bonus feature)
  - Docs: https://docs.monad.xyz/guides/x402-guide

### Development Tools
- **Solidity**: Smart contract development
- **TypeScript**: Client/server development
- **Hardhat/Foundry**: Contract testing/deployment
- **Node.js**: Runtime environment
- **SQLite/PostgreSQL**: Audit data storage

## Implementation Roadmap

### Phase 1: Environment Setup
1. Install MonSkill (strongly recommended first)
2. Set up Monad testnet development environment
3. Configure local development toolchain

### Phase 2: Smart Contract Development
1. Create wallet contract based on MonSkill templates
2. Implement Session Key management logic
3. Integrate Policy Engine
4. Add audit logging functionality
5. Deploy to Monad testnet

### Phase 3: Client Development
1. Implement local key management
2. Develop Session Key generator
3. Integrate MPP SDK payment functions
4. Build policy checker
5. Create transaction constructor

### Phase 4: Integration Interface Development
1. Implement MCP Server protocol
2. Create CLI tool
3. Develop TypeScript SDK
4. Add API documentation and examples

### Phase 5: Audit System
1. Design audit database schema
2. Implement payment record storage
3. Create query and export functions
4. Build simple web interface

### Phase 6: Testing & Optimization
1. Unit tests (contracts, client)
2. Integration tests (end-to-end flow)
3. Security audit (focus on permission vulnerabilities)
4. Performance optimization

### Phase 7: Demo Preparation
1. Create end-to-end demo scripts
2. Prepare demo video materials
3. Write project documentation
4. Prepare review materials

## Bonus Features Priority

### High Priority (Recommended First)
1. **Policy Engine** - Configurable policy layer
   - Rule engine supporting complex conditions
   - Real-time policy updates
   - Policy template library

2. **Session Key/Delegated Key** - Restricted temporary keys
   - Time limits, amount limits
   - Function restrictions, recipient restrictions
   - Auto-expiration mechanism

3. **Audit Logs/Payment Receipt** - Structured payment receipts
   - Standardized receipt format
   - On-chain/off-chain storage
   - Verifiability

### Medium Priority
4. **Human-Machine Collaborative Approval** - Tiered approval flow
   - Small amount auto-approval
   - Medium amount secondary confirmation
   - High risk manual approval

5. **Native Machine Payment** - API pay-per-use
   - x402 protocol integration
   - Streaming payment support
   - Micropayment support

### Low Priority
6. **Modern Login Experience** - zkLogin/Passkeys
   - Integration with traditional security schemes
   - Progressive enhancement

## Integration Specifications

### MCP Server Design
```typescript
// Example MCP tool definitions
tools: [
  {
    name: "request_payment",
    description: "Request payment permission and execute payment",
    inputSchema: {
      type: "object",
      properties: {
        amount: { type: "string" },
        currency: { type: "string" },
        recipient: { type: "string" },
        reason: { type: "string" },
        taskContext: { type: "string" }
      }
    }
  },
  {
    name: "check_budget",
    description: "Check remaining budget and payment limits"
  }
]
```

### CLI Tool Commands
```bash
# Initialize wallet
agent-pay init --network monad-testnet

# Authorize Agent
agent-pay authorize --agent-id "claude-code" --budget "10 USDC" --expiry "24h"

# View audit logs
agent-pay audit --task-id "task-123"

# Emergency pause
agent-pay pause --all
```

### SDK Usage Example
```typescript
import { AgentPay } from '@agent-pay/sdk';

const agentPay = await AgentPay.init({
  walletAddress: '0x...',
  network: 'monad-testnet'
});

const result = await agentPay.requestPayment({
  amount: '1.5',
  currency: 'USDC',
  recipient: '0x...',
  reason: 'Pay API call fee',
  taskContext: 'Data analysis task ID: 123'
});
```

## Testing Strategy

### Unit Testing
- Contract functionality tests (Hardhat/Foundry)
- Client logic tests (Jest/Vitest)
- Policy Engine tests

### Integration Testing
- End-to-end payment flow
- Multi-Agent scenario testing
- Failure recovery testing
- Security boundary testing

### Security Testing
- Permission bypass testing
- Session Key abuse testing
- Replay attack protection
- Frontend security testing

## Demo Requirements

### Demonstration Scenarios
1. **Basic Payment Flow**:
   - Agent requests payment for API fees
   - User approves authorization
   - Automatic payment execution
   - Audit record generation

2. **Complex Policy Demonstration**:
   - Budget limit triggers manual approval
   - Non-whitelisted address rejection
   - Multi-level approval flow

3. **Recovery & Security Management**:
   - Session Key revocation after compromise
   - Multi-signature wallet recovery
   - Batch permission management

### Deliverables
1. Functional MCP Server
2. CLI tool and SDK
3. Smart contract source code
4. Audit web interface
5. Complete project documentation
6. Demo video and screenshots

## Success Criteria

### Core Criteria (Must Meet)
- [ ] All 5 mandatory requirements implemented
- [ ] Operational on Monad testnet
- [ ] Integrated with at least one AI Agent environment
- [ ] Complete security audit passed

### Extended Criteria (Bonus)
- [ ] 3+ bonus features implemented
- [ ] Complete API documentation provided
- [ ] Real use case demonstrations
- [ ] Good performance optimization

---

*Version 1.0 - Development Specification for Monad Blitz Hangzhou Agentic Payment Challenge*