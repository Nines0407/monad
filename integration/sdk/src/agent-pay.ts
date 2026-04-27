import { 
  PaymentRequest, 
  PaymentResponse, 
  Budget, 
  AgentPermissions,
  Agent,
  AuditEvent,
  PolicyEvaluation,
  ApiResponse,
  PaginatedResponse,
  IntegrationError,
  ErrorCodes,
  IntegrationConfig,
  getDefaultConfig
} from '@agent-pay/shared';
import { PaymentRequestBuilder } from './payment-request';
import { PolicyManager } from './policy-manager';
import { AuditClient } from './audit-client';
import { WebSocketClient } from './websocket-client';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface AgentPayConfig {
  apiEndpoint?: string;
  apiKey?: string;
  agentId?: string;
  userId?: string;
  timeout?: number;
  maxRetries?: number;
  enableWebSocket?: boolean;
  debug?: boolean;
}

export class AgentPay {
  private config: Required<AgentPayConfig>;
  private axiosInstance: AxiosInstance;
  private policyManager: PolicyManager;
  private auditClient: AuditClient;
  private wsClient?: WebSocketClient;
  private interceptors: number[] = [];

  constructor(config: AgentPayConfig = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || 'http://localhost:3001',
      apiKey: config.apiKey || '',
      agentId: config.agentId || '',
      userId: config.userId || '',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      enableWebSocket: config.enableWebSocket ?? true,
      debug: config.debug ?? false,
    };

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.apiEndpoint,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        ...(this.config.agentId ? { 'X-Agent-ID': this.config.agentId } : {}),
        ...(this.config.userId ? { 'X-User-ID': this.config.userId } : {}),
      },
    });

    // Add request interceptors
    this.setupInterceptors();

    // Initialize managers
    this.policyManager = new PolicyManager(this.axiosInstance);
    this.auditClient = new AuditClient(this.axiosInstance);

    // Initialize WebSocket client if enabled
    if (this.config.enableWebSocket) {
      const wsUrl = this.config.apiEndpoint.replace(/^http/, 'ws') + '/ws';
      this.wsClient = new WebSocketClient(wsUrl, {
        apiKey: this.config.apiKey,
        agentId: this.config.agentId,
        userId: this.config.userId,
      });
    }
  }

  private setupInterceptors(): void {
    // Request interceptor for logging and retry logic
    const requestInterceptor = this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`[AgentPay] Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[AgentPay] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    const responseInterceptor = this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (this.config.debug) {
          console.log(`[AgentPay] Response: ${response.status} ${response.config.url}`);
        }

        // Check if response follows our ApiResponse format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          const apiResponse = response.data as ApiResponse;
          if (!apiResponse.success && apiResponse.error) {
            throw new IntegrationError(
              apiResponse.error.code,
              apiResponse.error.message,
              apiResponse.error.details,
              response.status
            );
          }
          return { ...response, data: apiResponse.data };
        }

        return response;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[AgentPay] Response error:', error);
        }

        // Handle network errors
        if (!error.response) {
          throw new IntegrationError(
            ErrorCodes.NETWORK_CONNECTION_FAILED,
            'Network connection failed',
            { originalError: error.message },
            0
          );
        }

        // Handle HTTP errors
        const status = error.response?.status;
        let message = error.response?.data?.message || error.message;
        let code = ErrorCodes.EXTERNAL_SERVICE_ERROR;

        switch (status) {
          case 400:
            code = ErrorCodes.VALIDATION_ERROR;
            message = message || 'Bad request';
            break;
          case 401:
            code = ErrorCodes.AUTHENTICATION_FAILED;
            message = message || 'Authentication failed';
            break;
          case 403:
            code = ErrorCodes.AGENT_PERMISSION_DENIED;
            message = message || 'Permission denied';
            break;
          case 404:
            message = message || 'Resource not found';
            break;
          case 429:
            code = ErrorCodes.RATE_LIMIT_EXCEEDED;
            message = message || 'Rate limit exceeded';
            break;
          case 500:
            code = ErrorCodes.EXTERNAL_SERVICE_ERROR;
            message = message || 'Internal server error';
            break;
          case 503:
            code = ErrorCodes.SYSTEM_MAINTENANCE;
            message = message || 'Service unavailable';
            break;
        }

        throw new IntegrationError(
          code,
          message,
          {
            status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
          },
          status
        );
      }
    );

    this.interceptors = [requestInterceptor, responseInterceptor];
  }

  /**
   * Request a payment
   */
  async requestPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.axiosInstance.post<PaymentResponse>('/api/v1/payments', request);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to request payment',
        { originalError: error }
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await this.axiosInstance.get<PaymentResponse>(`/api/v1/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get payment',
        { paymentId, originalError: error }
      );
    }
  }

  /**
   * List payments with filtering
   */
  async listPayments(options: {
    agentId?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<PaymentResponse>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<PaymentResponse>>('/api/v1/payments', {
        params: options,
      });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to list payments',
        { options, originalError: error }
      );
    }
  }

  /**
   * Check budget for agent
   */
  async checkBudget(agentId?: string): Promise<Budget> {
    const targetAgentId = agentId || this.config.agentId;
    if (!targetAgentId) {
      throw new IntegrationError(
        ErrorCodes.VALIDATION_ERROR,
        'agentId is required',
        { providedAgentId: agentId }
      );
    }

    try {
      const response = await this.axiosInstance.get<Budget>(`/api/v1/budgets/${targetAgentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to check budget',
        { agentId: targetAgentId, originalError: error }
      );
    }
  }

  /**
   * Get agent information
   */
  async getAgent(agentId?: string): Promise<Agent> {
    const targetAgentId = agentId || this.config.agentId;
    if (!targetAgentId) {
      throw new IntegrationError(
        ErrorCodes.VALIDATION_ERROR,
        'agentId is required',
        { providedAgentId: agentId }
      );
    }

    try {
      const response = await this.axiosInstance.get<Agent>(`/api/v1/agents/${targetAgentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get agent',
        { agentId: targetAgentId, originalError: error }
      );
    }
  }

  /**
   * Update agent permissions
   */
  async updatePermissions(
    agentId: string,
    permissions: Partial<AgentPermissions>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.axiosInstance.put(`/api/v1/agents/${agentId}/permissions`, permissions);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to update permissions',
        { agentId, permissions, originalError: error }
      );
    }
  }

  /**
   * Create a payment request builder
   */
  createPaymentRequest(): PaymentRequestBuilder {
    return new PaymentRequestBuilder();
  }

  /**
   * Get policy manager
   */
  getPolicyManager(): PolicyManager {
    return this.policyManager;
  }

  /**
   * Get audit client
   */
  getAuditClient(): AuditClient {
    return this.auditClient;
  }

  /**
   * Get WebSocket client
   */
  getWebSocketClient(): WebSocketClient | undefined {
    return this.wsClient;
  }

  /**
   * Connect WebSocket client
   */
  async connectWebSocket(): Promise<void> {
    if (!this.wsClient) {
      throw new IntegrationError(
        ErrorCodes.VALIDATION_ERROR,
        'WebSocket client is not enabled',
        { enableWebSocket: this.config.enableWebSocket }
      );
    }
    await this.wsClient.connect();
  }

  /**
   * Disconnect WebSocket client
   */
  async disconnectWebSocket(): Promise<void> {
    if (this.wsClient) {
      await this.wsClient.disconnect();
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribeToEvents(
    eventTypes: string[],
    handler: (event: any) => void
  ): void {
    if (!this.wsClient) {
      throw new IntegrationError(
        ErrorCodes.VALIDATION_ERROR,
        'WebSocket client is not enabled',
        { enableWebSocket: this.config.enableWebSocket }
      );
    }
    this.wsClient.subscribe(eventTypes, handler);
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    // Remove axios interceptors
    this.interceptors.forEach(id => {
      this.axiosInstance.interceptors.request.eject(id);
    });

    // Disconnect WebSocket
    if (this.wsClient) {
      await this.wsClient.disconnect();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<AgentPayConfig> {
    return { ...this.config };
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<IntegrationConfig> {
    try {
      const response = await this.axiosInstance.get<IntegrationConfig>('/api/v1/config');
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get system config',
        { originalError: error }
      );
    }
  }
}