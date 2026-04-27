# Integration Specifications

## MCP Server Design

### Protocol Compliance
- **MCP Version**: Model Context Protocol latest version
- **Transport**: SSE (Server-Sent Events) for tool calls and resources
- **Authentication**: Bearer tokens with automatic rotation
- **Error Handling**: Structured error responses with retry guidance

### Tool Definitions

#### 1. request_payment
```typescript
{
  name: "request_payment",
  description: "Request payment permission and execute payment for AI Agent tasks",
  inputSchema: {
    type: "object",
    required: ["amount", "currency", "recipient", "reason"],
    properties: {
      amount: {
        type: "string",
        description: "Payment amount (e.g., '1.5', '100')"
      },
      currency: {
        type: "string",
        description: "Currency/token symbol (e.g., 'USDC', 'ETH', 'MON')",
        enum: ["USDC", "ETH", "MON", "USDT", "DAI"]
      },
      recipient: {
        type: "string",
        description: "Recipient address (0x...) or ENS name"
      },
      reason: {
        type: "string",
        description: "Detailed explanation of payment purpose"
      },
      taskContext: {
        type: "string",
        description: "Task ID or context for audit purposes"
      },
      urgency: {
        type: "string",
        description: "Payment urgency level",
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
      },
      category: {
        type: "string",
        description: "Payment category for policy matching",
        enum: ["api", "compute", "storage", "data", "service", "other"]
      }
    }
  }
}
```

#### 2. check_budget
```typescript
{
  name: "check_budget",
  description: "Check remaining budget and payment limits for current context",
  inputSchema: {
    type: "object",
    properties: {
      agentId: {
        type: "string",
        description: "Optional specific Agent ID to check"
      },
      category: {
        type: "string",
        description: "Optional category filter"
      }
    }
  }
}
```

#### 3. get_payment_status
```typescript
{
  name: "get_payment_status",
  description: "Get status of a specific payment or transaction",
  inputSchema: {
    type: "object",
    required: ["transactionId"],
    properties: {
      transactionId: {
        type: "string",
        description: "Transaction hash or payment ID"
      }
    }
  }
}
```

#### 4. list_payments
```typescript
{
  name: "list_payments",
  description: "List recent payments with filtering options",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of payments to return",
        default: 50,
        maximum: 1000
      },
      offset: {
        type: "number",
        description: "Pagination offset",
        default: 0
      },
      status: {
        type: "string",
        description: "Filter by payment status",
        enum: ["pending", "approved", "rejected", "executed", "failed"]
      },
      startDate: {
        type: "string",
        description: "Start date (ISO 8601 format)"
      },
      endDate: {
        type: "string",
        description: "End date (ISO 8601 format)"
      }
    }
  }
}
```

#### 5. update_permissions
```typescript
{
  name: "update_permissions",
  description: "Update Agent permissions and restrictions",
  inputSchema: {
    type: "object",
    required: ["agentId"],
    properties: {
      agentId: {
        type: "string",
        description: "Agent identifier"
      },
      dailyLimit: {
        type: "string",
        description: "New daily spending limit (e.g., '100 USDC')"
      },
      perTransactionLimit: {
        type: "string",
        description: "New per-transaction limit"
      },
      allowedCategories: {
        type: "array",
        items: { type: "string" },
        description: "Array of allowed payment categories"
      },
      expiry: {
        type: "string",
        description: "Permission expiry timestamp (ISO 8601)"
      }
    }
  }
}
```

### Resource Definitions

#### 1. payment_policies
```typescript
{
  name: "payment_policies",
  description: "Current active payment policies",
  mimeType: "application/json"
}
```

#### 2. audit_logs
```typescript
{
  name: "audit_logs",
  description: "Recent audit log entries",
  mimeType: "application/json"
}
```

#### 3. budget_status
```typescript
{
  name: "budget_status",
  description: "Current budget utilization and limits",
  mimeType: "application/json"
}
```

### Server Configuration
```typescript
interface MCPServerConfig {
  port: number;                    // Server port (default: 3000)
  host: string;                   // Server hostname (default: 'localhost')
  authToken: string;              // Required authentication token
  walletAddress: string;          // Default wallet address
  network: 'testnet' | 'mainnet'; // Monad network
  policyRefreshInterval: number;  // Policy refresh interval in ms
  cacheTTL: number;               // Cache time-to-live in seconds
}
```

## CLI Tool Specification

### Command Structure
```
agent-pay [global-options] <command> [command-options]
```

### Global Options
- `--config, -c`: Configuration file path
- `--network, -n`: Network (testnet/mainnet)
- `--verbose, -v`: Verbose output
- `--silent, -s`: Silent mode (no output)
- `--help, -h`: Show help

### Commands

#### 1. init
```bash
agent-pay init [options]
```
**Options**:
- `--wallet-address`: Existing wallet address to import
- `--create-new`: Create new wallet
- `--recovery-phrase`: Recovery phrase for existing wallet
- `--output-format`: Output format (json, yaml, text)

**Example**:
```bash
agent-pay init --create-new --network monad-testnet
```

#### 2. authorize
```bash
agent-pay authorize [options]
```
**Options**:
- `--agent-id`: Agent identifier (required)
- `--budget`: Budget allocation (e.g., "100 USDC")
- `--expiry`: Expiry time (e.g., "24h", "7d", "2024-12-31")
- `--per-transaction-limit`: Per transaction limit
- `--allowed-categories`: Comma-separated allowed categories
- `--require-approval-above`: Amount requiring manual approval

**Example**:
```bash
agent-pay authorize --agent-id "claude-code" \
  --budget "50 USDC" \
  --expiry "7d" \
  --per-transaction-limit "10 USDC" \
  --allowed-categories "api,compute,storage"
```

#### 3. audit
```bash
agent-pay audit [options]
```
**Options**:
- `--task-id`: Filter by specific task ID
- `--agent-id`: Filter by Agent ID
- `--start-date`: Start date for filtering
- `--end-date`: End date for filtering
- `--status`: Filter by status
- `--output-format`: Output format (json, csv, table)
- `--export`: Export to file

**Example**:
```bash
agent-pay audit --task-id "task-123" --output-format json
agent-pay audit --start-date "2024-01-01" --export "audit.csv"
```

#### 4. pause
```bash
agent-pay pause [options]
```
**Options**:
- `--all`: Pause all Agents
- `--agent-id`: Pause specific Agent
- `--duration`: Pause duration (e.g., "1h", "until-manual")

**Example**:
```bash
agent-pay pause --all
agent-pay pause --agent-id "claude-code" --duration "2h"
```

#### 5. policy
```bash
agent-pay policy <subcommand> [options]
```
**Subcommands**:
- `list`: List all policies
- `add`: Add new policy
- `update`: Update existing policy
- `remove`: Remove policy
- `test`: Test policy against transaction

**Example**:
```bash
agent-pay policy add --name "api-budget" \
  --condition "category == 'api'" \
  --action "limit 100 USDC daily"
```

#### 6. status
```bash
agent-pay status [options]
```
**Options**:
- `--detailed`: Show detailed status information
- `--json`: Output in JSON format

**Example**:
```bash
agent-pay status --detailed
```

### Interactive Mode
```bash
agent-pay interactive
```
Launches interactive shell with autocomplete, command history, and contextual help.

## TypeScript/JavaScript SDK

### Installation
```bash
npm install @agent-pay/sdk
# or
yarn add @agent-pay/sdk
# or
pnpm add @agent-pay/sdk
```

### Core Classes

#### 1. AgentPay (Main Class)
```typescript
class AgentPay {
  // Constructor
  constructor(config: AgentPayConfig);
  
  // Core Methods
  requestPayment(request: PaymentRequest): Promise<PaymentResponse>;
  checkBudget(options?: BudgetCheckOptions): Promise<BudgetStatus>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  listPayments(options?: ListPaymentsOptions): Promise<Payment[]>;
  updatePermissions(options: UpdatePermissionsOptions): Promise<void>;
  
  // Utility Methods
  getWalletAddress(): string;
  getNetwork(): string;
  disconnect(): void;
  
  // Event Emitter
  on(event: 'payment_approved', listener: (payment: Payment) => void): this;
  on(event: 'payment_rejected', listener: (payment: Payment) => void): this;
  on(event: 'policy_updated', listener: (policies: Policy[]) => void): this;
}

interface AgentPayConfig {
  walletAddress: string;
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
  apiKey?: string;
  autoConnect?: boolean;
}

interface PaymentRequest {
  amount: string;
  currency: string;
  recipient: string;
  reason: string;
  taskContext?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  category?: PaymentCategory;
}

interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  approvalRequired: boolean;
  estimatedGas?: string;
  estimatedCost?: string;
}
```

#### 2. PolicyManager
```typescript
class PolicyManager {
  // Policy Management
  addPolicy(policy: Policy): Promise<void>;
  updatePolicy(policyId: string, updates: Partial<Policy>): Promise<void>;
  removePolicy(policyId: string): Promise<void>;
  listPolicies(): Promise<Policy[]>;
  testPolicy(transaction: Partial<PaymentRequest>): Promise<PolicyTestResult>;
  
  // Template Management
  getTemplates(): Promise<PolicyTemplate[]>;
  createFromTemplate(templateId: string, overrides?: Partial<Policy>): Promise<Policy>;
}

interface Policy {
  id: string;
  name: string;
  description?: string;
  condition: string;  // DSL for conditions
  action: 'allow' | 'deny' | 'require_approval';
  parameters?: Record<string, any>;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. AuditClient
```typescript
class AuditClient {
  // Query Methods
  queryPayments(options: QueryOptions): Promise<PaymentRecord[]>;
  getPayment(transactionId: string): Promise<PaymentRecord | null>;
  exportPayments(options: ExportOptions): Promise<Buffer>;
  
  // Analytics
  getSpendingAnalytics(options: AnalyticsOptions): Promise<AnalyticsData>;
  getAgentPerformance(agentId: string): Promise<AgentPerformance>;
  getPolicyEffectiveness(): Promise<PolicyEffectiveness>;
}

interface PaymentRecord {
  id: string;
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: string;
  blockNumber: number;
  timestamp: Date;
  gasUsed: string;
  gasPrice: string;
  taskId?: string;
  agentId?: string;
  reason?: string;
  category?: string;
  policiesEvaluated: string[];
  manualApproval: boolean;
  approvedBy?: string;
}
```

### Usage Examples

#### Basic Payment Request
```typescript
import { AgentPay } from '@agent-pay/sdk';

const agentPay = new AgentPay({
  walletAddress: '0x1234...',
  network: 'monad-testnet',
  apiKey: process.env.AGENT_PAY_API_KEY
});

const result = await agentPay.requestPayment({
  amount: '1.5',
  currency: 'USDC',
  recipient: '0x5678...',
  reason: 'Payment for API usage in data analysis task',
  taskContext: 'Data analysis task ID: 123',
  urgency: 'medium',
  category: 'api'
});

console.log(`Payment ${result.status}, transaction: ${result.transactionId}`);
```

#### Policy Management
```typescript
import { PolicyManager } from '@agent-pay/sdk';

const policyManager = new PolicyManager();

// Add a new policy
await policyManager.addPolicy({
  name: 'api-budget-limit',
  description: 'Limit API-related spending to $100 daily',
  condition: "category == 'api'",
  action: 'require_approval',
  parameters: {
    dailyLimit: '100 USDC'
  },
  priority: 1,
  enabled: true
});

// Test a transaction against policies
const testResult = await policyManager.testPolicy({
  amount: '50',
  currency: 'USDC',
  category: 'api'
});
```

#### Audit Query
```typescript
import { AuditClient } from '@agent-pay/sdk';

const auditClient = new AuditClient();

// Query recent payments
const payments = await auditClient.queryPayments({
  limit: 10,
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Export to CSV
const csvData = await auditClient.exportPayments({
  format: 'csv',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Event Handling
```typescript
agentPay.on('payment_approved', (payment) => {
  console.log(`Payment approved: ${payment.transactionId}`);
  // Execute the approved payment
});

agentPay.on('payment_rejected', (payment) => {
  console.log(`Payment rejected: ${payment.reason}`);
  // Notify user or try alternative payment method
});

agentPay.on('policy_updated', (policies) => {
  console.log(`Policies updated: ${policies.length} active policies`);
});
```

## WebSocket API (Real-time Updates)

### Connection
```javascript
const ws = new WebSocket('wss://api.agent-pay.monad/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-auth-token'
  }));
};
```

### Message Types

#### 1. Payment Status Updates
```javascript
{
  type: 'payment_status',
  data: {
    transactionId: '0x...',
    status: 'executed',
    blockNumber: 1234567,
    gasUsed: '21000',
    timestamp: '2024-01-01T12:00:00Z'
  }
}
```

#### 2. Policy Updates
```javascript
{
  type: 'policy_update',
  data: {
    policyId: 'policy-123',
    action: 'added' | 'updated' | 'removed',
    policy: Policy
  }
}
```

#### 3. Budget Alerts
```javascript
{
  type: 'budget_alert',
  data: {
    agentId: 'claude-code',
    category: 'api',
    spent: '85 USDC',
    limit: '100 USDC',
    percentage: 85
  }
}
```

### Subscription Model
```javascript
// Subscribe to payment updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'payments',
  filters: { agentId: 'claude-code' }
}));

// Subscribe to policy updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'policies'
}));
```

## REST API Endpoints

### Base URL
```
https://api.agent-pay.monad/v1
```

### Authentication
- **Header**: `Authorization: Bearer <token>`
- **Token Rotation**: Automatic via refresh tokens

### Key Endpoints

#### 1. POST /payments/request
Request a new payment

#### 2. GET /payments/{id}
Get payment status

#### 3. GET /payments
List payments with filtering

#### 4. GET /budget
Get budget status

#### 5. PUT /agents/{id}/permissions
Update Agent permissions

#### 6. GET /audit/export
Export audit data

#### 7. POST /policies/test
Test policy against transaction

### Rate Limiting
- **Tier 1 (Free)**: 100 requests/minute
- **Tier 2 (Pro)**: 1000 requests/minute
- **Tier 3 (Enterprise)**: Custom limits

## Integration Examples

### Claude Code Integration
```typescript
// Example Claude Code integration
import { MCPClient } from '@agent-pay/mcp-client';

const client = new MCPClient({
  serverUrl: 'http://localhost:3000',
  authToken: process.env.MCP_TOKEN
});

// Use in Claude Code tools
const tools = await client.getTools();
```

### Node.js Automation Script
```javascript
const { exec } = require('child_process');

// Use CLI tool in automation
exec('agent-pay authorize --agent-id "automation-bot" --budget "1000 USDC"', 
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`Authorization successful: ${stdout}`);
  });
```

### React Component Integration
```typescript
import { useAgentPay } from '@agent-pay/react-hooks';

function PaymentRequestComponent() {
  const { requestPayment, loading, error } = useAgentPay();
  
  const handlePayment = async () => {
    const result = await requestPayment({
      amount: '10',
      currency: 'USDC',
      recipient: '0x...',
      reason: 'API usage for data processing'
    });
    
    if (result.status === 'approved') {
      // Show success message
    }
  };
  
  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Request Payment'}
    </button>
  );
}
```

---

*Part of Agentic Payment System Module Documentation*