# Core Requirements

## 1. Decentralization (Mandatory)

### 1.1 Non-custodial Scheme
- **User holds private keys**: Agents never access real private keys
- **Key storage**: Encrypted local storage with hardware security module (HSM) support
- **Backup options**: Social recovery, hardware wallet backup, multi-sig

### 1.2 Smart Contract Wallet
- **Standard**: Based on ERC-4337 or similar account abstraction standard
- **Upgradability**: Modular design for future protocol upgrades
- **Gas optimization**: Batch transactions, gas sponsorship options

### 1.3 Permission Delegation
- **Session Key mechanism**: Temporary, restricted authorization keys
- **Delegation granularity**: Time, amount, recipient, function-level restrictions
- **Revocation**: Immediate revocation capabilities

### 1.4 Cross-platform Support
- **Operating Systems**: MacOS, Linux, Windows
- **Architectures**: AMD64, Intel x86_64, Apple ARM (M1/M2/M3)
- **Containerization**: Docker support for consistent environments

### 1.5 Open Source
- **License**: MIT/Apache 2.0 dual license
- **Repository structure**: Clear separation of concerns, comprehensive documentation
- **Community engagement**: Issue templates, contribution guidelines

## 2. Security Configuration (Mandatory)

### 2.1 Limits Management
- **Per-transaction maximum**: Configurable per Agent/task
- **Daily/weekly budget limits**: Rolling window calculations
- **Time-based controls**: Time-of-day restrictions, cooldown periods
- **Category limits**: Different limits for different payment categories

### 2.2 Whitelist Mechanisms
- **Recipient addresses**: Verified address database
- **Smart contracts**: Approved contract addresses with function-level permissions
- **Token types**: Approved ERC-20/ERC-721 tokens
- **Vendor verification**: KYC/AML verification for commercial vendors

### 2.3 Method-level Restrictions
- **Contract functions**: Allow/deny specific function calls
- **Dangerous operations**: Block unlimited approve, ownership transfers
- **Parameter validation**: Validate transaction parameters against policies

### 2.4 Manual Confirmation
- **Threshold triggers**: Configurable thresholds for human intervention
- **Notification channels**: Telegram, Email, Push notifications, Browser extensions
- **Approval workflow**: Multi-step approval for high-risk transactions

### 2.5 Emergency Measures
- **Global pause**: One-click pause all Agent activities
- **Selective revocation**: Revoke specific Session Keys or Agent permissions
- **Incident response**: Automated incident detection and response protocols

## 3. Agent-native Design (Mandatory)

### 3.1 Permission Request Flow
- **Context-aware requests**: Agent provides task context and justification
- **Risk assessment**: Automated risk scoring based on request parameters
- **User interface**: Clear, concise permission request presentation

### 3.2 Temporary Authorization
- **Task-based validity**: Authorization tied to specific task completion
- **Auto-expiration**: Automatic revocation after task completion or timeout
- **Renewal process**: Streamlined renewal for ongoing tasks

### 3.3 Payment Context
- **Metadata attachment**: Task ID, Agent ID, user goals, project context
- **Context preservation**: Maintain context throughout payment lifecycle
- **Searchable records**: Context-based search and filtering

### 3.4 Failure Handling
- **Retry logic**: Intelligent retry with exponential backoff
- **Alternative paths**: Fallback payment methods or providers
- **Error reporting**: Detailed error messages with resolution suggestions

### 3.5 Integration Interfaces
- **MCP Server protocol**: Native Model Context Protocol integration
- **CLI tool**: Command-line interface for automation and scripting
- **TypeScript SDK**: Comprehensive SDK for custom integrations
- **WebSocket API**: Real-time event streaming

### 3.6 Design Criterion
- **Agent-first**: Optimized for programmatic access over human interaction
- **Context preservation**: Maintain task context throughout interactions
- **Failure recovery**: Built-in resilience for network and chain issues

## 4. Auditable & Explainable (Mandatory)

### 4.1 Structured Payment Records
- **Core identifiers**: Task ID, Agent ID, User ID, Session Key ID
- **Transaction details**: Recipient, amount, asset, gas used, block number
- **Context data**: Payment reason, task description, user intent
- **Policy information**: Policies evaluated, decisions made, override reasons
- **Execution metadata**: Timestamp, transaction hash, confirmation status
- **Risk metrics**: Risk score, confidence level, anomaly flags

### 4.2 Audit Interface
- **Time-based views**: Daily, weekly, monthly summaries
- **Agent-specific views**: Activity per Agent, performance metrics
- **Task-based grouping**: All payments related to specific tasks
- **Export formats**: CSV, JSON, PDF reports
- **API access**: RESTful API for programmatic access to audit data
- **On-chain storage**: Immutable storage of critical metadata

### 4.3 Analytics & Reporting
- **Spending analytics**: Category breakdown, trend analysis
- **Agent performance**: Success rates, error patterns, efficiency metrics
- **Policy effectiveness**: Policy hit rates, override frequency
- **Compliance reports**: Regulatory compliance documentation

## 5. Recovery & Permission Management (Mandatory)

### 5.1 Wallet Recovery
- **Social recovery**: 3-of-5 guardian model with time locks
- **Hardware backup**: Integration with Ledger, Trezor, other hardware wallets
- **Multi-sig fallback**: Emergency multi-signature access
- **Recovery testing**: Regular recovery procedure validation

### 5.2 Permission Adjustment
- **Real-time updates**: Immediate permission changes without downtime
- **Bulk operations**: Batch updates for multiple Agents or permissions
- **Templates**: Permission templates for common use cases
- **Version control**: Permission change history and rollback capability

### 5.3 Session Key Rotation
- **Automatic rotation**: Scheduled rotation based on time or usage
- **Compromise response**: Immediate rotation on security events
- **Rotation policies**: Configurable rotation frequency and triggers
- **Key history**: Maintain historical keys for audit purposes

### 5.4 Multi-Agent Management
- **Role-based permissions**: Predefined roles with permission sets
- **Agent categorization**: Long-term, temporary, task-specific Agents
- **Hierarchical management**: Nested permission structures for organizations
- **Quota management**: Resource allocation across multiple Agents

### 5.5 Lifecycle Management
- **Onboarding**: Streamlined Agent registration and configuration
- **Offboarding**: Secure decommissioning and permission revocation
- **Suspension**: Temporary suspension with preservation of state
- **Archival**: Long-term storage of inactive Agent data

---

*Part of Agentic Payment System Module Documentation*