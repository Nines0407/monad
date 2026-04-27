import { PaymentRepositoryImpl } from './PaymentRepositoryImpl';
import { PolicyDecisionRepositoryImpl } from './PolicyDecisionRepositoryImpl';
import { AuditEventRepositoryImpl } from './AuditEventRepositoryImpl';
import { SessionKeyEventRepositoryImpl } from './SessionKeyEventRepositoryImpl';
import { ManualApprovalRepositoryImpl } from './ManualApprovalRepositoryImpl';
import { AuditRepository } from '../interfaces';

export class AuditRepositoryImpl
  implements AuditRepository
{
  private paymentRepo: PaymentRepositoryImpl;
  private policyDecisionRepo: PolicyDecisionRepositoryImpl;
  private auditEventRepo: AuditEventRepositoryImpl;
  private sessionKeyEventRepo: SessionKeyEventRepositoryImpl;
  private manualApprovalRepo: ManualApprovalRepositoryImpl;

  // PaymentRepository methods
  create: any;
  findById: any;
  findByTaskId: any;
  findByAgentId: any;
  findByUserId: any;
  updateStatus: any;
  search: any;
  export: any;

  // PolicyDecisionRepository methods
  createPolicyDecision: any;
  findByPaymentId: any;
  getStatistics: any;

  // AuditEventRepository methods
  logEvent: any;
  getEvents: any;
  getSystemHealthEvents: any;

  // SessionKeyEventRepository methods
  createSessionKeyEvent: any;
  findBySessionKey: any;
  findByPaymentIdForSessionKey: any;

  // ManualApprovalRepository methods
  createManualApproval: any;
  findByPaymentIdForApproval: any;
  findByApproverId: any;

  constructor() {
    this.paymentRepo = new PaymentRepositoryImpl();
    this.policyDecisionRepo = new PolicyDecisionRepositoryImpl();
    this.auditEventRepo = new AuditEventRepositoryImpl();
    this.sessionKeyEventRepo = new SessionKeyEventRepositoryImpl();
    this.manualApprovalRepo = new ManualApprovalRepositoryImpl();

    // PaymentRepository methods
    this.create = this.paymentRepo.create.bind(this.paymentRepo);
    this.findById = this.paymentRepo.findById.bind(this.paymentRepo);
    this.findByTaskId = this.paymentRepo.findByTaskId.bind(this.paymentRepo);
    this.findByAgentId = this.paymentRepo.findByAgentId.bind(this.paymentRepo);
    this.findByUserId = this.paymentRepo.findByUserId.bind(this.paymentRepo);
    this.updateStatus = this.paymentRepo.updateStatus.bind(this.paymentRepo);
    this.search = this.paymentRepo.search.bind(this.paymentRepo);
    this.export = this.paymentRepo.export.bind(this.paymentRepo);

    // PolicyDecisionRepository methods
    this.createPolicyDecision = this.policyDecisionRepo.create.bind(this.policyDecisionRepo);
    this.findByPaymentId = this.policyDecisionRepo.findByPaymentId.bind(this.policyDecisionRepo);
    this.getStatistics = this.policyDecisionRepo.getStatistics.bind(this.policyDecisionRepo);

    // AuditEventRepository methods
    this.logEvent = this.auditEventRepo.logEvent.bind(this.auditEventRepo);
    this.getEvents = this.auditEventRepo.getEvents.bind(this.auditEventRepo);
    this.getSystemHealthEvents = this.auditEventRepo.getSystemHealthEvents.bind(this.auditEventRepo);

    // SessionKeyEventRepository methods
    this.createSessionKeyEvent = this.sessionKeyEventRepo.create.bind(this.sessionKeyEventRepo);
    this.findBySessionKey = this.sessionKeyEventRepo.findBySessionKey.bind(this.sessionKeyEventRepo);
    this.findByPaymentIdForSessionKey = this.sessionKeyEventRepo.findByPaymentId.bind(this.sessionKeyEventRepo);

    // ManualApprovalRepository methods
    this.createManualApproval = this.manualApprovalRepo.create.bind(this.manualApprovalRepo);
    this.findByPaymentIdForApproval = this.manualApprovalRepo.findByPaymentId.bind(this.manualApprovalRepo);
    this.findByApproverId = this.manualApprovalRepo.findByApproverId.bind(this.manualApprovalRepo);
  }
}