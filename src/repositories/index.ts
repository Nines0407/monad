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
import { PaymentRepositoryImpl } from './impl/PaymentRepositoryImpl';
import { PolicyDecisionRepositoryImpl } from './impl/PolicyDecisionRepositoryImpl';
import { AuditEventRepositoryImpl } from './impl/AuditEventRepositoryImpl';
import { SessionKeyEventRepositoryImpl } from './impl/SessionKeyEventRepositoryImpl';
import { ManualApprovalRepositoryImpl } from './impl/ManualApprovalRepositoryImpl';

// Create repository instances
const paymentRepository: PaymentRepository = new PaymentRepositoryImpl();
const policyDecisionRepository: PolicyDecisionRepository = new PolicyDecisionRepositoryImpl();
const auditEventRepository: AuditEventRepository = new AuditEventRepositoryImpl();
const sessionKeyEventRepository: SessionKeyEventRepository = new SessionKeyEventRepositoryImpl();
const manualApprovalRepository: ManualApprovalRepository = new ManualApprovalRepositoryImpl();

export const repositories = {
  payment: paymentRepository,
  policyDecision: policyDecisionRepository,
  auditEvent: auditEventRepository,
  sessionKeyEvent: sessionKeyEventRepository,
  manualApproval: manualApprovalRepository
};