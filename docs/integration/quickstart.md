# Quick Start Guide

This guide will help you get started with the Agentic Payment System integration layer in 5 minutes.

## Prerequisites

Ensure you have the following installed:

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/agentic-payment-system/agentic-payment-system.git
cd agentic-payment-system

# Install dependencies
npm install

# Setup integration layer environment
bash scripts/setup-integration.sh
```

## Step 2: Configure Environment

```bash
# Copy environment configuration
cp .env.integration.example .env

# Edit .env file with your settings
# (Optional) Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Start Services

```bash
# Start all integration services
npm run dev:integration

# Or start services individually:
# npm run dev:mcp      # MCP Server
# npm run dev:api      # REST/GraphQL API
# npm run dev:ws       # WebSocket API
```

You should see output indicating all services are running:
- MCP Server: http://localhost:3000
- REST/GraphQL API: http://localhost:3001
- WebSocket API: ws://localhost:3002

## Step 4: Test the CLI

```bash
# Build the CLI tool
cd integration/cli
npm run build

# Initialize configuration
node dist/cli.js init --env development

# Authorize an agent
node dist/cli.js authorize \
  --agent-id claude-001 \
  --agent-name "Claude Code Assistant" \
  --budget 5000 \
  --currency USDC \
  --daily-limit 100

# Check status
node dist/cli.js status --verbose
```

## Step 5: Use the TypeScript SDK

Create a new file `test-sdk.js`:

```javascript
const { AgentPay } = require('@agent-pay/sdk');

async function testSDK() {
  // Initialize SDK
  const agentPay = new AgentPay({
    apiEndpoint: 'http://localhost:3001',
    agentId: 'claude-001',
    debug: true,
  });

  try {
    // Check budget
    const budget = await agentPay.checkBudget('claude-001');
    console.log('Budget:', budget);

    // Create a payment request
    const payment = await agentPay.requestPayment({
      amount: '0.5',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8',
      reason: 'Test payment',
      category: 'api',
    });

    console.log('Payment created:', payment);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSDK();
```

Run it:
```bash
cd integration/sdk
npm run build
node test-sdk.js
```

## Step 6: Connect an AI Agent (Claude Code)

Create an MCP configuration file `mcp-config.json`:

```json
{
  "mcpServers": {
    "agentic-payment": {
      "command": "node",
      "args": ["/path/to/agentic-payment-system/integration/mcp-server/dist/index.js"],
      "env": {
        "MCP_SERVER_PORT": "3000",
        "API_ENDPOINT": "http://localhost:3001"
      }
    }
  }
}
```

Configure your AI Agent to use this MCP server. The agent will now have access to payment tools.

## Step 7: Test WebSocket Connections

Create a WebSocket test script `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
</head>
<body>
  <h1>Agentic Payment System WebSocket Test</h1>
  <div id="messages"></div>
  
  <script>
    const ws = new WebSocket('ws://localhost:3002/ws');
    const messages = document.getElementById('messages');
    
    ws.onopen = () => {
      addMessage('Connected to WebSocket server');
      
      // Subscribe to payment events
      ws.send(JSON.stringify({
        type: 'subscribe',
        subscriptionId: 'test-subscription',
        eventTypes: ['payment:created', 'payment:status_changed'],
        timestamp: new Date().toISOString()
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addMessage(`Received: ${data.type} - ${JSON.stringify(data)}`);
    };
    
    ws.onerror = (error) => {
      addMessage(`Error: ${error}`);
    };
    
    ws.onclose = () => {
      addMessage('Disconnected');
    };
    
    function addMessage(text) {
      const div = document.createElement('div');
      div.textContent = text;
      messages.appendChild(div);
    }
  </script>
</body>
</html>
```

Open this file in a browser and watch for WebSocket messages.

## Step 8: Explore GraphQL API

Open your browser to:
```
http://localhost:3001/graphql
```

Try this query in the GraphQL playground:

```graphql
query {
  payments(limit: 10) {
    payments {
      id
      amount
      currency
      status
      createdAt
    }
    total
    page
    pageSize
  }
  
  budget(agentId: "claude-001") {
    total
    spent
    remaining
    dailyLimit
    dailySpent
    currency
  }
}
```

## Step 9: Run Health Checks

```bash
# Check all services
npm run health-check:integration

# Individual checks
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/config
```

## Next Steps

1. **Explore the API documentation** at `http://localhost:3001/api-docs`
2. **Review example integrations** in the `examples/` directory
3. **Configure security policies** using the CLI or SDK
4. **Set up monitoring** with the provided Prometheus and Grafana configuration
5. **Deploy to production** following the deployment guide

## Troubleshooting

### Common Issues

1. **Services won't start:** Check if ports 3000-3002 are already in use
2. **Database connection errors:** Ensure PostgreSQL and Redis are running
3. **Authentication errors:** Verify your API keys and JWT configuration
4. **WebSocket connection issues:** Check CORS settings and firewall rules

### Getting Help

- Check the logs: `tail -f logs/integration.log`
- Review the troubleshooting guide
- Open an issue on GitHub with detailed error messages

## What's Next?

Now that you have the integration layer running, you can:

1. Integrate with your AI Agent workflow
2. Build custom dashboards using the SDK
3. Set up automated payment approval workflows
4. Implement real-time monitoring and alerts
5. Extend the system with custom policies and integrations