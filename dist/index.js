"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = require("dotenv");
const db_1 = require("./db");
const payments_1 = __importDefault(require("./api/routes/payments"));
const audit_events_1 = __importDefault(require("./api/routes/audit-events"));
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
// Health check endpoint
app.get('/health', async (_req, res) => {
    const dbHealthy = await (0, db_1.testConnection)();
    if (dbHealthy) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            service: 'audit-system'
        });
    }
    else {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            service: 'audit-system'
        });
    }
});
// API routes
app.use('/api/v1/payments', payments_1.default);
app.use('/api/v1/audit-events', audit_events_1.default);
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
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Audit System API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=index.js.map