# Interface Definitions

## Smart Contract Interfaces

### 1. IAgentWallet (ERC-4337 Compliant)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentWallet {
    // Core wallet operations
    function executeUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
    
    // Session key management
    function registerSessionKey(
        address sessionKey,
        SessionKeyPermissions calldata permissions,
        uint256 expiry
    ) external;
    
    function revokeSessionKey(address sessionKey) external;
    function isSessionKeyValid(address sessionKey) external view returns (bool);
    
    // Policy management
    function evaluatePolicy(
        PolicyRequest calldata request
    ) external view returns (PolicyDecision memory);
    
    // Emergency controls
    function pauseAllOperations() external;
    function resumeOperations() external;
    function isPaused() external view returns (bool);
    
    // Events
    event SessionKeyRegistered(address indexed sessionKey, uint256 expiry);
    event SessionKeyRevoked(address indexed sessionKey);
    event PaymentExecuted(
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        bytes32 taskId
    );
    event PolicyEvaluated(
        bytes32 indexed policyId,
        PolicyDecision decision,
        bytes32 transactionHash
    );
}

struct SessionKeyPermissions {
    uint256 maxAmount;
    uint256 maxGas;
    address[] allowedRecipients;
    bytes4[] allowedFunctions;
    uint256 expiry;
    bool requireApproval;
}

struct PolicyRequest {
    address sender;
    address recipient;
    uint256 amount;
    address token;
    bytes data;
    uint256 gas;
}

struct PolicyDecision {
    bool allowed;
    bool requiresApproval;
    string reason;
    bytes32[] triggeredPolicies;
}
```

### 2. ISessionKeyManager
```solidity
interface ISessionKeyManager {
    function validateSessionKey(
        address sessionKey,
        ValidationContext calldata context
    ) external view returns (ValidationResult memory);
    
    function getSessionKeyPermissions(
        address sessionKey
    ) external view returns (SessionKeyPermissions memory);
    
    function rotateSessionKey(
        address oldKey,
        address newKey,
        SessionKeyPermissions calldata permissions
    ) external;
    
    // Batch operations for efficiency
    function batchValidate(
        address[] calldata sessionKeys,
        ValidationContext[] calldata contexts
    ) external view returns (ValidationResult[] memory);
}

struct ValidationContext {
    address recipient;
    uint256 amount;
    bytes data;
    uint256 gas;
    uint256 blockTimestamp;
}

struct ValidationResult {
    bool valid;
    string failureReason;
    uint256 remainingAmount;
    uint256 remainingGas;
}
```

### 3. IPolicyEngine
```solidity
interface IPolicyEngine {
    // Policy management
    function addPolicy(PolicyDefinition calldata policy) external;
    function updatePolicy(bytes32 policyId, PolicyDefinition calldata policy) external;
    function removePolicy(bytes32 policyId) external;
    function getPolicy(bytes32 policyId) external view returns (PolicyDefinition memory);
    
    // Policy evaluation
    function evaluate(
        EvaluationContext calldata context,
        bytes32[] calldata policyIds
    ) external view returns (EvaluationResult memory);
    
    // Governance
    function proposePolicyUpdate(
        bytes32 policyId,
        PolicyDefinition calldata newPolicy,
        string calldata justification
    ) external;
    
    function voteOnProposal(bytes32 proposalId, bool support) external;
    function executeProposal(bytes32 proposalId) external;
}

struct PolicyDefinition {
    string name;
    string description;
    Condition[] conditions;
    Action action;
    uint256 priority;
    bool enabled;
}

struct Condition {
    string field;
    Operator operator;
    bytes value;
    LogicOperator logic; // AND, OR, NOT
}

enum Operator {
    EQUAL,
    NOT_EQUAL,
    GREATER_THAN,
    LESS_THAN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN_OR_EQUAL,
    IN,
    NOT_IN,
    CONTAINS,
    STARTS_WITH,
    ENDS_WITH
}

enum LogicOperator {
    AND,
    OR,
    NOT
}

enum Action {
    ALLOW,
    DENY,
    REQUIRE_APPROVAL,
    ESCALATE
}

struct EvaluationContext {
    address sender;
    address sessionKey;
    address recipient;
    uint256 amount;
    address token;
    bytes data;
    uint256 gas;
    uint256 timestamp;
    bytes32 taskId;
    string category;
}

struct EvaluationResult {
    Action finalAction;
    bytes32[] triggeredPolicies;
    string explanation;
    bool requiresEscalation;
    address escalationPath; // Multi-sig or governance address
}
```

### 4. IAuditLogger
```solidity
interface IAuditLogger {
    // Logging functions
    function logPayment(
        PaymentLog calldata payment
    ) external returns (bytes32 logId);
    
    function logPolicyDecision(
        PolicyDecisionLog calldata decision
    ) external returns (bytes32 logId);
    
    function logSessionKeyActivity(
        SessionKeyActivity calldata activity
    ) external returns (bytes32 logId);
    
    // Query functions (view-only for gas efficiency)
    function getPaymentLog(bytes32 logId) external view returns (PaymentLog memory);
    function getLogsByTask(bytes32 taskId) external view returns (bytes32[] memory);
    function getLogsByAgent(address agent) external view returns (bytes32[] memory);
    
    // Batch operations
    function batchLogPayments(
        PaymentLog[] calldata payments
    ) external returns (bytes32[] memory);
    
    // Events for off-chain indexing
    event PaymentLogged(
        bytes32 indexed logId,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 taskId
    );
    
    event PolicyDecisionLogged(
        bytes32 indexed logId,
        bytes32 indexed policyId,
        Action decision,
        bytes32 transactionHash
    );
}

struct PaymentLog {
    address from;
    address to;
    uint256 amount;
    address token;
    bytes32 taskId;
    address agent;
    bytes32 sessionKeyId;
    uint256 timestamp;
    bytes32 transactionHash;
    uint256 gasUsed;
    uint256 gasPrice;
    string reason;
    string category;
}

struct PolicyDecisionLog {
    bytes32 policyId;
    Action decision;
    bytes32 transactionHash;
    address evaluator;
    uint256 timestamp;
    string explanation;
    bytes context; // Additional context data
}

struct SessionKeyActivity {
    address sessionKey;
    ActivityType activity;
    address initiatedBy;
    uint256 timestamp;
    bytes additionalData;
}

enum ActivityType {
    REGISTERED,
    REVOKED,
    USED,
    EXPIRED,
    ROTATED
}
```

## TypeScript/JavaScript Interfaces

### 1. AgentPay SDK Interfaces

#### Core Configuration
```typescript
interface AgentPayConfig {
    // Required
    walletAddress: string;
    network: 'testnet' | 'mainnet';
    
    // Optional
    rpcUrl?: string;
    apiKey?: string;
    autoConnect?: boolean;
    policyRefreshInterval?: number;
    cacheTTL?: number;
    
    // Security
    encryptionKey?: string;
    hsmConfig?: HSMConfig;
    hardwareWallet?: HardwareWalletConfig;
}

interface HSMConfig {
    type: 'aws-kms' | 'gcp-kms' | 'azure-keyvault';
    keyId: string;
    region?: string;
}

interface HardwareWalletConfig {
    type: 'ledger' | 'trezor' | 'keystone';
    derivationPath?: string;
    transportType?: 'webhid' | 'webusb' | 'ble';
}
```

#### Payment Request/Response
```typescript
interface PaymentRequest {
    // Required
    amount: string;
    currency: string;
    recipient: string;
    reason: string;
    
    // Optional
    taskContext?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    category?: PaymentCategory;
    metadata?: Record<string, any>;
    callbackUrl?: string;
    
    // Advanced
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
}

interface PaymentResponse {
    // Identification
    paymentId: string;
    transactionId?: string;
    
    // Status
    status: PaymentStatus;
    approvalRequired: boolean;
    approvalId?: string;
    
    // Financial
    amount: string;
    currency: string;
    estimatedGas?: string;
    estimatedCost?: string;
    
    // Timing
    createdAt: Date;
    expiresAt?: Date;
    
    // Metadata
    policiesEvaluated: string[];
    riskScore?: number;
    explanation?: string;
}

type PaymentStatus = 
    | 'pending' 
    | 'approved' 
    | 'rejected' 
    | 'executed' 
    | 'failed' 
    | 'cancelled';

type PaymentCategory = 
    | 'api' 
    | 'compute' 
    | 'storage' 
    | 'data' 
    | 'service' 
    | 'infrastructure' 
    | 'other';
```

#### Session Key Interfaces
```typescript
interface SessionKey {
    id: string;
    publicKey: string;
    permissions: SessionKeyPermissions;
    createdAt: Date;
    expiresAt: Date;
    lastUsed?: Date;
    usageCount: number;
    isActive: boolean;
}

interface SessionKeyPermissions {
    // Limits
    maxAmount: string;
    maxAmountPerTransaction: string;
    maxGas: string;
    
    // Restrictions
    allowedRecipients: string[];
    allowedContracts: string[];
    allowedFunctions: string[];
    allowedTokens: string[];
    allowedCategories: PaymentCategory[];
    
    // Time
    expiry: Date;
    cooldownPeriod?: number; // seconds between uses
    
    // Conditions
    requireApprovalAbove?: string;
    requireMultiSigAbove?: string;
    blockAddresses: string[];
}

interface SessionKeyGenerationOptions {
    permissions: Partial<SessionKeyPermissions>;
    duration: number; // seconds
    keyType?: 'ephemeral' | 'persistent';
    storage?: 'memory' | 'encrypted' | 'hsm';
}
```

#### Policy Interfaces
```typescript
interface Policy {
    id: string;
    name: string;
    description?: string;
    
    // Conditions DSL
    condition: string;
    action: PolicyAction;
    
    // Parameters
    parameters?: Record<string, any>;
    priority: number;
    enabled: boolean;
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: number;
    
    // Scope
    scope: PolicyScope;
    tags: string[];
}

type PolicyAction = 
    | 'allow' 
    | 'deny' 
    | 'require_approval' 
    | 'require_multisig' 
    | 'escalate' 
    | 'notify';

interface PolicyScope {
    agents?: string[];
    categories?: PaymentCategory[];
    timeRange?: {
        start: Date;
        end: Date;
    };
    amountRange?: {
        min: string;
        max: string;
    };
}

interface PolicyTestResult {
    matches: boolean;
    triggeredPolicies: string[];
    finalAction: PolicyAction;
    explanation: string;
    suggestedActions?: string[];
}
```

#### Audit Interfaces
```typescript
interface AuditQuery {
    // Filters
    taskId?: string;
    agentId?: string;
    status?: PaymentStatus;
    category?: PaymentCategory;
    
    // Date range
    startDate?: Date;
    endDate?: Date;
    
    // Pagination
    limit?: number;
    offset?: number;
    
    // Sorting
    sortBy?: 'date' | 'amount' | 'status';
    sortOrder?: 'asc' | 'desc';
    
    // Additional filters
    minAmount?: string;
    maxAmount?: string;
    recipient?: string;
    policies?: string[];
}

interface AuditRecord {
    id: string;
    
    // Transaction details
    transactionHash: string;
    blockNumber: number;
    timestamp: Date;
    
    // Parties
    from: string;
    to: string;
    agentId?: string;
    
    // Financial
    amount: string;
    currency: string;
    gasUsed: string;
    gasPrice: string;
    totalCost: string;
    
    // Context
    taskId?: string;
    reason?: string;
    category?: PaymentCategory;
    
    // Policies
    policiesEvaluated: string[];
    finalDecision: PolicyAction;
    manualApproval: boolean;
    approvedBy?: string;
    
    // Status
    status: PaymentStatus;
    errorMessage?: string;
    
    // Metadata
    metadata?: Record<string, any>;
    version: number;
}

interface AnalyticsData {
    spendingByCategory: Record<PaymentCategory, string>;
    spendingByAgent: Record<string, string>;
    spendingOverTime: TimeSeriesData[];
    policyEffectiveness: PolicyEffectivenessMetrics;
    agentPerformance: AgentPerformanceMetrics[];
}

interface TimeSeriesData {
    timestamp: Date;
    value: string;
    category?: PaymentCategory;
}
```

### 2. MCP Server Interfaces

#### Tool Definitions
```typescript
interface MCPTool {
    name: string;
    description: string;
    inputSchema: JsonSchema;
    outputSchema?: JsonSchema;
    handler: (input: any, context: MCPContext) => Promise<any>;
}

interface MCPResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    handler: (context: MCPContext) => Promise<Buffer | string>;
}

interface MCPContext {
    sessionId: string;
    agentId: string;
    userId: string;
    walletAddress: string;
    permissions: string[];
    metadata: Record<string, any>;
}

interface MCPServerConfig {
    port: number;
    host: string;
    authToken: string;
    walletAddress: string;
    network: 'testnet' | 'mainnet';
    tools: MCPTool[];
    resources: MCPResource[];
    middleware?: MCPMiddleware[];
}

interface MCPMiddleware {
    name: string;
    handler: (context: MCPContext, next: () => Promise<any>) => Promise<any>;
}
```

### 3. CLI Tool Interfaces

#### Command Structure
```typescript
interface CLICommand {
    name: string;
    description: string;
    options: CLIOption[];
    subcommands?: CLICommand[];
    handler: (args: CLIArgs) => Promise<void>;
}

interface CLIOption {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    required?: boolean;
    default?: any;
    alias?: string;
}

interface CLIArgs {
    command: string;
    options: Record<string, any>;
    args: string[];
    globalOptions: Record<string, any>;
}

interface CLIConfig {
    configPath?: string;
    network: string;
    walletAddress?: string;
    apiKey?: string;
    outputFormat: 'text' | 'json' | 'yaml';
    color: boolean;
    interactive: boolean;
}
```

### 4. Database Schema Interfaces

#### PostgreSQL Schema
```typescript
interface DatabaseSchema {
    payments: PaymentTable;
    policies: PolicyTable;
    session_keys: SessionKeyTable;
    audit_logs: AuditLogTable;
    agents: AgentTable;
    users: UserTable;
}

interface PaymentTable {
    id: string;
    transaction_hash: string;
    from_address: string;
    to_address: string;
    amount: string;
    currency: string;
    status: string;
    block_number: number;
    timestamp: Date;
    gas_used: string;
    gas_price: string;
    task_id?: string;
    agent_id?: string;
    reason?: string;
    category?: string;
    policies_evaluated: string[];
    manual_approval: boolean;
    approved_by?: string;
    error_message?: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

interface PolicyTable {
    id: string;
    name: string;
    description?: string;
    condition: string;
    action: string;
    parameters: Record<string, any>;
    priority: number;
    enabled: boolean;
    scope: Record<string, any>;
    tags: string[];
    created_by: string;
    created_at: Date;
    updated_at: Date;
    version: number;
}

interface SessionKeyTable {
    id: string;
    public_key: string;
    permissions: Record<string, any>;
    created_at: Date;
    expires_at: Date;
    last_used?: Date;
    usage_count: number;
    is_active: boolean;
    revoked_at?: Date;
    revoked_reason?: string;
}

interface AuditLogTable {
    id: string;
    event_type: string;
    event_data: Record<string, any>;
    user_id?: string;
    agent_id?: string;
    ip_address?: string;
    user_agent?: string;
    timestamp: Date;
}

interface AgentTable {
    id: string;
    name: string;
    description?: string;
    wallet_address: string;
    permissions: Record<string, any>;
    daily_limit: string;
    per_transaction_limit: string;
    allowed_categories: string[];
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    last_active_at?: Date;
}

interface UserTable {
    id: string;
    email: string;
    wallet_address: string;
    preferences: Record<string, any>;
    notification_settings: Record<string, any>;
    security_settings: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
}
```

## WebSocket API Interfaces

### Connection Management
```typescript
interface WebSocketMessage {
    type: string;
    id?: string;
    data: any;
    timestamp: Date;
}

interface WebSocketAuth {
    type: 'auth';
    token: string;
    agentId?: string;
}

interface WebSocketSubscription {
    type: 'subscribe' | 'unsubscribe';
    channel: string;
    filters?: Record<string, any>;
}

interface WebSocketEvent {
    type: 'payment_update' | 'policy_update' | 'budget_alert' | 'security_alert';
    channel: string;
    data: any;
}
```

### Event Payloads
```typescript
interface PaymentUpdateEvent {
    paymentId: string;
    transactionId?: string;
    status: PaymentStatus;
    amount: string;
    currency: string;
    timestamp: Date;
    blockNumber?: number;
    confirmations?: number;
}

interface PolicyUpdateEvent {
    policyId: string;
    action: 'added' | 'updated' | 'removed';
    policy: Policy;
    updatedBy: string;
    timestamp: Date;
}

interface BudgetAlertEvent {
    agentId: string;
    category: PaymentCategory;
    spent: string;
    limit: string;
    percentage: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    timestamp: Date;
}

interface SecurityAlertEvent {
    alertId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'anomaly' | 'suspicious' | 'breach_attempt';
    description: string;
    affectedEntities: string[];
    timestamp: Date;
    recommendations: string[];
}
```

## REST API Interfaces

### Request/Response Types
```typescript
// Generic API response
interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}

// Pagination
interface PaginatedRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> extends APIResponse<T[]> {
    metadata: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

// Error responses
interface ErrorResponse {
    code: string;
    message: string;
    details?: any;
    requestId: string;
    timestamp: Date;
}
```

## Plugin/Extension Interfaces

### Browser Extension
```typescript
interface BrowserExtensionAPI {
    // Payment approval
    requestApproval(payment: PaymentRequest): Promise<ApprovalResponse>;
    getPendingApprovals(): Promise<ApprovalRequest[]>;
    
    // Wallet management
    getWalletStatus(): Promise<WalletStatus>;
    updateWalletSettings(settings: WalletSettings): Promise<void>;
    
    // Notification management
    showNotification(notification: Notification): Promise<void>;
    getNotificationSettings(): Promise<NotificationSettings>;
    
    // Policy management
    getPolicies(): Promise<Policy[]>;
    updatePolicy(policy: Policy): Promise<void>;
    
    // Event handling
    onPaymentUpdate(callback: (payment: PaymentUpdate) => void): void;
    onPolicyUpdate(callback: (policy: Policy) => void): void;
    onSecurityAlert(callback: (alert: SecurityAlert) => void): void;
}

interface ApprovalRequest {
    id: string;
    payment: PaymentRequest;
    policies: string[];
    riskScore: number;
    requestedAt: Date;
    expiresAt: Date;
}

interface ApprovalResponse {
    approved: boolean;
    reason?: string;
    overridePolicies?: string[];
    timestamp: Date;
}

interface WalletStatus {
    address: string;
    balance: string;
    network: string;
    isConnected: boolean;
    sessionKeys: number;
    activePolicies: number;
}
```

### Hardware Wallet Integration
```typescript
interface HardwareWallet {
    type: 'ledger' | 'trezor' | 'keystone';
    isConnected: boolean;
    
    // Connection
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    
    // Key management
    getPublicKey(derivationPath?: string): Promise<string>;
    signTransaction(transaction: any, derivationPath?: string): Promise<string>;
    signMessage(message: string, derivationPath?: string): Promise<string>;
    
    // Session key delegation
    delegateSessionKey(
        sessionKey: string,
        permissions: SessionKeyPermissions
    ): Promise<string>;
    
    // Events
    onConnect(callback: () => void): void;
    onDisconnect(callback: () => void): void;
    onError(callback: (error: Error) => void): void;
}

interface HardwareWalletConfig {
    type: 'ledger' | 'trezor' | 'keystone';
    derivationPath?: string;
    network?: string;
    debug?: boolean;
}
```

## Utility Interfaces

### Encryption Utilities
```typescript
interface EncryptionService {
    encrypt(data: Buffer | string, key: string): Promise<EncryptedData>;
    decrypt(encrypted: EncryptedData, key: string): Promise<Buffer>;
    generateKey(): Promise<string>;
    deriveKey(password: string, salt: string): Promise<string>;
}

interface EncryptedData {
    ciphertext: string;
    iv: string;
    salt: string;
    algorithm: string;
    version: number;
}

interface KeyManagementService {
    // Local key storage
    storeKey(keyId: string, key: string): Promise<void>;
    retrieveKey(keyId: string): Promise<string>;
    deleteKey(keyId: string): Promise<void>;
    
    // Hardware security module
    hsmEncrypt(data: Buffer): Promise<Buffer>;
    hsmDecrypt(data: Buffer): Promise<Buffer>;
    hsmSign(data: Buffer): Promise<string>;
    
    // Key rotation
    rotateKey(keyId: string): Promise<string>;
    getKeyVersion(keyId: string): Promise<number>;
}
```

### Validation Utilities
```typescript
interface ValidationService {
    validatePaymentRequest(request: PaymentRequest): ValidationResult;
    validateSessionKeyPermissions(permissions: SessionKeyPermissions): ValidationResult;
    validatePolicy(policy: Policy): ValidationResult;
    validateAddress(address: string): ValidationResult;
}

interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

interface ValidationError {
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
}

interface ValidationWarning {
    field: string;
    code: string;
    message: string;
    suggestion?: string;
}
```

### Monitoring Interfaces
```typescript
interface MetricsCollector {
    // Payment metrics
    recordPayment(payment: PaymentRecord): Promise<void>;
    recordPolicyEvaluation(policyId: string, duration: number): Promise<void>;
    recordSessionKeyUsage(keyId: string): Promise<void>;
    
    // Performance metrics
    recordLatency(operation: string, duration: number): Promise<void>;
    recordThroughput(operation: string, count: number): Promise<void>;
    recordError(operation: string, error: Error): Promise<void>;
    
    // Business metrics
    recordSpending(category: PaymentCategory, amount: string): Promise<void>;
    recordAgentActivity(agentId: string, operation: string): Promise<void>;
    
    // Get metrics
    getMetrics(query: MetricsQuery): Promise<MetricsData>;
}

interface MetricsQuery {
    timeframe: 'hour' | 'day' | 'week' | 'month';
    operation?: string;
    category?: PaymentCategory;
    agentId?: string;
    groupBy?: string[];
}

interface MetricsData {
    timestamp: Date;
    operation: string;
    count: number;
    averageDuration: number;
    errorRate: number;
    p50: number;
    p95: number;
    p99: number;
    dimensions: Record<string, string>;
}
```

## Testing Interfaces

### Test Utilities
```typescript
interface TestEnvironment {
    // Setup
    setup(): Promise<void>;
    teardown(): Promise<void>;
    reset(): Promise<void>;
    
    // Contract deployment
    deployContracts(): Promise<ContractAddresses>;
    getContract(contractName: string): Promise<any>;
    
    // Account management
    createAccount(): Promise<TestAccount>;
    getAccount(address: string): Promise<TestAccount>;
    fundAccount(address: string, amount: string): Promise<void>;
    
    // Network simulation
    mineBlocks(count: number): Promise<void>;
    increaseTime(seconds: number): Promise<void>;
    setNextBlockBaseFee(fee: string): Promise<void>;
}

interface TestAccount {
    address: string;
    privateKey: string;
    balance: string;
}

interface ContractAddresses {
    agentWallet: string;
    sessionKeyManager: string;
    policyEngine: string;
    auditLogger: string;
}

interface MockServices {
    rpc: MockRPC;
    keychain: MockKeychain;
    storage: MockStorage;
    notification: MockNotification;
}

interface MockRPC {
    setResponse(method: string, response: any): void;
    setError(method: string, error: Error): void;
    clear(): void;
    getCallCount(method: string): number;
    getCallParams(method: string, callIndex?: number): any[];
}
```

---

*Part of Agentic Payment System Module Documentation*