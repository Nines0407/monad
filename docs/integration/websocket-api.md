# WebSocket API 文档

## 概述

Agentic Payment System WebSocket API 提供实时双向通信能力，允许客户端接收支付状态更新、策略变更通知、系统事件和预算警告。WebSocket 连接支持自动重连、心跳检测和高效的消息压缩。

## 基础信息

- **连接 URL**: `wss://api.agenticpay.com/ws`
- **测试环境**: `wss://testnet.api.agenticpay.com/ws`
- **本地开发**: `ws://localhost:3001/ws`
- **协议版本**: v1
- **消息格式**: JSON
- **认证方式**: JWT Token, API Key

## 快速开始

### 1. 基础连接示例

```javascript
// 使用原生 WebSocket
const socket = new WebSocket('wss://api.agenticpay.com/ws');

socket.onopen = () => {
  console.log('WebSocket 连接已建立');
  
  // 发送认证消息
  socket.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN'
  }));
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('收到消息:', message);
};

socket.onclose = () => {
  console.log('WebSocket 连接已关闭');
};

socket.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};
```

### 2. 使用官方客户端库

```typescript
import { WebSocketClient } from '@agentic-pay/sdk';

const wsClient = new WebSocketClient({
  url: 'wss://api.agenticpay.com/ws',
  token: process.env.AGENTIC_PAY_API_KEY,
  autoReconnect: true,
  reconnectInterval: 5000
});

// 连接
await wsClient.connect();

// 订阅事件
wsClient.subscribe('payment:status_changed', (data) => {
  console.log(`支付状态变更: ${data.paymentId} -> ${data.status}`);
});

wsClient.subscribe('budget:warning', (data) => {
  console.log(`预算警告: ${data.message}`);
});

// 断开连接
wsClient.disconnect();
```

## 连接管理

### 建立连接

#### 连接 URL

```
wss://api.agenticpay.com/ws[?token=<token>]
```

支持查询参数认证：

```javascript
// 通过 URL 参数传递 token
const socket = new WebSocket('wss://api.agenticpay.com/ws?token=YOUR_TOKEN');
```

#### 认证流程

连接建立后，必须在 10 秒内完成认证：

```javascript
// 认证消息格式
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "clientId": "dashboard_123", // 可选，客户端标识
  "version": "1.0.0" // 可选，客户端版本
}
```

**认证成功响应**:
```json
{
  "type": "auth_success",
  "clientId": "dashboard_123",
  "userId": "user_456",
  "permissions": ["payments:read", "payments:write"],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**认证失败响应**:
```json
{
  "type": "auth_failed",
  "reason": "invalid_token",
  "message": "认证令牌无效或已过期",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 心跳检测

WebSocket 连接每 30 秒发送一次心跳检测：

```javascript
// 服务器发送的心跳检测
{
  "type": "ping",
  "timestamp": "2024-01-01T00:00:00Z"
}

// 客户端应响应
{
  "type": "pong",
  "timestamp": "2024-01-01T00:00:01Z"
}
```

如果客户端在 90 秒内未响应心跳，服务器将关闭连接。

### 自动重连

客户端应实现自动重连机制：

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    
    this.connect();
  }
  
  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('连接成功');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onclose = (event) => {
      console.log(`连接关闭，代码: ${event.code}, 原因: ${event.reason}`);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts);
        console.log(`${delay}ms 后尝试重连...`);
        
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };
  }
}
```

## 消息协议

### 消息格式

所有消息使用 JSON 格式：

```typescript
interface WebSocketMessage {
  type: string;           // 消息类型
  id?: string;            // 消息 ID (用于请求-响应匹配)
  timestamp: string;      // ISO 时间戳
  data?: any;             // 消息数据
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 消息类型

#### 控制消息

| 类型 | 方向 | 描述 |
|------|------|------|
| `auth` | 客户端→服务器 | 认证请求 |
| `auth_success` | 服务器→客户端 | 认证成功 |
| `auth_failed` | 服务器→客户端 | 认证失败 |
| `ping` | 服务器→客户端 | 心跳检测 |
| `pong` | 客户端→服务器 | 心跳响应 |
| `subscribe` | 客户端→服务器 | 订阅事件 |
| `unsubscribe` | 客户端→服务器 | 取消订阅 |
| `subscription_confirmed` | 服务器→客户端 | 订阅确认 |
| `unsubscribe_confirmed` | 服务器→客户端 | 取消订阅确认 |
| `error` | 双向 | 错误消息 |

#### 事件消息

| 类型 | 描述 | 数据格式 |
|------|------|----------|
| `payment:created` | 新支付创建 | `PaymentCreatedEvent` |
| `payment:status_changed` | 支付状态变更 | `PaymentStatusChangedEvent` |
| `payment:approved` | 支付已批准 | `PaymentApprovedEvent` |
| `payment:rejected` | 支付被拒绝 | `PaymentRejectedEvent` |
| `payment:completed` | 支付已完成 | `PaymentCompletedEvent` |
| `payment:failed` | 支付失败 | `PaymentFailedEvent` |
| `policy:created` | 策略创建 | `PolicyCreatedEvent` |
| `policy:updated` | 策略更新 | `PolicyUpdatedEvent` |
| `policy:deleted` | 策略删除 | `PolicyDeletedEvent` |
| `budget:warning` | 预算警告 | `BudgetWarningEvent` |
| `budget:exceeded` | 预算超支 | `BudgetExceededEvent` |
| `budget:updated` | 预算更新 | `BudgetUpdatedEvent` |
| `agent:connected` | 代理连接 | `AgentConnectedEvent` |
| `agent:disconnected` | 代理断开 | `AgentDisconnectedEvent` |
| `agent:paused` | 代理暂停 | `AgentPausedEvent` |
| `agent:resumed` | 代理恢复 | `AgentResumedEvent` |
| `emergency:triggered` | 紧急暂停触发 | `EmergencyTriggeredEvent` |
| `system:alert` | 系统警报 | `SystemAlertEvent` |
| `audit:event` | 审计事件 | `AuditEvent` |

## 订阅管理

### 订阅事件

```javascript
// 订阅单个事件类型
{
  "type": "subscribe",
  "id": "sub_123",
  "eventType": "payment:status_changed",
  "filters": {
    "agentId": "agent_claude_code",
    "status": ["completed", "failed"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}

// 订阅多个事件类型
{
  "type": "subscribe",
  "id": "sub_456",
  "eventTypes": ["payment:created", "payment:completed", "budget:warning"],
  "filters": {
    "agentId": "agent_claude_code"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**订阅成功响应**:
```json
{
  "type": "subscription_confirmed",
  "subscriptionId": "sub_123",
  "eventTypes": ["payment:status_changed"],
  "filters": {
    "agentId": "agent_claude_code"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 取消订阅

```javascript
{
  "type": "unsubscribe",
  "subscriptionId": "sub_123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**取消订阅成功响应**:
```json
{
  "type": "unsubscribe_confirmed",
  "subscriptionId": "sub_123",
  "timestamp": "2024-01-01T00:00:01Z"
}
```

### 过滤器

订阅支持多种过滤器：

```javascript
{
  "type": "subscribe",
  "eventType": "payment:status_changed",
  "filters": {
    // 代理过滤
    "agentId": "agent_claude_code",
    "agentIds": ["agent_claude_code", "agent_openclaw"],
    
    // 支付属性过滤
    "status": ["completed", "failed"],
    "category": ["api", "infrastructure"],
    "minAmount": "1.0",
    "maxAmount": "1000.0",
    
    // 时间过滤
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-31T23:59:59Z",
    
    // 自定义条件
    "conditions": [
      {
        "field": "recipient",
        "operator": "startsWith",
        "value": "0x742d"
      }
    ]
  }
}
```

## 事件详情

### 支付事件

#### PaymentCreatedEvent - 支付创建事件

```typescript
interface PaymentCreatedEvent {
  type: 'payment:created';
  data: {
    paymentId: string;
    agentId: string;
    amount: string;
    currency: string;
    recipient: string;
    reason: string;
    category: string;
    status: 'pending';
    createdAt: string;
    taskContext?: {
      taskId: string;
      taskDescription: string;
      taskType: string;
    };
    policyEvaluations: Array<{
      policyId: string;
      decision: 'approved' | 'rejected' | 'requires_approval';
      evaluatedRules: Array<{
        ruleId: string;
        name: string;
        condition: string;
      }>;
    }>;
  };
  timestamp: string;
}
```

**示例**:
```json
{
  "type": "payment:created",
  "data": {
    "paymentId": "pay_1234567890abcdef",
    "agentId": "agent_claude_code",
    "amount": "1.5",
    "currency": "USDC",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
    "reason": "API 调用额度",
    "category": "api",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    "taskContext": {
      "taskId": "task_12345",
      "taskDescription": "自动API调用费用",
      "taskType": "api_integration"
    },
    "policyEvaluations": [
      {
        "policyId": "policy_123",
        "decision": "approved",
        "evaluatedRules": [
          {
            "ruleId": "rule_456",
            "name": "每日限额检查",
            "condition": "dailySpent + amount <= dailyLimit"
          }
        ]
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### PaymentStatusChangedEvent - 支付状态变更事件

```typescript
interface PaymentStatusChangedEvent {
  type: 'payment:status_changed';
  data: {
    paymentId: string;
    previousStatus: string;
    newStatus: string;
    changedAt: string;
    changedBy?: string;
    reason?: string;
    transactionHash?: string;
    metadata?: any;
  };
  timestamp: string;
}
```

#### PaymentCompletedEvent - 支付完成事件

```typescript
interface PaymentCompletedEvent {
  type: 'payment:completed';
  data: {
    paymentId: string;
    amount: string;
    currency: string;
    recipient: string;
    transactionHash: string;
    blockNumber: number;
    completedAt: string;
    gasUsed: string;
    gasPrice: string;
    totalCost: string;
  };
  timestamp: string;
}
```

### 预算事件

#### BudgetWarningEvent - 预算警告事件

```typescript
interface BudgetWarningEvent {
  type: 'budget:warning';
  data: {
    agentId: string;
    warningType: 'approaching_limit' | 'high_usage' | 'unusual_activity';
    message: string;
    currentUsage: number; // 百分比
    threshold: number;    // 阈值百分比
    dailySpent: string;
    dailyLimit: string;
    remaining: string;
    currency: string;
    suggestedActions: string[];
  };
  timestamp: string;
}
```

#### BudgetExceededEvent - 预算超支事件

```typescript
interface BudgetExceededEvent {
  type: 'budget:exceeded';
  data: {
    agentId: string;
    exceededBy: string;
    dailyLimit: string;
    dailySpent: string;
    currency: string;
    actionsTaken: string[]; // 如: ['block_new_payments', 'notify_admins']
    autoResumeAt?: string; // 自动恢复时间
  };
  timestamp: string;
}
```

### 代理事件

#### AgentPausedEvent - 代理暂停事件

```typescript
interface AgentPausedEvent {
  type: 'agent:paused';
  data: {
    agentId: string;
    pausedBy: string; // 'system', 'user_123', 'agent_456'
    reason: string;
    duration?: number; // 分钟
    expectedResumeAt?: string;
    affectedPayments: number;
  };
  timestamp: string;
}
```

#### AgentResumedEvent - 代理恢复事件

```typescript
interface AgentResumedEvent {
  type: 'agent:resumed';
  data: {
    agentId: string;
    resumedBy: string;
    reason: string;
    pausedDuration: number; // 分钟
    backlogProcessed: number; // 处理的积压支付数量
  };
  timestamp: string;
}
```

### 系统事件

#### EmergencyTriggeredEvent - 紧急暂停触发事件

```typescript
interface EmergencyTriggeredEvent {
  type: 'emergency:triggered';
  data: {
    triggeredBy: string;
    reason: string;
    scope: 'all' | 'agent' | 'category';
    scopeIds: string[];
    duration: number; // 分钟，0 表示手动恢复
    affectedAgents: number;
    affectedPayments: number;
    emergencyId: string;
  };
  timestamp: string;
}
```

#### SystemAlertEvent - 系统警报事件

```typescript
interface SystemAlertEvent {
  type: 'system:alert';
  data: {
    alertId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'performance' | 'security' | 'availability' | 'data';
    title: string;
    message: string;
    details: any;
    actions: string[];
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    resolvedAt?: string;
  };
  timestamp: string;
}
```

### 审计事件

#### AuditEvent - 审计事件

```typescript
interface AuditEventMessage {
  type: 'audit:event';
  data: {
    auditId: string;
    eventType: string;
    actorType: 'agent' | 'user' | 'system';
    actorId: string;
    targetType?: string;
    targetId?: string;
    action: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    timestamp: string;
  };
  timestamp: string;
}
```

## 客户端实现

### JavaScript/TypeScript 客户端

```typescript
class AgenticPayWebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  
  constructor(
    private url: string,
    private token: string,
    private options: {
      autoReconnect?: boolean;
      reconnectInterval?: number;
      heartbeatInterval?: number;
    } = {}
  ) {}
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        
        // 发送认证
        this.send({
          type: 'auth',
          token: this.token,
          clientId: this.generateClientId()
        });
        
        // 设置心跳检测
        if (this.options.heartbeatInterval) {
          setInterval(() => {
            this.send({ type: 'pong', timestamp: new Date().toISOString() });
          }, this.options.heartbeatInterval);
        }
        
        resolve();
      };
      
      this.socket.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
      
      this.socket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        this.handleDisconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }
  
  private handleMessage(message: any) {
    // 处理控制消息
    switch (message.type) {
      case 'auth_success':
        console.log('Authentication successful');
        break;
      case 'auth_failed':
        console.error('Authentication failed:', message.message);
        break;
      case 'ping':
        this.send({ type: 'pong', timestamp: new Date().toISOString() });
        break;
      case 'subscription_confirmed':
        console.log(`Subscription confirmed: ${message.subscriptionId}`);
        break;
      case 'error':
        console.error('WebSocket error:', message.error);
        break;
    }
    
    // 触发事件监听器
    const listeners = this.subscriptions.get(message.type) || [];
    listeners.forEach(listener => listener(message.data));
  }
  
  private handleDisconnect() {
    if (this.options.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = (this.options.reconnectInterval || 5000) * Math.pow(1.5, this.reconnectAttempts);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
        this.connect();
      }, delay);
    }
  }
  
  subscribe(eventType: string, callback: Function): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 发送订阅请求
    this.send({
      type: 'subscribe',
      id: subscriptionId,
      eventType,
      timestamp: new Date().toISOString()
    });
    
    // 保存回调
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(callback);
    
    return subscriptionId;
  }
  
  unsubscribe(subscriptionId: string): void {
    this.send({
      type: 'unsubscribe',
      subscriptionId,
      timestamp: new Date().toISOString()
    });
  }
  
  private send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }
  
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
  }
}
```

### Python 客户端

```python
import asyncio
import json
import websockets
from typing import Dict, List, Callable, Optional
import time

class AgenticPayWebSocketClient:
    def __init__(self, url: str, token: str, auto_reconnect: bool = True):
        self.url = url
        self.token = token
        self.auto_reconnect = auto_reconnect
        self.websocket = None
        self.subscriptions: Dict[str, List[Callable]] = {}
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        
    async def connect(self):
        """建立 WebSocket 连接"""
        try:
            self.websocket = await websockets.connect(self.url)
            print("WebSocket connected")
            
            # 发送认证
            await self.send({
                "type": "auth",
                "token": self.token,
                "clientId": self._generate_client_id()
            })
            
            # 启动消息处理循环
            asyncio.create_task(self._message_loop())
            
            # 启动心跳检测
            asyncio.create_task(self._heartbeat_loop())
            
        except Exception as e:
            print(f"Connection failed: {e}")
            await self._handle_reconnect()
            
    async def _message_loop(self):
        """消息处理循环"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self._handle_message(data)
        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed: {e}")
            await self._handle_reconnect()
            
    async def _handle_message(self, message: Dict):
        """处理收到的消息"""
        message_type = message.get("type")
        
        # 处理控制消息
        if message_type == "auth_success":
            print("Authentication successful")
            self.reconnect_attempts = 0
        elif message_type == "auth_failed":
            print(f"Authentication failed: {message.get('message')}")
        elif message_type == "ping":
            await self.send({"type": "pong", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
        elif message_type == "subscription_confirmed":
            print(f"Subscription confirmed: {message.get('subscriptionId')}")
            
        # 触发事件监听器
        if message_type in self.subscriptions:
            for callback in self.subscriptions[message_type]:
                asyncio.create_task(callback(message.get("data", {})))
                
    async def _heartbeat_loop(self):
        """心跳检测循环"""
        while True:
            await asyncio.sleep(30)  # 每30秒发送一次心跳
            
            if self.websocket and self.websocket.open:
                await self.send({"type": "pong", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
            else:
                break
                
    async def _handle_reconnect(self):
        """处理重连"""
        if self.auto_reconnect and self.reconnect_attempts < self.max_reconnect_attempts:
            delay = 5 * (1.5 ** self.reconnect_attempts)
            print(f"Reconnecting in {delay:.1f} seconds...")
            
            await asyncio.sleep(delay)
            self.reconnect_attempts += 1
            
            try:
                await self.connect()
            except Exception as e:
                print(f"Reconnect failed: {e}")
                
    async def subscribe(self, event_type: str, callback: Callable) -> str:
        """订阅事件"""
        subscription_id = f"sub_{int(time.time())}_{hash(callback)}"
        
        await self.send({
            "type": "subscribe",
            "id": subscription_id,
            "eventType": event_type,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
        
        if event_type not in self.subscriptions:
            self.subscriptions[event_type] = []
        self.subscriptions[event_type].append(callback)
        
        return subscription_id
        
    async def unsubscribe(self, subscription_id: str):
        """取消订阅"""
        await self.send({
            "type": "unsubscribe",
            "subscriptionId": subscription_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
        
    async def send(self, data: Dict):
        """发送消息"""
        if self.websocket and self.websocket.open:
            await self.websocket.send(json.dumps(data))
        else:
            print("WebSocket not connected")
            
    def _generate_client_id(self) -> str:
        """生成客户端 ID"""
        return f"python_client_{int(time.time())}"
        
    async def disconnect(self):
        """断开连接"""
        if self.websocket:
            await self.websocket.close()
            print("WebSocket disconnected")
```

### React Hook 示例

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  token: string;
  autoReconnect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { url, token, autoReconnect = true, onOpen, onClose, onError } = options;
  
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const subscriptionsRef = useRef<Map<string, Function[]>>(new Map());
  
  const connect = useCallback(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // 发送认证
      socket.send(JSON.stringify({
        type: 'auth',
        token,
        clientId: `web_${Date.now()}`
      }));
      
      onOpen?.();
    };
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      
      // 触发订阅回调
      const listeners = subscriptionsRef.current.get(message.type) || [];
      listeners.forEach(listener => listener(message.data));
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onClose?.();
      
      // 自动重连
      if (autoReconnect) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };
    
    return () => {
      socket.close();
    };
  }, [url, token, autoReconnect, onOpen, onClose, onError]);
  
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);
  
  const send = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);
  
  const subscribe = useCallback((eventType: string, callback: Function) => {
    const subscriptionId = `sub_${Date.now()}`;
    
    // 发送订阅请求
    send({
      type: 'subscribe',
      id: subscriptionId,
      eventType,
      timestamp: new Date().toISOString()
    });
    
    // 保存回调
    if (!subscriptionsRef.current.has(eventType)) {
      subscriptionsRef.current.set(eventType, []);
    }
    subscriptionsRef.current.get(eventType)!.push(callback);
    
    return subscriptionId;
  }, [send]);
  
  const unsubscribe = useCallback((subscriptionId: string) => {
    send({
      type: 'unsubscribe',
      subscriptionId,
      timestamp: new Date().toISOString()
    });
  }, [send]);
  
  return {
    isConnected,
    messages,
    send,
    subscribe,
    unsubscribe
  };
}

// 使用示例
function PaymentDashboard() {
  const { isConnected, messages, subscribe, unsubscribe } = useWebSocket({
    url: 'wss://api.agenticpay.com/ws',
    token: process.env.REACT_APP_API_KEY || '',
    autoReconnect: true
  });
  
  useEffect(() => {
    const subId = subscribe('payment:status_changed', (data) => {
      console.log('Payment status changed:', data);
      // 更新 UI
    });
    
    const budgetSubId = subscribe('budget:warning', (data) => {
      console.log('Budget warning:', data);
      // 显示警告
    });
    
    return () => {
      unsubscribe(subId);
      unsubscribe(budgetSubId);
    };
  }, [subscribe, unsubscribe]);
  
  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Messages received: {messages.length}</div>
      {/* 其他 UI 组件 */}
    </div>
  );
}
```

## 错误处理

### 错误消息格式

```json
{
  "type": "error",
  "error": {
    "code": "subscription_failed",
    "message": "无法订阅事件 'payment:status_changed'",
    "details": {
      "reason": "invalid_event_type",
      "suggestions": ["payment:created", "payment:completed"]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|----------|------|----------|
| `auth_required` | 需要认证 | 发送认证消息 |
| `invalid_token` | 令牌无效 | 检查令牌有效性 |
| `insufficient_permissions` | 权限不足 | 检查订阅权限 |
| `invalid_event_type` | 无效事件类型 | 检查事件类型拼写 |
| `subscription_limit_exceeded` | 订阅数量超限 | 减少订阅数量 |
| `rate_limit_exceeded` | 频率限制 | 降低消息发送频率 |
| `connection_timeout` | 连接超时 | 检查网络连接 |
| `server_error` | 服务器错误 | 稍后重试 |

### 重连策略

```javascript
// 指数退避重连策略
const RECONNECT_STRATEGY = {
  initialDelay: 1000,      // 1秒
  maxDelay: 30000,         // 30秒
  multiplier: 1.5,         // 每次重连延迟乘数
  maxAttempts: 10          // 最大重试次数
};

function calculateReconnectDelay(attempt) {
  const delay = RECONNECT_STRATEGY.initialDelay * 
                Math.pow(RECONNECT_STRATEGY.multiplier, attempt);
  return Math.min(delay, RECONNECT_STRATEGY.maxDelay);
}
```

## 性能优化

### 消息压缩

对于大量消息，启用压缩：

```javascript
// 客户端启用压缩
const socket = new WebSocket('wss://api.agenticpay.com/ws', {
  compression: 'deflate'  // 或 'gzip'
});

// 服务器响应压缩消息
{
  "type": "payment:status_changed",
  "data": { ... },
  "compressed": true,
  "originalSize": 1024,
  "compressedSize": 256
}
```

### 批量消息

```javascript
// 服务器发送批量消息
{
  "type": "batch",
  "messages": [
    { "type": "payment:status_changed", "data": { ... } },
    { "type": "budget:updated", "data": { ... } },
    { "type": "audit:event", "data": { ... } }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 连接池

对于多页面应用，使用共享连接：

```javascript
// 共享 WebSocket 连接管理器
class WebSocketConnectionPool {
  static instance = null;
  connections = new Map();
  
  static getInstance() {
    if (!WebSocketConnectionPool.instance) {
      WebSocketConnectionPool.instance = new WebSocketConnectionPool();
    }
    return WebSocketConnectionPool.instance;
  }
  
  getConnection(url, token) {
    const key = `${url}|${token}`;
    
    if (!this.connections.has(key)) {
      const connection = new AgenticPayWebSocketClient(url, token);
      this.connections.set(key, connection);
      connection.connect();
    }
    
    return this.connections.get(key);
  }
}

// 使用共享连接
const pool = WebSocketConnectionPool.getInstance();
const connection = pool.getConnection(
  'wss://api.agenticpay.com/ws',
  'YOUR_TOKEN'
);
```

## 安全考虑

### 1. 认证和授权

- 所有连接必须认证
- 令牌有效期限制（通常24小时）
- 基于角色的访问控制
- 订阅权限验证

### 2. 消息验证

- 验证消息格式
- 防止消息注入
- 限制消息大小
- 速率限制

### 3. 连接安全

- 使用 WSS (WebSocket Secure)
- 防止跨站 WebSocket 劫持
- 合适的 CORS 配置
- 连接数量限制

### 4. 数据保护

- 敏感数据加密
- 不记录敏感信息
- 安全审计日志
- 数据保留策略

## 监控和调试

### 连接状态监控

```javascript
// 监控连接状态
const monitor = {
  connectTime: null,
  disconnectTime: null,
  messagesReceived: 0,
  messagesSent: 0,
  errors: [],
  
  onConnect() {
    this.connectTime = new Date();
    this.disconnectTime = null;
  },
  
  onDisconnect() {
    this.disconnectTime = new Date();
  },
  
  onMessageReceived() {
    this.messagesReceived++;
  },
  
  onMessageSent() {
    this.messagesSent++;
  },
  
  onError(error) {
    this.errors.push({
      time: new Date(),
      error
    });
  },
  
  getStats() {
    return {
      uptime: this.disconnectTime ? 
        this.disconnectTime - this.connectTime : 
        Date.now() - this.connectTime,
      messagesReceived: this.messagesReceived,
      messagesSent: this.messagesSent,
      errorCount: this.errors.length,
      lastError: this.errors[this.errors.length - 1]
    };
  }
};
```

### 调试工具

浏览器开发者工具中监控 WebSocket：

1. **Chrome DevTools**: Network → WS → 查看消息
2. **Firefox DevTools**: Network → WS → 查看框架
3. **第三方工具**: WSCat, WebSocket King

## 限制和配额

### 连接限制

| 用户类型 | 最大连接数 | 消息频率限制 | 订阅限制 |
|----------|------------|--------------|----------|
| 免费用户 | 3 | 10/秒 | 10个事件 |
| 标准用户 | 10 | 50/秒 | 50个事件 |
| 高级用户 | 30 | 100/秒 | 200个事件 |
| 企业用户 | 100 | 500/秒 | 1000个事件 |

### 消息大小限制

- 单个消息: 最大 1MB
- 批量消息: 最大 5MB
- 压缩后消息: 最大 10MB

### 连接超时

- 认证超时: 10秒
- 心跳超时: 90秒
- 空闲超时: 300秒

## 版本信息

- **协议版本**: v1
- **最后更新**: 2024-01-01
- **支持的特性**:
  - 实时事件订阅
  - 双向通信
  - 自动重连
  - 心跳检测
  - 消息压缩
  - 批量消息
  - 安全认证

---

*本文档根据 Agentic Payment System 集成层规范生成，确保开发者能够充分利用 WebSocket API 的全部功能。*