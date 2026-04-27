# TypeScript SDK 使用指南

## 概述

Agentic Payment System TypeScript SDK 为自定义集成、第三方应用和高级用例提供全面的功能接口。SDK 设计为模块化、类型安全且高性能，适用于 Node.js、浏览器和 React Native 环境。

## 安装

```bash
# 使用 npm
npm install @agentic-pay/sdk

# 使用 yarn
yarn add @agentic-pay/sdk

# 使用 pnpm
pnpm add @agentic-pay/sdk
```

## 快速开始

```typescript
import { AgentPay } from '@agentic-pay/sdk';

// 初始化 SDK
const agentPay = new AgentPay({
  apiKey: process.env.AGENTIC_PAY_API_KEY,
  environment: 'testnet', // 'testnet' 或 'mainnet'
  timeout: 30000, // 请求超时时间（毫秒）
});

// 发起支付请求
const payment = await agentPay.requestPayment({
  amount: '1.5',
  currency: 'USDC',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f',
  reason: 'API 调用额度',
  category: 'api',
  taskContext: {
    taskId: 'task_12345',
    description: '自动API调用费用',
    agentId: 'agent_claude_code'
  }
});

console.log(`Payment created: ${payment.id}`);
```

## 核心类

### AgentPay

主 SDK 类，提供高级 API 接口。

```typescript
import { AgentPay, PaymentRequest, BudgetStatus } from '@agentic-pay/sdk';

const agentPay = new AgentPay(config);

// 检查预算状态
const budget: BudgetStatus = await agentPay.checkBudget('agent_123');

// 查询支付记录
const payments = await agentPay.listPayments({
  limit: 10,
  status: 'completed',
  startDate: '2024-01-01'
});

// 更新代理权限
await agentPay.updatePermissions('agent_123', {
  maxAmountPerTransaction: '1000',
  allowedCategories: ['api', 'infrastructure', 'tools']
});
```

### PaymentRequest

支付请求构建器，提供流畅的接口。

```typescript
import { PaymentRequest } from '@agentic-pay/sdk';

const request = new PaymentRequest()
  .amount('50.00')
  .currency('USDC')
  .recipient('0x...')
  .reason('服务器费用')
  .category('infrastructure')
  .addPolicyCheck('dailyLimit', '500')
  .addPolicyCheck('categoryWhitelist', ['infrastructure', 'api'])
  .setTaskContext({
    taskId: 'task_67890',
    description: '月度服务器维护'
  });

const payment = await request.submit();
```

### PolicyManager

策略配置和管理。

```typescript
import { PolicyManager } from '@agentic-pay/sdk';

const policyManager = new PolicyManager(agentPay);

// 创建新策略
const policy = await policyManager.createPolicy({
  name: '每日限制',
  type: 'dailyLimit',
  conditions: {
    maxAmount: '1000',
    currency: 'USDC'
  },
  actions: ['block', 'notify']
});

// 评估支付请求
const evaluation = await policyManager.evaluate(request, {
  agentId: 'agent_123',
  context: { timeOfDay: 'business_hours' }
});

// 更新策略
await policyManager.updatePolicy(policy.id, {
  conditions: { maxAmount: '1500' }
});
```

### AuditClient

审计日志查询和导出。

```typescript
import { AuditClient } from '@agentic-pay/sdk';

const auditClient = new AuditClient(agentPay);

// 查询审计日志
const logs = await auditClient.query({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  eventTypes: ['payment.created', 'payment.completed'],
  agentId: 'agent_123',
  limit: 100
});

// 导出审计数据
const exportResult = await auditClient.export({
  format: 'csv', // 'csv', 'json', 'pdf'
  filters: {
    dateRange: { from: '2024-01-01', to: '2024-01-31' },
    status: ['completed', 'failed']
  }
});

// 下载导出文件
await exportResult.download('audit-report.csv');
```

### WebSocketClient

实时更新和通知。

```typescript
import { WebSocketClient } from '@agentic-pay/sdk';

const wsClient = new WebSocketClient({
  url: 'wss://api.agenticpay.com/ws',
  token: process.env.WS_TOKEN
});

// 连接 WebSocket
await wsClient.connect();

// 订阅事件
wsClient.subscribe('payment:status_changed', (data) => {
  console.log(`Payment ${data.paymentId} status changed to ${data.status}`);
});

wsClient.subscribe('budget:warning', (data) => {
  console.log(`Budget warning for agent ${data.agentId}: ${data.message}`);
});

wsClient.subscribe('emergency:triggered', (data) => {
  console.log('Emergency pause activated!');
  // 采取相应措施
});

// 取消订阅
wsClient.unsubscribe('payment:status_changed');

// 断开连接
wsClient.disconnect();
```

## 高级特性

### 中间件支持

SDK 支持中间件用于日志记录、缓存、重试等。

```typescript
import { AgentPay, Middleware } from '@agentic-pay/sdk';

// 自定义中间件
const loggingMiddleware: Middleware = async (context, next) => {
  const start = Date.now();
  console.log(`Starting request: ${context.request.method} ${context.request.url}`);
  
  try {
    const response = await next(context);
    const duration = Date.now() - start;
    console.log(`Request completed in ${duration}ms with status ${response.status}`);
    return response;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
};

const cachingMiddleware: Middleware = async (context, next) => {
  const cacheKey = JSON.stringify(context.request);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.response;
  }
  
  const response = await next(context);
  cache.set(cacheKey, { response, timestamp: Date.now() });
  return response;
};

// 使用中间件
const agentPay = new AgentPay({
  apiKey: 'your-api-key',
  middlewares: [loggingMiddleware, cachingMiddleware]
});
```

### 错误处理

SDK 提供类型化的错误和恢复指导。

```typescript
import { AgentPay, PaymentError, NetworkError, ValidationError } from '@agentic-pay/sdk';

try {
  const payment = await agentPay.requestPayment(request);
} catch (error) {
  if (error instanceof PaymentError) {
    // 支付相关错误
    console.error(`Payment failed: ${error.code} - ${error.message}`);
    console.log('Recovery suggestions:', error.recoverySuggestions);
    
    if (error.code === 'INSUFFICIENT_BUDGET') {
      // 处理预算不足
      await agentPay.requestBudgetIncrease('agent_123', {
        amount: '500',
        reason: '需要额外预算完成重要任务'
      });
    }
  } else if (error instanceof ValidationError) {
    // 验证错误
    console.error('Validation errors:', error.details);
  } else if (error instanceof NetworkError) {
    // 网络错误
    console.error('Network error, retrying...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 重试逻辑
  } else {
    // 其他错误
    console.error('Unexpected error:', error);
  }
}
```

### React Hooks

为 React 应用提供自定义 Hooks。

```typescript
import { useAgentPay, useBudget, usePayments } from '@agentic-pay/react';

function PaymentDashboard() {
  const { agentPay, loading, error } = useAgentPay();
  const { budget, refresh } = useBudget('agent_123');
  const { payments, loadMore, hasMore } = usePayments({
    limit: 20,
    status: 'completed'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Budget: {budget.remaining} / {budget.total} USDC</h1>
      <button onClick={refresh}>Refresh Budget</button>
      
      <h2>Recent Payments</h2>
      <ul>
        {payments.map(payment => (
          <li key={payment.id}>
            {payment.amount} USDC to {payment.recipient.slice(0, 8)}...
            - Status: {payment.status}
          </li>
        ))}
      </ul>
      
      {hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

### Vue Composables

为 Vue 3 应用提供组合式 API。

```typescript
import { useAgentPay, useBudget } from '@agentic-pay/vue';
import { ref, computed } from 'vue';

export default {
  setup() {
    const { agentPay, loading, error } = useAgentPay();
    const { budget, refresh } = useBudget('agent_123');
    
    const budgetUsage = computed(() => {
      if (!budget.value) return 0;
      return (budget.value.used / budget.value.total) * 100;
    });
    
    return {
      agentPay,
      loading,
      error,
      budget,
      budgetUsage,
      refresh
    };
  }
};
```

## 配置选项

### AgentPay 配置

```typescript
interface AgentPayConfig {
  // 必需配置
  apiKey: string;
  
  // 可选配置
  environment?: 'testnet' | 'mainnet' | 'local';
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  middlewares?: Middleware[];
  logger?: Logger;
  
  // WebSocket 配置
  websocket?: {
    enabled?: boolean;
    url?: string;
    autoReconnect?: boolean;
    reconnectInterval?: number;
  };
  
  // 缓存配置
  cache?: {
    enabled?: boolean;
    ttl?: number;
    storage?: 'memory' | 'localStorage' | 'sessionStorage';
  };
}
```

### 环境配置

```typescript
// 根据不同环境配置 SDK
const config = {
  apiKey: process.env.AGENTIC_PAY_API_KEY,
  
  // 开发环境
  development: {
    environment: 'local',
    baseUrl: 'http://localhost:3001',
    timeout: 60000
  },
  
  // 测试环境
  test: {
    environment: 'testnet',
    baseUrl: 'https://testnet.api.agenticpay.com',
    timeout: 30000
  },
  
  // 生产环境
  production: {
    environment: 'mainnet',
    baseUrl: 'https://api.agenticpay.com',
    timeout: 10000,
    retries: 3
  }
};

const env = process.env.NODE_ENV || 'development';
const agentPay = new AgentPay({ ...config[env], apiKey: config.apiKey });
```

## 测试工具

SDK 包含测试工具用于开发和测试。

```typescript
import { 
  MockAgentPay, 
  MockWebSocketServer, 
  createTestPayment, 
  createTestBudget 
} from '@agentic-pay/sdk/testing';

// 使用模拟服务器
const mockAgentPay = new MockAgentPay({
  mockResponses: {
    'requestPayment': { id: 'pay_123', status: 'pending' },
    'checkBudget': { total: '1000', used: '300', remaining: '700' }
  }
});

// 在测试中使用
describe('Payment Flow', () => {
  it('should create payment', async () => {
    const agentPay = mockAgentPay.getInstance();
    const payment = await agentPay.requestPayment(createTestPayment());
    expect(payment.id).toBe('pay_123');
    expect(payment.status).toBe('pending');
  });
});

// WebSocket 模拟服务器
const mockWSServer = new MockWebSocketServer();
mockWSServer.on('connection', (client) => {
  client.send('payment:status_changed', {
    paymentId: 'pay_123',
    status: 'completed'
  });
});
```

## 性能优化

### Tree Shaking

SDK 设计为可树摇优化，只导入需要的模块。

```typescript
// 只导入需要的模块（推荐）
import { AgentPay } from '@agentic-pay/sdk/core';
import { PaymentRequest } from '@agentic-pay/sdk/payment';
import { WebSocketClient } from '@agentic-pay/sdk/websocket';

// 避免全量导入（不推荐）
import * as AgenticPay from '@agentic-pay/sdk'; // 全量导入，打包体积大
```

### 延迟加载

大型模块支持延迟加载。

```typescript
// 按需加载审计模块
async function exportAuditReport() {
  const { AuditClient } = await import('@agentic-pay/sdk/audit');
  const auditClient = new AuditClient(agentPay);
  return auditClient.export({ format: 'csv' });
}
```

### 缓存策略

```typescript
const agentPay = new AgentPay({
  apiKey: 'your-api-key',
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    storage: 'localStorage' // 或 'memory', 'sessionStorage'
  }
});
```

## 错误代码参考

| 错误代码 | 描述 | 恢复建议 |
|----------|------|----------|
| `INSUFFICIENT_BUDGET` | 代理预算不足 | 请求增加预算或减少支付金额 |
| `POLICY_VIOLATION` | 违反安全策略 | 检查支付参数是否符合策略要求 |
| `INVALID_RECIPIENT` | 无效的收款地址 | 验证收款地址格式和有效性 |
| `NETWORK_ERROR` | 网络连接错误 | 检查网络连接并重试 |
| `TIMEOUT` | 请求超时 | 增加超时时间或稍后重试 |
| `RATE_LIMITED` | 请求频率限制 | 降低请求频率或联系管理员 |
| `AUTHENTICATION_FAILED` | 认证失败 | 检查 API 密钥是否有效 |
| `VALIDATION_ERROR` | 参数验证失败 | 检查输入参数格式和必填项 |

## 最佳实践

### 安全实践

1. **保护 API 密钥**：不要将 API 密钥提交到版本控制系统
2. **环境隔离**：为不同环境使用不同的 API 密钥
3. **最小权限**：只为代理分配必要的权限
4. **定期轮换**：定期轮换 API 密钥和访问令牌

### 性能实践

1. **连接复用**：尽可能复用 AgentPay 实例
2. **批量操作**：使用批量 API 处理多个支付
3. **缓存结果**：对不经常变化的数据使用缓存
4. **错误重试**：实现指数退避重试逻辑

### 开发实践

1. **类型检查**：启用 TypeScript 严格模式
2. **错误处理**：处理所有可能的错误情况
3. **日志记录**：记录关键操作和错误
4. **测试覆盖**：为集成代码编写全面的测试

## 故障排除

### 常见问题

**Q: SDK 初始化失败**
```typescript
// 检查配置
const agentPay = new AgentPay({
  apiKey: 'valid-api-key', // 确保 API 密钥正确
  environment: 'testnet',   // 确保环境正确
  baseUrl: 'https://testnet.api.agenticpay.com' // 确保 baseUrl 正确
});
```

**Q: WebSocket 连接失败**
```typescript
// 检查 WebSocket 配置
const wsClient = new WebSocketClient({
  url: 'wss://api.agenticpay.com/ws', // 确保 URL 正确
  token: 'valid-token', // 确保令牌有效
  autoReconnect: true   // 启用自动重连
});
```

**Q: 支付请求被拒绝**
```typescript
// 检查支付参数和策略
const request = new PaymentRequest()
  .amount('100')        // 确保金额在预算内
  .currency('USDC')     // 确保货币支持
  .recipient('valid-address') // 确保地址有效
  .addPolicyCheck('dailyLimit', '1000'); // 确保符合策略
```

### 获取帮助

- **文档**: [https://docs.agenticpay.com/sdk](https://docs.agenticpay.com/sdk)
- **GitHub**: [https://github.com/agentic-pay/sdk](https://github.com/agentic-pay/sdk)
- **Discord**: [https://discord.gg/agenticpay](https://discord.gg/agenticpay)
- **邮箱**: support@agenticpay.com

## 版本信息

- **SDK 版本**: 1.0.0
- **API 版本**: v1
- **最后更新**: 2024-01-01
- **兼容性**: Node.js >= 18.0.0, 现代浏览器, React Native

---

*本文档根据 Agentic Payment System 集成层规范生成，确保开发者能够充分利用 TypeScript SDK 的全部功能。*