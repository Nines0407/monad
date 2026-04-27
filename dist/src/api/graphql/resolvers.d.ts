import { PaymentStatus } from '../../models';
declare const resolvers: {
    JSON: {
        serialize: (value: any) => any;
        parseValue: (value: any) => any;
        parseLiteral: (ast: any) => any;
    };
    DateTime: {
        serialize: (value: Date) => string;
        parseValue: (value: string) => Date;
        parseLiteral: (ast: any) => Date;
    };
    Query: {
        payments: (_: any, { criteria, options }: any) => Promise<{
            payments: import("../../models").Payment[];
            total: number;
            page: number;
            pageSize: any;
        }>;
        payment: (_: any, { id }: {
            id: string;
        }) => Promise<import("../../models").Payment | null>;
        paymentsByTaskId: (_: any, { taskId }: {
            taskId: string;
        }) => Promise<import("../../models").Payment[]>;
        paymentsByAgentId: (_: any, { agentId, options }: {
            agentId: string;
            options?: any;
        }) => Promise<import("../../models").Payment[]>;
        paymentsByUserId: (_: any, { userId, options }: {
            userId: string;
            options?: any;
        }) => Promise<import("../../models").Payment[]>;
        auditEvents: (_: any, filter: any) => Promise<import("../../models").AuditEvent[]>;
        policyDecisions: (_: any, { paymentId }: {
            paymentId: string;
        }) => Promise<import("../../models").PolicyDecision[]>;
        policyStatistics: (_: any, { from, to }: {
            from: Date;
            to: Date;
        }) => Promise<import("../../models").PolicyStatistics>;
    };
    Mutation: {
        createPayment: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../models").Payment>;
        updatePaymentStatus: (_: any, { id, status }: {
            id: string;
            status: PaymentStatus;
        }) => Promise<import("../../models").Payment | null>;
        logAuditEvent: (_: any, { input }: {
            input: any;
        }) => Promise<boolean>;
        createPolicyDecision: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../models").PolicyDecision>;
        createManualApproval: (_: any, { input }: {
            input: any;
        }) => Promise<{
            id: string;
            paymentId: any;
            approverId: any;
            decision: any;
            reason: any;
            approvedAt: Date;
        }>;
    };
    Payment: {
        policyDecisions: (payment: any) => Promise<import("../../models").PolicyDecision[]>;
        auditEvents: (payment: any) => Promise<never[]>;
        sessionKeyEvents: (_payment: any) => Promise<never[]>;
        manualApprovals: (_payment: any) => Promise<never[]>;
    };
};
export default resolvers;
//# sourceMappingURL=resolvers.d.ts.map