# 故障排查手册

## 概述

本文档提供 Agentic Payment System 集成过程中常见问题的解决方案和排查步骤。涵盖认证、连接、API 调用、WebSocket 连接等方面的问题。

## 快速诊断

### 1. 检查基础连接

```bash
# 检查 API 端点可访问性
curl -I https://api.agenticpay.com/health

# 检查测试网络
curl -I https://testnet.api.agenticpay.com/health

# 检查本地开发环境
curl -I http://localhost:3001/health
```

### 2. 验证 API 密钥

```bash
# 测试 API 密钥有效性
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.agenticpay.com/api/v1/health
```

### 3. 检查网络连接

```bash
# 检查 DNS 解析
nslookup api.agenticpay.com

# 检查端口连接
telnet api.agenticpay.com 443

# 检查防火墙规则
# Windows:
netsh advfirewall firewall show rule name=all
# Linux:
sudo iptables -L
```

## 常见问题分类

### 认证和授权问题

#### 问题 1: API 密钥无效或过期

**症状**:
- HTTP 401 错误
- "Authentication failed" 消息
- WebSocket 连接立即关闭

**解决方案**:
```bash
# 1. 检查 API 密钥格式
echo "API Key: ${AGENTIC_PAY_API_KEY:0:10}..."  # 只显示前10个字符

# 2. 在控制台重新生成 API 密钥
# 访问: https://console.agenticpay.com/api-keys

# 3. 验证密钥权限
curl -H "Authorization: Bearer YOUR_NEW_API_KEY" \
  https://api.agenticpay.com/api/v1/health

# 4. 更新环境变量
# .env 文件:
AGENTIC_PAY_API_KEY=sk_live_xxxxxxxxxxxx

# 5. 重启应用使新密钥生效
```

**预防措施**:
- 定期轮换 API 密钥（每90天）
- 为不同环境使用不同密钥
- 使用密钥管理服务（如 AWS Secrets Manager, HashiCorp Vault）

#### 问题 2: 权限不足

**症状**:
- HTTP 403 错误
- "Insufficient permissions" 消息
- 特定操作失败

**解决方案**:
```typescript
// 检查当前权限
import { AgentPay } from '@agentic-pay/sdk';

const agentPay = new AgentPay({ apiKey: process.env.AGENTIC_PAY_API_KEY });

async function checkPermissions() {
  try {
    // 尝试执行需要权限的操作
    const payments = await agentPay.listPayments({ limit: 1 });
    console.log('具有 payments:read 权限');
  } catch (error) {
    if (error.code === 'FORBIDDEN') {
      console.log('缺少 payments:read 权限');
    }
  }
  
  try {
    await agentPay.requestPayment({...});
    console.log('具有 payments:write 权限');
  } catch (error) {
    if (error.code === 'FORBIDDEN') {
      console.log('缺少 payments:write 权限');
    }
  }
}
```

**所需最小权限**:
| 操作 | 所需权限 |
|------|----------|
| 读取支付记录 | `payments:read` |
| 创建支付请求 | `payments:write` |
| 读取预算信息 | `budgets:read` |
| 更新预算 | `budgets:write` |
| 读取策略 | `policies:read` |
| 更新策略 | `policies:write` |
| 读取审计日志 | `audit:read` |

#### 问题 3: JWT 令牌过期

**症状**:
- 间歇性认证失败
- 长时间运行后出现 401 错误
- WebSocket 连接断开

**解决方案**:
```javascript
// 自动刷新令牌的客户端实现
class AuthClient {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.autoRefreshInterval = null;
  }
  
  async login(apiKey) {
    const response = await fetch('https://api.agenticpay.com/api/v1/auth/token', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const data = await response.json();
    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.tokenExpiry = Date.now() + (data.expiresIn * 1000);
    
    // 设置自动刷新
    this.startAutoRefresh();
    
    return this.token;
  }
  
  async refresh() {
    const response = await fetch('https://api.agenticpay.com/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.refreshToken}` }
    });
    
    const data = await response.json();
    this.token = data.accessToken;
    this.tokenExpiry = Date.now() + (data.expiresIn * 1000);
    
    return this.token;
  }
  
  startAutoRefresh() {
    // 在令牌过期前5分钟刷新
    const refreshTime = this.tokenExpiry - (5 * 60 * 1000) - Date.now();
    
    if (this.autoRefreshInterval) {
      clearTimeout(this.autoRefreshInterval);
    }
    
    this.autoRefreshInterval = setTimeout(async () => {
      try {
        await this.refresh();
        this.startAutoRefresh();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // 重新登录
        await this.login(process.env.AGENTIC_PAY_API_KEY);
      }
    }, Math.max(refreshTime, 0));
  }
  
  getToken() {
    // 如果令牌即将过期，立即刷新
    if (Date.now() > this.tokenExpiry - (60 * 1000)) {
      this.refresh().catch(console.error);
    }
    
    return this.token;
  }
}
```

### 连接和网络问题

#### 问题 4: API 请求超时

**症状**:
- 请求长时间无响应
- 网络超时错误
- 间歇性连接失败

**解决方案**:
```javascript
// 1. 增加超时时间
const agentPay = new AgentPay({
  apiKey: process.env.AGENTIC_PAY_API_KEY,
  timeout: 60000, // 60秒
  retries: 3,      // 重试3次
  retryDelay: 1000 // 重试延迟1秒
});

// 2. 实现指数退避重试
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数退避延迟
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 3. 检查网络延迟
const start = Date.now();
await fetch('https://api.agenticpay.com/health');
const latency = Date.now() - start;
console.log(`API latency: ${latency}ms`);

// 可接受的延迟: < 100ms (理想), < 300ms (正常), > 1000ms (需要排查)
```

**网络排查**:
```bash
# 检查到 API 服务器的路由
traceroute api.agenticpay.com

# 检查数据包丢失
ping -c 10 api.agenticpay.com

# 检查 MTU 大小
ping -M do -s 1472 api.agenticpay.com  # 测试 MTU 1500

# 如果使用代理，检查代理配置
echo $http_proxy
echo $https_proxy
```

#### 问题 5: WebSocket 连接不稳定

**症状**:
- WebSocket 频繁断开
- 连接建立失败
- 消息丢失

**解决方案**:
```javascript
// 健壮的 WebSocket 客户端
class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.heartbeatInterval = null;
    this.messageQueue = [];
    this.isConnected = false;
    
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // 发送积压的消息
        this.flushMessageQueue();
        
        // 开始心跳检测
        this.startHeartbeat();
        
        this.options.onOpen?.();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        // 处理心跳响应
        if (message.type === 'ping') {
          this.send({ type: 'pong', timestamp: new Date().toISOString() });
          return;
        }
        
        this.options.onMessage?.(message);
      };
      
      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        this.isConnected = false;
        this.stopHeartbeat();
        
        this.options.onClose?.(event);
        
        // 自动重连
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.options.onError?.(error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }
  
  send(data) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // 队列消息等待重连
      this.messageQueue.push(data);
      console.log('Message queued, waiting for reconnection');
    }
  }
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, 30000); // 每30秒发送一次心跳
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds...`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected');
    }
  }
}
```

**WebSocket 调试**:
```javascript
// 启用详细的 WebSocket 日志
localStorage.debug = 'websocket*';

// 浏览器开发者工具中监控 WebSocket
// Chrome: Network → WS → 查看消息
// Firefox: Network → WS → 查看框架

// 使用 wscat 进行命令行测试
// npm install -g wscat
// wscat -c wss://api.agenticpay.com/ws
```

#### 问题 6: CORS 错误

**症状**:
- 浏览器控制台显示 CORS 错误
- 预检请求失败
- 跨域请求被阻止

**解决方案**:
```javascript
// 前端配置
const agentPay = new AgentPay({
  apiKey: process.env.AGENTIC_PAY_API_KEY,
  baseUrl: 'https://api.agenticpay.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 如果使用 fetch，添加 mode 选项
fetch('https://api.agenticpay.com/api/v1/payments', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  mode: 'cors', // 明确指定 CORS 模式
  credentials: 'include' // 如果需要发送 cookies
});

// 服务器端配置示例 (Node.js/Express)
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['https://your-app.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
```

**CORS 预检请求排查**:
```bash
# 检查预检请求响应头
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -I https://api.agenticpay.com/api/v1/payments
```

### API 调用问题

#### 问题 7: 请求验证失败

**症状**:
- HTTP 400 错误
- "Validation failed" 消息
- 详细验证错误信息

**解决方案**:
```typescript
// 验证支付请求参数
interface PaymentRequest {
  amount: string;      // 必须为正数，最多2位小数
  currency: string;    // 必须是支持的货币
  recipient: string;   // 必须是有效的以太坊地址
  reason: string;      // 必须为非空，最多500字符
  category: string;    // 必须是允许的类别
  taskContext?: {
    taskId: string;
    description: string;
  };
}

function validatePaymentRequest(request: PaymentRequest): string[] {
  const errors: string[] = [];
  
  // 验证金额
  const amount = parseFloat(request.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!/^\d+(\.\d{1,2})?$/.test(request.amount)) {
    errors.push('Amount must have at most 2 decimal places');
  }
  
  // 验证货币
  const supportedCurrencies = ['USDC', 'ETH', 'DAI'];
  if (!supportedCurrencies.includes(request.currency)) {
    errors.push(`Currency must be one of: ${supportedCurrencies.join(', ')}`);
  }
  
  // 验证收款地址
  if (!/^0x[a-fA-F0-9]{40}$/.test(request.recipient)) {
    errors.push('Recipient must be a valid Ethereum address');
  }
  
  // 验证原因
  if (!request.reason || request.reason.trim().length === 0) {
    errors.push('Reason is required');
  }
  
  if (request.reason.length > 500) {
    errors.push('Reason must be less than 500 characters');
  }
  
  // 验证类别
  const allowedCategories = [
    'api', 'infrastructure', 'tools', 'data', 
    'compute', 'service', 'ai_agent', 'other'
  ];
  
  if (!allowedCategories.includes(request.category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(', ')}`);
  }
  
  return errors;
}

// 使用验证函数
const paymentRequest = {
  amount: '100.00',
  currency: 'USDC',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f',
  reason: 'API usage fees',
  category: 'api'
};

const errors = validatePaymentRequest(paymentRequest);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  // 显示给用户或记录日志
}
```

**API 响应示例**:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Must be a positive number",
        "value": "-100.00"
      },
      {
        "field": "recipient",
        "message": "Must be a valid Ethereum address",
        "value": "invalid-address"
      }
    ]
  }
}
```

#### 问题 8: 速率限制

**症状**:
- HTTP 429 错误
- "Rate limit exceeded" 消息
- 特定时间段内请求被拒绝

**解决方案**:
```javascript
// 速率限制处理
class RateLimitedClient {
  constructor(baseClient, options = {}) {
    this.client = baseClient;
    this.requests = [];
    this.windowMs = options.windowMs || 60000; // 1分钟窗口
    this.maxRequests = options.maxRequests || 60; // 每分钟60次
    
    // 清理旧请求
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  async request(method, ...args) {
    const now = Date.now();
    
    // 检查速率限制
    const recentRequests = this.requests.filter(
      req => now - req.timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest.timestamp);
      
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // 清理后重试
      this.cleanup();
    }
    
    // 记录请求
    this.requests.push({ timestamp: now });
    
    // 执行请求
    try {
      return await this.client[method](...args);
    } catch (error) {
      if (error.response?.status === 429) {
        // 从响应头获取重试时间
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        
        console.log(`Server rate limit, retrying after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // 重试
        return await this.client[method](...args);
      }
      throw error;
    }
  }
  
  cleanup() {
    const now = Date.now();
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.windowMs
    );
  }
}

// 使用示例
const rateLimitedClient = new RateLimitedClient(agentPay, {
  windowMs: 60000,
  maxRequests: 30 // 更保守的限制
});

// 所有请求都通过速率限制包装器
const payments = await rateLimitedClient.request('listPayments', { limit: 10 });
```

**速率限制头信息**:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200
```

#### 问题 9: 支付策略拒绝

**症状**:
- 支付请求被拒绝
- "Policy violation" 错误
- 特定条件下支付失败

**解决方案**:
```typescript
// 策略检查工具
class PolicyChecker {
  constructor(agentPay) {
    this.agentPay = agentPay;
  }
  
  async checkPaymentRequest(request) {
    const violations = [];
    
    // 1. 检查每日限额
    const budget = await this.agentPay.checkBudget(request.agentId);
    const dailyRemaining = budget.dailyLimit - budget.dailySpent;
    
    if (parseFloat(request.amount) > dailyRemaining) {
      violations.push({
        policy: 'daily_limit',
        message: `Exceeds daily limit. Remaining: ${dailyRemaining} ${budget.currency}`,
        severity: 'high'
      });
    }
    
    // 2. 检查交易限额
    if (parseFloat(request.amount) > budget.maxPerTransaction) {
      violations.push({
        policy: 'max_per_transaction',
        message: `Exceeds maximum per transaction limit of ${budget.maxPerTransaction}`,
        severity: 'high'
      });
    }
    
    // 3. 检查类别限制
    if (budget.allowedCategories && 
        !budget.allowedCategories.includes(request.category)) {
      violations.push({
        policy: 'category_whitelist',
        message: `Category '${request.category}' not allowed. Allowed: ${budget.allowedCategories.join(', ')}`,
        severity: 'medium'
      });
    }
    
    // 4. 检查收款人黑名单
    const isBlocked = await this.checkRecipientBlacklist(request.recipient);
    if (isBlocked) {
      violations.push({
        policy: 'recipient_blacklist',
        message: 'Recipient is in blacklist',
        severity: 'high'
      });
    }
    
    return {
      allowed: violations.length === 0,
      violations,
      suggestions: this.getSuggestions(violations, budget)
    };
  }
  
  async checkRecipientBlacklist(recipient) {
    // 实现黑名单检查逻辑
    // 可以是本地列表或 API 调用
    return false;
  }
  
  getSuggestions(violations, budget) {
    const suggestions = [];
    
    violations.forEach(violation => {
      switch (violation.policy) {
        case 'daily_limit':
          suggestions.push({
            action: 'reduce_amount',
            amount: (budget.dailyLimit - budget.dailySpent).toString(),
            message: `Reduce amount to ${budget.dailyLimit - budget.dailySpent} or less`
          });
          suggestions.push({
            action: 'request_budget_increase',
            message: 'Request daily budget increase'
          });
          break;
          
        case 'max_per_transaction':
          suggestions.push({
            action: 'split_payment',
            message: 'Split into multiple smaller payments'
          });
          break;
          
        case 'category_whitelist':
          suggestions.push({
            action: 'change_category',
            message: `Use one of allowed categories: ${budget.allowedCategories.join(', ')}`
          });
          break;
      }
    });
    
    return suggestions;
  }
}

// 使用示例
const policyChecker = new PolicyChecker(agentPay);
const checkResult = await policyChecker.checkPaymentRequest(paymentRequest);

if (!checkResult.allowed) {
  console.error('Policy violations:', checkResult.violations);
  console.log('Suggestions:', checkResult.suggestions);
  
  // 根据建议调整请求或通知用户
}
```

### 数据一致性問題

#### 问题 10: 支付状态不一致

**症状**:
- 支付状态未更新
- 区块链确认但系统状态未同步
- 双重支付风险

**解决方案**:
```typescript
// 支付状态同步服务
class PaymentSyncService {
  constructor(agentPay, options = {}) {
    this.agentPay = agentPay;
    this.checkInterval = options.checkInterval || 30000; // 30秒
    this.maxAttempts = options.maxAttempts || 10;
    this.syncingPayments = new Map(); // paymentId -> { attempts, lastCheck }
    this.intervalId = null;
  }
  
  start() {
    this.intervalId = setInterval(() => this.syncPendingPayments(), this.checkInterval);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  async syncPendingPayments() {
    // 获取待处理的支付
    const pendingPayments = await this.agentPay.listPayments({
      status: 'pending',
      limit: 50
    });
    
    for (const payment of pendingPayments.items) {
      await this.syncPayment(payment.id);
    }
  }
  
  async syncPayment(paymentId) {
    const record = this.syncingPayments.get(paymentId) || {
      attempts: 0,
      lastCheck: 0,
      status: 'pending'
    };
    
    // 检查是否达到最大重试次数
    if (record.attempts >= this.maxAttempts) {
      console.log(`Max sync attempts reached for payment ${paymentId}`);
      this.syncingPayments.delete(paymentId);
      return;
    }
    
    // 检查是否最近检查过
    const now = Date.now();
    if (now - record.lastCheck < 10000) { // 10秒内不重复检查
      return;
    }
    
    record.attempts++;
    record.lastCheck = now;
    this.syncingPayments.set(paymentId, record);
    
    try {
      // 获取最新支付信息
      const payment = await this.agentPay.getPayment(paymentId);
      
      // 如果状态已变更
      if (payment.status !== record.status) {
        console.log(`Payment ${paymentId} status changed: ${record.status} -> ${payment.status}`);
        record.status = payment.status;
        
        // 触发状态变更事件
        this.emitStatusChange(payment);
        
        // 如果是最终状态，从同步列表中移除
        if (this.isFinalStatus(payment.status)) {
          this.syncingPayments.delete(paymentId);
        }
      }
      
      // 如果支付有交易哈希，检查区块链确认
      if (payment.transactionHash && payment.status === 'pending') {
        const isConfirmed = await this.checkBlockchainConfirmation(payment.transactionHash);
        
        if (isConfirmed) {
          // 更新支付状态为已完成
          await this.agentPay.updatePaymentStatus(paymentId, 'completed');
          this.syncingPayments.delete(paymentId);
        }
      }
    } catch (error) {
      console.error(`Failed to sync payment ${paymentId}:`, error);
      
      // 指数退避重试
      const delay = Math.min(1000 * Math.pow(2, record.attempts), 300000);
      setTimeout(() => this.syncPayment(paymentId), delay);
    }
  }
  
  async checkBlockchainConfirmation(txHash) {
    // 实现区块链确认检查
    // 可以使用 Web3.js, Ethers.js 或专门的区块链 API
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.confirmations >= 12) { // 12个确认
        return true;
      }
    } catch (error) {
      console.error('Blockchain check failed:', error);
    }
    
    return false;
  }
  
  isFinalStatus(status) {
    return ['completed', 'failed', 'cancelled', 'rejected'].includes(status);
  }
  
  emitStatusChange(payment) {
    // 实现事件发射逻辑
    // 可以是 EventEmitter, WebSocket 广播等
    console.log(`Payment status changed: ${payment.id} -> ${payment.status}`);
  }
}

// 使用示例
const syncService = new PaymentSyncService(agentPay, {
  checkInterval: 15000, // 15秒检查一次
  maxAttempts: 20       // 最多重试20次
});

syncService.start();

// 应用关闭时停止同步
process.on('SIGINT', () => {
  syncService.stop();
});
```

### 性能问题

#### 问题 11: API 响应缓慢

**症状**:
- 请求响应时间 > 1秒
- 用户界面卡顿
- 超时错误增加

**解决方案**:
```typescript
// 性能监控和优化
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      errors: 0,
      slowRequests: 0
    };
    
    this.slowThreshold = 1000; // 1秒
    this.metricWindow = 60000; // 1分钟窗口
    this.metricHistory = [];
  }
  
  startMonitoring(client) {
    // 包装客户端方法以监控性能
    const originalMethods = {};
    
    ['requestPayment', 'checkBudget', 'listPayments', 'getPayment'].forEach(method => {
      if (client[method]) {
        originalMethods[method] = client[method];
        
        client[method] = async (...args) => {
          const startTime = Date.now();
          this.metrics.requestCount++;
          
          try {
            const result = await originalMethods[method].apply(client, args);
            
            const responseTime = Date.now() - startTime;
            this.metrics.totalResponseTime += responseTime;
            
            // 记录慢请求
            if (responseTime > this.slowThreshold) {
              this.metrics.slowRequests++;
              console.warn(`Slow ${method} request: ${responseTime}ms`);
              
              // 记录详细日志供分析
              this.recordSlowRequest({
                method,
                responseTime,
                args: args.length > 0 ? args[0] : null,
                timestamp: new Date().toISOString()
              });
            }
            
            // 更新历史指标
            this.updateMetricHistory(responseTime);
            
            return result;
          } catch (error) {
            this.metrics.errors++;
            throw error;
          }
        };
      }
    });
  }
  
  recordSlowRequest(details) {
    // 存储慢请求详情供分析
    // 可以发送到监控系统或记录到文件
    console.log('Slow request details:', details);
  }
  
  updateMetricHistory(responseTime) {
    const now = Date.now();
    this.metricHistory.push({ timestamp: now, responseTime });
    
    // 清理旧数据
    this.metricHistory = this.metricHistory.filter(
      m => now - m.timestamp < this.metricWindow
    );
  }
  
  getMetrics() {
    const avgResponseTime = this.metrics.requestCount > 0
      ? this.metrics.totalResponseTime / this.metrics.requestCount
      : 0;
    
    const errorRate = this.metrics.requestCount > 0
      ? (this.metrics.errors / this.metrics.requestCount) * 100
      : 0;
    
    const slowRequestRate = this.metrics.requestCount > 0
      ? (this.metrics.slowRequests / this.metrics.requestCount) * 100
      : 0;
    
    // 计算 P95 响应时间
    const recentResponseTimes = this.metricHistory
      .map(m => m.responseTime)
      .sort((a, b) => a - b);
    
    const p95Index = Math.floor(recentResponseTimes.length * 0.95);
    const p95ResponseTime = recentResponseTimes[p95Index] || 0;
    
    return {
      requestCount: this.metrics.requestCount,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime,
      errorRate: errorRate.toFixed(2),
      slowRequestRate: slowRequestRate.toFixed(2),
      timestamp: new Date().toISOString()
    };
  }
  
  // 性能优化建议
  getOptimizationSuggestions() {
    const metrics = this.getMetrics();
    const suggestions = [];
    
    if (metrics.avgResponseTime > 500) {
      suggestions.push({
        issue: 'High average response time',
        suggestion: 'Implement client-side caching for frequently accessed data',
        priority: 'high'
      });
    }
    
    if (metrics.p95ResponseTime > 1000) {
      suggestions.push({
        issue: 'High P95 response time',
        suggestion: 'Consider implementing request batching or parallel requests',
        priority: 'high'
      });
    }
    
    if (metrics.errorRate > 5) {
      suggestions.push({
        issue: 'High error rate',
        suggestion: 'Review error handling and implement automatic retries',
        priority: 'medium'
      });
    }
    
    if (metrics.slowRequestRate > 10) {
      suggestions.push({
        issue: 'High slow request rate',
        suggestion: 'Optimize payload size and implement compression',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }
}

// 使用示例
const monitor = new PerformanceMonitor();
monitor.startMonitoring(agentPay);

// 定期记录性能指标
setInterval(() => {
  const metrics = monitor.getMetrics();
  console.log('Performance metrics:', metrics);
  
  const suggestions = monitor.getOptimizationSuggestions();
  if (suggestions.length > 0) {
    console.log('Optimization suggestions:', suggestions);
  }
}, 60000); // 每分钟记录一次
```

#### 缓存优化
```typescript
// 客户端缓存实现
class CachedAgentPay {
  constructor(agentPay, options = {}) {
    this.agentPay = agentPay;
    this.cache = new Map();
    this.ttl = options.ttl || 300000; // 5分钟
    this.maxSize = options.maxSize || 100;
  }
  
  async checkBudget(agentId, forceRefresh = false) {
    const cacheKey = `budget:${agentId}`;
    
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const budget = await this.agentPay.checkBudget(agentId);
    this.setCache(cacheKey, budget);
    
    return budget;
  }
  
  async listPayments(params, forceRefresh = false) {
    const cacheKey = `payments:${JSON.stringify(params)}`;
    
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const payments = await this.agentPay.listPayments(params);
    this.setCache(cacheKey, payments);
    
    return payments;
  }
  
  getFromCache(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  setCache(key, data) {
    // 限制缓存大小
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  invalidate(pattern) {
    // 根据模式使缓存失效
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// 使用缓存的客户端
const cachedAgentPay = new CachedAgentPay(agentPay, {
  ttl: 60000, // 1分钟
  maxSize: 50
});

// 自动刷新缓存
setInterval(() => {
  // 刷新活跃代理的预算缓存
  cachedAgentPay.checkBudget('default', true).catch(console.error);
}, 30000);
```

### 部署和环境问题

#### 问题 12: 环境配置错误

**症状**:
- 生产环境使用测试网络配置
- 环境变量未设置
- 配置不一致导致错误

**解决方案**:
```javascript
// 环境配置管理
class EnvironmentConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.configs = {
      development: {
        apiUrl: 'http://localhost:3001',
        wsUrl: 'ws://localhost:3001/ws',
        network: 'local',
        logLevel: 'debug'
      },
      test: {
        apiUrl: 'https://testnet.api.agenticpay.com',
        wsUrl: 'wss://testnet.api.agenticpay.com/ws',
        network: 'testnet',
        logLevel: 'info'
      },
      production: {
        apiUrl: 'https://api.agenticpay.com',
        wsUrl: 'wss://api.agenticpay.com/ws',
        network: 'mainnet',
        logLevel: 'warn'
      }
    };
  }
  
  validate() {
    const errors = [];
    const config = this.getConfig();
    
    // 检查必需的 API 密钥
    if (!process.env.AGENTIC_PAY_API_KEY) {
      errors.push('AGENTIC_PAY_API_KEY environment variable is required');
    }
    
    // 检查 API 密钥格式
    if (process.env.AGENTIC_PAY_API_KEY) {
      const apiKey = process.env.AGENTIC_PAY_API_KEY;
      
      if (config.network === 'mainnet' && !apiKey.startsWith('sk_live_')) {
        errors.push('Production API key must start with "sk_live_"');
      }
      
      if (config.network === 'testnet' && !apiKey.startsWith('sk_test_')) {
        errors.push('Testnet API key must start with "sk_test_"');
      }
    }
    
    // 检查 RPC URL（如果使用区块链功能）
    if (config.network !== 'local' && !process.env.RPC_URL) {
      errors.push('RPC_URL environment variable is required for blockchain operations');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      config
    };
  }
  
  getConfig() {
    const baseConfig = this.configs[this.env] || this.configs.development;
    
    // 允许环境变量覆盖
    return {
      ...baseConfig,
      apiUrl: process.env.AGENTIC_PAY_API_URL || baseConfig.apiUrl,
      wsUrl: process.env.AGENTIC_PAY_WS_URL || baseConfig.wsUrl,
      network: process.env.AGENTIC_PAY_NETWORK || baseConfig.network,
      logLevel: process.env.LOG_LEVEL || baseConfig.logLevel
    };
  }
  
  // 环境检查脚本
  static async checkEnvironment() {
    const envConfig = new EnvironmentConfig();
    const validation = envConfig.validate();
    
    console.log(`Environment: ${envConfig.env}`);
    console.log(`Config:`, envConfig.getConfig());
    
    if (!validation.valid) {
      console.error('Environment validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    // 测试 API 连接
    try {
      const response = await fetch(`${envConfig.getConfig().apiUrl}/health`);
      if (response.ok) {
        console.log('✓ API server is reachable');
      } else {
        console.error('✗ API server returned error:', response.status);
      }
    } catch (error) {
      console.error('✗ Cannot reach API server:', error.message);
    }
    
    // 测试 WebSocket 连接
    try {
      const ws = new WebSocket(envConfig.getConfig().wsUrl);
      
      await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
        
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      });
      
      console.log('✓ WebSocket server is reachable');
      ws.close();
    } catch (error) {
      console.error('✗ Cannot reach WebSocket server:', error.message);
    }
    
    console.log('Environment check completed');
  }
}

// 在应用启动时检查环境
EnvironmentConfig.checkEnvironment().catch(console.error);
```

### 监控和日志

#### 问题 13: 缺乏有效监控

**症状**:
- 问题发现不及时
- 无法定位问题根源
- 缺乏性能基准

**解决方案**:
```typescript
// 综合监控系统
class MonitoringSystem {
  constructor(options = {}) {
    this.metrics = {
      apiCalls: [],
      errors: [],
      performance: [],
      userActions: []
    };
    
    this.retentionPeriod = options.retentionPeriod || 604800000; // 7天
    this.maxEntries = options.maxEntries || 10000;
    
    // 定期清理旧数据
    setInterval(() => this.cleanup(), 3600000); // 每小时清理一次
  }
  
  trackApiCall(method, duration, success, error = null) {
    const entry = {
      timestamp: Date.now(),
      method,
      duration,
      success,
      error: error ? {
        code: error.code,
        message: error.message,
        stack: error.stack
      } : null
    };
    
    this.metrics.apiCalls.push(entry);
    
    // 发送到监控服务
    this.sendToMonitoringService('api_call', entry);
  }
  
  trackError(error, context = {}) {
    const entry = {
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context
    };
    
    this.metrics.errors.push(entry);
    
    // 发送错误到错误跟踪服务
    this.sendToErrorTrackingService(entry);
    
    // 严重错误发送告警
    if (this.isCriticalError(error)) {
      this.sendAlert(`Critical error: ${error.message}`, entry);
    }
  }
  
  trackPerformance(metricName, value, tags = {}) {
    const entry = {
      timestamp: Date.now(),
      metric: metricName,
      value,
      tags
    };
    
    this.metrics.performance.push(entry);
    
    // 发送到性能监控服务
    this.sendToPerformanceService(entry);
    
    // 检查性能阈值
    if (this.exceedsThreshold(metricName, value)) {
      this.sendAlert(`Performance threshold exceeded: ${metricName}=${value}`, entry);
    }
  }
  
  trackUserAction(action, details = {}) {
    const entry = {
      timestamp: Date.now(),
      action,
      details
    };
    
    this.metrics.userActions.push(entry);
    
    // 发送到分析服务
    this.sendToAnalyticsService(entry);
  }
  
  isCriticalError(error) {
    // 定义关键错误条件
    const criticalErrorCodes = [
      'NETWORK_ERROR',
      'DATABASE_CONNECTION_FAILED',
      'AUTHENTICATION_FAILED',
      'INSUFFICIENT_BUDGET'
    ];
    
    return criticalErrorCodes.includes(error.code) || 
           error.message.includes('fatal') ||
           error.message.includes('critical');
  }
  
  exceedsThreshold(metricName, value) {
    const thresholds = {
      'api_response_time': 1000, // 1秒
      'payment_processing_time': 5000, // 5秒
      'error_rate': 0.05, // 5%
      'cache_hit_rate': 0.8 // 80%
    };
    
    return thresholds[metricName] && value > thresholds[metricName];
  }
  
  sendToMonitoringService(eventType, data) {
    // 实现发送到监控服务（如 Datadog, New Relic, Prometheus）
    console.log(`[Monitoring] ${eventType}:`, data);
  }
  
  sendToErrorTrackingService(error) {
    // 实现发送到错误跟踪服务（如 Sentry, Rollbar）
    console.log(`[Error Tracking]`, error);
  }
  
  sendToPerformanceService(metric) {
    // 实现发送到性能监控服务
    console.log(`[Performance] ${metric.metric}: ${metric.value}`);
  }
  
  sendToAnalyticsService(action) {
    // 实现发送到分析服务（如 Google Analytics, Mixpanel）
    console.log(`[Analytics] User action: ${action.action}`);
  }
  
  sendAlert(message, data) {
    // 实现告警发送（如 Slack, Email, PagerDuty）
    console.log(`[ALERT] ${message}`, data);
  }
  
  cleanup() {
    const cutoff = Date.now() - this.retentionPeriod;
    
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key]
        .filter(entry => entry.timestamp > cutoff)
        .slice(-this.maxEntries);
    });
  }
  
  // 生成健康报告
  generateHealthReport() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    const recentApiCalls = this.metrics.apiCalls.filter(
      call => call.timestamp > oneHourAgo
    );
    
    const recentErrors = this.metrics.errors.filter(
      error => error.timestamp > oneHourAgo
    );
    
    const errorRate = recentApiCalls.length > 0
      ? recentErrors.length / recentApiCalls.length
      : 0;
    
    const avgResponseTime = recentApiCalls.length > 0
      ? recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length
      : 0;
    
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalApiCalls: this.metrics.apiCalls.length,
        recentApiCalls: recentApiCalls.length,
        totalErrors: this.metrics.errors.length,
        recentErrors: recentErrors.length,
        errorRate: errorRate.toFixed(4),
        avgResponseTime: Math.round(avgResponseTime),
        performanceMetrics: this.metrics.performance.length,
        userActions: this.metrics.userActions.length
      },
      status: errorRate > 0.1 ? 'degraded' : 'healthy',
      recommendations: this.generateRecommendations()
    };
  }
  
  generateRecommendations() {
    const report = this.generateHealthReport();
    const recommendations = [];
    
    if (report.metrics.errorRate > 0.05) {
      recommendations.push({
        issue: 'High error rate',
        priority: 'high',
        action: 'Review recent errors and implement fixes',
        deadline: 'immediate'
      });
    }
    
    if (report.metrics.avgResponseTime > 500) {
      recommendations.push({
        issue: 'Slow API response',
        priority: 'medium',
        action: 'Optimize API calls and implement caching',
        deadline: '1 week'
      });
    }
    
    if (report.metrics.recentApiCalls === 0 && report.metrics.totalApiCalls > 0) {
      recommendations.push({
        issue: 'No recent API activity',
        priority: 'low',
        action: 'Check if application is running correctly',
        deadline: '24 hours'
      });
    }
    
    return recommendations;
  }
}

// 使用示例
const monitor = new MonitoringSystem();

// 包装 API 调用以进行监控
const monitoredAgentPay = new Proxy(agentPay, {
  get(target, prop) {
    const original = target[prop];
    
    if (typeof original === 'function') {
      return async function(...args) {
        const startTime = Date.now();
        
        try {
          const result = await original.apply(target, args);
          const duration = Date.now() - startTime;
          
          monitor.trackApiCall(prop, duration, true);
          monitor.trackPerformance('api_response_time', duration, { method: prop });
          
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          
          monitor.trackApiCall(prop, duration, false, error);
          monitor.trackError(error, {
            method: prop,
            args: args.length > 0 ? args[0] : null
          });
          
          throw error;
        }
      };
    }
    
    return original;
  }
});

// 定期生成健康报告
setInterval(() => {
  const report = monitor.generateHealthReport();
  console.log('Health report:', report);
  
  if (report.status === 'degraded') {
    console.warn('System is degraded!', report.recommendations);
  }
}, 300000); // 每5分钟生成一次报告
```

## 紧急恢复步骤

### 系统完全不可用

1. **检查依赖服务状态**:
   ```bash
   # 检查数据库
   pg_isready -h database-host -p 5432
   
   # 检查 Redis
   redis-cli ping
   
   # 检查区块链节点
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     http://localhost:8545
   ```

2. **查看应用日志**:
   ```bash
   # 查看最近的错误日志
   tail -100 /var/log/agentic-pay/error.log
   
   # 查看应用日志
   journalctl -u agentic-pay --since "10 minutes ago"
   
   # 查看容器日志（如果使用 Docker）
   docker logs agentic-pay-api --tail 100
   ```

3. **重启服务**:
   ```bash
   # 使用 systemd
   sudo systemctl restart agentic-pay-api
   sudo systemctl restart agentic-pay-websocket
   
   # 使用 Docker Compose
   docker-compose restart api websocket
   
   # 使用 Kubernetes
   kubectl rollout restart deployment/agentic-pay-api
   ```

4. **紧急回滚**:
   ```bash
   # 如果最近有部署，回滚到上一个版本
   git checkout tags/previous-stable-version
   npm run deploy:rollback
   ```

### 数据不一致

1. **支付状态修复**:
   ```typescript
   // 支付状态修复脚本
   async function repairPaymentStatus() {
     // 获取所有待处理的支付
     const pendingPayments = await agentPay.listPayments({
       status: 'pending',
       limit: 100
     });
     
     for (const payment of pendingPayments.items) {
       // 检查区块链确认
       if (payment.transactionHash) {
         const isConfirmed = await checkBlockchainConfirmation(payment.transactionHash);
         
         if (isConfirmed) {
           // 更新为已完成
           await agentPay.updatePaymentStatus(payment.id, 'completed');
           console.log(`Updated payment ${payment.id} to completed`);
         } else {
           // 检查交易是否失败
           const txFailed = await checkTransactionFailure(payment.transactionHash);
           
           if (txFailed) {
             await agentPay.updatePaymentStatus(payment.id, 'failed');
             console.log(`Updated payment ${payment.id} to failed`);
           }
         }
       } else {
         // 没有交易哈希，检查是否超时
         const createdAt = new Date(payment.createdAt);
         const now = new Date();
         const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
         
         if (hoursDiff > 24) {
           // 超过24小时无交易哈希，标记为失败
           await agentPay.updatePaymentStatus(payment.id, 'failed');
           console.log(`Updated payment ${payment.id} to failed (timeout)`);
         }
       }
     }
   }
   ```

2. **预算同步修复**:
   ```typescript
   async function repairBudgetSync() {
     // 获取所有代理
     const agents = await agentPay.listAgents({ limit: 100 });
     
     for (const agent of agents.items) {
       // 计算实际支出
       const payments = await agentPay.listPayments({
         agentId: agent.id,
         status: 'completed',
         startDate: getCurrentPeriodStart()
       });
       
       const actualSpent = payments.items.reduce(
         (sum, payment) => sum + parseFloat(payment.amount), 0
       );
       
       // 更新预算
       await agentPay.updateBudget(agent.id, {
         spent: actualSpent,
         remaining: agent.budget.total - actualSpent
       });
       
       console.log(`Updated budget for agent ${agent.id}: spent=${actualSpent}`);
     }
   }
   ```

## 联系支持

如果以上解决方案都无法解决问题，请联系支持团队：

### 提供的信息

1. **环境信息**:
   - 应用版本
   - 操作系统和版本
   - Node.js 版本
   - 浏览器版本（如果是前端问题）

2. **错误信息**:
   - 完整的错误堆栈
   - 错误代码和消息
   - 发生时间

3. **重现步骤**:
   - 详细的操作步骤
   - 测试数据
   - 网络环境

4. **日志文件**:
   - 应用日志
   - 错误日志
   - 网络请求日志

### 支持渠道

- **紧急问题**: support@agenticpay.com (标注 [URGENT])
- **一般问题**: help@agenticpay.com
- **Discord**: https://discord.gg/agenticpay
- **文档**: https://docs.agenticpay.com

## 更新日志

- **2024-01-01**: 初始版本，包含常见问题解决方案
- **后续更新**: 将根据用户反馈和系统演进持续更新

---

*本文档提供 Agentic Payment System 常见问题的解决方案和排查步骤。建议定期查阅最新版本以获取更新。*