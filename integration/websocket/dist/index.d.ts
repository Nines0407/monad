import { WebSocketEvent } from '@agent-pay/shared';
export declare class WebSocketServerManager {
    private wss;
    private clients;
    private config;
    private pingInterval;
    constructor();
    private setupEventHandlers;
    private startPingInterval;
    private handleMessage;
    private handlePing;
    private handlePong;
    private handleAuthentication;
    private handleSubscribe;
    private handleUnsubscribe;
    private handleBroadcast;
    private handleDisconnect;
    private sendToClient;
    broadcast(event: WebSocketEvent, channels?: string[]): void;
    broadcastToAgents(event: WebSocketEvent, agentIds: string[]): void;
    getClientCount(): number;
    getAuthenticatedCount(): number;
    getStats(): {
        totalClients: number;
        authenticatedClients: number;
        subscriptions: Record<string, number>;
    };
    private generateClientId;
    close(): void;
}
//# sourceMappingURL=index.d.ts.map