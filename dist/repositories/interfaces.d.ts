import { Payment, PaymentCreate, PaymentSearchCriteria, PaymentSearchResult, QueryOptions, PolicyDecision, PolicyDecisionCreate, PolicyStatistics, TimeRange, AuditEvent, AuditEventCreate, EventFilter, SessionKeyEvent, SessionKeyEventCreate, ManualApproval, ManualApprovalCreate } from '../models';
export interface PaymentRepository {
    create(payment: PaymentCreate): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByTaskId(taskId: string): Promise<Payment[]>;
    findByAgentId(agentId: string, options?: QueryOptions): Promise<Payment[]>;
    findByUserId(userId: string, options?: QueryOptions): Promise<Payment[]>;
    updateStatus(id: string, status: Payment['status']): Promise<void>;
    search(criteria: PaymentSearchCriteria, options?: QueryOptions): Promise<PaymentSearchResult>;
    export(criteria: PaymentSearchCriteria): Promise<any>;
}
export interface PolicyDecisionRepository {
    create(decision: PolicyDecisionCreate): Promise<PolicyDecision>;
    findByPaymentId(paymentId: string): Promise<PolicyDecision[]>;
    getStatistics(timeRange: TimeRange): Promise<PolicyStatistics>;
}
export interface AuditEventRepository {
    logEvent(event: AuditEventCreate): Promise<void>;
    getEvents(filter: EventFilter): Promise<AuditEvent[]>;
    getSystemHealthEvents(): Promise<AuditEvent[]>;
}
export interface SessionKeyEventRepository {
    create(event: SessionKeyEventCreate): Promise<SessionKeyEvent>;
    findBySessionKey(sessionKey: string, options?: QueryOptions): Promise<SessionKeyEvent[]>;
    findByPaymentId(paymentId: string): Promise<SessionKeyEvent[]>;
}
export interface ManualApprovalRepository {
    create(approval: ManualApprovalCreate): Promise<ManualApproval>;
    findByPaymentId(paymentId: string): Promise<ManualApproval[]>;
    findByApproverId(approverId: string, options?: QueryOptions): Promise<ManualApproval[]>;
}
export interface AuditRepository extends PaymentRepository, PolicyDecisionRepository, AuditEventRepository, SessionKeyEventRepository, ManualApprovalRepository {
}
//# sourceMappingURL=interfaces.d.ts.map