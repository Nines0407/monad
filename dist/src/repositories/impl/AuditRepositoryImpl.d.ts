import { AuditRepository } from '../interfaces';
export declare class AuditRepositoryImpl implements AuditRepository {
    private paymentRepo;
    private policyDecisionRepo;
    private auditEventRepo;
    private sessionKeyEventRepo;
    private manualApprovalRepo;
    create: any;
    findById: any;
    findByTaskId: any;
    findByAgentId: any;
    findByUserId: any;
    updateStatus: any;
    search: any;
    export: any;
    createPolicyDecision: any;
    findByPaymentId: any;
    getStatistics: any;
    logEvent: any;
    getEvents: any;
    getSystemHealthEvents: any;
    createSessionKeyEvent: any;
    findBySessionKey: any;
    findByPaymentIdForSessionKey: any;
    createManualApproval: any;
    findByPaymentIdForApproval: any;
    findByApproverId: any;
    constructor();
}
//# sourceMappingURL=AuditRepositoryImpl.d.ts.map