declare class MCPServer {
    private server;
    private tools;
    constructor();
    private setupTools;
    private setupHandlers;
    private handleRequestPayment;
    private handleCheckBudget;
    private handleGetPaymentStatus;
    private handleListPayments;
    private handleUpdatePermissions;
    private handleEmergencyPause;
    start(): Promise<void>;
}
export { MCPServer };
//# sourceMappingURL=index.d.ts.map