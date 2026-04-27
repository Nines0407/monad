import { PaymentRequest, PaymentCategory, TaskContext } from '@agent-pay/shared';

export class PaymentRequestBuilder {
  private request: Partial<PaymentRequest> = {};
  private metadata: Record<string, any> = {};
  private taskContext?: Partial<TaskContext>;

  /**
   * Set payment amount
   */
  amount(amount: string | number): this {
    this.request.amount = typeof amount === 'number' ? amount.toString() : amount;
    return this;
  }

  /**
   * Set currency
   */
  currency(currency: string): this {
    this.request.currency = currency;
    return this;
  }

  /**
   * Set recipient address
   */
  recipient(recipient: string): this {
    this.request.recipient = recipient;
    return this;
  }

  /**
   * Set payment reason
   */
  reason(reason: string): this {
    this.request.reason = reason;
    return this;
  }

  /**
   * Set payment category
   */
  category(category: PaymentCategory): this {
    this.request.category = category;
    return this;
  }

  /**
   * Set metadata
   */
  metadata(key: string, value: any): this;
  metadata(metadata: Record<string, any>): this;
  metadata(keyOrMetadata: string | Record<string, any>, value?: any): this {
    if (typeof keyOrMetadata === 'string') {
      this.metadata[keyOrMetadata] = value;
    } else {
      this.metadata = { ...this.metadata, ...keyOrMetadata };
    }
    this.request.metadata = this.metadata;
    return this;
  }

  /**
   * Set task ID for context
   */
  taskId(taskId: string): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.taskId = taskId;
    return this;
  }

  /**
   * Set task description
   */
  taskDescription(description: string): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.taskDescription = description;
    return this;
  }

  /**
   * Set task type
   */
  taskType(type: string): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.taskType = type;
    return this;
  }

  /**
   * Set environment
   */
  environment(environment: 'development' | 'staging' | 'production'): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.environment = environment;
    return this;
  }

  /**
   * Set files modified
   */
  filesModified(files: string[]): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.filesModified = files;
    return this;
  }

  /**
   * Set commands executed
   */
  commandsExecuted(commands: string[]): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.commandsExecuted = commands;
    return this;
  }

  /**
   * Set estimated cost
   */
  estimatedCost(cost: number): this {
    if (!this.taskContext) {
      this.taskContext = {};
    }
    this.taskContext.estimatedCost = cost;
    return this;
  }

  /**
   * Set full task context
   */
  context(context: TaskContext): this {
    this.taskContext = context;
    return this;
  }

  /**
   * Set agent ID
   */
  agentId(agentId: string): this {
    this.request.agentId = agentId;
    return this;
  }

  /**
   * Build the payment request
   */
  build(): PaymentRequest {
    // Validate required fields
    if (!this.request.amount) {
      throw new Error('Amount is required');
    }
    if (!this.request.currency) {
      throw new Error('Currency is required');
    }
    if (!this.request.recipient) {
      throw new Error('Recipient is required');
    }
    if (!this.request.reason) {
      throw new Error('Reason is required');
    }
    if (!this.request.category) {
      throw new Error('Category is required');
    }

    // Validate recipient address format (basic Ethereum address check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(this.request.recipient)) {
      throw new Error('Invalid recipient address format');
    }

    // Validate amount format
    if (!/^\d+(\.\d+)?$/.test(this.request.amount)) {
      throw new Error('Invalid amount format');
    }

    // Build the complete request
    const request: PaymentRequest = {
      amount: this.request.amount,
      currency: this.request.currency,
      recipient: this.request.recipient,
      reason: this.request.reason,
      category: this.request.category,
      ...(this.metadata && Object.keys(this.metadata).length > 0 && { metadata: this.metadata }),
      ...(this.taskContext && Object.keys(this.taskContext).length > 0 && { taskContext: this.taskContext as TaskContext }),
      ...(this.request.agentId && { agentId: this.request.agentId }),
    };

    return request;
  }

  /**
   * Build and validate the payment request
   */
  validate(): { valid: boolean; errors: string[]; request?: PaymentRequest } {
    try {
      const request = this.build();
      return { valid: true, errors: [], request };
    } catch (error: any) {
      return { valid: false, errors: [error.message], request: undefined };
    }
  }

  /**
   * Create a payment request from an object
   */
  static fromObject(obj: Partial<PaymentRequest>): PaymentRequestBuilder {
    const builder = new PaymentRequestBuilder();
    
    if (obj.amount) builder.amount(obj.amount);
    if (obj.currency) builder.currency(obj.currency);
    if (obj.recipient) builder.recipient(obj.recipient);
    if (obj.reason) builder.reason(obj.reason);
    if (obj.category) builder.category(obj.category);
    if (obj.metadata) builder.metadata(obj.metadata);
    if (obj.taskContext) builder.context(obj.taskContext);
    if (obj.agentId) builder.agentId(obj.agentId);
    
    return builder;
  }

  /**
   * Create a payment request from JSON
   */
  static fromJson(json: string): PaymentRequestBuilder {
    const obj = JSON.parse(json);
    return PaymentRequestBuilder.fromObject(obj);
  }
}