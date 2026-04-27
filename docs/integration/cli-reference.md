# CLI Tool Reference Guide

## Overview

The Agentic Payment System CLI (`agent-pay`) is a command-line interface for automation, scripting, and manual management of the payment system. It provides complete control over agent authorization, payment requests, audit logging, policy management, and emergency operations.

## Installation

### Global Installation (Recommended)

```bash
# Install globally from npm
npm install -g @agent-pay/cli

# Verify installation
agent-pay --version
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/agentic-payment-system/agentic-payment-system.git
cd agentic-payment-system/integration/cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Run directly
node dist/cli.js --help
```

### Docker Installation

```bash
# Run CLI via Docker
docker run --rm -v ~/.agent-pay:/root/.agent-pay agentic/cli:latest --help
```

## Quick Start

```bash
# 1. Initialize configuration
agent-pay init --env production --network monad-mainnet

# 2. Authorize an agent
agent-pay authorize \
  --agent-id claude-code-001 \
  --agent-name "Claude Code Production" \
  --budget 10000 \
  --daily-limit 1000 \
  --allowed-categories api,compute,storage

# 3. Check status
agent-pay status --verbose

# 4. Request a payment
agent-pay request \
  --amount 1.5 \
  --recipient 0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8 \
  --reason "API usage credits" \
  --category api

# 5. View audit logs
agent-pay audit --agent-id claude-code-001 --output json
```

## Command Reference

### Global Options

All commands support these global options:

```bash
--help, -h          # Show help for command
--version, -V       # Show version
--verbose, -v       # Enable verbose output
--config <path>     # Use alternative config file
--env <environment> # Override environment (development, staging, production)
```

### `agent-pay init`

Initialize wallet and configuration.

```bash
agent-pay init [options]
```

**Options:**
- `-e, --env <environment>` - Environment (development, staging, production) [default: development]
- `-n, --network <network>` - Network (monad-testnet, monad-mainnet) [default: monad-testnet]

**Examples:**
```bash
# Initialize for development
agent-pay init --env development --network monad-testnet

# Initialize for production
agent-pay init --env production --network monad-mainnet
```

**What it does:**
1. Creates configuration directory `~/.agent-pay/`
2. Saves configuration to `~/.agent-pay/config.json`
3. Sets up environment-specific settings
4. Validates connectivity to API endpoints

**Configuration file location:**
- **Linux/macOS**: `~/.agent-pay/config.json`
- **Windows**: `C:\Users\<username>\.agent-pay\config.json`

### `agent-pay authorize`

Authorize Agent with budget and permissions.

```bash
agent-pay authorize [options]
```

**Required Options:**
- `-i, --agent-id <id>` - Agent ID (required)

**Additional Options:**
- `-n, --agent-name <name>` - Agent name [default: agent ID]
- `-t, --agent-type <type>` - Agent type (claude_code, openclaw, codex, manus, custom) [default: custom]
- `-b, --budget <amount>` - Total budget amount [default: 1000]
- `-c, --currency <currency>` - Currency (USDC, ETH, etc.) [default: USDC]
- `-d, --daily-limit <amount>` - Daily spending limit [default: 100]
- `-a, --allowed-categories <categories>` - Comma-separated allowed categories [default: api,compute,storage,data,service,other]
- `-r, --require-approval <threshold>` - Amount threshold requiring approval [default: 50]

**Examples:**
```bash
# Authorize Claude Code agent
agent-pay authorize \
  --agent-id claude-code-001 \
  --agent-name "Claude Code Production" \
  --agent-type claude_code \
  --budget 5000 \
  --daily-limit 500 \
  --allowed-categories api,compute \
  --require-approval 100

# Authorize custom agent
agent-pay authorize \
  --agent-id custom-agent-123 \
  --budget 1000 \
  --daily-limit 100 \
  --allowed-categories storage,data
```

**What it does:**
1. Creates agent configuration in `~/.agent-pay/auth.json`
2. Sets up budget and permission limits
3. Generates API keys for agent authentication
4. Logs authorization in audit trail

### `agent-pay request`

Manually request payment (bypassing Agent).

```bash
agent-pay request [options]
```

**Required Options:**
- `-a, --amount <amount>` - Payment amount (required)
- `-r, --recipient <address>` - Recipient address (required)

**Additional Options:**
- `-c, --currency <currency>` - Currency (USDC, ETH, etc.) [default: USDC]
- `--category <category>` - Payment category [default: other]
- `--reason <reason>` - Payment reason [default: Manual payment via CLI]
- `--agent-id <id>` - Associated agent ID
- `--task-id <id>` - Task ID for context
- `--dry-run` - Simulate payment without executing [default: false]

**Examples:**
```bash
# Basic payment request
agent-pay request \
  --amount 2.5 \
  --recipient 0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8 \
  --reason "Compute credits" \
  --category compute

# Payment with agent context
agent-pay request \
  --amount 1.0 \
  --recipient 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 \
  --agent-id claude-code-001 \
  --task-id task-123 \
  --reason "Uniswap LP fees"

# Dry run (simulation)
agent-pay request \
  --amount 5.0 \
  --recipient 0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8 \
  --dry-run
```

**What it does:**
1. Validates recipient address format
2. Evaluates payment against policies
3. Checks budget availability
4. Submits payment request to API
5. Returns payment ID and status
6. Logs transaction in audit trail

### `agent-pay audit`

View audit logs with filtering and export.

```bash
agent-pay audit [options]
```

**Options:**
- `-t, --type <eventType>` - Filter by event type
- `-a, --agent-id <id>` - Filter by agent ID
- `-u, --user-id <id>` - Filter by user ID
- `--from <date>` - Start date (YYYY-MM-DD)
- `--to <date>` - End date (YYYY-MM-DD)
- `-l, --limit <number>` - Number of records to show [default: 50]
- `-o, --output <format>` - Output format (json, csv, table) [default: table]
- `--export <file>` - Export to file

**Examples:**
```bash
# View recent audit logs
agent-pay audit

# Filter by agent
agent-pay audit --agent-id claude-code-001

# Filter by date range
agent-pay audit --from 2024-01-01 --to 2024-01-31

# Export to JSON
agent-pay audit --output json --export audit.json

# Export to CSV
agent-pay audit --output csv --export audit.csv
```

**Output Formats:**
- **table**: Human-readable table format (default)
- **json**: JSON format for programmatic use
- **csv**: CSV format for spreadsheets

**Event Types:**
- `payment_requested` - New payment requested
- `payment_approved` - Payment approved
- `payment_rejected` - Payment rejected
- `payment_executed` - Payment executed on-chain
- `policy_evaluated` - Policy evaluation completed
- `agent_authorized` - Agent authorized
- `agent_revoked` - Agent authorization revoked
- `emergency_paused` - System emergency paused
- `emergency_resumed` - System emergency resumed

### `agent-pay policy`

Manage security policies.

```bash
agent-pay policy <subcommand> [options]
```

**Subcommands:**
- `list` - List all policies
- `show <policy-id>` - Show policy details
- `create` - Create new policy
- `update <policy-id>` - Update existing policy
- `delete <policy-id>` - Delete policy
- `enable <policy-id>` - Enable policy
- `disable <policy-id>` - Disable policy

**Examples:**
```bash
# List all policies
agent-pay policy list

# Show policy details
agent-pay policy show daily-limit-policy

# Create new policy
agent-pay policy create \
  --name "Daily Budget Limit" \
  --type amount_limit \
  --rules '{"maxDaily": 1000, "maxPerTransaction": 100}' \
  --priority 1

# Enable/disable policy
agent-pay policy enable recipient-whitelist
agent-pay policy disable recipient-whitelist
```

**Policy Types:**
- `amount_limit` - Amount-based restrictions
- `recipient_control` - Recipient whitelist/blacklist
- `time_restriction` - Time-based controls
- `category_restriction` - Category-based restrictions
- `manual_approval` - Manual approval requirements
- `compound` - Complex boolean logic rules

### `agent-pay status`

Check system status and balances.

```bash
agent-pay status [options]
```

**Options:**
- `-a, --agent-id <id>` - Check status for specific agent
- `-v, --verbose` - Show detailed information [default: false]

**Examples:**
```bash
# Overall system status
agent-pay status

# Specific agent status
agent-pay status --agent-id claude-code-001

# Verbose output
agent-pay status --verbose
```

**Output includes:**
- System environment and network
- API endpoint connectivity
- Number of authorized agents
- Agent-specific budget and permissions (if agent ID provided)
- System health indicators

### `agent-pay pause`

Emergency pause all activities.

```bash
agent-pay pause [options]
```

**Options:**
- `-r, --reason <reason>` - Reason for pausing
- `-d, --duration <minutes>` - Duration in minutes (0 = until manually resumed) [default: 0]

**Examples:**
```bash
# Pause with reason
agent-pay pause --reason "Suspicious activity detected" --duration 60

# Pause until manually resumed
agent-pay pause --reason "System maintenance"
```

**What it does:**
1. Immediately pauses all agent activities
2. Prevents new payment requests
3. Notifies all connected agents
4. Logs pause event in audit trail
5. Optionally auto-resumes after duration

**⚠️ Warning:** This is an emergency operation that affects all agents. Use with caution.

### `agent-pay recover`

Wallet recovery operations.

```bash
agent-pay recover <subcommand> [options]
```

**Subcommands:**
- `list` - List recovery options
- `reset-permissions` - Reset all agent permissions to defaults
- `reset-budget` - Reset budget for specific agent
- `unpause` - Emergency unpause/resume system
- `export-audit` - Export complete audit trail for analysis
- `validate-config` - Validate and fix configuration issues

**Examples:**
```bash
# List recovery options
agent-pay recover list

# Reset agent permissions
agent-pay recover reset-permissions --agent-id claude-code-001

# Reset budget
agent-pay recover reset-budget --agent-id claude-code-001 --budget 5000

# Emergency unpause
agent-pay recover unpause

# Export audit trail
agent-pay recover export-audit --output audit-export.zip
```

## Advanced Usage

### Scripting and Automation

```bash
#!/bin/bash
# Example automation script

# Initialize if not already initialized
if [ ! -f ~/.agent-pay/config.json ]; then
    agent-pay init --env production --network monad-mainnet
fi

# Authorize agent if not already authorized
if ! agent-pay status --agent-id $AGENT_ID 2>/dev/null | grep -q "Agent found"; then
    agent-pay authorize \
        --agent-id $AGENT_ID \
        --budget $BUDGET \
        --daily-limit $DAILY_LIMIT
fi

# Process payments from CSV
while IFS=, read -r amount recipient reason category; do
    agent-pay request \
        --amount "$amount" \
        --recipient "$recipient" \
        --reason "$reason" \
        --category "$category" \
        --agent-id $AGENT_ID
done < payments.csv
```

### Output Formatting for Pipelines

```bash
# JSON output for jq processing
agent-pay status --agent-id claude-code-001 --output json | jq '.budget.remaining'

# CSV output for spreadsheet import
agent-pay audit --from 2024-01-01 --output csv > audit.csv

# Filter and format with grep/awk
agent-pay audit | grep "payment_executed" | awk '{print $4, $6}'
```

### Environment Variables

The CLI respects these environment variables:

```bash
# API Configuration
export AGENT_PAY_API_ENDPOINT="http://localhost:3001"
export AGENT_PAY_API_KEY="your-api-key"

# Network Configuration  
export MONAD_RPC_URL="https://mainnet.monad.xyz"
export MONAD_CHAIN_ID=10143

# CLI Configuration
export AGENT_PAY_CONFIG_DIR="/custom/path/.agent-pay"
export AGENT_PAY_LOG_LEVEL="debug"
```

### Configuration Files

**Main Configuration (`~/.agent-pay/config.json`):**
```json
{
  "environment": "production",
  "network": "monad-mainnet",
  "apiEndpoint": "https://api.agent-pay.com",
  "mcpEndpoint": "https://mcp.agent-pay.com",
  "initializedAt": "2024-01-01T12:00:00Z",
  "version": "0.1.0"
}
```

**Auth Configuration (`~/.agent-pay/auth.json`):**
```json
{
  "claude-code-001": {
    "agentId": "claude-code-001",
    "agentName": "Claude Code Production",
    "agentType": "claude_code",
    "permissions": {
      "canRequestPayments": true,
      "maxDailyAmount": 1000,
      "allowedCategories": ["api", "compute"],
      "requireApprovalThreshold": 100
    },
    "budget": {
      "total": 10000,
      "spent": 2450,
      "remaining": 7550,
      "dailyLimit": 1000,
      "dailySpent": 250,
      "currency": "USDC",
      "resetAt": "2024-01-02T12:00:00Z"
    },
    "authorizedAt": "2024-01-01T12:00:00Z"
  }
}
```

## Troubleshooting

### Common Issues

**"Command not found: agent-pay"**
```bash
# Ensure global installation
npm list -g @agent-pay/cli

# If not installed
npm install -g @agent-pay/cli

# Or use local installation
cd integration/cli
node dist/cli.js --help
```

**"Configuration not initialized"**
```bash
# Initialize configuration first
agent-pay init --env development
```

**"Agent not authorized"**
```bash
# Authorize the agent
agent-pay authorize --agent-id your-agent-id --budget 1000
```

**"Invalid recipient address"**
```bash
# Ensure address starts with 0x and has 40 hex characters
agent-pay request --amount 1.0 --recipient 0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8
```

**"API connection failed"**
```bash
# Check API endpoint
agent-pay status

# Verify network connectivity
curl $AGENT_PAY_API_ENDPOINT/health

# Update configuration if needed
rm ~/.agent-pay/config.json
agent-pay init --env production
```

### Debug Mode

```bash
# Enable debug logging
export AGENT_PAY_LOG_LEVEL=debug
agent-pay status --verbose

# Or use verbose flag
agent-pay status -vvv

# Check logs
tail -f ~/.agent-pay/cli.log
```

### Getting Help

```bash
# General help
agent-pay --help

# Command-specific help
agent-pay request --help
agent-pay authorize --help

# Version info
agent-pay --version
```

## Security Considerations

### API Key Management

- API keys are stored in `~/.agent-pay/auth.json`
- File permissions should be set to `600` (read/write owner only)
- Consider using secret management tools for production:
  ```bash
  # Example with 1Password
  op inject -i config-template.json -o ~/.agent-pay/config.json
  
  # Example with HashiCorp Vault
  vault kv get -format=json agent-pay/config | jq -r '.data.data' > ~/.agent-pay/config.json
  ```

### Audit Trail

All CLI operations are logged:
- Command execution with arguments (sensitive data redacted)
- API responses and errors
- Configuration changes
- Payment requests and outcomes

Audit logs are stored in `~/.agent-pay/audit.log` and also sent to the central audit system.

### Permission Model

- **Admin users**: Can authorize agents, modify policies, emergency pause
- **Agent users**: Can request payments within their budget and permissions
- **Audit users**: Can view audit logs but not modify configuration

## Performance Tips

### Batch Operations

```bash
# Use xargs for parallel processing
cat payments.txt | xargs -n 5 -P 4 -I {} agent-pay request {}

# Use jq for complex JSON processing
agent-pay audit --output json | jq '.[] | select(.amount > 100)'
```

### Caching

The CLI caches:
- Agent configurations (5 minute TTL)
- Policy configurations (10 minute TTL)
- Budget information (1 minute TTL)

Force cache refresh:
```bash
# Add --no-cache flag
agent-pay status --no-cache
```

### Connection Pooling

The CLI maintains persistent connections to:
- API server (HTTP/2 with keep-alive)
- Database (connection pool)
- Monad RPC nodes (WebSocket connections)

## Updates and Maintenance

### Checking for Updates

```bash
# Check current version
agent-pay --version

# Check for updates
npm outdated -g @agent-pay/cli

# Update to latest
npm update -g @agent-pay/cli
```

### Backup and Restore

```bash
# Backup configuration
tar -czf agent-pay-backup-$(date +%Y%m%d).tar.gz ~/.agent-pay/

# Restore configuration
tar -xzf agent-pay-backup-20240101.tar.gz -C ~/
```

### Uninstallation

```bash
# Uninstall globally
npm uninstall -g @agent-pay/cli

# Remove configuration (optional)
rm -rf ~/.agent-pay/
```

## Support

For issues and questions:

1. Check troubleshooting section above
2. Review command help: `agent-pay --help`
3. Check logs: `~/.agent-pay/cli.log`
4. Open issue on GitHub repository
5. Contact support@agentic-payments.com

---

*Document Version: 1.0.0*  
*Last Updated: 2024-01-01*  
*CLI Version: 0.1.0*  
*Compatible Systems: Linux, macOS, Windows (PowerShell)*