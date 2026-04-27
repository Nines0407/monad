import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import { 
  WebSocketEvent, 
  IntegrationConfig,
  getDefaultConfig 
} from '@agent-pay/shared';

// Load environment variables
config();

interface ClientConnection {
  ws: WebSocket;
  id: string;
  subscriptions: Set<string>;
  authenticated: boolean;
  agentId?: string;
  userId?: string;
  lastPing: number;
}

export class WebSocketServerManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private config: IntegrationConfig;
  private pingInterval: NodeJS.Timeout;

  constructor() {
    this.config = getDefaultConfig();
    const port = this.config.websocketServer.port;
    const host = this.config.websocketServer.host;

    this.wss = new WebSocketServer({ 
      port,
      host,
      clientTracking: true,
    });

    console.log(`WebSocket server running on ws://${host}:${port}`);

    this.setupEventHandlers();
    this.startPingInterval();
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, _request) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = {
        ws,
        id: clientId,
        subscriptions: new Set(),
        authenticated: false,
        lastPing: Date.now(),
      };

      this.clients.set(clientId, client);

      console.log(`Client connected: ${clientId} (Total: ${this.clients.size})`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        message: 'Connected to Agentic Payment System WebSocket',
        clientId,
        timestamp: new Date().toISOString(),
      });

      // Setup message handler
      ws.on('message', (data: Buffer) => {
        this.handleMessage(clientId, data.toString());
      });

      // Setup close handler
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Setup error handler
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.wss.on('close', () => {
      console.log('WebSocket server closed');
      clearInterval(this.pingInterval);
    });
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const timeout = this.config.websocketServer.pingInterval * 2;

    this.clients.forEach((client, _clientId) => {
        if (now - client.lastPing > timeout) {
          console.log(`Client ${_clientId} timed out, disconnecting`);
          client.ws.close(1000, 'Ping timeout');
          this.clients.delete(_clientId);
        } else {
          // Send ping to active clients
          this.sendToClient(_clientId, {
            type: 'ping',
            timestamp: new Date().toISOString(),
          });
        }
      });
    }, this.config.websocketServer.pingInterval);
  }

  private handleMessage(clientId: string, message: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const data = JSON.parse(message);

      // Update last ping time on any message
      client.lastPing = Date.now();

      switch (data.type) {
        case 'ping':
          this.handlePing(clientId, data);
          break;
        
        case 'pong':
          this.handlePong(clientId, data);
          break;
        
        case 'authenticate':
          this.handleAuthentication(clientId, data);
          break;
        
        case 'subscribe':
          this.handleSubscribe(clientId, data);
          break;
        
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, data);
          break;
        
        case 'broadcast':
          this.handleBroadcast(clientId, data);
          break;
        
        default:
          this.sendToClient(clientId, {
            type: 'error',
            message: 'Unknown message type',
            receivedType: data.type,
            timestamp: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error(`Failed to parse message from client ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid JSON message',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handlePing(clientId: string, data: any): void {
    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: new Date().toISOString(),
      originalTimestamp: data.timestamp,
    });
  }

  private handlePong(clientId: string, _data: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = Date.now();
    }
  }

  private handleAuthentication(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // In a real implementation, validate token with auth service
    const { token, agentId, userId } = data;

    // Simple validation for demo purposes
    const isValid = token === process.env.WS_AUTH_TOKEN || 
                   token === this.config.security.jwtSecret;

    if (isValid) {
      client.authenticated = true;
      client.agentId = agentId;
      client.userId = userId;

      this.sendToClient(clientId, {
        type: 'authentication_success',
        message: 'Authentication successful',
        agentId,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Client ${clientId} authenticated as agent: ${agentId}, user: ${userId}`);
    } else {
      this.sendToClient(clientId, {
        type: 'authentication_failed',
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleSubscribe(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!client.authenticated) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Authentication required for subscriptions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { subscriptionId, eventTypes } = data;
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    types.forEach(eventType => {
      client.subscriptions.add(eventType);
    });

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      subscriptionId,
      eventTypes: types,
      timestamp: new Date().toISOString(),
    });

    console.log(`Client ${clientId} subscribed to: ${types.join(', ')}`);
  }

  private handleUnsubscribe(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { subscriptionId, eventTypes } = data;
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    types.forEach(eventType => {
      client.subscriptions.delete(eventType);
    });

    this.sendToClient(clientId, {
      type: 'unsubscribe_confirmed',
      subscriptionId,
      eventTypes: types,
      timestamp: new Date().toISOString(),
    });

    console.log(`Client ${clientId} unsubscribed from: ${types.join(', ')}`);
  }

  private handleBroadcast(clientId: string, data: any): void {
    // In a real implementation, this would require admin privileges
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!client.authenticated) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Authentication required for broadcast',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { event, channels } = data;
    this.broadcast(event, channels);
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`Client disconnected: ${clientId} (Agent: ${client.agentId || 'none'})`);
      this.clients.delete(clientId);
    }
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
      }
    }
  }

  public broadcast(event: WebSocketEvent, channels?: string[]): void {
    const message = JSON.stringify(event);
    
    this.clients.forEach((client, clientId) => {
      if (!client.authenticated || client.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      // Check if client is subscribed to this event type
      const shouldSend = !channels || 
                        channels.some(channel => client.subscriptions.has(channel)) ||
                        client.subscriptions.has('*') ||
                        client.subscriptions.has(event.type);

      if (shouldSend) {
        try {
          client.ws.send(message);
        } catch (error) {
          console.error(`Failed to broadcast to client ${clientId}:`, error);
        }
      }
    });
  }

  public broadcastToAgents(event: WebSocketEvent, agentIds: string[]): void {
    this.clients.forEach((client, _clientId) => {
      if (client.authenticated && 
          client.agentId && 
          agentIds.includes(client.agentId) &&
          client.ws.readyState === WebSocket.OPEN) {
        
        try {
          client.ws.send(JSON.stringify(event));
        } catch (error) {
          console.error(`Failed to broadcast to agent ${client.agentId}:`, error);
        }
      }
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public getAuthenticatedCount(): number {
    return Array.from(this.clients.values()).filter(c => c.authenticated).length;
  }

  public getStats(): {
    totalClients: number;
    authenticatedClients: number;
    subscriptions: Record<string, number>;
  } {
    const subscriptions: Record<string, number> = {};
    
    this.clients.forEach(client => {
      client.subscriptions.forEach(eventType => {
        subscriptions[eventType] = (subscriptions[eventType] || 0) + 1;
      });
    });

    return {
      totalClients: this.clients.size,
      authenticatedClients: this.getAuthenticatedCount(),
      subscriptions,
    };
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public close(): void {
    clearInterval(this.pingInterval);
    this.wss.close();
    this.clients.clear();
  }
}

// Start server if this is the main module
if (require.main === module) {
  const server = new WebSocketServerManager();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    server.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down WebSocket server...');
    server.close();
    process.exit(0);
  });
}

