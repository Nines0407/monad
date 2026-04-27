# Agentic Payment System - 审计系统文档

## 概述
本审计系统为 Agentic Payment System 的所有支付活动提供完整的可追溯性和可解释性。按照 `agent_development_preset.md` 标准开发，包含数据库模式、存储实现、REST API、GraphQL API 和部署自动化。

## 已实现的组件

### 1. 数据库模式
- **payments**: 主要支付记录，带索引和分区
- **policy_decisions**: 策略评估结果，带 JSONB 字段
- **audit_events**: 系统范围审计追踪，带时间序列优化
- **session_key_events**: 会话密钥生命周期跟踪
- **manual_approvals**: 人工审批记录

### 2. 数据访问层
- 所有表的仓储模式实现
- 使用 Knex.js 的连接池
- TypeScript 模型和接口
- 带通用工具的基础仓储类

### 3. API 接口
- **REST API**: 所有实体的完整 CRUD 操作
  - 支付: `/api/v1/payments`
  - 审计事件: `/api/v1/audit-events`
  - 策略决策: `/api/v1/policy-decisions`
- **GraphQL API**: 使用 Apollo Server 的灵活查询
  - 模式定义在 `src/api/graphql/schema.ts`
  - 支持复杂查询和关系

### 4. 基础设施
- **环境配置**: `.env.example` 包含所有必需变量
- **数据库迁移**: 带回滚支持的版本化迁移
- **健康检查**: 全面的健康监控
- **部署脚本**: 开发和生产环境的自动化部署

### 5. 文档
- **架构文档**: `docs/architecture/audit-system.md`
- **API 文档**: 代码中记录的 REST 端点
- **部署指南**: `scripts/` 中的脚本和说明

## 开发环境设置

### 前提条件
- Node.js 18+
- PostgreSQL 14+（或 Docker）
- Redis 7+（可选）

### 安装步骤
1. 克隆仓库
2. 运行设置脚本: `./scripts/setup.sh`
3. 配置环境: `cp .env.example .env`
4. 更新 `.env` 中的数据库凭证
5. 运行迁移: `npm run migrate:up`
6. 启动开发服务器: `npm run dev`

### 数据库设置
```bash
# 运行迁移
npm run migrate:up

# 种子样本数据（开发环境）
npx knex seed:run
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 健康检查
```bash
# 运行健康检查
npm run health-check

# 手动健康检查
curl http://localhost:3001/health
```

## 部署

### 完整部署
```bash
./scripts/deploy-all.sh
```

### 环境特定部署
```bash
# 开发环境
NODE_ENV=development npm run deploy:all

# 生产环境
NODE_ENV=production npm run deploy:all
```

## API 使用示例

### REST API
```bash
# 获取所有支付记录
curl http://localhost:3001/api/v1/payments

# 按 ID 获取支付
curl http://localhost:3001/api/v1/payments/550e8400-e29b-41d4-a716-446655440000

# 搜索支付
curl "http://localhost:3001/api/v1/payments?userId=user_001&status=executed"
```

### GraphQL API
```graphql
query {
  payments(criteria: { userId: "user_001" }) {
    payments {
      id
      amount
      status
      createdAt
    }
    total
    page
  }
}
```

## 项目结构
```
F:\monad\
├── src/
│   ├── models/           # TypeScript 类型定义
│   ├── repositories/     # 数据访问层
│   ├── db/              # 数据库连接
│   ├── api/             # REST 和 GraphQL API
│   └── index.ts         # 应用入口点
├── migrations/          # 数据库迁移
├── seeds/              # 样本数据
├── scripts/            # 部署和工具脚本
├── docs/               # 文档
├── tests/              # 测试套件
└── package.json        # 依赖和脚本
```

## 符合开发预设定标准
本实现遵循 `agent_development_preset.md` 的所有标准：

- ✅ 环境验证和依赖配置
- ✅ 自动化部署脚本
- ✅ 文档生成
- ✅ 质量保证标准
- ✅ 监控和报告模板
- ✅ 标准开发工作流

## 后续步骤
1. 完成 Web 界面实现（仪表板、支付浏览器、导出功能）
2. 添加全面的测试覆盖率
3. 实现性能基准测试
4. 添加监控和告警集成
5. 设置 CI/CD 流水线

## 许可证
Agentic Payment System 的一部分 - Monad Blitz 杭州竞赛