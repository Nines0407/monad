import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { testConnection } from './db';
import paymentRoutes from './api/routes/payments';
import auditEventRoutes from './api/routes/audit-events';
import policyDecisionRoutes from './api/routes/policy-decisions';
import apolloServer from './api/graphql/server';

// Load environment variables
config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealthy = await testConnection();
  
  if (dbHealthy) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'audit-system'
    });
  } else {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      service: 'audit-system'
    });
  }
});

// API routes
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/audit-events', auditEventRoutes);
app.use('/api/v1/policy-decisions', policyDecisionRoutes);

// GraphQL endpoint (if Apollo Server is available)
// Start Apollo Server and apply middleware
(async () => {
  try {
    await apolloServer.start();
    // Type assertion to work around type incompatibility
    apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });
    console.log(`GraphQL API available at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  } catch (error) {
    console.error('Failed to start GraphQL server:', error);
  }
})();

app.get('/', (_req, res) => {
  res.json({
    message: 'Audit System API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      payments: '/api/v1/payments',
      auditEvents: '/api/v1/audit-events',
      policyDecisions: '/api/v1/policy-decisions'
    }
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Audit System API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Host: 0.0.0.0`);
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});