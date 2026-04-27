# GraphQL API 文档

## 概述

Agentic Payment System GraphQL API 提供灵活的数据查询和操作接口，允许客户端精确请求所需数据，减少过度获取和多次请求。GraphQL API 与 REST API 共享相同的业务逻辑，但提供更强大的查询能力。

## 基础信息

- **端点**: `/graphql`
- **基础 URL**: `https://api.agenticpay.com/graphql`
- **测试环境**: `https://testnet.api.agenticpay.com/graphql`
- **本地开发**: `http://localhost:3001/graphql`
- **传输协议**: HTTP/HTTPS (支持 GET/POST)
- **WebSocket 订阅**: `wss://api.agenticpay.com/graphql` (实时订阅)

## 快速开始

### 1. 简单查询示例

```graphql
# 查询支付列表
query GetPayments {
  payments(limit: 10) {
    items {
      id
      amount
      currency
      recipient
      status
      createdAt
    }
    total
    page
    pageSize
    hasNext
  }
}
```

### 2. 带参数的查询

```graphql
# 查询特定代理的支付记录
query GetAgentPayments($agentId: String!, $status: String) {
  payments(agentId: $agentId, status: $status, limit: 20) {
    items {
      id
      amount
      currency
      status
      createdAt
      policyEvaluations {
        policyId
        decision
        evaluatedRules {
          name
          condition
          action
        }
      }
    }
    total
  }
}

# 变量
# {
#   "agentId": "agent_claude_code",
#   "status": "completed"
# }
```

### 3. 创建支付请求

```graphql
# 发起支付请求
mutation RequestPayment($input: PaymentInput!) {
  requestPayment(input: $input) {
    id
    status
    amount
    currency
    recipient
    approvalRequired
    policyEvaluations {
      policyId
      decision
      violations {
        ruleId
        message
        severity
      }
    }
    createdAt
  }
}

# 变量
# {
#   "input": {
#     "amount": "1.5",
#     "currency": "USDC",
#     "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
#     "reason": "API 调用额度",
#     "category": "api",
#     "taskContext": {
#       "taskId": "task_12345",
#       "taskDescription": "自动API调用费用",
#       "taskType": "api_integration",
#       "environment": "production"
#     },
#     "agentId": "agent_claude_code"
#   }
# }
```

## 完整 Schema 参考

### 查询 (Query)

#### payments - 查询支付列表

```graphql
query {
  payments(
    agentId: String
    status: String
    category: String
    limit: Int = 50
    offset: Int = 0
  ): PaymentsResponse!
}
```

**参数**:
- `agentId: String` - 过滤特定代理的支付
- `status: String` - 过滤支付状态 (`pending`, `approved`, `rejected`, `completed`, `failed`, `cancelled`)
- `category: String` - 过滤支付类别 (`api`, `infrastructure`, `tools`, `data`, `compute`, `service`, `ai_agent`, `other`)
- `limit: Int` - 每页记录数 (默认: 50, 最大: 100)
- `offset: Int` - 分页偏移量 (默认: 0)

**返回类型**: `PaymentsResponse`

#### payment - 查询单个支付详情

```graphql
query {
  payment(id: String!): Payment
}
```

**参数**:
- `id: String!` - 支付 ID

**返回类型**: `Payment`

#### budget - 查询代理预算

```graphql
query {
  budget(agentId: String!): Budget
}
```

**参数**:
- `agentId: String!` - 代理 ID

**返回类型**: `Budget`

#### agent - 查询代理信息

```graphql
query {
  agent(id: String!): Agent
}
```

**参数**:
- `id: String!` - 代理 ID

**返回类型**: `Agent`

#### policies - 查询策略列表

```graphql
query {
  policies: [Policy!]!
}
```

**返回类型**: `[Policy!]!`

#### auditEvents - 查询审计事件

```graphql
query {
  auditEvents(
    eventType: String
    actorType: String
    actorId: String
    limit: Int = 100
    offset: Int = 0
  ): AuditEventsResponse!
}
```

**参数**:
- `eventType: String` - 事件类型过滤
- `actorType: String` - 执行者类型 (`agent`, `user`, `system`)
- `actorId: String` - 执行者 ID
- `limit: Int` - 每页记录数 (默认: 100, 最大: 500)
- `offset: Int` - 分页偏移量 (默认: 0)

**返回类型**: `AuditEventsResponse`

### 变更 (Mutation)

#### requestPayment - 创建支付请求

```graphql
mutation {
  requestPayment(input: PaymentInput!): Payment!
}
```

**参数**:
- `input: PaymentInput!` - 支付请求输入

**返回类型**: `Payment!`

#### updateAgentPermissions - 更新代理权限

```graphql
mutation {
  updateAgentPermissions(
    agentId: String!
    permissions: PermissionsInput!
  ): Agent!
}
```

**参数**:
- `agentId: String!` - 代理 ID
- `permissions: PermissionsInput!` - 权限更新输入

**返回类型**: `Agent!`

#### emergencyPause - 紧急暂停系统

```graphql
mutation {
  emergencyPause(
    reason: String
    duration: Int
  ): SystemResponse!
}
```

**参数**:
- `reason: String` - 暂停原因
- `duration: Int` - 暂停时长 (分钟)

**返回类型**: `SystemResponse!`

### 订阅 (Subscription)

#### paymentStatusChanged - 支付状态变更订阅

```graphql
subscription {
  paymentStatusChanged(paymentId: String): Payment!
}
```

**参数**:
- `paymentId: String` - 支付 ID (可选，不指定则订阅所有支付)

**返回类型**: `Payment!`

#### budgetWarning - 预算警告订阅

```graphql
subscription {
  budgetWarning(agentId: String): BudgetWarning!
}
```

**参数**:
- `agentId: String` - 代理 ID (可选，不指定则订阅所有代理)

**返回类型**: `BudgetWarning!`

#### systemEvent - 系统事件订阅

```graphql
subscription {
  systemEvent(eventTypes: [String!]): SystemEvent!
}
```

**参数**:
- `eventTypes: [String!]` - 事件类型列表 (可选)

**返回类型**: `SystemEvent!`

## 类型定义

### Payment - 支付类型

```graphql
type Payment {
  # 基本信息
  id: String!
  status: String!
  amount: String!
  currency: String!
  recipient: String!
  transactionHash: String
  
  # 审批信息
  approvalRequired: Boolean!
  approvalId: String
  approvedBy: String
  approvedAt: String
  
  # 策略评估
  policyEvaluations: [PolicyEvaluation!]!
  
  # 上下文信息
  reason: String
  category: String
  taskContext: TaskContext
  
  # 时间戳
  createdAt: String!
  updatedAt: String
  completedAt: String
  cancelledAt: String
  
  # 审计追踪
  auditTrail: [AuditEvent!]
}
```

### PaymentsResponse - 支付列表响应

```graphql
type PaymentsResponse {
  items: [Payment!]!
  total: Int!
  page: Int!
  pageSize: Int!
  hasNext: Boolean!
  hasPrevious: Boolean!
}
```

### Budget - 预算类型

```graphql
type Budget {
  # 预算总额
  total: Float!
  spent: Float!
  remaining: Float!
  currency: String!
  
  # 限制设置
  dailyLimit: Float!
  dailySpent: Float!
  maxPerTransaction: Float!
  
  # 周期信息
  period: String!
  resetAt: String!
  
  # 分类使用情况
  usageByCategory: JSON!
  
  # 警告阈值
  warningThreshold: Float!
  criticalThreshold: Float!
}
```

### Agent - 代理类型

```graphql
type Agent {
  # 基本信息
  id: String!
  name: String!
  type: String!
  version: String!
  
  # 权限配置
  permissions: Permissions!
  
  # 预算信息
  budget: Budget!
  
  # 状态信息
  isActive: Boolean!
  isPaused: Boolean!
  
  # 时间戳
  createdAt: String!
  lastActive: String!
  pausedAt: String
  resumedAt: String
}
```

### Permissions - 权限类型

```graphql
type Permissions {
  # 基本权限
  canRequestPayments: Boolean!
  canManageBudget: Boolean!
  canUpdatePolicies: Boolean!
  
  # 金额限制
  maxDailyAmount: Float!
  maxPerTransaction: Float!
  requireApprovalThreshold: Float!
  
  # 类别限制
  allowedCategories: [String!]!
  blockedCategories: [String!]!
  
  # 收款人限制
  allowedRecipients: [String!]!
  blockedRecipients: [String!]!
  
  # 时间限制
  allowedHours: [String!]!
  blockedDays: [String!]!
}
```

### Policy - 策略类型

```graphql
type Policy {
  # 基本信息
  id: String!
  name: String!
  description: String!
  enabled: Boolean!
  priority: Int!
  
  # 规则配置
  rules: [PolicyRule!]!
  
  # 作用范围
  scope: PolicyScope!
  
  # 时间戳
  createdAt: String!
  updatedAt: String!
  enabledAt: String
  disabledAt: String
}
```

### PolicyRule - 策略规则类型

```graphql
type PolicyRule {
  id: String!
  name: String!
  description: String!
  condition: String!
  action: String!
  severity: String!
  parameters: JSON!
}
```

### PolicyEvaluation - 策略评估类型

```graphql
type PolicyEvaluation {
  policyId: String!
  decision: String!
  evaluatedRules: [PolicyRule!]!
  violations: [PolicyViolation!]!
  timestamp: String!
}
```

### PolicyViolation - 策略违规类型

```graphql
type PolicyViolation {
  ruleId: String!
  message: String!
  severity: String!
  data: JSON
}
```

### AuditEvent - 审计事件类型

```graphql
type AuditEvent {
  id: String!
  eventType: String!
  actorType: String!
  actorId: String!
  targetType: String
  targetId: String
  metadata: JSON
  timestamp: String!
  
  # IP 和用户代理信息
  ipAddress: String
  userAgent: String
  location: String
}
```

### AuditEventsResponse - 审计事件响应

```graphql
type AuditEventsResponse {
  events: [AuditEvent!]!
  total: Int!
  page: Int!
  pageSize: Int!
}
```

### TaskContext - 任务上下文类型

```graphql
type TaskContext {
  taskId: String!
  taskDescription: String!
  taskType: String!
  environment: String!
  filesModified: [String!]
  commandsExecuted: [String!]
  estimatedCost: Float
  agentId: String
}
```

### SystemResponse - 系统响应类型

```graphql
type SystemResponse {
  success: Boolean!
  message: String!
  timestamp: String!
  data: JSON
}
```

### BudgetWarning - 预算警告类型

```graphql
type BudgetWarning {
  agentId: String!
  warningType: String!
  message: String!
  currentUsage: Float!
  threshold: Float!
  currency: String!
  timestamp: String!
}
```

### SystemEvent - 系统事件类型

```graphql
type SystemEvent {
  eventType: String!
  severity: String!
  message: String!
  data: JSON
  timestamp: String!
}
```

### PolicyScope - 策略作用范围类型

```graphql
type PolicyScope {
  type: String!
  agentIds: [String!]
  category: String
  minAmount: Float
  maxAmount: Float
  timeRange: TimeRange
}

type TimeRange {
  start: String!
  end: String!
  daysOfWeek: [Int!]
  timezone: String!
}
```

## 输入类型

### PaymentInput - 支付请求输入

```graphql
input PaymentInput {
  amount: String!
  currency: String! = "USDC"
  recipient: String!
  reason: String!
  category: String! = "other"
  metadata: JSON
  taskContext: TaskContextInput
  agentId: String
}
```

### TaskContextInput - 任务上下文输入

```graphql
input TaskContextInput {
  taskId: String!
  taskDescription: String!
  taskType: String!
  environment: String! = "development"
  filesModified: [String!]
  commandsExecuted: [String!]
  estimatedCost: Float
}
```

### PermissionsInput - 权限输入

```graphql
input PermissionsInput {
  canRequestPayments: Boolean
  maxDailyAmount: Float
  allowedCategories: [String!]
  requireApprovalThreshold: Float
  allowedRecipients: [String!]
  blockedRecipients: [String!]
}
```

### PolicyInput - 策略输入

```graphql
input PolicyInput {
  name: String!
  description: String!
  enabled: Boolean! = true
  priority: Int! = 100
  rules: [PolicyRuleInput!]!
  scope: PolicyScopeInput
}

input PolicyRuleInput {
  name: String!
  description: String!
  condition: String!
  action: String!
  severity: String! = "medium"
  parameters: JSON = {}
}

input PolicyScopeInput {
  type: String!
  agentIds: [String!]
  category: String
  minAmount: Float
  maxAmount: Float
  timeRange: TimeRangeInput
}

input TimeRangeInput {
  start: String!
  end: String!
  daysOfWeek: [Int!]
  timezone: String! = "UTC"
}
```

## 枚举类型

### PaymentStatus - 支付状态枚举

```graphql
enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
  FAILED
  CANCELLED
}
```

### PolicyDecision - 策略决策枚举

```graphql
enum PolicyDecision {
  APPROVED
  REJECTED
  REQUIRES_APPROVAL
  PENDING_EVALUATION
}
```

### Severity - 严重程度枚举

```graphql
enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### EventType - 事件类型枚举

```graphql
enum EventType {
  PAYMENT_CREATED
  PAYMENT_APPROVED
  PAYMENT_REJECTED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  PAYMENT_CANCELLED
  BUDGET_WARNING
  BUDGET_EXCEEDED
  POLICY_VIOLATION
  AGENT_PAUSED
  AGENT_RESUMED
  SYSTEM_ALERT
  AUDIT_LOG_CREATED
}
```

### AgentType - 代理类型枚举

```graphql
enum AgentType {
  CLAUDE_CODE
  OPENCLAW
  CODEX
  MANUS
  CUSTOM
}
```

## 标量类型

### JSON - JSON 标量类型

GraphQL API 包含自定义 `JSON` 标量类型，用于存储任意 JSON 数据。

```graphql
scalar JSON
```

**使用示例**:
```graphql
query {
  payment(id: "pay_123") {
    metadata
    taskContext {
      metadata
    }
  }
}
```

## 查询示例

### 1. 复杂支付查询

```graphql
query GetDetailedPayments(
  $agentId: String!
  $startDate: String!
  $endDate: String!
  $statuses: [PaymentStatus!]
) {
  payments(
    agentId: $agentId
    status: $statuses
    limit: 50
  ) {
    items {
      id
      amount
      currency
      status
      createdAt
      recipient
      reason
      category
      
      policyEvaluations {
        decision
        evaluatedRules {
          name
          condition
          action
        }
        violations {
          message
          severity
        }
      }
      
      taskContext {
        taskId
        taskDescription
        taskType
        environment
      }
      
      auditTrail {
        eventType
        actorId
        timestamp
        metadata
      }
    }
    total
    page
    pageSize
  }
}
```

### 2. 预算和支付综合分析

```graphql
query GetAgentFinancialOverview($agentId: String!) {
  agent(id: $agentId) {
    id
    name
    type
    isActive
    
    permissions {
      maxDailyAmount
      allowedCategories
      requireApprovalThreshold
    }
    
    budget {
      total
      spent
      remaining
      dailyLimit
      dailySpent
      usageByCategory
      resetAt
    }
  }
  
  payments(agentId: $agentId, limit: 10) {
    items {
      id
      amount
      currency
      status
      category
      createdAt
    }
    total
  }
  
  policies {
    id
    name
    enabled
    priority
    scope {
      type
      agentIds
    }
  }
}
```

### 3. 审计日志分析

```graphql
query GetAuditAnalysis(
  $startDate: String!
  $endDate: String!
  $eventTypes: [EventType!]
) {
  auditEvents(
    eventType: $eventTypes
    limit: 100
  ) {
    events {
      id
      eventType
      actorType
      actorId
      targetType
      targetId
      timestamp
      metadata
      
      ... on PaymentAuditEvent {
        payment {
          id
          amount
          currency
          recipient
        }
      }
    }
    total
  }
}
```

## 变更示例

### 1. 完整支付工作流

```graphql
mutation CompletePaymentWorkflow {
  # 1. 创建支付请求
  request1: requestPayment(input: {
    amount: "100.00",
    currency: "USDC",
    recipient: "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
    reason: "服务器费用",
    category: "infrastructure",
    taskContext: {
      taskId: "task_server_maintenance",
      taskDescription: "月度服务器维护",
      taskType: "maintenance",
      environment: "production"
    },
    agentId: "agent_claude_code"
  }) {
    id
    status
    approvalRequired
    policyEvaluations {
      decision
    }
  }
  
  # 2. 更新代理权限
  updateAgentPermissions(
    agentId: "agent_claude_code"
    permissions: {
      maxDailyAmount: 5000.00,
      allowedCategories: ["infrastructure", "api", "tools"]
    }
  ) {
    id
    permissions {
      maxDailyAmount
      allowedCategories
    }
  }
  
  # 3. 紧急暂停（如果需要）
  emergencyPause(
    reason: "系统维护",
    duration: 30
  ) {
    success
    message
  }
}
```

### 2. 策略管理

```graphql
mutation ManagePolicies {
  # 创建新策略
  createPolicy(input: {
    name: "高风险交易审批",
    description: "要求审批所有超过500 USDC的交易",
    enabled: true,
    priority: 90,
    rules: [
      {
        name: "金额阈值检查",
        description: "检查交易金额是否超过阈值",
        condition: "amount > 500",
        action: "require_approval",
        severity: "high"
      }
    ],
    scope: {
      type: "all_agents",
      minAmount: 0
    }
  }) {
    id
    name
    enabled
  }
  
  # 更新现有策略
  updatePolicy(id: "policy_123", input: {
    enabled: false,
    description: "已禁用 - 使用新策略代替"
  }) {
    id
    enabled
    description
  }
}
```

## 订阅示例

### 1. 实时支付状态监控

```graphql
subscription MonitorPayments($agentId: String!) {
  paymentStatusChanged(paymentId: null) {
    id
    status
    amount
    currency
    recipient
    updatedAt
    
    ... on Payment {
      policyEvaluations {
        decision
      }
    }
  }
  
  budgetWarning(agentId: $agentId) {
    warningType
    message
    currentUsage
    threshold
    timestamp
  }
}
```

### 2. 系统事件监控

```graphql
subscription MonitorSystemEvents {
  systemEvent(eventTypes: [SYSTEM_ALERT, AGENT_PAUSED, AGENT_RESUMED]) {
    eventType
    severity
    message
    timestamp
    data
  }
}
```

## 错误处理

### GraphQL 错误格式

```json
{
  "errors": [
    {
      "message": "Field 'paymnts' doesn't exist on type 'Query'",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["query", "paymnts"],
      "extensions": {
        "code": "FIELD_NOT_FOUND",
        "suggestions": ["payments"]
      }
    }
  ],
  "data": null
}
```

### 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|----------|------|----------|
| `FIELD_NOT_FOUND` | 字段不存在 | 检查字段拼写或查看文档 |
| `ARGUMENT_REQUIRED` | 缺少必需参数 | 提供所有必需参数 |
| `INVALID_INPUT` | 输入验证失败 | 检查输入格式和类型 |
| `UNAUTHORIZED` | 认证失败 | 检查认证令牌 |
| `FORBIDDEN` | 权限不足 | 检查用户权限 |
| `RESOURCE_NOT_FOUND` | 资源不存在 | 检查资源 ID |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 | 稍后重试或联系支持 |

## 性能优化

### 1. 查询优化

```graphql
# 不好 - 获取了不需要的字段
query {
  payments(limit: 100) {
    items {
      id
      amount
      currency
      status
      # 可能不需要的字段
      policyEvaluations {
        evaluatedRules {
          condition
          parameters
        }
      }
      auditTrail {
        metadata
        ipAddress
      }
    }
  }
}

# 好 - 只获取需要的字段
query {
  payments(limit: 100) {
    items {
      id
      amount
      currency
      status
    }
  }
}
```

### 2. 使用片段复用字段

```graphql
fragment PaymentBasicFields on Payment {
  id
  amount
  currency
  status
  createdAt
}

fragment PaymentDetailFields on Payment {
  ...PaymentBasicFields
  recipient
  reason
  category
  policyEvaluations {
    decision
  }
}

query GetPaymentList {
  payments(limit: 10) {
    items {
      ...PaymentBasicFields
    }
  }
}

query GetPaymentDetail($id: String!) {
  payment(id: $id) {
    ...PaymentDetailFields
    taskContext {
      taskId
      taskDescription
    }
  }
}
```

### 3. 批量查询

```graphql
query GetDashboardData($agentId: String!) {
  agent: agent(id: $agentId) {
    ...AgentBasicFields
    budget {
      ...BudgetFields
    }
  }
  
  recentPayments: payments(agentId: $agentId, limit: 5) {
    items {
      ...PaymentBasicFields
    }
  }
  
  policies {
    id
    name
    enabled
  }
}

fragment AgentBasicFields on Agent {
  id
  name
  type
  isActive
}

fragment BudgetFields on Budget {
  total
  spent
  remaining
  dailyLimit
  dailySpent
}
```

## 工具和客户端

### 1. GraphQL 客户端推荐

- **Apollo Client** (React, Vue, Angular)
- **urql** (轻量级)
- **Relay** (Facebook, 复杂应用)
- **graphql-request** (简单请求)

### 2. 使用 Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.agenticpay.com/graphql',
  cache: new InMemoryCache(),
  headers: {
    'Authorization': `Bearer ${process.env.AGENTIC_PAY_API_KEY}`
  }
});

const GET_PAYMENTS = gql`
  query GetPayments($agentId: String!) {
    payments(agentId: $agentId, limit: 10) {
      items {
        id
        amount
        currency
        status
      }
      total
    }
  }
`;

const { data, loading, error } = await client.query({
  query: GET_PAYMENTS,
  variables: { agentId: 'agent_claude_code' }
});
```

### 3. 使用 graphql-request

```typescript
import { request, gql } from 'graphql-request';

const endpoint = 'https://api.agenticpay.com/graphql';

const query = gql`
  query GetBudget($agentId: String!) {
    budget(agentId: $agentId) {
      total
      spent
      remaining
    }
  }
`;

const data = await request(endpoint, query, { agentId: 'agent_claude_code' }, {
  'Authorization': `Bearer ${process.env.AGENTIC_PAY_API_KEY}`
});
```

## 内省查询

### 1. 查询 Schema 信息

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        description
        type {
          name
          kind
        }
      }
    }
  }
}
```

### 2. 查询可用查询和变更

```graphql
query AvailableOperations {
  __schema {
    queryType {
      name
      fields {
        name
        description
        args {
          name
          description
          type {
            name
          }
        }
      }
    }
    mutationType {
      name
      fields {
        name
        description
      }
    }
    subscriptionType {
      name
      fields {
        name
        description
      }
    }
  }
}
```

## 版本信息

- **GraphQL 版本**: June 2018 规范
- **API 版本**: v1
- **最后更新**: 2024-01-01
- **支持的特性**:
  - 查询 (Query)
  - 变更 (Mutation)
  - 订阅 (Subscription)
  - 片段 (Fragments)
  - 变量 (Variables)
  - 指令 (Directives)
  - 内省 (Introspection)

---

*本文档根据 Agentic Payment System 集成层规范生成，确保开发者能够充分利用 GraphQL API 的全部功能。*