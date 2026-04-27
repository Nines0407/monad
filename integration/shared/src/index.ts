// Shared exports for integration layer

export * from './types';

// Utility functions
export const formatAmount = (amount: string, currency: string): string => {
  return `${amount} ${currency}`;
};

export const validateAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const generateCorrelationId = (): string => {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Configuration helpers
export const getDefaultConfig = () => {
  return {
    mcpServer: {
      port: parseInt(process.env.MCP_SERVER_PORT || '3000'),
      host: process.env.MCP_SERVER_HOST || 'localhost',
      maxConnections: parseInt(process.env.MCP_MAX_CONNECTIONS || '100'),
      heartbeatInterval: parseInt(process.env.MCP_HEARTBEAT_INTERVAL || '30'),
      auth: {
        enabled: process.env.MCP_AUTH_ENABLED !== 'false',
        tokenExpiry: parseInt(process.env.MCP_TOKEN_EXPIRY || '3600'),
      },
    },
    apiServer: {
      port: parseInt(process.env.API_PORT || '3001'),
      host: process.env.API_HOST || 'localhost',
      rateLimit: parseInt(process.env.API_RATE_LIMIT || '1000'),
      cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
      },
    },
    websocketServer: {
      port: parseInt(process.env.WS_PORT || '3002'),
      host: process.env.WS_HOST || 'localhost',
      maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '10000'),
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30'),
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/agent_pay_integration',
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
      ssl: process.env.DB_SSL === 'true',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      prefix: process.env.REDIS_PREFIX || 'agent_pay:',
    },
    monad: {
      rpcUrl: process.env.MONAD_RPC_URL || 'https://testnet.monad.xyz',
      chainId: parseInt(process.env.MONAD_CHAIN_ID || '10143'),
      explorerUrl: process.env.MONAD_EXPLORER_URL || 'https://explorer.monad.xyz',
      contractAddress: process.env.CONTRACT_ADDRESS,
    },
    security: {
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
      sessionExpiry: parseInt(process.env.SESSION_EXPIRY || '86400'),
    },
  };
};