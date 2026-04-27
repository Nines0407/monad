export * from './types';
export declare const formatAmount: (amount: string, currency: string) => string;
export declare const validateAddress: (address: string) => boolean;
export declare const generateCorrelationId: () => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare const getDefaultConfig: () => {
    mcpServer: {
        port: number;
        host: string;
        maxConnections: number;
        heartbeatInterval: number;
        auth: {
            enabled: boolean;
            tokenExpiry: number;
        };
    };
    apiServer: {
        port: number;
        host: string;
        rateLimit: number;
        cors: {
            enabled: boolean;
            origins: string[];
        };
    };
    websocketServer: {
        port: number;
        host: string;
        maxConnections: number;
        pingInterval: number;
    };
    database: {
        url: string;
        poolSize: number;
        ssl: boolean;
    };
    redis: {
        url: string;
        prefix: string;
    };
    monad: {
        rpcUrl: string;
        chainId: number;
        explorerUrl: string;
        contractAddress: string | undefined;
    };
    security: {
        encryptionKey: string;
        jwtSecret: string;
        sessionExpiry: number;
    };
};
//# sourceMappingURL=index.d.ts.map