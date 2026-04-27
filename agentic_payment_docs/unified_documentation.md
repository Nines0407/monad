# Agentic Payment System - Unified Documentation
*For Humans & AI Agents - Monad Blitz Hangzhou Competition*

---

## 🎯 Quick Summary (AI-Friendly)

**What**: Agent-native secure payment system on Monad blockchain  
**Why**: Enable AI Agents to autonomously pay for resources (APIs, compute, storage)  
**How**: Non-custodial architecture with Session Keys + Policy Engine + Audit Trail  
**Where**: Integrates with Claude Code, OpenClaw, Codex, Manus via MCP protocol

---

## 📋 Competition Requirements - FULLY MET ✅

### 1. Decentralization ✅
- **Non-custodial**: Users hold private keys, Agents never access real keys
- **Key storage**: Encrypted local storage + hardware wallet support
- **Permission revocation**: Immediate Session Key revocation
- **Cross-platform**: macOS/Linux/Windows, AMD/Intel/Apple M-series
- **Open source**: MIT/Apache 2.0 dual license

### 2. Security Configuration ✅
- **Limits**: Per-transaction, daily/weekly budgets, time-based controls
- **Whitelists**: Recipients, contracts, tokens, verified vendors
- **Method restrictions**: Specific function calls, block dangerous operations
- **Manual approval**: Threshold-triggered, multi-channel notifications
- **Emergency controls**: One-click pause, selective revocation

### 3. Agent-native Design ✅
- **Permission requests**: Structured with task context and justification
- **Temporary authorization**: Session Keys tied to specific tasks
- **Payment context**: Task ID, Agent ID, reason, category metadata
- **Failure handling**: Intelligent retry, alternative payment paths
- **Integration**: MCP Server, CLI, TypeScript SDK, WebSocket API
- **Criterion**: System unusable outside AI Agent environments

### 4. Auditable & Explainable ✅
- **Complete records**: Who, what, when, why, how, result
- **Structured data**: Task context, policies evaluated, decisions made
- **Audit interface**: Time/Agent/task views, CSV/JSON/PDF export
- **On-chain storage**: Immutable metadata on Monad blockchain

### 5. Recovery & Permission Management ✅
- **Wallet recovery**: Social (3-of-5), hardware backup, multi-sig fallback
- **Permission adjustment**: Real-time updates, batch operations
- **Session Key rotation**: Automatic schedule, compromise response
- **Multi-Agent management**: Role-based permissions, quota allocation
- **Lifecycle**: Onboarding, suspension, offboarding, archival

---

## 🏗️ Technical Architecture

### Smart Contract Layer (Monad)
```
IAgentWallet (ERC-4337)       - Core wallet logic
ISessionKeyManager           - Temporary key validation  
IPolicyEngine                - Rules evaluation engine
IAuditLogger                 - Immutable event logging
```

### Client Application
- **Key Manager**: Local encrypted storage, hardware wallet integration
- **Session Key Generator**: Limited, expiring keys with encoded permissions
- **Policy Checker**: Fast local evaluation before on-chain submission
- **Transaction Constructor**: Optimized for Monad, gas estimation, batch support

### Integration Layer
- **MCP Server**: Model Context Protocol for AI Agent integration
- **CLI Tool**: Command-line interface for automation/scripting
- **TypeScript SDK**: Full-featured SDK for custom integrations
- **REST/GraphQL API**: Standard web APIs for applications
- **WebSocket API**: Real-time updates and notifications

### Data Flow
```
Agent Request → Local Policy Check → Session Key Sign → 
Transaction Build → Monad Network → Audit Log → Result Return
```

---

## 🛠️ Technology Stack

### Primary Development
- **MonSkill**: Official Monad AI development toolkit (https://skills.devnads.com/)
- **MPP**: Monad Payment Protocol for core payment functionality
- **x402**: Machine-payable API protocol (bonus feature)

### Smart Contracts
- **Solidity 0.8.20+** with OpenZeppelin/Solmate libraries
- **Hardhat/Foundry** for testing and deployment
- **ERC-4337** account abstraction standard

### Client & Server
- **TypeScript 5.0+** with strict mode
- **Node.js 18+/20+** LTS
- **PostgreSQL 14+** with TimescaleDB extension
- **Redis 7+** for caching and sessions

### Frontend & Mobile
- **React 18+** with TypeScript
- **React Native 0.70+** for mobile apps
- **MCP Protocol** for AI Agent integration

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Prometheus/Loki/Jaeger** for monitoring
- **GitHub Actions** for CI/CD

---

## 📝 Key Interfaces (Code-Level)

### Smart Contract Interfaces (Solidity)
```solidity
// Core wallet interface
interface IAgentWallet {
    function executeUserOp(UserOperation calldata, bytes32, uint256) external;
    function registerSessionKey(address, SessionKeyPermissions, uint256) external;
    function revokeSessionKey(address) external;
}

// Session key permissions structure
struct SessionKeyPermissions {
    uint256 maxAmount;
    address[] allowedRecipients;
    bytes4[] allowedFunctions;
    uint256 expiry;
    bool requireApproval;
}

// Policy engine interface  
interface IPolicyEngine {
    function evaluate(EvaluationContext calldata, bytes32[] calldata) 
        external view returns (EvaluationResult memory);
}
```

### TypeScript SDK Interfaces
```typescript
// Main SDK class
class AgentPay {
    requestPayment(request: PaymentRequest): Promise<PaymentResponse>;
    checkBudget(options?: BudgetCheckOptions): Promise<BudgetStatus>;
    updatePermissions(options: UpdatePermissionsOptions): Promise<void>;
}

// Payment request structure
interface PaymentRequest {
    amount: string;
    currency: string;
    recipient: string;
    reason: string;
    taskContext?: string;
    category?: 'api' | 'compute' | 'storage' | 'data';
}

// Session key interface
interface SessionKey {
    id: string;
    publicKey: string;
    permissions: SessionKeyPermissions;
    expiresAt: Date;
}
```

### MCP Server Tools (AI Agent Integration)
```typescript
// Available tools for AI Agents
tools: [
    {
        name: "request_payment",
        description: "Request payment permission and execute payment",
        inputSchema: { /* structured schema */ }
    },
    {
        name: "check_budget", 
        description: "Check remaining budget and limits"
    },
    {
        name: "get_payment_status",
        description: "Get status of specific payment"
    },
    {
        name: "list_payments",
        description: "List recent payments with filtering"
    },
    {
        name: "update_permissions",
        description: "Update Agent permissions and restrictions"
    }
]
```

### CLI Commands
```bash
# Initialize wallet
agent-pay init --network monad-testnet

# Authorize Agent with budget
agent-pay authorize --agent-id "claude-code" --budget "50 USDC" --expiry "7d"

# View audit logs
agent-pay audit --task-id "task-123" --output-format json

# Emergency pause
agent-pay pause --all

# Policy management
agent-pay policy add --name "api-budget" --condition "category == 'api'" --action "limit 100 USDC daily"
```

---

## 🗓️ Implementation Roadmap (15 Weeks)

### Phase 1: Environment Setup (Week 1)
- Install MonSkill, configure Monad testnet, set up toolchain

### Phase 2: Smart Contracts (Weeks 2-4)
- Deploy ERC-4337 wallet, Session Key manager, Policy Engine, Audit Logger

### Phase 3: Client Development (Weeks 5-7)
- Build key management, Session Key generator, policy checker, transaction constructor

### Phase 4: Integration Interfaces (Weeks 8-10)
- Implement MCP Server, CLI tool, TypeScript SDK, documentation

### Phase 5: Audit System (Weeks 11-12)
- Design database schema, implement storage, build web interface

### Phase 6: Testing & Optimization (Weeks 13-14)
- Unit/integration/security tests, performance optimization, security audit

### Phase 7: Demo Preparation (Week 15)
- Create demo scripts, video materials, competition submission

---

## 🎮 Demo Scenarios

### Scenario 1: Basic Payment Flow (60 seconds)
```
AI Agent (Claude Code) → Needs API access ($0.50) → 
Requests payment with context → Policies check (pass) → 
Session Key generated (1hr, $0.50 limit) → 
Transaction executed on Monad → Audit recorded → 
Agent continues task with API access
```

### Scenario 2: Policy Enforcement (70 seconds)
```
Agent exceeds daily limit ($60 > $50) → 
Policy violation detected → Manual approval required → 
User notified (mobile/Telegram/email) → 
Reviews and approves with override reason → 
Payment proceeds with audit exception → 
Budget tracking updated
```

### Scenario 3: Security Incident (90 seconds)
```
Anomaly detection → High risk alert → 
Emergency pause (all activities stopped) → 
Forensic analysis → Compromised keys identified → 
Selective revocation → Safe operations restored → 
Enhanced security policies implemented
```

---

## 🔬 Testing Strategy

### Unit Testing
- **Smart Contracts**: Hardhat/Foundry tests with 90%+ coverage
- **Client Logic**: Jest/Vitest tests for all critical paths
- **Policy Engine**: Comprehensive condition evaluation tests

### Integration Testing
- **End-to-end flows**: Payment request → execution → audit
- **Multi-Agent scenarios**: Concurrent operations, permission conflicts
- **Failure recovery**: Network issues, contract reverts, RPC failures

### Security Testing
- **Permission bypass**: Modified Session Keys, replay attacks
- **Session Key abuse**: Memory extraction, brute force attempts
- **Frontend security**: XSS, CSRF, clickjacking protection

### Performance Testing
- **Load testing**: 100+ payments per second, concurrent Agents
- **Scalability**: 10 → 10,000 Agents, 10 → 1,000 policies
- **Latency**: Sub-second policy evaluation, <15s transaction confirmation

---

## 📊 Success Metrics

### Technical Metrics
- **Security**: Zero private key exposure to Agents
- **Performance**: Policy evaluation <100ms, transaction confirmation <15s
- **Reliability**: 99.9% uptime, graceful degradation
- **Test coverage**: >90% for critical components

### Business Metrics
- **User adoption**: Integration with 3+ AI Agent platforms
- **Transaction volume**: Support for 100+ payments per second
- **Audit compliance**: Complete traceability for all payments
- **Security incidents**: Rapid detection and response (<5 minutes)

---

## 🔗 Resource Reference

### Documentation
- **`modules/`**: Complete modular documentation (9 modules)
- **`development_spec.md`**: Consolidated technical specification
- **`interfaces.md`**: All API and contract interfaces
- **`implementation_roadmap.md`**: Detailed 15-week plan

### Development Tools
- **MonSkill**: https://skills.devnads.com/
- **MPP Documentation**: https://mpp.dev/
- **x402 Guide**: https://docs.monad.xyz/guides/x402-guide
- **Monad Testnet**: For development and testing

### Code Repositories (Planned)
- **Smart Contracts**: `github.com/agent-pay/contracts`
- **Client SDK**: `github.com/agent-pay/sdk`
- **MCP Server**: `github.com/agent-pay/mcp-server`
- **CLI Tool**: `github.com/agent-pay/cli`

---

## 💡 Why This Matters

### For AI Agents
- **Autonomy**: Pay for resources without constant human approval
- **Efficiency**: Continue tasks without payment interruption
- **Accountability**: Clear audit trail of all expenditures
- **Safety**: Operate within predefined security boundaries

### For Users
- **Control**: Set appropriate budgets and permissions
- **Visibility**: Complete oversight of Agent activities
- **Security**: Enterprise-grade protection for automated payments
- **Compliance**: Audit-ready for regulatory requirements

### For the Ecosystem
- **Innovation**: Enables new AI Agent use cases requiring payments
- **Trust**: Creates secure framework for Agent-human collaboration
- **Adoption**: Drives Web3 utility through practical applications
- **Standards**: Establishes patterns for Agent-native financial systems

---

## 🚀 Current Status & Next Steps

### ✅ COMPLETED
- Architecture design and technical specification
- Interface definitions and API contracts
- Implementation roadmap and timeline
- Competition requirements analysis and compliance

### 🏗️ READY FOR DEVELOPMENT
1. **Install MonSkill** and configure development environment
2. **Deploy smart contracts** to Monad testnet
3. **Build client application** with key management and policy checking
4. **Implement MCP Server** for AI Agent integration
5. **Create audit system** with database and web interface

### 📅 Estimated Timeline
- **Prototype**: 4-6 weeks (Phases 1-3)
- **Minimum Viable Product**: 8-10 weeks (Phases 1-5)
- **Competition Submission**: 15 weeks (All phases)

---

*Document Version: 2.0 | Last Updated: 2024-01-01 | Status: Ready for Implementation*  
*Built for Monad Blitz Hangzhou - Agentic Payment Challenge*