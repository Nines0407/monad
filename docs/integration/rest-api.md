# REST API 文档

## 概述

Agentic Payment System REST API 为外部应用、仪表板和移动应用提供标准的 HTTP 接口。API 设计为 RESTful，支持资源导向的设计、版本控制和全面的认证机制。

## 基础信息

- **API 版本**: v1
- **基础 URL**: `https://api.agenticpay.com/api/v1`
- **测试环境 URL**: `https://testnet.api.agenticpay.com/api/v1`
- **本地开发 URL**: `http://localhost:3001/api/v1`
- **响应格式**: JSON
- **认证**: Bearer Token, API Key, JWT

## 快速开始

### 1. 获取 API 密钥

在 [Agentic Pay 控制台](https://console.agenticpay.com) 注册并获取 API 密钥。

### 2. 基础请求示例

```bash
# 使用 curl
curl -X GET \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  https://api.agenticpay.com/api/v1/health

# 使用 Node.js
const response = await fetch('https://api.agenticpay.com/api/v1/health', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

# 使用 Python
import requests
response = requests.get(
  'https://api.agenticpay.com/api/v1/health',
  headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
```

### 3. 典型工作流

```bash
# 1. 检查系统状态
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.agenticpay.com/api/v1/health

# 2. 查询预算状态
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.agenticpay.com/api/v1/budgets

# 3. 创建支付请求
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1.5",
    "currency": "USDC",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
    "reason": "API 调用额度",
    "category": "api",
    "taskContext": {
      "taskId": "task_12345",
      "description": "自动API调用费用",
      "agentId": "agent_claude_code"
    }
  }' \
  https://api.agenticpay.com/api/v1/payments

# 4. 查询支付状态
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.agenticpay.com/api/v1/payments/PAYMENT_ID
```

## 认证

### API 密钥认证

所有 API 请求必须在 `Authorization` 头中包含有效的 API 密钥。

```http
Authorization: Bearer sk_live_1234567890abcdef
```

### JWT 认证（OAuth2）

对于用户级别的访问，支持 JWT 令牌。

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 生成 JWT 令牌

```bash
# 获取授权码
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "grant_type": "client_credentials",
    "scope": "payments:read payments:write"
  }' \
  https://api.agenticpay.com/api/v1/oauth/token
```

## 端点参考

### 健康检查

检查 API 服务器状态。

```http
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "blockchain": "connected"
  }
}
```

### 支付管理

#### 创建支付请求

```http
POST /payments
```

**请求体**:
```json
{
  "amount": "1.5",
  "currency": "USDC",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
  "reason": "API 调用额度",
  "category": "api",
  "taskContext": {
    "taskId": "task_12345",
    "description": "自动API调用费用",
    "agentId": "agent_claude_code",
    "metadata": {}
  },
  "policies": [
    {
      "type": "dailyLimit",
      "maxAmount": "1000"
    },
    {
      "type": "categoryWhitelist",
      "allowedCategories": ["api", "infrastructure"]
    }
  ]
}
```

**响应示例** (201 Created):
```json
{
  "id": "pay_1234567890abcdef",
  "amount": "1.5",
  "currency": "USDC",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
  "reason": "API 调用额度",
  "category": "api",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "taskContext": {
    "taskId": "task_12345",
    "description": "自动API调用费用",
    "agentId": "agent_claude_code"
  },
  "policyEvaluations": [
    {
      "policyId": "policy_123",
      "type": "dailyLimit",
      "result": "approved",
      "details": "Daily limit check passed"
    }
  ]
}
```

#### 查询支付列表

```http
GET /payments
```

**查询参数**:
| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `limit` | integer | 返回记录数 | 20 |
| `offset` | integer | 分页偏移量 | 0 |
| `status` | string | 支付状态过滤 | - |
| `agentId` | string | 代理 ID 过滤 | - |
| `category` | string | 类别过滤 | - |
| `startDate` | string | 开始日期 (ISO 8601) | - |
| `endDate` | string | 结束日期 (ISO 8601) | - |
| `sortBy` | string | 排序字段 | `createdAt` |
| `sortOrder` | string | 排序顺序 (`asc`/`desc`) | `desc` |

**响应示例**:
```json
{
  "payments": [
    {
      "id": "pay_1234567890abcdef",
      "amount": "1.5",
      "currency": "USDC",
      "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
      "reason": "API 调用额度",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 获取支付详情

```http
GET /payments/{paymentId}
```

**响应示例**:
```json
{
  "id": "pay_1234567890abcdef",
  "amount": "1.5",
  "currency": "USDC",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
  "reason": "API 调用额度",
  "category": "api",
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:01Z",
  "completedAt": "2024-01-01T00:00:01Z",
  "transactionHash": "0xabc123...",
  "taskContext": {
    "taskId": "task_12345",
    "description": "自动API调用费用",
    "agentId": "agent_claude_code"
  },
  "policyEvaluations": [
    {
      "policyId": "policy_123",
      "type": "dailyLimit",
      "result": "approved",
      "details": "Daily limit check passed"
    }
  ],
  "auditTrail": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "event": "payment.created",
      "actor": "agent_claude_code",
      "details": "Payment request created"
    },
    {
      "timestamp": "2024-01-01T00:00:01Z",
      "event": "payment.completed",
      "actor": "system",
      "details": "Transaction confirmed on blockchain"
    }
  ]
}
```

#### 取消支付请求

```http
DELETE /payments/{paymentId}
```

**响应示例** (200 OK):
```json
{
  "id": "pay_1234567890abcdef",
  "status": "cancelled",
  "cancelledAt": "2024-01-01T00:00:00Z",
  "cancelledBy": "user_123"
}
```

### 预算管理

#### 查询预算状态

```http
GET /budgets
```

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| `agentId` | string | 代理 ID (可选) |

**响应示例**:
```json
{
  "budgets": [
    {
      "agentId": "agent_claude_code",
      "total": "10000.00",
      "used": "1500.00",
      "remaining": "8500.00",
      "currency": "USDC",
      "period": "monthly",
      "resetDate": "2024-02-01T00:00:00Z",
      "limits": {
        "maxPerTransaction": "1000.00",
        "maxDaily": "5000.00",
        "maxMonthly": "10000.00"
      },
      "usageByCategory": {
        "api": "500.00",
        "infrastructure": "800.00",
        "tools": "200.00"
      }
    }
  ]
}
```

#### 请求预算增加

```http
POST /budgets/requests
```

**请求体**:
```json
{
  "agentId": "agent_claude_code",
  "amount": "2000.00",
  "currency": "USDC",
  "reason": "需要额外预算完成重要任务",
  "justification": "本月有多个重要API集成项目需要完成",
  "urgency": "high"
}
```

**响应示例**:
```json
{
  "requestId": "budget_req_123456",
  "agentId": "agent_claude_code",
  "amount": "2000.00",
  "status": "pending_review",
  "createdAt": "2024-01-01T00:00:00Z",
  "reviewDeadline": "2024-01-03T00:00:00Z"
}
```

### 策略管理

#### 查询策略列表

```http
GET /policies
```

**响应示例**:
```json
{
  "policies": [
    {
      "id": "policy_123",
      "name": "每日限额策略",
      "type": "dailyLimit",
      "description": "限制每日支付总额",
      "conditions": {
        "maxAmount": "1000.00",
        "currency": "USDC"
      },
      "actions": ["block", "notify"],
      "priority": 100,
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "policy_124",
      "name": "类别白名单",
      "type": "categoryWhitelist",
      "description": "只允许特定类别的支付",
      "conditions": {
        "allowedCategories": ["api", "infrastructure", "tools"]
      },
      "actions": ["block"],
      "priority": 90,
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 创建新策略

```http
POST /policies
```

**请求体**:
```json
{
  "name": "新代理限制策略",
  "type": "agentRestriction",
  "description": "限制新代理的初始支付额度",
  "conditions": {
    "maxAmountPerTransaction": "100.00",
    "maxTotalAmount": "500.00",
    "durationDays": 7
  },
  "actions": ["block", "require_approval"],
  "priority": 80,
  "enabled": true
}
```

#### 更新策略

```http
PUT /policies/{policyId}
```

**请求体**:
```json
{
  "conditions": {
    "maxAmountPerTransaction": "200.00"
  },
  "enabled": false
}
```

#### 删除策略

```http
DELETE /policies/{policyId}
```

### 审计日志

#### 查询审计日志

```http
GET /audit
```

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| `startDate` | string | 开始日期 |
| `endDate` | string | 结束日期 |
| `eventType` | string | 事件类型 |
| `actorId` | string | 执行者 ID |
| `resourceId` | string | 资源 ID |
| `limit` | integer | 返回记录数 |
| `offset` | integer | 分页偏移量 |

**响应示例**:
```json
{
  "auditEntries": [
    {
      "id": "audit_123456",
      "timestamp": "2024-01-01T00:00:00Z",
      "eventType": "payment.created",
      "actor": {
        "id": "agent_claude_code",
        "type": "agent"
      },
      "resource": {
        "id": "pay_1234567890abcdef",
        "type": "payment"
      },
      "details": {
        "amount": "1.5",
        "currency": "USDC",
        "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 ..."
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 导出审计日志

```http
POST /audit/export
```

**请求体**:
```json
{
  "format": "csv", // "csv", "json", "pdf"
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "eventTypes": ["payment.created", "payment.completed"],
    "actorIds": ["agent_claude_code"]
  },
  "includeMetadata": true
}
```

**响应示例**:
```json
{
  "exportId": "export_123456",
  "status": "processing",
  "estimatedCompletionTime": "2024-01-01T00:01:00Z",
  "downloadUrl": "https://api.agenticpay.com/api/v1/audit/export/export_123456/download"
}
```

### Webhook 管理

#### 创建 Webhook

```http
POST /webhooks
```

**请求体**:
```json
{
  "url": "https://your-server.com/webhooks/payments",
  "events": [
    "payment.created",
    "payment.status_changed",
    "budget.warning",
    "emergency.triggered"
  ],
  "secret": "your_webhook_secret",
  "enabled": true,
  "description": "生产环境支付通知"
}
```

#### 查询 Webhook 列表

```http
GET /webhooks
```

#### 测试 Webhook

```http
POST /webhooks/{webhookId}/test
```

#### 删除 Webhook

```http
DELETE /webhooks/{webhookId}
```

## 错误处理

### 错误响应格式

```json
{
  "error": {
    "code": "validation_error",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "amount",
        "message": "必须为有效的正数"
      },
      {
        "field": "recipient",
        "message": "必须为有效的以太坊地址"
      }
    ],
    "requestId": "req_1234567890abcdef",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 常见错误代码

| HTTP 状态码 | 错误代码 | 描述 | 解决方案 |
|------------|----------|------|----------|
| 400 | `validation_error` | 请求参数验证失败 | 检查请求体格式和参数 |
| 401 | `authentication_failed` | 认证失败 | 检查 API 密钥或令牌 |
| 403 | `insufficient_permissions` | 权限不足 | 检查用户或代理权限 |
| 404 | `resource_not_found` | 资源不存在 | 检查资源 ID |
| 429 | `rate_limit_exceeded` | 请求频率限制 | 降低请求频率 |
| 500 | `internal_server_error` | 服务器内部错误 | 稍后重试或联系支持 |

### 重试策略

对于暂时性错误（429, 500, 502, 503, 504），建议实现指数退避重试：

```python
import time
import requests
from requests.exceptions import RequestException

def make_request_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            elif response.status_code in [429, 500, 502, 503, 504]:
                # 指数退避
                delay = (2 ** attempt) + (random.random() * 0.1)
                time.sleep(delay)
                continue
            else:
                # 非暂时性错误，直接抛出
                response.raise_for_status()
        except RequestException as e:
            if attempt == max_retries - 1:
                raise e
            delay = (2 ** attempt) + (random.random() * 0.1)
            time.sleep(delay)
    
    raise Exception("Max retries exceeded")
```

## 速率限制

### 限制策略

- **标准用户**: 每分钟 60 次请求
- **高级用户**: 每分钟 300 次请求
- **企业用户**: 每分钟 1000 次请求

### 速率限制头信息

响应中包含速率限制信息：

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704067200
```

### 处理速率限制

```javascript
async function makeRequestWithRateLimitHandling() {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'), 10);
    const waitTime = resetTime * 1000 - Date.now();
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return makeRequestWithRateLimitHandling();
    }
  }
  
  return response;
}
```

## 分页

所有列表端点支持游标分页：

### 游标分页示例

```http
GET /payments?limit=20&cursor=eyJpZCI6InBheV8xMjM0NTY3ODkwYWJjZGVmIiwidGltZXN0YW1wIjoiMjAyNC0wMS0wMVQwMDowMDowMFoifQ==
```

**响应示例**:
```json
{
  "payments": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6InBheV8xMjM0NTY3ODkwYWJjZGVmIiwidGltZXN0YW1wIjoiMjAyNC0wMS0wMVQwMDowMDowMFoifQ==",
    "hasMore": true
  }
}
```

## 版本控制

API 使用 URL 路径版本控制：

- 当前版本: `v1`
- 旧版本: 支持 `v0`（已弃用）
- 新版本: 未来将发布 `v2`

### 弃用通知

当端点被弃用时，会在响应头中通知：

```http
Deprecation: true
Sunset: Wed, 01 Jan 2025 00:00:00 GMT
Link: <https://api.agenticpay.com/api/v2/payments>; rel="successor-version"
```

## SDK 集成

### 使用官方 SDK

```typescript
import { AgentPay } from '@agentic-pay/sdk';

const agentPay = new AgentPay({
  apiKey: process.env.AGENTIC_PAY_API_KEY,
  environment: 'production'
});

// 创建支付
const payment = await agentPay.requestPayment({
  amount: '1.5',
  currency: 'USDC',
  recipient: '0x...',
  reason: 'API 调用额度'
});
```

### 自动生成客户端

使用 OpenAPI 规范自动生成客户端：

```bash
# 下载 OpenAPI 规范
curl -o openapi.yaml https://api.agenticpay.com/api/v1/openapi.yaml

# 使用 OpenAPI Generator
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./client
```

## 监控与日志

### 请求 ID

每个请求分配唯一 ID，便于追踪：

```http
X-Request-ID: req_1234567890abcdef
```

### 结构化日志

API 生成结构化日志，包含：

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info",
  "requestId": "req_1234567890abcdef",
  "method": "POST",
  "path": "/api/v1/payments",
  "statusCode": 201,
  "durationMs": 125,
  "userId": "user_123",
  "agentId": "agent_claude_code"
}
```

## 安全最佳实践

### API 密钥保护

1. **不要提交到版本控制**: 使用环境变量
2. **轮换策略**: 每 90 天轮换一次 API 密钥
3. **最小权限**: 为不同用途创建不同权限的密钥
4. **监控使用**: 定期检查 API 密钥使用情况

### 请求签名（高级）

对于高安全需求，支持请求签名：

```python
import hashlib
import hmac
import time
import json

def sign_request(api_key, api_secret, method, path, body):
    timestamp = str(int(time.time()))
    body_hash = hashlib.sha256(json.dumps(body).encode()).hexdigest()
    
    message = f"{method}\n{path}\n{timestamp}\n{body_hash}"
    signature = hmac.new(
        api_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return {
        'X-API-Key': api_key,
        'X-Timestamp': timestamp,
        'X-Signature': signature
    }
```

## 支持与联系

- **文档**: [https://docs.agenticpay.com/api](https://docs.agenticpay.com/api)
- **状态页面**: [https://status.agenticpay.com](https://status.agenticpay.com)
- **支持邮箱**: api-support@agenticpay.com
- **紧急联系人**: 仅限企业客户

## 更新日志

| 日期 | 版本 | 变更描述 |
|------|------|----------|
| 2024-01-01 | v1.0.0 | 初始版本发布 |
| 2024-01-15 | v1.1.0 | 增加 Webhook 支持 |
| 2024-02-01 | v1.2.0 | 增加批量支付操作 |

---

*本文档根据 Agentic Payment System 集成层规范生成，确保开发者能够充分利用 REST API 的全部功能。*