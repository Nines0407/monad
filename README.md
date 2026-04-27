# Agentic Payment System - 智能体原生支付系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Monad Blitz](https://img.shields.io/badge/Monad-Blitz%20Hangzhou-blue)](https://monad.xyz)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🎯 项目概述

**Agentic Payment System** 是一个基于 **Monad 区块链** 的智能体原生安全支付系统，专为 AI 智能体设计。系统使 AI 智能体能够在用户授权下自主执行链上支付，同时确保安全、可控和完全可审计。

本项目为 **Monad Blitz 杭州竞赛 - Agentic Payment 挑战赛** 的参赛作品，最终产品可集成到 Claude Code、OpenClaw、Codex、Manus 等 AI 智能体环境中。

## ✨ 核心特性

### 🔒 去中心化与非托管架构
- **用户自持私钥**：AI 智能体永远无法接触真实私钥
- **智能合约钱包**：基于 ERC-4337 账户抽象标准
- **权限委托机制**：通过会话密钥（Session Key）授予临时权限
- **跨平台支持**：macOS/Linux/Windows，AMD/Intel/Apple M 架构
- **完全开源**：采用 MIT/Apache 2.0 双重许可证

### 🛡️ 多层安全配置
- **限额管理**：单笔交易上限、每日/每周预算限制、时间控制
- **白名单机制**：允许的收款地址、智能合约、代币类型、已验证服务商
- **方法级限制**：特定合约函数调用权限，禁止危险操作（如无限授权）
- **人工审批**：阈值触发的人工审批，支持 Telegram/App/浏览器插件通知
- **紧急控制**：一键暂停所有权限，即时会话密钥撤销

### 🤖 智能体原生设计
- **权限请求流程**：智能体明确请求支付权限并说明理由和上下文
- **临时授权**：基于任务的短期授权，任务完成后自动过期
- **支付上下文**：与任务ID、智能体ID、用户目标关联的记录
- **失败处理**：重试逻辑，失败时备用支付路径
- **集成接口**：MCP 服务器协议、CLI 工具、TypeScript SDK

### 📊 完整可审计性
- **结构化支付记录**：任务ID、智能体ID、用户ID、收款地址、金额、资产类型等
- **策略决策跟踪**：评估的策略、规则、违规详情、决策原因
- **审计事件日志**：完整的系统事件时间线
- **数据导出**：支持 CSV、JSON、PDF 格式导出
- **链上存储**：重要元数据在 Monad 区块链上永久存储

### 🔄 权限管理与恢复
- **钱包恢复**：社交恢复（3-of-5）、硬件备份、多重签名备用
- **权限调整**：实时更新、批量操作、条件触发
- **会话密钥轮换**：自动计划轮换，泄露时应急响应
- **多智能体管理**：基于角色的权限分配、配额分配
- **生命周期管理**：入职、暂停、离职、归档全流程

## 🏗️ 系统架构

### 分层架构设计

```
├── 智能合约层（链上）
│   ├── AgentWallet.sol        # 代理钱包主合约
│   ├── SessionKeyManager.sol  # 会话密钥管理器
│   ├── PolicyEngine.sol       # 策略执行引擎
│   └── AuditLogger.sol        # 审计日志记录器
│
├── 客户端层（本地）
│   ├── key-manager/           # 密钥管理模块
│   ├── policy-checker/        # 策略验证器
│   ├── transaction-constructor/ # 交易构造器
│   └── session-key-generator/ # 会话密钥生成器
│
├── 服务层（后端）
│   ├── 审计服务（Audit System）
│   │   ├── 数据库: PostgreSQL + Redis
│   │   ├── REST API: Express + Knex.js
│   │   └── GraphQL API: Apollo Server
│   │
│   └── 集成层（Integration Layer）
│       ├── MCP 服务器: Model Context Protocol
│       ├── TypeScript SDK: 统一开发工具包
│       ├── WebSocket API: 实时通信
│       └── CLI 工具: 命令行管理界面
│
└── 智能合约测试层
    ├── Foundry 测试套件
    └── 覆盖率测试（>=90%）
```

### 核心数据流

```
AI 智能体支付请求 → 本地策略检查 → 会话密钥签名 → 
→ 交易构造 → Monad 网络提交 → 审计记录 → 结果返回
```

## 🛠️ 技术栈

### 主要开发工具
- **MonSkill**: 官方 Monad AI 开发工具包（https://skills.devnads.com/）
- **MPP**: Monad 支付协议核心功能
- **x402**: 机器可支付 API 协议（附加功能）

### 智能合约
- **Solidity 0.8.20+** 使用 OpenZeppelin/Solmate 库
- **Hardhat/Foundry** 用于测试和部署
- **ERC-4337** 账户抽象标准

### 客户端与服务器
- **TypeScript 5.0+** 严格模式
- **Node.js 18+/20+** LTS 版本
- **PostgreSQL 14+** 带 TimescaleDB 扩展
- **Redis 7+** 用于缓存和会话管理

### 前端与移动端
- **React 18+** 带 TypeScript
- **React Native 0.70+** 用于移动应用
- **MCP 协议** 用于 AI 智能体集成

### 基础设施
- **Docker** 容器化
- **Kubernetes** 编排
- **Prometheus/Loki/Jaeger** 监控
- **GitHub Actions** CI/CD

## 🚀 快速开始

### 前提条件
- Windows 10/11 (64位) 或 macOS/Linux
- Docker Desktop 已安装并运行
- Node.js 18+ 已安装
- 至少 5GB 可用磁盘空间

### 一键部署（推荐）

```powershell
# Windows PowerShell
cd F:\monad
powershell -ExecutionPolicy Bypass -File run.ps1

# 或使用批处理文件
run.bat
```

### 手动分步部署

1. **启动数据库服务**
```bash
docker-compose up -d postgres redis
```

2. **安装项目依赖**
```bash
npm config set registry https://registry.npmmirror.com  # 使用淘宝镜像加速
npm install
```

3. **运行数据库迁移**
```bash
npm run migrate:up
```

4. **构建项目**
```bash
npm run build
```

5. **启动审计系统**
```bash
npm start
```

### 验证部署

```bash
# 检查容器状态
docker-compose ps

# 测试数据库连接
docker-compose exec postgres psql -U postgres -d agent_pay_audit -c "SELECT 'Database connected' as status;"

# 测试 API 健康检查
curl http://localhost:3001/health
```

## 📖 详细使用指南

### 审计系统使用

审计系统提供完整的支付活动可追溯性和可解释性，包含：

- **数据库模式**：支付记录、策略决策、审计事件、会话密钥事件、人工审批
- **数据访问层**：仓储模式实现，Knex.js 连接池，TypeScript 模型接口
- **API 接口**：
  - REST API：`/api/v1/payments`, `/api/v1/audit-events`, `/api/v1/policy-decisions`
  - GraphQL API：灵活查询，支持复杂关系和过滤
- **基础设施**：环境配置、数据库迁移、健康检查、部署脚本

详细文档请参阅：[README_AUDIT_SYSTEM.md](README_AUDIT_SYSTEM.md)

### 集成接口

#### MCP 服务器（AI 智能体集成）
```typescript
// 可用的 AI 智能体工具
tools: [
    {
        name: "request_payment",
        description: "请求支付权限并执行支付",
        inputSchema: { /* 结构化模式 */ }
    },
    {
        name: "check_budget", 
        description: "检查剩余预算和限制"
    },
    // ... 更多工具
]
```

#### CLI 命令行工具
```bash
# 初始化钱包
agent-pay init --network monad-testnet

# 授权智能体并设置预算
agent-pay authorize --agent-id "claude-code" --budget "50 USDC" --expiry "7d"

# 查看审计日志
agent-pay audit --task-id "task-123" --output-format json

# 紧急暂停
agent-pay pause --all

# 策略管理
agent-pay policy add --name "api-budget" --condition "category == 'api'" --action "limit 100 USDC daily"
```

#### TypeScript SDK
```typescript
import { AgentPay } from '@agent-pay/sdk';

const agentPay = new AgentPay({
    network: 'monad-testnet',
    apiKey: 'your-api-key'
});

// 请求支付
const result = await agentPay.requestPayment({
    amount: "0.5",
    currency: "USDC",
    recipient: "0x1234...",
    reason: "API access payment",
    taskContext: "web-scraping-task-001"
});
```

### API 使用示例

#### REST API
```bash
# 获取所有支付记录
curl http://localhost:3001/api/v1/payments

# 按 ID 获取支付
curl http://localhost:3001/api/v1/payments/550e8400-e29b-41d4-a716-446655440000

# 搜索支付
curl "http://localhost:3001/api/v1/payments?userId=user_001&status=executed"
```

#### GraphQL API
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

## 🗺️ 项目结构

```
F:\monad\
├── client/                    # 客户端应用
│   ├── src/
│   │   ├── key-manager/      # 密钥管理
│   │   ├── session-key-generator/ # 会话密钥生成
│   │   ├── policy-checker/   # 策略检查
│   │   ├── transaction-constructor/ # 交易构造
│   │   └── types/           # 类型定义
│   └── docs/                # 客户端文档
│
├── contracts/                # 智能合约
│   ├── src/
│   │   ├── AgentWallet.sol
│   │   ├── SessionKeyManager.sol
│   │   ├── PolicyEngine.sol
│   │   └── interfaces/
│   └── script/              # 部署脚本
│
├── src/                     # 审计系统后端
│   ├── models/              # TypeScript 类型定义
│   ├── repositories/        # 数据访问层
│   ├── db/                  # 数据库连接
│   ├── api/                 # REST 和 GraphQL API
│   └── index.ts             # 应用入口点
│
├── integration/             # 集成层
│   ├── mcp-server/         # MCP 服务器
│   ├── cli/                # 命令行工具
│   ├── sdk/                # TypeScript SDK
│   ├── api/                # 集成 API
│   ├── websocket/          # WebSocket API
│   └── shared/             # 共享代码
│
├── docs/                    # 文档
│   ├── architecture/       # 架构文档
│   └── integration/        # 集成文档
│
├── scripts/                 # 部署和工具脚本
├── migrations/             # 数据库迁移
├── seeds/                  # 样本数据
├── tests/                  # 测试套件
├── web/                    # Web 前端
└── agent_tasks/            # 智能体任务规范
```

## 🔧 开发指南

### 环境设置

详细的环境配置和开发规范请参阅：[agent_development_preset.md](agent_development_preset.md)

该文档为 AI 智能体提供完整的开发指导，包括：
- 环境与依赖配置
- 代码结构与规范
- 自动化测试标准
- 文档生成流程
- 质量保证标准
- 部署与监控模板

### 开发工作流

1. **环境验证**：运行 `./scripts/verify-environment.sh` 检查开发环境
2. **依赖安装**：运行 `npm install` 安装所有依赖
3. **数据库设置**：运行 `npm run migrate:up` 执行数据库迁移
4. **开发服务器**：运行 `npm run dev` 启动开发服务器
5. **运行测试**：运行 `npm test` 执行测试套件
6. **构建项目**：运行 `npm run build` 构建生产版本

### 测试策略

- **单元测试**：智能合约 Hardhat/Foundry 测试，客户端 Jest/Vitest 测试
- **集成测试**：端到端流程测试，多智能体并发场景
- **安全测试**：权限绕过测试，会话密钥滥用测试
- **性能测试**：负载测试（100+ 支付/秒），可扩展性测试

## 🤝 贡献指南

我们欢迎所有形式的贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

### 贡献流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 行为准则
本项目遵守贡献者公约行为准则，请参阅 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

## 📄 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔒 安全策略

发现安全漏洞？请查看 [SECURITY.md](SECURITY.md) 了解如何报告安全问题。

## 📚 详细文档

- [AI 智能体开发预设定](agent_development_preset.md) - AI 智能体开发标准
- [技术修复与使用指南](TECHNICAL_REPAIR_AND_USAGE.md) - 技术问题修复记录
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 部署步骤检查清单
- [详细部署指南](DEPLOYMENT_GUIDE.md) - 全面部署说明
- [Docker 部署指南](README_DOCKER.md) - Docker 容器化部署
- [项目分析报告](PROJECT_ANALYSIS.md) - 项目架构和技术分析
- [审计系统文档](README_AUDIT_SYSTEM.md) - 审计系统组件说明

## 📞 支持与联系

- **问题反馈**：使用 GitHub Issues 报告问题
- **功能请求**：使用 GitHub Discussions 提出建议
- **技术讨论**：加入我们的技术社区

---

**Monad Blitz 杭州竞赛 - Agentic Payment 挑战赛参赛作品**  
*构建智能体原生的安全支付未来*