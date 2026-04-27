"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepositoryImpl = void 0;
const PaymentRepositoryImpl_1 = require("./PaymentRepositoryImpl");
const PolicyDecisionRepositoryImpl_1 = require("./PolicyDecisionRepositoryImpl");
const AuditEventRepositoryImpl_1 = require("./AuditEventRepositoryImpl");
const SessionKeyEventRepositoryImpl_1 = require("./SessionKeyEventRepositoryImpl");
const ManualApprovalRepositoryImpl_1 = require("./ManualApprovalRepositoryImpl");
class AuditRepositoryImpl {
    paymentRepo;
    policyDecisionRepo;
    auditEventRepo;
    sessionKeyEventRepo;
    manualApprovalRepo;
    // PaymentRepository methods
    create;
    findById;
    findByTaskId;
    findByAgentId;
    findByUserId;
    updateStatus;
    search;
    export;
    // PolicyDecisionRepository methods
    createPolicyDecision;
    findByPaymentId;
    getStatistics;
    // AuditEventRepository methods
    logEvent;
    getEvents;
    getSystemHealthEvents;
    // SessionKeyEventRepository methods
    createSessionKeyEvent;
    findBySessionKey;
    findByPaymentIdForSessionKey;
    // ManualApprovalRepository methods
    createManualApproval;
    findByPaymentIdForApproval;
    findByApproverId;
    constructor() {
        this.paymentRepo = new PaymentRepositoryImpl_1.PaymentRepositoryImpl();
        this.policyDecisionRepo = new PolicyDecisionRepositoryImpl_1.PolicyDecisionRepositoryImpl();
        this.auditEventRepo = new AuditEventRepositoryImpl_1.AuditEventRepositoryImpl();
        this.sessionKeyEventRepo = new SessionKeyEventRepositoryImpl_1.SessionKeyEventRepositoryImpl();
        this.manualApprovalRepo = new ManualApprovalRepositoryImpl_1.ManualApprovalRepositoryImpl();
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
exports.AuditRepositoryImpl = AuditRepositoryImpl;
//# sourceMappingURL=AuditRepositoryImpl.js.map