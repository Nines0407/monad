// Shared types for the integration layer

// Payment types
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed' | 'cancelled';
export type PaymentCategory = 'api' | 'compute' | 'storage' | 'data' | 'service' | 'other' | 'ai_agent';

// Agent types
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

// Payment request
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

// Payment response
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

// Policy evaluation
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

// Audit types
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

export type AuditEventType =
  | 'payment_requested'
  | 'payment_approved'
  | 'payment_rejected'
  | 'payment_executed'
  | 'payment_failed'
  | 'policy_evaluated'
  | 'policy_updated'
  | 'agent_connected'
  | 'agent_disconnected'
  | 'emergency_paused'
  | 'emergency_resumed'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'manual_approval_required'
  | 'manual_approval_granted'
  | 'manual_approval_denied';

export type ActorType = 'agent' | 'user' | 'system' | 'admin';

// WebSocket events
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export type WebSocketEventType =
  | 'payment:created'
  | 'payment:status_changed'
  | 'policy:updated'
  | 'budget:warning'
  | 'emergency:triggered'
  | 'agent:connected'
  | 'agent:disconnected'
  | 'system:alert'
  | 'audit:event';

// MCP Tool definitions
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

// API response types
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

// Configuration types
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

// Error types
export class IntegrationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export const ErrorCodes = {
  // Payment errors
  PAYMENT_INSUFFICIENT_BUDGET: 'PAYMENT_INSUFFICIENT_BUDGET',
  PAYMENT_RECIPIENT_BLOCKED: 'PAYMENT_RECIPIENT_BLOCKED',
  PAYMENT_CATEGORY_NOT_ALLOWED: 'PAYMENT_CATEGORY_NOT_ALLOWED',
  PAYMENT_AMOUNT_EXCEEDS_LIMIT: 'PAYMENT_AMOUNT_EXCEEDS_LIMIT',
  PAYMENT_REQUIRES_APPROVAL: 'PAYMENT_REQUIRES_APPROVAL',
  
  // Agent errors
  AGENT_NOT_AUTHORIZED: 'AGENT_NOT_AUTHORIZED',
  AGENT_PERMISSION_DENIED: 'AGENT_PERMISSION_DENIED',
  AGENT_BUDGET_EXCEEDED: 'AGENT_BUDGET_EXCEEDED',
  
  // Policy errors
  POLICY_EVALUATION_FAILED: 'POLICY_EVALUATION_FAILED',
  POLICY_VIOLATION_DETECTED: 'POLICY_VIOLATION_DETECTED',
  
  // System errors
  SYSTEM_EMERGENCY_PAUSED: 'SYSTEM_EMERGENCY_PAUSED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  
  // Network errors
  NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Authentication errors
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;