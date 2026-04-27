# Agentic Payment System - Integration Layer

The integration layer provides multiple interfaces for AI Agents and external applications to interact with the Agentic Payment System.

## Components

### 1. MCP Server (Model Context Protocol)
Exposes payment functionality as tools for AI Agents (Claude Code, OpenClaw, Codex, Manus).

**Key Tools:**
- `request_payment` - Request payment permission and execute payment
- `check_budget` - Check remaining budget and limits
- `get_payment_status` - Get status of specific payment
- `list_payments` - List recent payments with filtering
- `update_permissions` - Update Agent permissions and restrictions
- `emergency_pause` - Immediately pause all Agent activities

### 2. CLI Tool
Command-line interface for automation, scripting, and manual management.

**Key Commands:**
- `agent-pay init` - Initialize wallet and configuration
- `agent-pay authorize` - Authorize Agent with budget and permissions
- `agent-pay request` - Manually request payment
- `agent-pay audit` - View audit logs with filtering
- `agent-pay policy` - Manage security policies
- `agent-pay status` - Check system status and balances
- `agent-pay pause` - Emergency pause all activities
- `agent-pay recover` - Wallet recovery operations

### 3. TypeScript SDK
Full-featured SDK for custom integrations, third-party applications, and advanced use cases.

**Core Classes:**
- `AgentPay` - Main SDK class with high-level API
- `PaymentRequest` - Payment request builder with fluent interface
- `PolicyManager` - Policy configuration and management
- `AuditClient` - Audit log querying and export
- `WebSocketClient` - Real-time updates and notifications

### 4. REST/GraphQL API
Standard web APIs for integration with external applications, dashboards, and mobile apps.

**Key Features:**
- RESTful endpoints with proper HTTP verbs
- Full GraphQL schema for flexible queries
- OpenAPI 3.0 auto-generated documentation
- Authentication with JWT tokens and API keys
- Rate limiting and caching

### 5. WebSocket API
Real-time updates for payment status, policy changes, and system events.

**Key Events:**
- `payment:created` - New payment requested
- `payment:status_changed` - Payment status updated
- `policy:updated` - Policy changed
- `budget:warning` - Budget threshold reached
- `emergency:triggered` - Emergency pause activated

## Architecture

```
integration/
├── mcp-server/     # MCP Server for AI Agents
├── cli/            # Command-line interface
├── sdk/            # TypeScript SDK
├── api/            # REST/GraphQL API
├── websocket/      # WebSocket API
└── shared/         # Shared types and utilities
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for database)
- PostgreSQL >= 14.0
- Redis >= 7.0

### Quick Start

1. **Clone and setup:**
```bash
git clone <repository-url>
cd agentic-payment-system
npm install
bash scripts/setup-integration.sh
```

2. **Start services:**
```bash
npm run dev:integration
```

3. **Test the CLI:**
```bash
cd integration/cli
npm run build
node dist/cli.js --help
```

4. **Use the SDK:**
```typescript
import { AgentPay } from '@agent-pay/sdk';

const agentPay = new AgentPay({
  apiEndpoint: 'http://localhost:3001',
  apiKey: 'your-api-key',
});

const payment = await agentPay.requestPayment({
  amount: '1.5',
  currency: 'USDC',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8',
  reason: 'API usage',
  category: 'api',
});
```

## Development

### Building All Components
```bash
npm run build:integration
```

### Running Tests
```bash
npm run test:integration
```

### Deploying
```bash
npm run deploy:integration
```

## Configuration

Environment variables are configured in `.env.integration.example`. Copy to `.env` and customize:

```bash
cp .env.integration.example .env
```

## API Documentation

- **GraphQL Playground:** `http://localhost:3001/graphql`
- **REST API Docs:** `http://localhost:3001/api-docs`
- **OpenAPI Spec:** `http://localhost:3001/openapi.json`

## Examples

Check the `examples/` directory for:
- MCP Server integration with Claude Code
- CLI automation scripts
- SDK usage in React applications
- WebSocket client implementations

## Monitoring

- **Health checks:** `http://localhost:3001/health`
- **Metrics:** `http://localhost:9090` (Prometheus)
- **Dashboards:** `http://localhost:3003` (Grafana)

## Support

For issues and questions:
1. Check the troubleshooting guide in `docs/integration/troubleshooting.md`
2. Review API documentation
3. Open an issue on GitHub

## License

MIT License - see LICENSE file for details.