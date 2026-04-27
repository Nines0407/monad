# 审计系统架构

## 概述
审计系统为智能体支付系统中的所有支付活动提供完整的可追溯性和可解释性。它捕获、存储和查询支付记录、策略决策、审计事件、会话密钥生命周期事件和手动审批。

## 数据库架构

### 核心表

#### 1. 支付表（Payments）
主要支付记录，结构如下：
- `id` (UUID) - 主键
- `transaction_hash` (字符串) - 区块链交易哈希
- `task_id` (字符串) - 任务标识符
- `agent_id` (字符串) - 智能体标识符
- `user_id` (UUID) - 用户标识符
- `amount` (numeric) - 支付金额，18 位小数精度
- `currency` (字符串) - 货币代码（例如 USDC）
- `recipient` (字符串) - 收款人地址
- `status` (枚举) - 支付状态：待处理、已批准、已拒绝、已执行、失败
- `category` (枚举) - 支付类别：API、计算、存储、数据、服务、其他
- `reason` (文本) - 支付原因/描述
- `created_at`、`updated_at`、`executed_at` (时间戳)

#### 2. 策略决策表（Policy Decisions）
每笔支付的策略评估结果：
- `payment_id` (UUID) - 支付表外键
- `policy_id` (字符串) - 策略标识符
- `decision` (枚举) - 允许、拒绝、需要审批
- `evaluated_rules` (jsonb) - 详细的规则评估
- `violations` (jsonb) - 违规详情（如果有）

#### 3. 审计事件表（Audit Events）
系统范围的审计跟踪：
- `event_type` (枚举) - 事件类型（payment_created、policy_updated 等）
- `actor_type` (枚举) - 智能体、用户、系统
- `actor_id` (字符串) - 执行者标识符
- `target_type`、`target_id` (字符串) - 事件目标
- `metadata` (jsonb) - 额外事件数据

#### 4. 会话密钥事件表（Session Key Events）
会话密钥生命周期跟踪：
- `session_key` (字符串) - 会话密钥标识符
- `event_type` (枚举) - 已注册、已使用、已撤销、已过期
- `permissions_snapshot` (jsonb) - 事件发生时的权限快照
- `related_payment_id` (UUID) - 相关支付（如果有）

#### 5. 手动审批表（Manual Approvals）
手动审批决策：
- `payment_id` (UUID) - 支付表外键
- `approver_id` (UUID) - 审批人标识符
- `decision` (枚举) - 已批准、已拒绝
- `reason` (文本) - 审批原因

## 性能优化

### 索引策略
- 所有表的主键
- 常见查询模式的复合索引：
  - `payments(user_id, created_at)` - 用户支付历史
  - `payments(agent_id, created_at)` - 智能体支付历史
  - `payments(status, created_at)` - 基于状态的查询
  - `audit_events(created_at)` - 基于时间的事件查询
- `payments.reason` 上的全文搜索索引

### 分区
- 支付表按月分区，适用于时间序列数据
- 审计事件表使用 TimescaleDB 扩展进行优化

### 缓存
- 使用 Redis 缓存频繁访问的支付记录
- 仪表板统计信息的物化视图

## 数据流

1. **支付创建**：客户端应用创建支付记录
2. **策略评估**：策略引擎评估并记录决策
3. **事件记录**：系统组件记录相关审计事件
4. **会话密钥跟踪**：密钥管理器记录密钥生命周期事件
5. **手动审批**：审批系统记录手动决策
6. **查询与导出**：用户通过 API 查询和导出审计数据

## 可扩展性考虑

### 水平扩展
- 用于分析查询的数据库只读副本
- 大规模部署的用户分片
- 可配置连接池的连接池

### 数据保留
- 热存储：最近 90 天的数据
- 温存储：90 天至 2 年（压缩）
- 冷存储：超过 2 年的归档数据

## 安全

### 访问控制
- 基于角色的访问（管理员、审计员、用户）
- 基于 JWT 的身份验证
- API 速率限制

### 数据保护
- 敏感字段的静态加密
- 审计系统自身的审计跟踪
- 定期备份和恢复测试

## 集成点

### 内部集成
- 支付执行系统
- 策略引擎
- 会话密钥管理器
- 用户身份验证系统

### 外部 API
- 用于 CRUD 操作的 REST API
- 用于灵活查询的 GraphQL API
- 用于实时更新的 WebSocket API
- 支持外部系统的 Webhook