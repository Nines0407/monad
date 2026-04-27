"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const repositories_1 = require("../../repositories");
// Mock implementations - these should be replaced with actual service calls
// In a real implementation, these would call the appropriate repository methods
const resolvers = {
    JSON: {
        serialize: (value) => value,
        parseValue: (value) => value,
        parseLiteral: (ast) => {
            try {
                return JSON.parse(ast.value);
            }
            catch {
                return ast.value;
            }
        }
    },
    DateTime: {
        serialize: (value) => value.toISOString(),
        parseValue: (value) => new Date(value),
        parseLiteral: (ast) => new Date(ast.value)
    },
    Query: {
        // Payment queries
        payments: async (_, { criteria, options }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                const result = await paymentRepo.search({
                    userId: criteria?.userId,
                    agentId: criteria?.agentId,
                    taskId: criteria?.taskId,
                    status: criteria?.status,
                    category: criteria?.category,
                    dateFrom: criteria?.dateFrom,
                    dateTo: criteria?.dateTo,
                    minAmount: criteria?.minAmount,
                    maxAmount: criteria?.maxAmount,
                    recipient: criteria?.recipient
                });
                return {
                    payments: result.payments,
                    total: result.total,
                    page: options?.offset ? Math.floor(options.offset / (options.limit || 10)) + 1 : 1,
                    pageSize: options?.limit || 10
                };
            }
            catch (error) {
                console.error('Error in payments query:', error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch payments', 'DATABASE_ERROR');
            }
        },
        payment: async (_, { id }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                return await paymentRepo.findById(id);
            }
            catch (error) {
                console.error(`Error fetching payment ${id}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch payment', 'DATABASE_ERROR');
            }
        },
        paymentsByTaskId: async (_, { taskId }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                return await paymentRepo.findByTaskId(taskId);
            }
            catch (error) {
                console.error(`Error fetching payments for task ${taskId}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch payments by task ID', 'DATABASE_ERROR');
            }
        },
        paymentsByAgentId: async (_, { agentId, options }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                return await paymentRepo.findByAgentId(agentId, options);
            }
            catch (error) {
                console.error(`Error fetching payments for agent ${agentId}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch payments by agent ID', 'DATABASE_ERROR');
            }
        },
        paymentsByUserId: async (_, { userId, options }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                return await paymentRepo.findByUserId(userId, options);
            }
            catch (error) {
                console.error(`Error fetching payments for user ${userId}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch payments by user ID', 'DATABASE_ERROR');
            }
        },
        // Audit event queries
        auditEvents: async (_, filter) => {
            try {
                const auditEventRepo = repositories_1.repositories.auditEvent;
                return await auditEventRepo.getEvents(filter);
            }
            catch (error) {
                console.error('Error fetching audit events:', error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch audit events', 'DATABASE_ERROR');
            }
        },
        // Policy decision queries
        policyDecisions: async (_, { paymentId }) => {
            try {
                const policyDecisionRepo = repositories_1.repositories.policyDecision;
                return await policyDecisionRepo.findByPaymentId(paymentId);
            }
            catch (error) {
                console.error(`Error fetching policy decisions for payment ${paymentId}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch policy decisions', 'DATABASE_ERROR');
            }
        },
        policyStatistics: async (_, { from, to }) => {
            try {
                const policyDecisionRepo = repositories_1.repositories.policyDecision;
                return await policyDecisionRepo.getStatistics({ from, to });
            }
            catch (error) {
                console.error('Error fetching policy statistics:', error);
                throw new apollo_server_express_1.ApolloError('Failed to fetch policy statistics', 'DATABASE_ERROR');
            }
        }
    },
    Mutation: {
        // Payment mutations
        createPayment: async (_, { input }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                return await paymentRepo.create(input);
            }
            catch (error) {
                console.error('Error creating payment:', error);
                throw new apollo_server_express_1.ApolloError('Failed to create payment', 'DATABASE_ERROR');
            }
        },
        updatePaymentStatus: async (_, { id, status }) => {
            try {
                const paymentRepo = repositories_1.repositories.payment;
                await paymentRepo.updateStatus(id, status);
                return await paymentRepo.findById(id);
            }
            catch (error) {
                console.error(`Error updating payment ${id} status to ${status}:`, error);
                throw new apollo_server_express_1.ApolloError('Failed to update payment status', 'DATABASE_ERROR');
            }
        },
        // Audit event mutations
        logAuditEvent: async (_, { input }) => {
            try {
                const auditEventRepo = repositories_1.repositories.auditEvent;
                await auditEventRepo.logEvent(input);
                return true;
            }
            catch (error) {
                console.error('Error logging audit event:', error);
                throw new apollo_server_express_1.ApolloError('Failed to log audit event', 'DATABASE_ERROR');
            }
        },
        // Policy decision mutations
        createPolicyDecision: async (_, { input }) => {
            try {
                const policyDecisionRepo = repositories_1.repositories.policyDecision;
                return await policyDecisionRepo.create(input);
            }
            catch (error) {
                console.error('Error creating policy decision:', error);
                throw new apollo_server_express_1.ApolloError('Failed to create policy decision', 'DATABASE_ERROR');
            }
        },
        // Manual approval mutations
        createManualApproval: async (_, { input }) => {
            try {
                // Note: Manual approval repository needs to be created
                // For now, return a mock implementation
                console.log('Manual approval created:', input);
                return {
                    id: 'mock-approval-id',
                    paymentId: input.paymentId,
                    approverId: input.approverId,
                    decision: input.decision,
                    reason: input.reason,
                    approvedAt: new Date()
                };
            }
            catch (error) {
                console.error('Error creating manual approval:', error);
                throw new apollo_server_express_1.ApolloError('Failed to create manual approval', 'DATABASE_ERROR');
            }
        }
    },
    // Type resolvers for relationships
    Payment: {
        policyDecisions: async (payment) => {
            try {
                const policyDecisionRepo = repositories_1.repositories.policyDecision;
                return await policyDecisionRepo.findByPaymentId(payment.id);
            }
            catch (error) {
                console.error(`Error fetching policy decisions for payment ${payment.id}:`, error);
                return [];
            }
        },
        auditEvents: async (payment) => {
            try {
                // TODO: Implement method to get events by payment ID
                // For now, return empty array
                return [];
            }
            catch (error) {
                console.error(`Error fetching audit events for payment ${payment.id}:`, error);
                return [];
            }
        },
        sessionKeyEvents: async (_payment) => {
            // TODO: Implement session key event repository
            // For now, return empty array
            return [];
        },
        manualApprovals: async (_payment) => {
            // TODO: Implement manual approval repository
            // For now, return empty array
            return [];
        }
    }
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map