# MCP Server API Documentation

## Overview

The MCP (Model Context Protocol) Server provides a standardized interface for AI Agents (Claude Code, OpenClaw, Codex, Manus) to interact with the Agentic Payment System. It exposes payment functionality as tools that AI Agents can call with proper authentication, validation, and audit logging.

## Quick Start

### Connecting to the MCP Server

```bash
# Start the MCP Server
cd integration/mcp-server
npm run build
npm start

# Connect from AI Agent (example for Claude Code)
# Add to your MCP configuration:
{
  "mcpServers": {
    "agent-pay": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key",
        "MONAD_RPC_URL": "https://testnet.monad.xyz"
      }
    }
  }
}
```

### Basic Usage Example

```javascript
// Example of how an AI Agent would use the MCP tools
const payment = await mcp.request_payment({
  amount: "1.5",
  currency: "USDC",
  recipient: "0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8",
  reason: "API call credits for AI model inference",
  category: "api",
  taskContext: {
    taskId: "task_123",
    taskDescription: "Generate API documentation",
    taskType: "documentation",
    environment: "production",
    filesModified: ["docs/api.md"],
    commandsExecuted: ["npm run docs"],
    estimatedCost: 1.5
  }
});
```

## Available Tools

### 1. `request_payment`

Request payment permission and execute payment. This tool evaluates policies, checks budget, and either executes payment immediately or requests manual approval based on configured rules.

#### Input Schema

```typescript
{
  amount: string;           // Amount as string (e.g., "1.5")
  currency: string;        // Currency code (default: "USDC")
  recipient: string;       // Ethereum address (0x...)
  reason: string;         // Payment reason (1-500 chars)
  category: "api" | "compute" | "storage" | "data" | "service" | "other" | "ai_agent";
  metadata?: Record<string, any>;  // Additional metadata
  taskContext?: {
    taskId: string;
    taskDescription: string;
    taskType: string;
    environment: "development" | "staging" | "production";
    filesModified?: string[];
    commandsExecuted?: string[];
    estimatedCost?: number;
  };
}
```

#### Example Request

```json
{
  "amount": "2.5",
  "currency": "USDC",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8",
  "reason": "Compute credits for ML model training",
  "category": "compute",
  "taskContext": {
    "taskId": "ml_training_456",
    "taskDescription": "Train GPT-4 fine-tuned model",
    "taskType": "model_training",
    "environment": "production",
    "filesModified": ["models/gpt4-finetune.py"],
    "commandsExecuted": ["python train.py --epochs=10"],
    "estimatedCost": 2.5
  }
}
```

#### Response Format

```typescript
{
  id: string;             // Payment ID (e.g., "pay_1700000000_abc123")
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  amount: string;
  currency: string;
  recipient: string;
  approvalRequired: boolean;
  policyEvaluations: Array<{
    policyId: string;
    decision: "allow" | "deny" | "require_approval";
    evaluatedRules: Array<{
      id: string;
      name: string;
      description: string;
      condition: string;
      action: "allow" | "deny" | "require_approval";
    }>;
    violations: any[];
  }>;
  transactionHash?: string;   // Only if executed
  approvalId?: string;        // Only if approval required
  createdAt: Date;
}
```

### 2. `check_budget`

Check remaining budget and limits for an agent. Returns detailed budget information including daily limits, spent amounts, and reset times.

#### Input Schema

```typescript
{
  agentId?: string;  // Optional, defaults to current agent
}
```

#### Example Request

```json
{
  "agentId": "agent_claude_code_123"
}
```

#### Response Format

```typescript
{
  total: number;           // Total budget allocated
  spent: number;          // Amount spent so far
  remaining: number;      // Remaining budget
  dailyLimit: number;     // Daily spending limit
  dailySpent: number;     // Amount spent today
  currency: string;       // Currency code
  resetAt: Date;          // When daily limit resets
}
```

### 3. `get_payment_status`

Get status of specific payment by ID. Returns detailed payment information including transaction hash, policy evaluations, and audit trail.

#### Input Schema

```typescript
{
  paymentId: string;  // Payment ID to query
}
```

#### Example Request

```json
{
  "paymentId": "pay_1700000000_abc123"
}
```

#### Response Format

Same as `request_payment` response, but with complete status information.

### 4. `list_payments`

List recent payments with filtering options. Supports filtering by agent, status, category, and time range.

#### Input Schema

```typescript
{
  agentId?: string;
  status?: "pending" | "approved" | "rejected" | "executed" | "failed" | "cancelled";
  category?: "api" | "compute" | "storage" | "data" | "service" | "other" | "ai_agent";
  limit?: number;   // 1-100, default 50
  offset?: number;  // Pagination offset, default 0
}
```

#### Example Request

```json
{
  "agentId": "agent_claude_code_123",
  "status": "executed",
  "category": "api",
  "limit": 10,
  "offset": 0
}
```

#### Response Format

```typescript
{
  payments: Array<PaymentResponse>;  // Array of payment objects
  total: number;                     // Total matching payments
  page: number;                      // Current page number
  pageSize: number;                  // Items per page
}
```

### 5. `update_permissions`

Update Agent permissions and restrictions. Requires admin privileges. Changes are logged in audit trail.

#### Input Schema

```typescript
{
  agentId: string;
  permissions: {
    canRequestPayments?: boolean;
    maxDailyAmount?: number;
    allowedCategories?: Array<"api" | "compute" | "storage" | "data" | "service" | "other" | "ai_agent">;
    requireApprovalThreshold?: number;
    allowedRecipients?: string[];
    blockedRecipients?: string[];
  };
}
```

#### Example Request

```json
{
  "agentId": "agent_claude_code_123",
  "permissions": {
    "canRequestPayments": true,
    "maxDailyAmount": 1000,
    "allowedCategories": ["api", "compute"],
    "requireApprovalThreshold": 100,
    "allowedRecipients": ["0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8"],
    "blockedRecipients": ["0x0000000000000000000000000000000000000000"]
  }
}
```

#### Response Format

```typescript
{
  success: boolean;
  message: string;
  updatedAt: Date;
}
```

### 6. `emergency_pause`

Immediately pause all Agent activities. This is a safety measure that prevents any further payment requests until manually resumed.

#### Input Schema

```typescript
{
  reason?: string;    // Reason for pause
  duration?: number;  // Duration in seconds (optional)
}
```

#### Example Request

```json
{
  "reason": "Suspicious activity detected",
  "duration": 3600  // Pause for 1 hour
}
```

#### Response Format

```typescript
{
  success: boolean;
  message: string;
  pausedUntil?: Date;  // If duration specified
}
```

## Authentication & Security

### API Keys

The MCP Server requires API keys for authentication:

```bash
# Set API key when starting server
API_KEY=your-secret-key node dist/index.js

# Or via environment file
MCP_API_KEY=your-secret-key
MCP_ALLOWED_AGENTS=agent_claude_code_123,agent_openclaw_456
```

### Rate Limiting

- **Default limits**: 100 requests per minute per agent
- **Burst allowance**: 20 requests in 10 seconds
- **Global limits**: 1000 requests per minute total

### Audit Logging

All tool invocations are logged with:
- Timestamp and unique request ID
- Agent identity and session context
- Tool name and input parameters
- Policy evaluation results
- Outcome (success/failure/error)
- Transaction hash (if applicable)

## Error Handling

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_INPUT` | Input validation failed | Check input schema and fix validation errors |
| `POLICY_VIOLATION` | Payment request violates policies | Review policy rules and adjust request |
| `BUDGET_EXCEEDED` | Agent has exceeded budget | Wait for budget reset or request increase |
| `AUTH_FAILED` | Authentication failed | Check API key and agent permissions |
| `RATE_LIMITED` | Rate limit exceeded | Wait before making more requests |
| `SYSTEM_PAUSED` | System is in emergency pause | Wait for admin to resume system |

### Error Response Format

```json
{
  "error": {
    "code": "POLICY_VIOLATION",
    "message": "Payment amount exceeds daily limit",
    "details": {
      "policyId": "daily_limit_policy",
      "violations": [
        {
          "rule": "daily_limit",
          "actual": 1050,
          "limit": 1000
        }
      ]
    },
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Integration Examples

### Claude Code Integration

```javascript
// Example Claude Code MCP configuration
const mcpConfig = {
  servers: {
    "agent-pay": {
      command: "node",
      args: ["./integration/mcp-server/dist/index.js"],
      env: {
        "API_KEY": process.env.AGENT_PAY_API_KEY,
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
};

// Usage in Claude Code
async function requestPayment(amount, recipient, reason) {
  const result = await mcp.callTool("agent-pay", "request_payment", {
    amount: amount.toString(),
    currency: "USDC",
    recipient,
    reason,
    category: "ai_agent",
    taskContext: {
      taskId: generateTaskId(),
      taskDescription: "AI Agent autonomous payment",
      taskType: "agent_operation",
      environment: "production"
    }
  });
  
  return JSON.parse(result.content[0].text);
}
```

### OpenClaw Integration

```python
# Example OpenClaw Python integration
import subprocess
import json

class AgentPayMCP:
    def __init__(self, api_key):
        self.api_key = api_key
        self.process = None
        
    def start_server(self):
        env = os.environ.copy()
        env["API_KEY"] = self.api_key
        self.process = subprocess.Popen(
            ["node", "./integration/mcp-server/dist/index.js"],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
    def call_tool(self, tool_name, args):
        # Implementation depends on OpenClaw's MCP client
        pass
```

## Performance & Monitoring

### Key Metrics

- **Tool latency**: < 100ms for simple tools, < 500ms for payment requests
- **Concurrent connections**: Supports 100+ simultaneous agent connections
- **Throughput**: 1000+ tool invocations per minute
- **Uptime**: 99.9% target with automatic failover

### Health Checks

```bash
# Check MCP Server health
curl http://localhost:3000/health

# Response:
{
  "status": "healthy",
  "version": "0.1.0",
  "uptime": "5d 3h 12m",
  "connections": 42,
  "tools": {
    "request_payment": { "calls": 1250, "errors": 12 },
    "check_budget": { "calls": 3250, "errors": 2 }
  }
}
```

## Deployment

### Local Development

```bash
# Clone and setup
git clone <repository>
cd agentic-payment-system

# Install dependencies
npm install

# Build MCP Server
cd integration/mcp-server
npm run build

# Start server
npm start
```

### Production Deployment

```dockerfile
# Dockerfile for MCP Server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "dist/index.js"]
```

```bash
# Docker Compose example
version: '3.8'
services:
  mcp-server:
    image: agentic/mcp-server:latest
    ports:
      - "3000:3000"
    environment:
      - API_KEY=${MCP_API_KEY}
      - MONAD_RPC_URL=${MONAD_RPC_URL}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure MCP Server is running and listening on correct port
2. **Authentication failed**: Verify API key matches between client and server
3. **Tool not found**: Check tool name spelling and ensure server is properly initialized
4. **Input validation errors**: Review input schema and ensure all required fields are provided

### Debug Mode

```bash
# Start server in debug mode
DEBUG=true node dist/index.js

# Enable verbose logging
LOG_LEVEL=debug node dist/index.js
```

### Logs Location

- **Console logs**: Standard output/error
- **File logs**: `./logs/mcp-server.log` (rotated daily)
- **Audit logs**: Database table `audit_events`

## Version History

- **v0.1.0** (2024-01-01): Initial release with all core tools
- **v0.2.0** (2024-01-15): Added batch operations, improved error handling
- **v0.3.0** (2024-02-01): Enhanced security, rate limiting, audit logging

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review API documentation in this file
3. Open an issue on GitHub repository
4. Contact support@agentic-payments.com

---

*Document Version: 1.0.0*  
*Last Updated: 2024-01-01*  
*MCP Protocol Version: 0.6.0*  
*Compatible Agents: Claude Code, OpenClaw, Codex, Manus*