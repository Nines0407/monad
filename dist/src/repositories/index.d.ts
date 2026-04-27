export * from './interfaces';
export * from './impl/AuditRepositoryImpl';
export * from './impl/PaymentRepositoryImpl';
export * from './impl/PolicyDecisionRepositoryImpl';
export * from './impl/AuditEventRepositoryImpl';
export * from './impl/SessionKeyEventRepositoryImpl';
export * from './impl/ManualApprovalRepositoryImpl';
import { PaymentRepository } from './interfaces';
import { PolicyDecisionRepository } from './interfaces';
import { AuditEventRepository } from './interfaces';
import { SessionKeyEventRepository } from './interfaces';
import { ManualApprovalRepository } from './interfaces';
export declare const repositories: {
    payment: PaymentRepository;
    policyDecision: PolicyDecisionRepository;
    auditEvent: AuditEventRepository;
    sessionKeyEvent: SessionKeyEventRepository;
    manualApproval: ManualApprovalRepository;
};
//# sourceMappingURL=index.d.ts.map