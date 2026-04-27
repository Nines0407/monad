# Integration Layer Development Task Specification

## Overview
Develop the integration interfaces that enable AI Agents and external applications to interact with the Agentic Payment System. This includes MCP Server for AI Agent integration, CLI tool for automation, TypeScript SDK for custom integrations, and web APIs for application connectivity.

## Components & Subtasks

### 1. MCP Server (Model Context Protocol)
**Objective**: Implement an MCP Server that exposes payment functionality as tools for AI Agents (Claude Code, OpenClaw, Codex, Manus).

**Key Tools**:
- `request_payment` - Request payment permission and execute payment
- `check_budget` - Check remaining budget and limits
- `get_payment_status` - Get status of specific payment
- `list_payments` - List recent payments with filtering
- `update_permissions` - Update Agent permissions and restrictions
- `emergency_pause` - Immediately pause all Agent activities

**Protocol Implementation**:
- **Transport**: Server-Sent Events (SSE) for real-time communication
- **Authentication**: Bearer tokens with automatic rotation
- **Error Handling**: Structured errors with retry guidance
- **Versioning**: MCP protocol latest version compatibility
- **Resource Management**: Efficient connection pooling and session management

**Integration Features**:
- **Tool Discovery**: Dynamic tool registration based on user permissions
- **Context Awareness**: Include task context in all payment requests
- **Policy Integration**: Automatic policy evaluation before tool execution
- **Audit Logging**: Complete audit trail for all tool invocations
- **Rate Limiting**: Per-Agent and per-user rate limits

**Technical Requirements**:
- Use `@modelcontextprotocol/sdk` for MCP compliance
- Support both local (Unix socket) and remote (HTTP) connections
- Implement tool input validation with JSON Schema
- Add comprehensive error handling and recovery
- Include health checks and monitoring endpoints

**Dependencies**: Client Application (for payment execution), Policy Engine (for evaluation)

**Acceptance Criteria**:
- Compatible with Claude Code, OpenClaw, Codex, and Manus
- Tool invocation latency < 100ms
- Support 100+ concurrent Agent connections
- 99.9% uptime with graceful degradation
- Complete audit trail for all operations

**Estimated Effort**: 2 weeks

### 2. CLI Tool
**Objective**: Create a command-line interface for automation, scripting, and manual management of the payment system.

**Key Commands**:
- `agent-pay init` - Initialize wallet and configuration
- `agent-pay authorize` - Authorize Agent with budget and permissions
- `agent-pay request` - Manually request payment (bypassing Agent)
- `agent-pay audit` - View audit logs with filtering and export
- `agent-pay policy` - Manage security policies
- `agent-pay status` - Check system status and balances
- `agent-pay pause` - Emergency pause all activities
- `agent-pay recover` - Wallet recovery operations

**Advanced Features**:
- **Scripting Support**: Pipe commands, output formats (JSON, YAML, CSV)
- **Batch Operations**: Process multiple payments from file input
- **Automation Hooks**: Pre/post execution hooks for CI/CD integration
- **Configuration Management**: Profiles for different environments
- **Secret Management**: Integration with 1Password, LastPass, OS keychain

**User Experience**:
- **Interactive Mode**: Guided workflows for complex operations
- **Auto-completion**: Shell completion for bash, zsh, fish, PowerShell
- **Progress Indicators**: Real-time feedback for long operations
- **Color-coded Output**: Clear success/warning/error indicators
- **Help System**: Comprehensive documentation with examples

**Technical Implementation**:
- Use `commander.js` or `oclif` for CLI framework
- Implement tab completion using `tabtab` or similar
- Add support for configuration files (JSON, YAML, TOML)
- Include update mechanism for automatic upgrades
- Add telemetry (opt-in) for usage analytics

**Dependencies**: Client Application (core functionality), TypeScript SDK (shared logic)

**Acceptance Criteria**:
- All commands execute in < 2 seconds
- Support for Linux, macOS, Windows (including PowerShell)
- Comprehensive test coverage (> 90%)
- Easy installation (npm, brew, curl installer)
- Clear error messages with troubleshooting guidance

**Estimated Effort**: 1.5 weeks

### 3. TypeScript SDK
**Objective**: Develop a full-featured SDK for custom integrations, third-party applications, and advanced use cases.

**Core Classes**:
- `AgentPay` - Main SDK class with high-level API
- `PaymentRequest` - Payment request builder with fluent interface
- `PolicyManager` - Policy configuration and management
- `AuditClient` - Audit log querying and export
- `WebSocketClient` - Real-time updates and notifications

**Key Features**:
- **Type Safety**: Full TypeScript definitions with strict null checking
- **Modular Design**: Tree-shakable exports for bundle optimization
- **Error Handling**: Typed errors with recovery guidance
- **Middleware Support**: Interceptors for logging, caching, retries
- **Testing Utilities**: Mock servers, test fixtures, integration helpers

**API Surface**:
```typescript
// High-level API
const agentPay = new AgentPay(config);
const result = await agentPay.requestPayment({
  amount: "1.5",
  currency: "USDC",
  recipient: "0x...",
  reason: "API call credits",
  category: "api"
});

// Low-level API
const txBuilder = new TransactionBuilder();
const tx = await txBuilder.buildPayment({...});
const signed = await wallet.signTransaction(tx);
```

**Integration Points**:
- **React Hooks**: `useAgentPay()`, `useBudget()`, `usePayments()`
- **Vue Composables**: Similar hooks for Vue 3
- **Node.js Streams**: Stream payment data for processing
- **Browser Extension**: SDK for browser extension development
- **Mobile**: React Native and Capacitor support

**Technical Requirements**:
- Zero dependencies (or minimal, tree-shakable dependencies)
- Support for both ESM and CommonJS
- Comprehensive documentation with JSDoc comments
- Code generation for API clients from OpenAPI spec
- Performance benchmarking and optimization

**Dependencies**: Client Application (shared core logic), Smart Contracts (ABIs)

**Acceptance Criteria**:
- Bundle size < 50KB (gzipped)
- API consistency across all methods
- 100% type coverage with no `any` types
- Works in Node.js, browsers, and React Native
- Backward compatibility with semantic versioning

**Estimated Effort**: 2 weeks

### 4. REST/GraphQL API
**Objective**: Provide standard web APIs for integration with external applications, dashboards, and mobile apps.

**API Design**:
- **RESTful Endpoints**: Resource-oriented design with proper HTTP verbs
- **GraphQL Schema**: Full GraphQL schema for flexible queries
- **OpenAPI Specification**: Auto-generated OpenAPI 3.0 documentation
- **API Versioning**: Semantic versioning with deprecation notices

**Key Endpoints**:
- `POST /api/v1/payments` - Create new payment request
- `GET /api/v1/payments` - List payments with filtering
- `GET /api/v1/payments/{id}` - Get payment details
- `GET /api/v1/budgets` - Check budget status
- `PUT /api/v1/policies/{id}` - Update policy
- `GET /api/v1/audit` - Query audit logs
- `POST /api/v1/webhooks` - Manage webhook subscriptions

**GraphQL Schema**:
```graphql
type Payment {
  id: ID!
  amount: String!
  currency: String!
  recipient: Address!
  status: PaymentStatus!
  task: TaskContext
  policies: [PolicyEvaluation]
  auditTrail: [AuditEntry]
}

type Query {
  payments(filter: PaymentFilter): [Payment!]!
  budget(agentId: ID): BudgetStatus!
  policies: [Policy!]!
}

type Mutation {
  requestPayment(input: PaymentInput!): Payment!
  updatePolicy(input: PolicyInput!): Policy!
}
```

**API Features**:
- **Authentication**: JWT tokens, API keys, OAuth2
- **Rate Limiting**: Per-IP and per-user limits
- **Caching**: ETag, Last-Modified, Redis caching
- **Validation**: Request validation with detailed errors
- **Pagination**: Cursor-based pagination for large datasets

**Technical Implementation**:
- Use `Fastify` or `Express` with TypeScript
- Implement `GraphQL Yoga` or `Apollo Server` for GraphQL
- Add `Swagger`/`OpenAPI` auto-generation
- Include `rate-limit` middleware with Redis backend
- Implement comprehensive logging and monitoring

**Dependencies**: Client Application (business logic), Database (for querying)

**Acceptance Criteria**:
- API response time < 100ms (p95)
- Support 1000+ requests per second
- 99.9% API uptime
- Comprehensive API documentation with examples
- OpenAPI spec passes Redocly validation

**Estimated Effort**: 2 weeks

### 5. WebSocket API
**Objective**: Provide real-time updates for payment status, policy changes, and system events.

**Key Events**:
- `payment:created` - New payment requested
- `payment:status_changed` - Payment status updated
- `policy:updated` - Policy changed
- `budget:warning` - Budget threshold reached
- `emergency:triggered` - Emergency pause activated
- `agent:connected` - Agent connected/disconnected

**Protocol Features**:
- **Authentication**: Same as REST API (JWT tokens)
- **Reconnection**: Automatic reconnection with backoff
- **Heartbeats**: Keepalive messages to detect dead connections
- **Subscription Management**: Subscribe/unsubscribe to specific channels
- **Message Compression**: Optional compression for large payloads

**Client Libraries**:
- **JavaScript/TypeScript**: Official client library
- **Python**: Python client with async support
- **Go**: Go client for server-side integration
- **Mobile**: React Native and Swift/Java clients

**Use Cases**:
- **Real-time Dashboards**: Live updates for admin dashboards
- **Mobile Notifications**: Push notifications for manual approvals
- **Integration Updates**: External system synchronization
- **Monitoring**: Real-time system health monitoring

**Technical Implementation**:
- Use `Socket.IO` or `ws` with `JSON` messages
- Implement room/channel system for targeted broadcasts
- Add message persistence for disconnected clients
- Include connection quality monitoring
- Implement graceful degradation when under load

**Dependencies**: REST/GraphQL API (shared authentication), Client Application (event sources)

**Acceptance Criteria**:
- Message latency < 50ms
- Support 10,000+ concurrent connections
- 99.9% message delivery reliability
- Efficient bandwidth usage (< 1KB per message average)
- Comprehensive client libraries for major platforms

**Estimated Effort**: 1 week

## Integration Requirements

### Cross-Component Consistency
1. **Authentication**: Unified auth across all interfaces (MCP, CLI, API, WebSocket)
2. **Error Handling**: Consistent error codes and messages
3. **Data Models**: Shared TypeScript interfaces for all components
4. **Configuration**: Centralized configuration management
5. **Logging**: Unified structured logging format

### Deployment Architecture
- **MCP Server**: Can run locally or as a service
- **CLI Tool**: Local installation only
- **TypeScript SDK**: Published to npm registry
- **REST/GraphQL API**: Containerized microservice
- **WebSocket API**: Colocated with REST API or separate service

### Development Workflow
- **API First**: Design APIs before implementation
- **Contract Testing**: Verify all implementations against API contracts
- **Code Generation**: Generate clients from OpenAPI/GraphQL schemas
- **Version Management**: Semantic versioning with deprecation policies

## Development Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up monorepo structure for all integration components
- [ ] Define shared TypeScript interfaces and types
- [ ] Implement unified authentication system
- [ ] Create basic MCP Server skeleton

### Phase 2: Core APIs (Week 2)
- [ ] Complete MCP Server with all tools
- [ ] Implement CLI tool with core commands
- [ ] Create TypeScript SDK foundation
- [ ] Design REST/GraphQL API specifications

### Phase 3: Web Interfaces (Week 3)
- [ ] Implement REST/GraphQL API with core endpoints
- [ ] Add WebSocket API for real-time updates
- [ ] Create API documentation (OpenAPI, GraphQL schema)
- [ ] Build example integrations and demos

### Phase 4: Polish & Integration (Week 4)
- [ ] Add advanced features to all components
- [ ] Implement comprehensive error handling
- [ ] Add testing utilities and examples
- [ ] Final integration testing with other components

## Success Metrics
- **Interoperability**: Seamless integration with 3+ AI Agent platforms
- **Performance**: API latency < 100ms, WebSocket messages < 50ms
- **Reliability**: 99.9% uptime for all services
- **Developer Experience**: Comprehensive documentation and examples
- **Adoption**: SDK used by 3+ third-party applications

## Dependencies on Other Teams
- **Client Team**: Core payment logic and business rules
- **Smart Contract Team**: Contract ABI and interaction patterns
- **Audit Team**: Audit log querying and export functionality
- **DevOps Team**: Deployment and scaling infrastructure

## Risk Mitigation
- **Protocol Changes**: Abstract protocol details behind interfaces
- **Scalability Issues**: Design for horizontal scaling from day one
- **Integration Complexity**: Provide comprehensive examples and templates
- **Security Risks**: Rigorous authentication and input validation
- **Maintenance Burden**: Automated testing and API versioning

## 开发实施指南（按照Agentic Payment System开发预设定）

### 1. 环境与依赖配置

#### 1.1 必需工具清单
集成层开发需要以下工具，部署前必须验证：

```bash
# 基础开发工具
node --version      # 必须 >= 18.0.0
npm --version       # 必须 >= 9.0.0
docker --version    # 必须安装并运行
git --version       # 必须安装

# Monad开发工具
npx @monad/skill-install monad-skill

# 智能合约开发（用于集成测试）
forge --version     # Foundry工具链
solc --version      # Solidity编译器 >= 0.8.20

# 数据库（用于API组件）
psql --version      # PostgreSQL >= 14.0
redis-cli --version # Redis >= 7.0

# 容器化
docker-compose --version
```

#### 1.2 环境安装脚本
创建 `scripts/setup-integration.sh` 自动化环境设置：

```bash
#!/bin/bash
echo "🚀 开始设置集成层开发环境"

# 1. 安装Node.js依赖
echo "📦 安装Node.js依赖..."
npm install
npm install -g typescript ts-node jest @modelcontextprotocol/sdk commander

# 2. 初始化Monad测试网络配置
echo "🔗 配置Monad测试网络..."
npx @monad/skill-init --network monad-testnet --key-manager local

# 3. 启动本地数据库服务（用于REST/GraphQL API）
echo "🗄️ 启动数据库服务..."
docker-compose up -d postgres redis

# 4. 验证环境
echo "✅ 验证环境配置..."
node scripts/verify-environment.js

echo "🎉 集成层环境设置完成！"
```

#### 1.3 环境变量配置
创建 `.env.integration.example` 包含集成层特定配置：

```env
# MCP服务器配置
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost
MCP_MAX_CONNECTIONS=100
MCP_HEARTBEAT_INTERVAL=30

# API服务器配置
API_PORT=3001
API_HOST=localhost
API_RATE_LIMIT=1000

# WebSocket配置
WS_PORT=3002
WS_HOST=localhost
WS_MAX_CONNECTIONS=10000

# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/agent_pay_integration
REDIS_URL=redis://localhost:6379

# 监控配置
PROMETHEUS_PORT=9090
GRAFANA_PORT=3003
```

### 2. 自动化部署流程

#### 2.1 完整部署脚本
创建 `scripts/deploy-integration.sh` 自动化部署所有集成组件：

```bash
#!/bin/bash
set -e

echo "🏗️ 开始集成层部署流程"

# 阶段1: 构建所有组件
echo "1️⃣ 构建所有集成组件..."
npm run build:mcp
npm run build:cli
npm run build:sdk
npm run build:api

# 阶段2: 启动MCP服务器
echo "2️⃣ 启动MCP服务器..."
npm start:mcp &
MCP_PID=$!
sleep 3

# 阶段3: 启动REST/GraphQL API
echo "3️⃣ 启动API服务器..."
npm start:api &
API_PID=$!
sleep 3

# 阶段4: 启动WebSocket服务器
echo "4️⃣ 启动WebSocket服务器..."
npm start:ws &
WS_PID=$!
sleep 3

# 阶段5: 运行健康检查
echo "5️⃣ 运行部署后健康检查..."
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3002/health || exit 1

echo "🎊 集成层部署成功完成！"
```

#### 2.2 分阶段部署选项
在 `package.json` 中添加部署脚本：

```json
{
  "scripts": {
    "deploy:mcp": "npm run build:mcp && npm start:mcp",
    "deploy:api": "npm run build:api && npm start:api",
    "deploy:ws": "npm run build:ws && npm start:ws",
    "deploy:all": "./scripts/deploy-integration.sh"
  }
}
```

#### 2.3 部署验证清单
部署完成后必须验证：

```bash
# 1. MCP协议验证
node scripts/verify-mcp.js

# 2. API端点验证
curl http://localhost:3001/api/v1/health

# 3. WebSocket连接验证
node scripts/verify-websocket.js

# 4. 端到端集成测试
npm run test:e2e:integration
```

### 3. 文档生成规范

#### 3.1 文档结构模板
集成层必须生成以下文档：

```
docs/integration/
├── mcp-server-api.md      # MCP服务器API文档
├── cli-reference.md       # CLI工具参考手册
├── sdk-guide.md          # TypeScript SDK使用指南
├── rest-api.md           # REST API文档
├── graphql-api.md        # GraphQL API文档
├── websocket-api.md      # WebSocket API文档
└── integration-examples.md # 集成示例
```

#### 3.2 自动化文档生成脚本
创建 `scripts/generate-integration-docs.sh`：

```bash
#!/bin/bash
echo "📄 生成集成层文档..."

# 1. 生成MCP服务器文档
npx typedoc --out docs/integration/mcp mcp-server/src/

# 2. 生成CLI文档
npx oclif readme --dir docs/integration/cli

# 3. 生成API文档
npx redocly build-docs openapi.yaml --output docs/integration/rest-api.html

# 4. 生成GraphQL Schema文档
npx graphql-markdown schema.graphql --output docs/integration/graphql-api.md

echo "✅ 集成层文档生成完成！"
```

#### 3.3 文档质量检查清单
每份生成的文档必须满足：
- ✅ 标题清晰描述内容
- ✅ 使用标准Markdown标题层级
- ✅ 包含可运行的代码片段
- ✅ 包含完整的TypeScript/OpenAPI定义
- ✅ 复杂的流程必须有图表说明
- ✅ 所有示例代码必须通过测试
- ✅ 包含文档版本和最后更新日期

### 4. 质量保证与测试

#### 4.1 必须通过的测试套件

```bash
# MCP服务器测试
cd mcp-server
npm test --coverage
npm run test:integration

# CLI工具测试
cd cli
npm test --coverage
npm run test:e2e

# TypeScript SDK测试
cd sdk
npm test --coverage
npm run test:integration

# REST/GraphQL API测试
cd api
npm test --coverage
npm run test:e2e

# WebSocket API测试
cd websocket
npm test --coverage
npm run test:integration

# 端到端集成测试
npm run test:e2e:integration
```

#### 4.2 代码质量门禁

```json
{
  "质量门禁": {
    "测试覆盖率": {
      "MCP服务器": ">= 85%",
      "CLI工具": ">= 80%",
      "TypeScript SDK": ">= 90%",
      "API组件": ">= 85%"
    },
    "代码规范": {
      "ESLint通过率": "100%",
      "TypeScript严格模式": "启用",
      "无任何警告": "是"
    },
    "性能指标": {
      "MCP工具调用延迟": "< 100ms",
      "API响应时间": "< 100ms (P95)",
      "WebSocket消息延迟": "< 50ms"
    }
  }
}
```

#### 4.3 部署后健康检查
创建 `scripts/health-check-integration.sh`：

```bash
#!/bin/bash
echo "🏥 运行集成层健康检查..."

# 检查MCP服务器
MCP_HEALTH=$(curl -s http://localhost:3000/health | grep "status.*ok")

# 检查REST API
API_HEALTH=$(curl -s http://localhost:3001/api/v1/health | grep "status.*ok")

# 检查WebSocket连接
WS_HEALTH=$(node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3002');
setTimeout(() => {
  console.log(ws.readyState === 1 ? 'OK' : 'FAIL');
  ws.close();
}, 1000);
")

if [[ -n "$MCP_HEALTH" && -n "$API_HEALTH" && "$WS_HEALTH" == "OK" ]]; then
  echo "✅ 所有集成组件健康"
  exit 0
else
  echo "❌ 健康检查失败"
  exit 1
fi
```

### 5. 智能体开发工作流

#### 5.1 标准开发流程
```mermaid
graph TD
    A[接收集成层开发任务] --> B[环境验证]
    B --> C[组件实现]
    C --> D[运行测试套件]
    D --> E[生成文档]
    E --> F[部署验证]
    F --> G[健康检查]
    G --> H[任务完成]
    
    D -- 测试失败 --> I[修复问题]
    I --> C
    F -- 部署失败 --> J[排查问题]
    J --> C
```

#### 5.2 任务完成清单
每个集成组件开发完成后必须确认：
- [ ] 代码通过所有测试（`npm test`）
- [ ] 代码覆盖率达标（`npm run coverage`）
- [ ] 代码符合规范（`npm run lint`）
- [ ] 类型检查通过（`npm run typecheck`）
- [ ] 文档已更新（相关文档章节）
- [ ] 部署脚本已验证（本地部署测试）
- [ ] 健康检查通过（`npm run health-check`）
- [ ] 版本控制提交（git commit with standard message）

#### 5.3 错误处理与恢复
遇到部署失败时，智能体必须：
1. **收集日志**：保存所有相关错误日志
2. **回滚策略**：执行预定义的回滚脚本
3. **问题分析**：根据错误类型采取相应措施
4. **重新部署**：修复问题后重新执行部署

```bash
# 集成层回滚脚本
npm run rollback:mcp      # 回滚MCP服务器
npm run rollback:api      # 回滚API服务器
npm run rollback:ws       # 回滚WebSocket服务器
npm run cleanup:services  # 清理所有服务
```

### 6. 监控与报告

#### 6.1 部署报告模板
集成层部署完成后自动生成报告：

```markdown
# 集成层部署报告

## 部署信息
- **部署时间**: $(date)
- **部署版本**: $(git describe --tags)
- **部署环境**: 集成测试环境
- **部署者**: AI Agent (自主部署)

## 组件状态
| 组件 | 状态 | 版本 | 健康检查 |
|------|------|------|----------|
| MCP服务器 | ✅ 运行中 | v1.0.0 | 通过 |
| CLI工具 | ✅ 运行中 | v1.0.0 | 通过 |
| TypeScript SDK | ✅ 发布完成 | v1.0.0 | 通过 |
| REST/GraphQL API | ✅ 运行中 | v1.0.0 | 通过 |
| WebSocket API | ✅ 运行中 | v1.0.0 | 通过 |

## 测试结果
- **MCP服务器测试覆盖率**: 88%
- **CLI工具测试覆盖率**: 85%
- **SDK测试覆盖率**: 92%
- **API测试覆盖率**: 87%
- **集成测试通过率**: 100%

## 文档更新
- [x] MCP服务器API文档
- [x] CLI工具参考手册
- [x] SDK使用指南
- [x] API文档
- [x] 集成示例

## 下一步建议
1. 运行负载测试验证集成层性能
2. 配置集成层监控和告警
3. 更新生产环境部署配置
4. 创建集成层故障排查手册
```

#### 6.2 性能基准测试
部署后必须运行性能基准：

```bash
# 运行集成层性能基准测试
npm run benchmark:mcp      # MCP服务器性能
npm run benchmark:api      # API性能
npm run benchmark:ws       # WebSocket性能
npm run benchmark:integration # 整体集成性能

# 生成性能报告
node scripts/generate-integration-performance-report.js
```
### 7. 预设文档使用指南

#### 7.1 智能体启动流程

1. **环境准备**：运行 `scripts/setup-integration.sh` 设置集成层开发环境
2. **代码审查**：阅读 `integration_layer.md` 理解集成层架构和组件
3. **任务分解**：根据本文件的开发阶段分解具体任务
4. **开发实施**：按照标准工作流进行组件开发
5. **测试验证**：运行集成层测试套件
6. **文档生成**：更新相关文档并生成新文档
7. **部署验证**：执行自动化部署和健康检查

#### 7.2 预设文档维护

本预设文档应随集成层演进定期更新：

```bash
# 更新集成层预设文档
npm run update-preset:integration

# 验证预设文档有效性
npm run validate-preset:integration
```

#### 7.3 紧急联系人/回退机制

如遇到预设文档无法解决的问题：

1. 检查 `docs/integration/troubleshooting.md` 获取常见问题解决方案
2. 查看 `CHANGELOG.md` 了解最近变更
3. 如有必要，回滚到最后稳定版本：
   ```bash
   git checkout tags/integration-v1.0.0-stable
   npm run deploy:rollback:integration
   ```

### 8. 附录

#### A. 预设文件清单

```bash
integration_layer.md                    # 本文件
scripts/setup-integration.sh            # 集成层环境设置脚本
scripts/deploy-integration.sh          # 集成层部署脚本
scripts/health-check-integration.sh    # 集成层健康检查脚本
scripts/generate-integration-docs.sh   # 集成层文档生成脚本
.env.integration.example               # 集成层环境变量模板
```

#### B. 参考文档

- [MCP协议规范](https://spec.modelcontextprotocol.io/)
- [MonSkill官方文档](https://skills.devnads.com/)
- [OpenAPI规范](https://spec.openapis.org/oas/v3.1.0)
- [GraphQL规范](https://spec.graphql.org/)
- [WebSocket协议](https://tools.ietf.org/html/rfc6455)

#### C. 版本信息

- **文档版本**: 1.0.0
- **最后更新**: 2024-01-01
- **适用项目**: Agentic Payment System 集成层
- **目标智能体**: Claude Code, OpenClaw, Codex, Manus等

---

*本开发实施指南遵循 Agentic Payment System 开发预设定标准，确保AI智能体能够完全自主地部署、开发、测试并生成符合项目标准的集成层组件。*