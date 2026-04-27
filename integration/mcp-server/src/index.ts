import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { 
  PaymentResponse, 
  Budget,
  MCPTool,
  IntegrationError
} from '@agent-pay/shared';

// Define tool schemas using Zod for validation
const requestPaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string().default('USDC'),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  reason: z.string().min(1).max(500),
  category: z.enum(['api', 'compute', 'storage', 'data', 'service', 'other', 'ai_agent']),
  metadata: z.record(z.any()).optional(),
  taskContext: z.object({
    taskId: z.string(),
    taskDescription: z.string(),
    taskType: z.string(),
    environment: z.enum(['development', 'staging', 'production']),
    filesModified: z.array(z.string()).optional(),
    commandsExecuted: z.array(z.string()).optional(),
    estimatedCost: z.number().optional(),
  }).optional(),
});

const checkBudgetSchema = z.object({
  agentId: z.string().optional(),
});

const getPaymentStatusSchema = z.object({
  paymentId: z.string(),
});

const listPaymentsSchema = z.object({
  agentId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'executed', 'failed', 'cancelled']).optional(),
  category: z.enum(['api', 'compute', 'storage', 'data', 'service', 'other', 'ai_agent']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const updatePermissionsSchema = z.object({
  agentId: z.string(),
  permissions: z.object({
    canRequestPayments: z.boolean().optional(),
    maxDailyAmount: z.number().optional(),
    allowedCategories: z.array(z.enum(['api', 'compute', 'storage', 'data', 'service', 'other', 'ai_agent'])).optional(),
    requireApprovalThreshold: z.number().optional(),
    allowedRecipients: z.array(z.string()).optional(),
    blockedRecipients: z.array(z.string()).optional(),
  }),
});

const emergencyPauseSchema = z.object({
  reason: z.string().optional(),
  duration: z.number().optional(),
});

class MCPServer {
  private server: Server;
  private tools: MCPTool[] = [];

  constructor() {
    this.server = new Server(
      {
        name: 'agentic-payment-system',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
    this.setupHandlers();
  }

  private setupTools(): void {
    this.tools = [
      {
        name: 'request_payment',
        description: 'Request payment permission and execute payment. This tool evaluates policies, checks budget, and either executes payment immediately or requests manual approval based on configured rules.',
        inputSchema: requestPaymentSchema,
        handler: this.handleRequestPayment.bind(this),
      },
      {
        name: 'check_budget',
        description: 'Check remaining budget and limits for an agent. Returns detailed budget information including daily limits, spent amounts, and reset times.',
        inputSchema: checkBudgetSchema,
        handler: this.handleCheckBudget.bind(this),
      },
      {
        name: 'get_payment_status',
        description: 'Get status of specific payment by ID. Returns detailed payment information including transaction hash, policy evaluations, and audit trail.',
        inputSchema: getPaymentStatusSchema,
        handler: this.handleGetPaymentStatus.bind(this),
      },
      {
        name: 'list_payments',
        description: 'List recent payments with filtering options. Supports filtering by agent, status, category, and time range.',
        inputSchema: listPaymentsSchema,
        handler: this.handleListPayments.bind(this),
      },
      {
        name: 'update_permissions',
        description: 'Update Agent permissions and restrictions. Requires admin privileges. Changes are logged in audit trail.',
        inputSchema: updatePermissionsSchema,
        handler: this.handleUpdatePermissions.bind(this),
      },
      {
        name: 'emergency_pause',
        description: 'Immediately pause all Agent activities. This is a safety measure that prevents any further payment requests until manually resumed.',
        inputSchema: emergencyPauseSchema,
        handler: this.handleEmergencyPause.bind(this),
      },
    ];
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.find(t => t.name === name);
      
      if (!tool) {
        throw new Error(`Tool ${name} not found`);
      }

      try {
        // Validate input
        const validatedArgs = tool.inputSchema.parse(args);
        
        // Execute tool handler
        const result = await tool.handler(validatedArgs, {
          agentId: String(request.params.agentId || 'unknown'),
          sessionId: String(request.params.sessionId || 'unknown'),
          userId: String(request.params.userId || 'unknown'),
          permissions: {
            canRequestPayments: true,
            maxDailyAmount: 1000,
            allowedCategories: ['api', 'compute', 'storage', 'data', 'service', 'other', 'ai_agent'],
            requireApprovalThreshold: 500,
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
          } as Budget,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error(`Error executing tool ${name}:`, error);
        
        if (error instanceof z.ZodError) {
          throw new Error(`Invalid input: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        
        if (error instanceof IntegrationError) {
          throw new Error(`${error.code}: ${error.message}`);
        }
        
        throw new Error(`Internal server error: ${error.message}`);
      }
    });
  }

  // Tool handlers
  private async handleRequestPayment(
    args: z.infer<typeof requestPaymentSchema>,
    _context: any
  ): Promise<PaymentResponse> {
    console.log('Processing payment request:', args);
    
    // Simulate policy evaluation
    const policyEvaluations = [
      {
        policyId: 'budget_policy',
        decision: 'allow' as const,
        evaluatedRules: [
          {
            id: 'daily_limit',
            name: 'Daily Limit Check',
            description: 'Check if daily budget limit is exceeded',
            condition: 'daily_spent + amount <= daily_limit',
            action: 'allow' as const,
          },
        ],
        violations: [],
      },
    ];

    // Simulate approval logic
    const approvalRequired = false; // Would be determined by policy evaluation

    return {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: approvalRequired ? 'pending' : 'approved',
      amount: args.amount,
      currency: args.currency,
      recipient: args.recipient,
      approvalRequired,
      policyEvaluations,
      createdAt: new Date(),
    };
  }

  private async handleCheckBudget(
    _args: z.infer<typeof checkBudgetSchema>,
    _context: any
  ): Promise<Budget> {

    
    // Simulate budget data
    return {
      total: 10000,
      spent: 2450,
      remaining: 7550,
      dailyLimit: 1000,
      dailySpent: 250,
      currency: 'USDC',
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  private async handleGetPaymentStatus(
    args: z.infer<typeof getPaymentStatusSchema>,
    _context: any
  ): Promise<PaymentResponse> {
    // Simulate payment data
    return {
      id: args.paymentId,
      status: 'executed',
      amount: '1.5',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      approvalRequired: false,
      policyEvaluations: [],
      createdAt: new Date(Date.now() - 3600000),
    };
  }

  private async handleListPayments(
    args: z.infer<typeof listPaymentsSchema>,
    _context: any
  ): Promise<{ payments: PaymentResponse[]; total: number }> {
    // Simulate payment list
    const payments: PaymentResponse[] = [
      {
        id: 'pay_1',
        status: 'executed',
        amount: '1.5',
        currency: 'USDC',
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        approvalRequired: false,
        policyEvaluations: [],
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: 'pay_2',
        status: 'pending',
        amount: '5.0',
        currency: 'USDC',
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6f1d8',
        approvalRequired: true,
        approvalId: 'app_123',
        policyEvaluations: [],
        createdAt: new Date(Date.now() - 1800000),
      },
    ];

    // Filter based on arguments
    let filtered = payments;
    if (args.agentId) {
      filtered = filtered.filter(p => p.id.includes(args.agentId!));
    }
    if (args.status) {
      filtered = filtered.filter(p => p.status === args.status);
    }
    if (args.category) {
      // Note: category not in PaymentResponse in this example
    }

    // Apply pagination
    const paginated = filtered.slice(args.offset, args.offset + args.limit);

    return {
      payments: paginated,
      total: filtered.length,
    };
  }

  private async handleUpdatePermissions(
    args: z.infer<typeof updatePermissionsSchema>,
    _context: any
  ): Promise<{ success: boolean; message: string }> {
    console.log('Updating permissions for agent:', args.agentId, args.permissions);
    
    // In a real implementation, this would update the database
    // and log the change in the audit trail
    
    return {
      success: true,
      message: `Permissions updated for agent ${args.agentId}`,
    };
  }

  private async handleEmergencyPause(
    args: z.infer<typeof emergencyPauseSchema>,
    _context: any
  ): Promise<{ success: boolean; message: string }> {
    console.log('Emergency pause activated:', args.reason || 'No reason provided');
    
    // In a real implementation, this would:
    // 1. Set system-wide pause flag
    // 2. Notify all connected agents
    // 3. Log the event in audit trail
    // 4. Optionally revert any pending transactions
    
    return {
      success: true,
      message: `System paused${args.duration ? ` for ${args.duration} seconds` : ''}. ${args.reason ? `Reason: ${args.reason}` : ''}`,
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server running on stdio');
  }
}

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPServer();
  server.start().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { MCPServer };