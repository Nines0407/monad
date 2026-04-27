import { WebSocketEvent, WebSocketEventType, IntegrationError, ErrorCodes, generateCorrelationId } from '@agent-pay/shared';

export interface WebSocketClientConfig {
  apiKey?: string;
  agentId?: string;
  userId?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  debug?: boolean;
}

export interface Subscription {
  eventTypes: string[];
  handler: (event: WebSocketEvent) => void;
  id: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private subscriptions: Subscription[] = [];
  private reconnectAttempts = 0;
  private isConnected = false;
  private pingIntervalId: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private connectionPromise: Promise<void> | null = null;

  constructor(
    private url: string,
    config: WebSocketClientConfig = {}
  ) {
    this.config = {
      apiKey: config.apiKey || '',
      agentId: config.agentId || '',
      userId: config.userId || '',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      pingInterval: config.pingInterval || 30000,
      debug: config.debug || false,
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Build connection URL with authentication params
        const urlObj = new URL(this.url);
        if (this.config.apiKey) {
          urlObj.searchParams.set('token', this.config.apiKey);
        }
        if (this.config.agentId) {
          urlObj.searchParams.set('agentId', this.config.agentId);
        }
        if (this.config.userId) {
          urlObj.searchParams.set('userId', this.config.userId);
        }

        this.ws = new WebSocket(urlObj.toString());

        this.ws.onopen = () => {
          this.onOpen();
          resolve();
        };

        this.ws.onclose = (event) => {
          this.onClose(event);
          if (!event.wasClean) {
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

        this.ws.onerror = (error) => {
          this.onError(error);
          reject(new Error(`WebSocket connection error: ${error}`));
        };

        this.ws.onmessage = (event) => {
          this.onMessage(event);
        };
      } catch (error) {
        reject(error);
      }
    });

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnected');
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.subscriptions = [];
  }

  /**
   * Subscribe to events
   */
  subscribe(eventTypes: string[] | string, handler: (event: WebSocketEvent) => void): string {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
    const subscriptionId = generateCorrelationId();

    const subscription: Subscription = {
      eventTypes: types,
      handler,
      id: subscriptionId,
    };

    this.subscriptions.push(subscription);

    // Send subscription to server if connected
    if (this.isConnected && this.ws) {
      this.send({
        type: 'subscribe',
        subscriptionId,
        eventTypes: types,
        timestamp: new Date().toISOString(),
      });
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const index = this.subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);

      // Send unsubscribe to server if connected
      if (this.isConnected && this.ws) {
        this.send({
          type: 'unsubscribe',
          subscriptionId,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Send a message to the server
   */
  send(message: any): void {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
      if (this.config.debug) {
        console.log('[WebSocketClient] Message queued, connection not ready');
      }
    }
  }

  /**
   * Check if connected
   */
  isConnectionOpen(): boolean {
    return this.isConnected && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    url: string;
    reconnectAttempts: number;
    subscriptionCount: number;
    queuedMessages: number;
  } {
    return {
      connected: this.isConnected,
      url: this.url,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.length,
      queuedMessages: this.messageQueue.length,
    };
  }

  private onOpen(): void {
    if (this.config.debug) {
      console.log('[WebSocketClient] Connected to', this.url);
    }

    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Setup ping interval
    this.pingIntervalId = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.pingInterval);

    // Re-register all subscriptions
    this.subscriptions.forEach(subscription => {
      this.send({
        type: 'subscribe',
        subscriptionId: subscription.id,
        eventTypes: subscription.eventTypes,
        timestamp: new Date().toISOString(),
      });
    });

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  private onClose(event: CloseEvent): void {
    if (this.config.debug) {
      console.log('[WebSocketClient] Disconnected:', event.code, event.reason);
    }

    this.isConnected = false;

    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      if (this.config.debug) {
        console.log(`[WebSocketClient] Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
      }

      setTimeout(() => {
        this.connect().catch(error => {
          if (this.config.debug) {
            console.error('[WebSocketClient] Reconnect failed:', error);
          }
        });
      }, this.config.reconnectInterval);
    }
  }

  private onError(error: Event): void {
    if (this.config.debug) {
      console.error('[WebSocketClient] Error:', error);
    }
  }

  private onMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (this.config.debug) {
        console.log('[WebSocketClient] Received:', data);
      }

      // Handle pong response
      if (data.type === 'pong') {
        return;
      }

      // Handle subscription confirmation
      if (data.type === 'subscription_confirmed') {
        if (this.config.debug) {
          console.log('[WebSocketClient] Subscription confirmed:', data.subscriptionId);
        }
        return;
      }

      // Handle error messages
      if (data.type === 'error') {
        console.error('[WebSocketClient] Server error:', data);
        return;
      }

      // Handle system messages
      if (data.type === 'system') {
        if (this.config.debug) {
          console.log('[WebSocketClient] System message:', data);
        }
        return;
      }

      // Dispatch event to subscribers
      this.dispatchEvent(data);
    } catch (error) {
      console.error('[WebSocketClient] Failed to parse message:', error, event.data);
    }
  }

  private dispatchEvent(event: WebSocketEvent): void {
    // Find all subscriptions that match this event type
    const matchingSubscriptions = this.subscriptions.filter(sub =>
      sub.eventTypes.includes(event.type) || sub.eventTypes.includes('*')
    );

    // Call each handler
    matchingSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error(`[WebSocketClient] Error in event handler for subscription ${subscription.id}:`, error);
      }
    });
  }

  /**
   * Subscribe to payment events
   */
  subscribeToPayments(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'payment:created',
      'payment:status_changed',
      'payment:approved',
      'payment:rejected',
      'payment:executed',
      'payment:failed',
    ], handler);
  }

  /**
   * Subscribe to policy events
   */
  subscribeToPolicies(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'policy:updated',
      'policy:evaluated',
      'policy:violation',
    ], handler);
  }

  /**
   * Subscribe to budget events
   */
  subscribeToBudget(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'budget:warning',
      'budget:exceeded',
      'budget:updated',
      'budget:reset',
    ], handler);
  }

  /**
   * Subscribe to agent events
   */
  subscribeToAgents(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'agent:connected',
      'agent:disconnected',
      'agent:authorized',
      'agent:permissions_updated',
    ], handler);
  }

  /**
   * Subscribe to system events
   */
  subscribeToSystem(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'system:alert',
      'system:emergency_paused',
      'system:emergency_resumed',
      'system:maintenance',
      'system:health_check',
    ], handler);
  }

  /**
   * Subscribe to audit events
   */
  subscribeToAudit(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe([
      'audit:event',
      'audit:export_completed',
      'audit:cleanup_completed',
    ], handler);
  }

  /**
   * Subscribe to all events
   */
  subscribeToAll(handler: (event: WebSocketEvent) => void): string {
    return this.subscribe('*', handler);
  }
}