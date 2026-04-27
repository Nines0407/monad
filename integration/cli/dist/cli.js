#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const shared_1 = require("@agent-pay/shared");
// Load environment variables
(0, dotenv_1.config)();
const program = new commander_1.Command();
// Configuration
const CONFIG_DIR = (0, path_1.join)((0, os_1.homedir)(), '.agent-pay');
const CONFIG_FILE = (0, path_1.join)(CONFIG_DIR, 'config.json');
const AUTH_FILE = (0, path_1.join)(CONFIG_DIR, 'auth.json');
// Ensure config directory exists
if (!(0, fs_1.existsSync)(CONFIG_DIR)) {
    (0, fs_1.mkdirSync)(CONFIG_DIR, { recursive: true });
}
// Helper functions
function loadConfig() {
    if ((0, fs_1.existsSync)(CONFIG_FILE)) {
        try {
            return JSON.parse((0, fs_1.readFileSync)(CONFIG_FILE, 'utf-8'));
        }
        catch (error) {
            console.error('Failed to load config:', error);
            return {};
        }
    }
    return {};
}
function saveConfig(config) {
    (0, fs_1.writeFileSync)(CONFIG_FILE, JSON.stringify(config, null, 2));
}
function loadAuth() {
    if ((0, fs_1.existsSync)(AUTH_FILE)) {
        try {
            return JSON.parse((0, fs_1.readFileSync)(AUTH_FILE, 'utf-8'));
        }
        catch (error) {
            console.error('Failed to load auth:', error);
            return {};
        }
    }
    return {};
}
function saveAuth(auth) {
    (0, fs_1.writeFileSync)(AUTH_FILE, JSON.stringify(auth, null, 2));
}
function printSuccess(message) {
    console.log(`✅ ${message}`);
}
function printError(message) {
    console.error(`❌ ${message}`);
}
function printWarning(message) {
    console.log(`⚠️  ${message}`);
}
function printInfo(message) {
    console.log(`ℹ️  ${message}`);
}
// Initialize command
program
    .command('init')
    .description('Initialize wallet and configuration')
    .option('-e, --env <environment>', 'Environment (development, staging, production)', 'development')
    .option('-n, --network <network>', 'Network (monad-testnet, monad-mainnet)', 'monad-testnet')
    .action(async (options) => {
    console.log('Initializing Agentic Payment System CLI...');
    const config = {
        environment: options.env,
        network: options.network,
        apiEndpoint: process.env.API_ENDPOINT || 'http://localhost:3001',
        mcpEndpoint: process.env.MCP_ENDPOINT || 'http://localhost:3000',
        initializedAt: new Date().toISOString(),
        version: '0.1.0',
    };
    saveConfig(config);
    printSuccess('Configuration initialized successfully!');
    console.log(`Environment: ${config.environment}`);
    console.log(`Network: ${config.network}`);
    console.log(`API Endpoint: ${config.apiEndpoint}`);
    console.log(`Config file: ${CONFIG_FILE}`);
    printInfo('Next steps:');
    printInfo('1. Run "agent-pay authorize" to authorize an agent');
    printInfo('2. Run "agent-pay status" to check system status');
});
// Authorize command
program
    .command('authorize')
    .description('Authorize Agent with budget and permissions')
    .requiredOption('-i, --agent-id <id>', 'Agent ID')
    .option('-n, --agent-name <name>', 'Agent name')
    .option('-t, --agent-type <type>', 'Agent type (claude_code, openclaw, codex, manus, custom)', 'custom')
    .option('-b, --budget <amount>', 'Total budget amount', '1000')
    .option('-c, --currency <currency>', 'Currency (USDC, ETH, etc.)', 'USDC')
    .option('-d, --daily-limit <amount>', 'Daily spending limit', '100')
    .option('-a, --allowed-categories <categories>', 'Comma-separated allowed categories', 'api,compute,storage,data,service,other')
    .option('-r, --require-approval <threshold>', 'Amount threshold requiring approval', '50')
    .action(async (options) => {
    console.log(`Authorizing agent: ${options.agentId}`);
    const categories = options.allowedCategories.split(',').map((c) => c.trim());
    const agentConfig = {
        agentId: options.agentId,
        agentName: options.agentName || options.agentId,
        agentType: options.agentType,
        permissions: {
            canRequestPayments: true,
            maxDailyAmount: parseFloat(options.dailyLimit),
            allowedCategories: categories,
            requireApprovalThreshold: parseFloat(options.requireApproval),
            allowedRecipients: [],
            blockedRecipients: [],
        },
        budget: {
            total: parseFloat(options.budget),
            spent: 0,
            remaining: parseFloat(options.budget),
            dailyLimit: parseFloat(options.dailyLimit),
            dailySpent: 0,
            currency: options.currency,
            resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        authorizedAt: new Date().toISOString(),
    };
    const auth = loadAuth();
    auth[options.agentId] = agentConfig;
    saveAuth(auth);
    printSuccess(`Agent ${options.agentId} authorized successfully!`);
    console.log(`Budget: ${(0, shared_1.formatAmount)(options.budget, options.currency)}`);
    console.log(`Daily limit: ${(0, shared_1.formatAmount)(options.dailyLimit, options.currency)}`);
    console.log(`Require approval threshold: ${(0, shared_1.formatAmount)(options.requireApproval, options.currency)}`);
    console.log(`Allowed categories: ${categories.join(', ')}`);
});
// Request payment command
program
    .command('request')
    .description('Manually request payment (bypassing Agent)')
    .requiredOption('-a, --amount <amount>', 'Payment amount')
    .requiredOption('-r, --recipient <address>', 'Recipient address')
    .option('-c, --currency <currency>', 'Currency (USDC, ETH, etc.)', 'USDC')
    .option('--category <category>', 'Payment category', 'other')
    .option('--reason <reason>', 'Payment reason', 'Manual payment via CLI')
    .option('--agent-id <id>', 'Associated agent ID')
    .option('--task-id <id>', 'Task ID for context')
    .option('--dry-run', 'Simulate payment without executing', false)
    .action(async (options) => {
    console.log('Processing payment request...');
    // Validate recipient address
    if (!(0, shared_1.validateAddress)(options.recipient)) {
        printError('Invalid recipient address. Must be a valid Ethereum address (0x...).');
        process.exit(1);
    }
    // Payment request object would be created and sent to API in real implementation
    if (options.dryRun) {
        printWarning('DRY RUN - No payment will be executed');
    }
    console.log('Payment Request:');
    console.log(`  Amount: ${(0, shared_1.formatAmount)(options.amount, options.currency)}`);
    console.log(`  Recipient: ${options.recipient}`);
    console.log(`  Category: ${options.category}`);
    console.log(`  Reason: ${options.reason}`);
    if (options.agentId)
        console.log(`  Agent ID: ${options.agentId}`);
    if (options.taskId)
        console.log(`  Task ID: ${options.taskId}`);
    // In a real implementation, this would call the API
    if (!options.dryRun) {
        printInfo('Submitting payment request to API...');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const paymentResponse = {
            id: (0, shared_1.generateCorrelationId)(),
            status: 'pending',
            amount: options.amount,
            currency: options.currency,
            recipient: options.recipient,
            approvalRequired: parseFloat(options.amount) > 50, // Example logic
            policyEvaluations: [],
            createdAt: new Date(),
        };
        printSuccess('Payment request submitted successfully!');
        console.log(`Payment ID: ${paymentResponse.id}`);
        console.log(`Status: ${paymentResponse.status}`);
        console.log(`Approval required: ${paymentResponse.approvalRequired ? 'Yes' : 'No'}`);
    }
    else {
        printSuccess('Dry run completed successfully');
    }
});
// Audit command
program
    .command('audit')
    .description('View audit logs with filtering and export')
    .option('-t, --type <eventType>', 'Filter by event type')
    .option('-a, --agent-id <id>', 'Filter by agent ID')
    .option('-u, --user-id <id>', 'Filter by user ID')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('-l, --limit <number>', 'Number of records to show', '50')
    .option('-o, --output <format>', 'Output format (json, csv, table)', 'table')
    .option('--export <file>', 'Export to file')
    .action(async (options) => {
    console.log('Fetching audit logs...');
    const filters = [];
    if (options.type)
        filters.push(`type: ${options.type}`);
    if (options.agentId)
        filters.push(`agent: ${options.agentId}`);
    if (options.userId)
        filters.push(`user: ${options.userId}`);
    if (options.from)
        filters.push(`from: ${options.from}`);
    if (options.to)
        filters.push(`to: ${options.to}`);
    if (filters.length > 0) {
        console.log(`Filters: ${filters.join(', ')}`);
    }
    // Simulate audit data
    const auditEvents = [
        {
            id: 'audit_1',
            eventType: 'payment_requested',
            actorType: 'agent',
            actorId: 'agent_123',
            targetType: 'payment',
            targetId: 'pay_456',
            metadata: { amount: '1.5', currency: 'USDC' },
            timestamp: new Date(Date.now() - 3600000),
        },
        {
            id: 'audit_2',
            eventType: 'payment_approved',
            actorType: 'user',
            actorId: 'user_789',
            targetType: 'payment',
            targetId: 'pay_456',
            metadata: { approvedBy: 'user_789' },
            timestamp: new Date(Date.now() - 1800000),
        },
        {
            id: 'audit_3',
            eventType: 'payment_executed',
            actorType: 'system',
            actorId: 'system',
            targetType: 'payment',
            targetId: 'pay_456',
            metadata: { transactionHash: '0x123...', gasUsed: '21000' },
            timestamp: new Date(Date.now() - 900000),
        },
    ];
    if (options.output === 'json') {
        console.log(JSON.stringify(auditEvents, null, 2));
    }
    else if (options.output === 'csv') {
        console.log('id,eventType,actorType,actorId,targetType,targetId,timestamp');
        auditEvents.forEach(event => {
            console.log(`${event.id},${event.eventType},${event.actorType},${event.actorId},${event.targetType},${event.targetId},${event.timestamp.toISOString()}`);
        });
    }
    else {
        // Table format
        console.log('\nAudit Events:');
        console.log('─'.repeat(100));
        console.log('ID        | Event Type        | Actor  | Actor ID  | Target  | Target ID | Timestamp');
        console.log('─'.repeat(100));
        auditEvents.forEach(event => {
            console.log(`${event.id.padEnd(10)} | ${event.eventType.padEnd(17)} | ${event.actorType.padEnd(6)} | ${event.actorId.padEnd(9)} | ${event.targetType?.padEnd(6) || 'N/A'.padEnd(6)} | ${event.targetId?.padEnd(9) || 'N/A'.padEnd(9)} | ${event.timestamp.toISOString().substring(0, 19)}`);
        });
        console.log('─'.repeat(100));
        console.log(`Total: ${auditEvents.length} events`);
    }
    if (options.export) {
        printInfo(`Export feature not implemented in this example. Would export to: ${options.export}`);
    }
    printSuccess('Audit log query completed');
});
// Policy command
program
    .command('policy')
    .description('Manage security policies')
    .command('list', 'List all policies').action(() => {
    console.log('Security Policies:');
    console.log('─'.repeat(80));
    const policies = [
        { id: 'policy_1', name: 'Daily Budget Limit', description: 'Prevents exceeding daily spending limit', enabled: true },
        { id: 'policy_2', name: 'Recipient Whitelist', description: 'Only allows payments to approved recipients', enabled: false },
        { id: 'policy_3', name: 'Category Restrictions', description: 'Restricts payments to certain categories', enabled: true },
        { id: 'policy_4', name: 'Approval Threshold', description: 'Requires manual approval above threshold', enabled: true },
    ];
    policies.forEach(policy => {
        const status = policy.enabled ? '✅ Enabled' : '❌ Disabled';
        console.log(`${policy.id.padEnd(10)} | ${policy.name.padEnd(20)} | ${status.padEnd(12)} | ${policy.description}`);
    });
    console.log('─'.repeat(80));
});
// Status command
program
    .command('status')
    .description('Check system status and balances')
    .option('-a, --agent-id <id>', 'Check status for specific agent')
    .option('-v, --verbose', 'Show detailed information', false)
    .action(async (options) => {
    console.log('System Status Check');
    console.log('═'.repeat(50));
    const config = loadConfig();
    const auth = loadAuth();
    console.log(`Environment: ${config.environment || 'Not configured'}`);
    console.log(`Network: ${config.network || 'Not configured'}`);
    console.log(`API Endpoint: ${config.apiEndpoint || 'Not configured'}`);
    console.log(`Initialized: ${config.initializedAt ? new Date(config.initializedAt).toLocaleString() : 'No'}`);
    if (options.agentId) {
        const agent = auth[options.agentId];
        if (agent) {
            console.log('\nAgent Status:');
            console.log(`  ID: ${agent.agentId}`);
            console.log(`  Name: ${agent.agentName}`);
            console.log(`  Type: ${agent.agentType}`);
            console.log(`  Authorized: ${new Date(agent.authorizedAt).toLocaleString()}`);
            console.log('\nBudget:');
            console.log(`  Total: ${(0, shared_1.formatAmount)(agent.budget.total.toString(), agent.budget.currency)}`);
            console.log(`  Spent: ${(0, shared_1.formatAmount)(agent.budget.spent.toString(), agent.budget.currency)}`);
            console.log(`  Remaining: ${(0, shared_1.formatAmount)(agent.budget.remaining.toString(), agent.budget.currency)}`);
            console.log(`  Daily Limit: ${(0, shared_1.formatAmount)(agent.budget.dailyLimit.toString(), agent.budget.currency)}`);
            console.log(`  Daily Spent: ${(0, shared_1.formatAmount)(agent.budget.dailySpent.toString(), agent.budget.currency)}`);
            console.log(`  Daily Reset: ${new Date(agent.budget.resetAt).toLocaleString()}`);
            if (options.verbose) {
                console.log('\nPermissions:');
                console.log(`  Can Request Payments: ${agent.permissions.canRequestPayments}`);
                console.log(`  Max Daily Amount: ${(0, shared_1.formatAmount)(agent.permissions.maxDailyAmount.toString(), agent.budget.currency)}`);
                console.log(`  Allowed Categories: ${agent.permissions.allowedCategories.join(', ')}`);
                console.log(`  Approval Threshold: ${(0, shared_1.formatAmount)(agent.permissions.requireApprovalThreshold.toString(), agent.budget.currency)}`);
            }
        }
        else {
            printError(`Agent ${options.agentId} not found. Authorize first with "agent-pay authorize".`);
        }
    }
    else {
        console.log(`\nAuthorized Agents: ${Object.keys(auth).length}`);
        Object.keys(auth).forEach(agentId => {
            const agent = auth[agentId];
            console.log(`  - ${agentId}: ${(0, shared_1.formatAmount)(agent.budget.remaining.toString(), agent.budget.currency)} remaining`);
        });
    }
    console.log('\n' + '═'.repeat(50));
    printSuccess('Status check completed');
});
// Pause command
program
    .command('pause')
    .description('Emergency pause all activities')
    .option('-r, --reason <reason>', 'Reason for pausing')
    .option('-d, --duration <minutes>', 'Duration in minutes (0 = until manually resumed)', '0')
    .action(async (options) => {
    console.log('⚠️  EMERGENCY PAUSE ACTIVATION ⚠️');
    console.log('This will pause ALL agent activities including payment requests.');
    if (options.reason) {
        console.log(`Reason: ${options.reason}`);
    }
    if (parseInt(options.duration) > 0) {
        console.log(`Duration: ${options.duration} minutes`);
    }
    else {
        console.log('Duration: Until manually resumed');
    }
    // In a real implementation, this would call the emergency pause API
    printWarning('Emergency pause would be activated here.');
    printWarning('In a real implementation, this would:');
    printWarning('1. Set system-wide pause flag');
    printWarning('2. Notify all connected agents');
    printWarning('3. Log the event in audit trail');
    printWarning('4. Prevent any new payment requests');
    printSuccess('Emergency pause simulated (not actually activated in this example)');
});
// Recover command
program
    .command('recover')
    .description('Wallet recovery operations')
    .command('list', 'List recovery options').action(() => {
    console.log('Recovery Options:');
    console.log('─'.repeat(60));
    console.log('1. Reset agent permissions - Reset all agent permissions to defaults');
    console.log('2. Reset budget - Reset budget for specific agent');
    console.log('3. Emergency unpause - Resume system if paused');
    console.log('4. Export audit trail - Export complete audit trail for analysis');
    console.log('5. Validate configuration - Validate and fix configuration issues');
    console.log('─'.repeat(60));
    console.log('\nUse specific subcommands for each operation.');
    console.log('Example: agent-pay recover reset-permissions --agent-id <id>');
});
// Parse command line arguments
program
    .name('agent-pay')
    .description('Agentic Payment System CLI Tool')
    .version('0.1.0')
    .addHelpText('after', `
Examples:
  $ agent-pay init --env production
  $ agent-pay authorize --agent-id claude-001 --budget 5000
  $ agent-pay request --amount 1.5 --recipient 0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8 --reason "API usage"
  $ agent-pay audit --agent-id claude-001 --output json
  $ agent-pay status --verbose
  
Configuration:
  Config directory: ${CONFIG_DIR}
  Config file: ${CONFIG_FILE}
  Auth file: ${AUTH_FILE}
`);
// Handle unknown commands
program.on('command:*', (operands) => {
    printError(`Unknown command: ${operands[0]}`);
    console.log('See --help for a list of available commands.');
    process.exit(1);
});
// Parse arguments
program.parse(process.argv);
// Show help if no arguments
if (process.argv.length <= 2) {
    program.help();
}
//# sourceMappingURL=cli.js.map