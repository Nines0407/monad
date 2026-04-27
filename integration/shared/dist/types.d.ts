export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed' | 'cancelled';
export type PaymentCategory = 'api' | 'compute' | 'storage' | 'data' | 'service' | 'other' | 'ai_agent';
export interface Agent {
    id: string;
    name: string;
    type: 'claude_code' | 'openclaw' | 'codex' | 'manus' | 'custom';
    version: string;
    permissions: AgentPermissions;
    budget: Budget;
    createdAt: Date;
    lastActive: Date;
}
export interface AgentPermissions {
    canRequestPayments: boolean;
    maxDailyAmount: number;
    allowedCategories: PaymentCategory[];
    requireApprovalThreshold: number;
    allowedRecipients?: string[];
    blockedRecipients?: string[];
}
export interface Budget {
    total: number;
    spent: number;
    remaining: number;
    dailyLimit: number;
    dailySpent: number;
    currency: string;
    resetAt: Date;
}
export interface PaymentRequest {
    amount: string;
    currency: string;
    recipient: string;
    reason: string;
    category: PaymentCategory;
    metadata?: Record<string, any>;
    taskContext?: TaskContext;
    agentId?: string;
}
export interface TaskContext {
    taskId: string;
    taskDescription: string;
    taskType: string;
    environment: 'development' | 'staging' | 'production';
    filesModified?: string[];
    commandsExecuted?: string[];
    estimatedCost?: number;
}
export interface PaymentResponse {
    id: string;
    status: PaymentStatus;
    amount: string;
    currency: string;
    recipient: string;
    transactionHash?: string;
    estimatedGas?: string;
    estimatedGasPrice?: string;
    approvalRequired: boolean;
    approvalId?: string;
    policyEvaluations: PolicyEvaluation[];
    createdAt: Date;
}
export interface PolicyEvaluation {
    policyId: string;
    decision: 'allow' | 'deny' | 'require_approval';
    evaluatedRules: PolicyRule[];
    violations: PolicyViolation[];
}
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: 'allow' | 'deny' | 'require_approval';
}
export interface PolicyViolation {
    ruleId: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    data: Record<string, any>;
}
export interface AuditEvent {
    id: string;
    eventType: AuditEventType;
    actorType: ActorType;
    actorId: string;
    targetType?: string;
    targetId?: string;
    metadata: Record<string, any>;
    timestamp: Date;
}
export type AuditEventType = 'payment_requested' | 'payment_approved' | 'payment_rejected' | 'payment_executed' | 'payment_failed' | 'policy_evaluated' | 'policy_updated' | 'agent_connected' | 'agent_disconnected' | 'emergency_paused' | 'emergency_resumed' | 'budget_warning' | 'budget_exceeded' | 'manual_approval_required' | 'manual_approval_granted' | 'manual_approval_denied';
export type ActorType = 'agent' | 'user' | 'system' | 'admin';
export interface WebSocketEvent {
    type: string;
    payload: any;
    timestamp: Date;
    correlationId?: string;
}
export type WebSocketEventType = 'payment:created' | 'payment:status_changed' | 'policy:updated' | 'budget:warning' | 'emergency:triggered' | 'agent:connected' | 'agent:disconnected' | 'system:alert' | 'audit:event';
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    handler: (args: any, context: MCPContext) => Promise<any>;
}
export interface MCPContext {
    agentId: string;
    sessionId: string;
    userId: string;
    permissions: AgentPermissions;
    budget: Budget;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: Date;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface IntegrationConfig {
    mcpServer: {
        port: number;
        host: string;
        maxConnections: number;
        heartbeatInterval: number;
        auth: {
            enabled: boolean;
            tokenExpiry: number;
        };
    };
    apiServer: {
        port: number;
        host: string;
        rateLimit: number;
        cors: {
            enabled: boolean;
            origins: string[];
        };
    };
    websocketServer: {
        port: number;
        host: string;
        maxConnections: number;
        pingInterval: number;
    };
    database: {
        url: string;
        poolSize: number;
        ssl: boolean;
    };
    redis: {
        url: string;
        prefix: string;
    };
    monad: {
        rpcUrl: string;
        chainId: number;
        explorerUrl: string;
        contractAddress?: string;
    };
    security: {
        encryptionKey: string;
        jwtSecret: string;
        sessionExpiry: number;
    };
}
export declare class IntegrationError extends Error {
    code: string;
    details?: any;
    statusCode: number;
    constructor(code: string, message: string, details?: any, statusCode?: number);
}
export declare const ErrorCodes: {
    readonly PAYMENT_INSUFFICIENT_BUDGET: "PAYMENT_INSUFFICIENT_BUDGET";
    readonly PAYMENT_RECIPIENT_BLOCKED: "PAYMENT_RECIPIENT_BLOCKED";
    readonly PAYMENT_CATEGORY_NOT_ALLOWED: "PAYMENT_CATEGORY_NOT_ALLOWED";
    readonly PAYMENT_AMOUNT_EXCEEDS_LIMIT: "PAYMENT_AMOUNT_EXCEEDS_LIMIT";
    readonly PAYMENT_REQUIRES_APPROVAL: "PAYMENT_REQUIRES_APPROVAL";
    readonly AGENT_NOT_AUTHORIZED: "AGENT_NOT_AUTHORIZED";
    readonly AGENT_PERMISSION_DENIED: "AGENT_PERMISSION_DENIED";
    readonly AGENT_BUDGET_EXCEEDED: "AGENT_BUDGET_EXCEEDED";
    readonly POLICY_EVALUATION_FAILED: "POLICY_EVALUATION_FAILED";
    readonly POLICY_VIOLATION_DETECTED: "POLICY_VIOLATION_DETECTED";
    readonly SYSTEM_EMERGENCY_PAUSED: "SYSTEM_EMERGENCY_PAUSED";
    readonly SYSTEM_MAINTENANCE: "SYSTEM_MAINTENANCE";
    readonly NETWORK_CONNECTION_FAILED: "NETWORK_CONNECTION_FAILED";
    readonly TRANSACTION_FAILED: "TRANSACTION_FAILED";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED";
    readonly INVALID_TOKEN: "INVALID_TOKEN";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
};
//# sourceMappingURL=types.d.ts.map