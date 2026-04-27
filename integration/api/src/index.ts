import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyWebsocket from '@fastify/websocket';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { config } from 'dotenv';
import { 
  PaymentRequest, 
  PaymentResponse, 
  Budget, 
  Agent,
  AuditEvent,
  getDefaultConfig
} from '@agent-pay/shared';

// Load environment variables
config();

// Type definitions

// Mock data store
const mockData = {
  payments: new Map<string, PaymentResponse>(),
  agents: new Map<string, Agent>(),
  budgets: new Map<string, Budget>(),
  auditEvents: new Map<string, AuditEvent>(),
  policies: new Map<string, any>(),
};

// Initialize with some mock data
function initializeMockData() {
  // Add a sample agent
  const agentId = 'agent_123';
  mockData.agents.set(agentId, {
    id: agentId,
    name: 'Claude Code Assistant',
    type: 'claude_code',
    version: '1.0.0',
    permissions: {
      canRequestPayments: true,
      maxDailyAmount: 1000,
      allowedCategories: ['api', 'compute', 'storage', 'data', 'service', 'ai_agent'],
      requireApprovalThreshold: 100,
      allowedRecipients: [],
      blockedRecipients: [],
    },
    budget: {
      total: 10000,
      spent: 2450,
      remaining: 7550,
      dailyLimit: 1000,
      dailySpent: 250,
      currency: 'USDC',
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastActive: new Date(),
  });

  mockData.budgets.set(agentId, mockData.agents.get(agentId)!.budget);
}

// GraphQL Schema
const typeDefs = `
  type Query {
    payments(
      agentId: String
      status: String
      category: String
      limit: Int = 50
      offset: Int = 0
    ): PaymentsResponse!
    
    payment(id: String!): Payment
    
    budget(agentId: String!): Budget
    
    agent(id: String!): Agent
    
    policies: [Policy!]!
    
    auditEvents(
      eventType: String
      actorType: String
      actorId: String
      limit: Int = 100
      offset: Int = 0
    ): AuditEventsResponse!
  }
  
  type Mutation {
    requestPayment(input: PaymentInput!): Payment!
    
    updateAgentPermissions(agentId: String!, permissions: PermissionsInput!): Agent!
    
    emergencyPause(reason: String, duration: Int): SystemResponse!
  }
  
  type Payment {
    id: String!
    status: String!
    amount: String!
    currency: String!
    recipient: String!
    transactionHash: String
    approvalRequired: Boolean!
    approvalId: String
    policyEvaluations: [PolicyEvaluation!]!
    createdAt: String!
  }
  
  type PaymentsResponse {
    payments: [Payment!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
  }
  
  type Budget {
    total: Float!
    spent: Float!
    remaining: Float!
    dailyLimit: Float!
    dailySpent: Float!
    currency: String!
    resetAt: String!
  }
  
  type Agent {
    id: String!
    name: String!
    type: String!
    version: String!
    permissions: Permissions!
    budget: Budget!
    createdAt: String!
    lastActive: String!
  }
  
  type Permissions {
    canRequestPayments: Boolean!
    maxDailyAmount: Float!
    allowedCategories: [String!]!
    requireApprovalThreshold: Float!
    allowedRecipients: [String!]!
    blockedRecipients: [String!]!
  }
  
  type Policy {
    id: String!
    name: String!
    description: String!
    enabled: Boolean!
    priority: Int!
    rules: [PolicyRule!]!
  }
  
  type PolicyRule {
    id: String!
    name: String!
    description: String!
    condition: String!
    action: String!
  }
  
  type PolicyEvaluation {
    policyId: String!
    decision: String!
    evaluatedRules: [PolicyRule!]!
    violations: [PolicyViolation!]!
  }
  
  type PolicyViolation {
    ruleId: String!
    message: String!
    severity: String!
    data: JSON
  }
  
  type AuditEvent {
    id: String!
    eventType: String!
    actorType: String!
    actorId: String!
    targetType: String
    targetId: String
    metadata: JSON
    timestamp: String!
  }
  
  type AuditEventsResponse {
    events: [AuditEvent!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }
  
  type SystemResponse {
    success: Boolean!
    message: String!
    timestamp: String!
  }
  
  input PaymentInput {
    amount: String!
    currency: String! = "USDC"
    recipient: String!
    reason: String!
    category: String! = "other"
    metadata: JSON
    taskContext: TaskContextInput
    agentId: String
  }
  
  input TaskContextInput {
    taskId: String!
    taskDescription: String!
    taskType: String!
    environment: String! = "development"
    filesModified: [String!]
    commandsExecuted: [String!]
    estimatedCost: Float
  }
  
  input PermissionsInput {
    canRequestPayments: Boolean
    maxDailyAmount: Float
    allowedCategories: [String!]
    requireApprovalThreshold: Float
    allowedRecipients: [String!]
    blockedRecipients: [String!]
  }
  
  scalar JSON
`;

// Resolvers
const resolvers = {
  Query: {
     payments: (_: any, args: any) => {
      const { agentId, status, category, limit = 50, offset = 0 } = args;
      let payments = Array.from(mockData.payments.values());
      
      if (agentId) {
        // In real implementation, filter by agentId
      }
      
      if (status) {
        payments = payments.filter(p => p.status === status);
      }
      
      if (category) {
        // Category filtering would be implemented
      }
      
      const paginated = payments.slice(offset, offset + limit);
      
      return {
        payments: paginated,
        total: payments.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasNext: offset + limit < payments.length,
        hasPrevious: offset > 0,
      };
    },
    
     payment: (_: any, args: any) => {
      return mockData.payments.get(args.id) || null;
    },
    
     budget: (_: any, args: any) => {
      return mockData.budgets.get(args.agentId) || null;
    },
    
     agent: (_: any, args: any) => {
      return mockData.agents.get(args.id) || null;
    },
    
    policies: () => {
      return Array.from(mockData.policies.values());
    },
    
     auditEvents: (_: any, args: any) => {
      const { eventType, actorType, actorId, limit = 100, offset = 0 } = args;
      let events = Array.from(mockData.auditEvents.values());
      
      if (eventType) {
        events = events.filter(e => e.eventType === eventType);
      }
      
      if (actorType) {
        events = events.filter(e => e.actorType === actorType);
      }
      
      if (actorId) {
        events = events.filter(e => e.actorId === actorId);
      }
      
      const paginated = events.slice(offset, offset + limit);
      
      return {
        events: paginated,
        total: events.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      };
    },
  },
  
  Mutation: {
     requestPayment: (_: any, args: any) => {
      const { input } = args;
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payment: PaymentResponse = {
        id: paymentId,
        status: 'pending',
        amount: input.amount,
        currency: input.currency,
        recipient: input.recipient,
        approvalRequired: parseFloat(input.amount) > 100, // Example logic
        policyEvaluations: [],
        createdAt: new Date(),
      };
      
      mockData.payments.set(paymentId, payment);
      
      // Log audit event
      const auditEvent: AuditEvent = {
        id: `audit_${Date.now()}`,
        eventType: 'payment_requested',
        actorType: 'agent',
        actorId: input.agentId || 'unknown',
        targetType: 'payment',
        targetId: paymentId,
        metadata: { amount: input.amount, currency: input.currency, recipient: input.recipient },
        timestamp: new Date(),
      };
      
      mockData.auditEvents.set(auditEvent.id, auditEvent);
      
      return payment;
    },
    
     updateAgentPermissions: (_: any, args: any) => {
      const { agentId, permissions } = args;
      const agent = mockData.agents.get(agentId);
      
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      // Update permissions
      agent.permissions = {
        ...agent.permissions,
        ...permissions,
      };
      
      mockData.agents.set(agentId, agent);
      
      return agent;
    },
    
     emergencyPause: (_: any, args: any) => {
      const { reason, duration } = args;
      
      return {
        success: true,
        message: `System paused${duration ? ` for ${duration} minutes` : ''}. ${reason ? `Reason: ${reason}` : ''}`,
        timestamp: new Date().toISOString(),
      };
    },
  },
  
  JSON: {
     __serialize: (value: any) => value,
     __parseValue: (value: any) => value,
     __parseLiteral: (ast: any) => ast.value,
  },
};

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: { colorize: true }
      } : undefined
    },
    disableRequestLogging: process.env.NODE_ENV === 'test',
  });

  // Register plugins
  await server.register(fastifyCors, {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await server.register(fastifyHelmet);

  // Register WebSocket
  await server.register(fastifyWebsocket);

  // Create Yoga GraphQL server
  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/graphql',
    logging: server.log,
  });

  // Add GraphQL route
  server.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
       const response = await yoga.handleNodeRequest(req, {});
      
      for (const [key, value] of response.headers) {
        reply.header(key, value);
      }
      
      reply.status(response.status);
      reply.send(response.body);
    },
  });

  // WebSocket endpoint
   server.get('/ws', { websocket: true }, (connection, _req) => {
    connection.socket.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Agentic Payment System WebSocket',
      timestamp: new Date().toISOString(),
    }));

    connection.socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        server.log.info('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            connection.socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString(),
            }));
            break;
            
          case 'subscribe':
            connection.socket.send(JSON.stringify({
              type: 'subscription_confirmed',
              subscriptionId: data.subscriptionId,
              eventTypes: data.eventTypes,
              timestamp: new Date().toISOString(),
            }));
            break;
            
          default:
            connection.socket.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type',
              received: data.type,
              timestamp: new Date().toISOString(),
            }));
        }
      } catch (error) {
         server.log.error('WebSocket message error:', error as any);
        connection.socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON message',
          timestamp: new Date().toISOString(),
        }));
      }
    });
  });

  // Health check
   server.get('/health', async (_request, reply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'integration-api',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: 'connected',
        redis: 'connected',
        graphql: 'ready',
        websocket: 'ready',
      },
    };
    
    reply.send(health);
  });

  // System configuration
   server.get('/api/v1/config', async (_request, reply) => {
    const config = getDefaultConfig();
    reply.send({
      success: true,
      data: config,
      timestamp: new Date(),
    });
  });

  // REST API endpoints
  server.post('/api/v1/payments', async (request: FastifyRequest<{ Body: PaymentRequest }>, reply) => {
    try {
      const paymentRequest = request.body;
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payment: PaymentResponse = {
        id: paymentId,
        status: 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        recipient: paymentRequest.recipient,
        approvalRequired: parseFloat(paymentRequest.amount) > 100,
        policyEvaluations: [],
        createdAt: new Date(),
      };
      
      mockData.payments.set(paymentId, payment);
      
      reply.status(201).send({
        success: true,
        data: payment,
        timestamp: new Date(),
      });
    } catch (error) {
       server.log.error('Payment request error:', error as any);
      reply.status(500).send({
        success: false,
        error: {
          code: 'PAYMENT_REQUEST_FAILED',
          message: 'Failed to process payment request',
           details: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date(),
      });
    }
  });

  server.get('/api/v1/payments/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const payment = mockData.payments.get(request.params.id);
    
    if (!payment) {
      reply.status(404).send({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
        },
        timestamp: new Date(),
      });
      return;
    }
    
    reply.send({
      success: true,
      data: payment,
      timestamp: new Date(),
    });
  });

  server.get('/api/v1/payments', async (request, reply) => {
     const { agentId, status, limit = 50, offset = 0 } = request.query as any;
    let payments = Array.from(mockData.payments.values());
    
    if (agentId) {
      // Filter by agentId if implemented
    }
    
    if (status) {
      payments = payments.filter(p => p.status === status);
    }
    
    const paginated = payments.slice(Number(offset), Number(offset) + Number(limit));
    
    reply.send({
      success: true,
      data: {
        items: paginated,
        total: payments.length,
        page: Math.floor(Number(offset) / Number(limit)) + 1,
        pageSize: Number(limit),
        hasNext: Number(offset) + Number(limit) < payments.length,
        hasPrevious: Number(offset) > 0,
      },
      timestamp: new Date(),
    });
  });

  server.get('/api/v1/budgets/:agentId', async (request: FastifyRequest<{ Params: { agentId: string } }>, reply) => {
    const budget = mockData.budgets.get(request.params.agentId);
    
    if (!budget) {
      reply.status(404).send({
        success: false,
        error: {
          code: 'BUDGET_NOT_FOUND',
          message: 'Budget not found for agent',
        },
        timestamp: new Date(),
      });
      return;
    }
    
    reply.send({
      success: true,
      data: budget,
      timestamp: new Date(),
    });
  });

  server.get('/api/v1/agents/:agentId', async (request: FastifyRequest<{ Params: { agentId: string } }>, reply) => {
    const agent = mockData.agents.get(request.params.agentId);
    
    if (!agent) {
      reply.status(404).send({
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found',
        },
        timestamp: new Date(),
      });
      return;
    }
    
    reply.send({
      success: true,
      data: agent,
      timestamp: new Date(),
    });
  });

  // Root endpoint
   server.get('/', async (_request, reply) => {
    reply.send({
      message: 'Agentic Payment System Integration API',
      version: '0.1.0',
      endpoints: {
        graphql: '/graphql',
        websocket: '/ws',
        health: '/health',
        rest: {
          payments: '/api/v1/payments',
          budgets: '/api/v1/budgets/:agentId',
          agents: '/api/v1/agents/:agentId',
          config: '/api/v1/config',
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  return server;
}

// Start server
async function startServer() {
  try {
    // Initialize mock data
    initializeMockData();
    
    const server = await buildServer();
    const port = parseInt(process.env.API_PORT || '3001');
    const host = process.env.API_HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    console.log(`Integration API server running on http://${host}:${port}`);
    console.log(`GraphQL endpoint: http://${host}:${port}/graphql`);
    console.log(`WebSocket endpoint: ws://${host}:${port}/ws`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('Shutting down server...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export { buildServer, startServer };