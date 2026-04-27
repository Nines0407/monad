// Type definitions for Audit System entities (frontend version)

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
export type PaymentCategory = 'api' | 'compute' | 'storage' | 'data' | 'service' | 'other';

export interface Payment {
  id: string;
  transaction_hash?: string;
  task_id: string;
  agent_id: string;
  user_id: string;
  amount: string;
  currency: string;
  recipient: string;
  status: PaymentStatus;
  category: PaymentCategory;
  reason?: string;
  created_at: string;
  updated_at: string;
  executed_at?: string;
}

export type PolicyDecisionType = 'allow' | 'deny' | 'require_approval';

export interface PolicyDecision {
  id: string;
  payment_id: string;
  policy_id: string;
  decision: PolicyDecisionType;
  evaluated_rules: any[];
  violations: any[];
  created_at: string;
}

export type AuditEventType = 
  | 'payment_created' | 'policy_updated' | 'key_registered' | 'emergency_paused'
  | 'user_login' | 'permission_changed' | 'system_alert' | 'export_generated';

export type ActorType = 'agent' | 'user' | 'system';

export interface AuditEvent {
  id: string;
  event_type: AuditEventType;
  actor_type: ActorType;
  actor_id: string;
  target_type?: string;
  target_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type SessionKeyEventType = 'registered' | 'used' | 'revoked' | 'expired';

export interface SessionKeyEvent {
  id: string;
  session_key: string;
  event_type: SessionKeyEventType;
  permissions_snapshot: Record<string, any>;
  related_payment_id?: string;
  created_at: string;
}

export type ManualApprovalDecision = 'approved' | 'rejected';

export interface ManualApproval {
  id: string;
  payment_id: string;
  approver_id: string;
  decision: ManualApprovalDecision;
  reason?: string;
  approved_at: string;
}

// Query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaymentSearchCriteria {
  userId?: string;
  agentId?: string;
  taskId?: string;
  status?: PaymentStatus;
  category?: PaymentCategory;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  recipient?: string;
}

export interface PaymentSearchResult {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EventFilter {
  eventType?: AuditEventType;
  actorType?: ActorType;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface TimeRange {
  from: string;
  to: string;
}

export interface PolicyStatistics {
  totalDecisions: number;
  allowed: number;
  denied: number;
  requireApproval: number;
  commonViolations: Array<{ rule: string; count: number }>;
}