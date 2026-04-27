# Agentic Payment System - 智能体开发预设定

*用于指导AI智能体自主部署、开发、测试并生成文档的统一标准*

---

## 🎯 核心目标

本预设文档为AI智能体提供完整的开发指导，确保：
1. **自主部署**：智能体可独立完成项目部署到生产环境
2. **标准化开发**：遵循项目架构和代码规范
3. **自生成文档**：开发完成后自动生成符合标准的文档
4. **质量保证**：通过自动化测试和验证流程

---

## 📦 1. 环境与依赖配置

### 1.1 必需工具清单（部署前验证）

```bash
# 基础开发工具
node --version      # 必须 >= 18.0.0
npm --version       # 必须 >= 9.0.0
docker --version    # 必须安装并运行
git --version       # 必须安装

# Monad开发工具
# 安装MonSkill (https://skills.devnads.com/)
npx @monad/skill-install monad-skill

# 智能合约开发
forge --version     # Foundry工具链
solc --version      # Solidity编译器 >= 0.8.20

# 数据库
psql --version      # PostgreSQL >= 14.0
redis-cli --version # Redis >= 7.0

# 容器化
docker-compose --version
```

### 1.2 环境安装脚本 (`scripts/setup.sh`)

```bash
#!/bin/bash
# 自动化环境设置脚本

echo "🚀 开始设置Agentic Payment System开发环境"

# 1. 安装Node.js依赖
echo "📦 安装Node.js依赖..."
npm install
npm install -g typescript ts-node jest

# 2. 安装智能合约依赖
echo "📜 安装智能合约工具..."
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 3. 初始化Monad测试网络配置
echo "🔗 配置Monad测试网络..."
npx @monad/skill-init --network monad-testnet --key-manager local

# 4. 启动本地数据库服务
echo "🗄️ 启动数据库服务..."
docker-compose up -d postgres redis

# 5. 验证环境
echo "✅ 验证环境配置..."
node scripts/verify-environment.js

echo "🎉 环境设置完成！运行 'npm test' 验证配置"
```

### 1.3 环境变量配置 (`.env.example`)

```env
# Monad网络配置
MONAD_RPC_URL=https://testnet.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_EXPLORER=https://explorer.monad.xyz

# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/agent_pay
REDIS_URL=redis://localhost:6379

# 安全配置
ENCRYPTION_KEY= # 生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_KEY_EXPIRY=3600 # 会话密钥过期时间(秒)

# MCP服务器配置
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# 策略引擎默认配置
DEFAULT_DAILY_LIMIT=1000 # 默认每日限额(USDC)
REQUIRE_APPROVAL_THRESHOLD=100 # 需要审批的阈值(USDC)
```

---

## 🚀 2. 自动化部署流程

### 2.1 完整部署脚本 (`scripts/deploy-all.sh`)

```bash
#!/bin/bash
# 智能体自主部署主脚本

set -e # 遇到错误立即退出

echo "🏗️ 开始Agentic Payment System部署流程"

# 阶段1: 智能合约部署
echo "1️⃣ 部署智能合约到Monad测试网络..."
cd contracts
forge build
forge create --rpc-url $MONAD_RPC_URL \
  --private-key $DEPLOYER_KEY \
  src/AgentWallet.sol:AgentWallet
CONTRACT_ADDRESS=$(forge create-output | grep "Deployed to:" | awk '{print $3}')
echo "✅ 合约部署完成: $CONTRACT_ADDRESS"

# 阶段2: 客户端构建
echo "2️⃣ 构建客户端应用程序..."
cd ../client
npm run build
npm run typecheck

# 阶段3: MCP服务器启动
echo "3️⃣ 启动MCP服务器..."
cd ../mcp-server
npm start &
MCP_PID=$!
sleep 5 # 等待服务器启动

# 阶段4: 数据库初始化
echo "4️⃣ 初始化数据库..."
cd ../backend
npx prisma migrate deploy
npx prisma db seed

# 阶段5: 健康检查
echo "5️⃣ 运行部署后健康检查..."
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost:5432/health || exit 1

echo "🎊 部署成功完成！"
echo "📊 系统组件状态:"
echo "  - 智能合约: $CONTRACT_ADDRESS"
echo "  - MCP服务器: http://localhost:3000"
echo "  - 数据库: PostgreSQL运行中"
echo "  - Redis缓存: 运行中"
```

### 2.2 分阶段部署选项

```bash
# 仅部署智能合约
npm run deploy:contracts

# 仅部署后端服务
npm run deploy:backend

# 仅部署MCP服务器
npm run deploy:mcp

# 完整端到端部署
npm run deploy:all
```

### 2.3 部署验证清单

部署完成后必须验证：

```bash
# 1. 合约功能验证
npx hardhat test --network monad-testnet

# 2. API端点验证
curl http://localhost:3000/api/v1/health

# 3. 数据库连接验证
node scripts/verify-db.js

# 4. MCP协议验证
node scripts/verify-mcp.js

# 5. 端到端支付流程测试
npm run test:e2e
```

---

## 📝 3. 文档生成规范

### 3.1 文档结构模板

智能体完成每个开发阶段后，**必须**更新以下文档：

#### 3.1.1 技术架构文档 (`docs/architecture/`)
```
architecture/
├── smart-contracts.md      # 智能合约架构
├── client-architecture.md  # 客户端架构
├── data-flow.md           # 数据流设计
├── security-model.md      # 安全模型
└── deployment-architecture.md # 部署架构
```

#### 3.1.2 API文档 (`docs/api/`)
```
api/
├── mcp-server-api.md      # MCP服务器API
├── rest-api.md           # REST API文档
├── sdk-reference.md      # TypeScript SDK参考
└── integration-guide.md  # 集成指南
```

#### 3.1.3 运维文档 (`docs/operations/`)
```
operations/
├── deployment-guide.md    # 部署指南
├── monitoring.md         # 监控配置
├── troubleshooting.md    # 故障排查
└── backup-recovery.md    # 备份与恢复
```

### 3.2 自动化文档生成脚本

```bash
#!/bin/bash
# scripts/generate-docs.sh

echo "📄 生成系统文档..."

# 1. 生成API文档
npx typedoc --out docs/api src/

# 2. 生成合约ABI文档
forge doc --out docs/contracts

# 3. 生成架构图
npx mmdc -i docs/architecture/diagrams/*.mmd -o docs/architecture/images/

# 4. 验证文档完整性
node scripts/verify-docs.js

echo "✅ 文档生成完成！"
```

### 3.3 文档质量检查清单

每份生成的文档必须满足：

```yaml
文档标准:
  - 标题: 清晰描述内容
  - 结构: 使用标准Markdown标题层级
  - 代码示例: 包含可运行的代码片段
  - 接口定义: 包含完整的TypeScript/OpenAPI定义
  - 图表: 复杂的流程必须有图表说明
  - 测试验证: 所有示例代码必须通过测试
  - 版本信息: 包含文档版本和最后更新日期
```

---

## 🧪 4. 质量保证与测试

### 4.1 必须通过的测试套件

```bash
# 智能合约测试 (90%+覆盖率要求)
cd contracts
forge test --match-contract "Test.*" --coverage
forge snapshot

# 客户端单元测试
cd ../client
npm test --coverage
npm run test:integration

# MCP服务器测试
cd ../mcp-server
npm test -- --coverage

# 端到端测试
cd ../tests
npm run test:e2e

# 安全测试
npm run test:security
```

### 4.2 代码质量门禁

```json
{
  "质量门禁": {
    "测试覆盖率": {
      "智能合约": ">= 90%",
      "TypeScript代码": ">= 85%",
      "集成测试": ">= 80%"
    },
    "代码规范": {
      "ESLint通过率": "100%",
      "TypeScript严格模式": "启用",
      "无任何警告": "是"
    },
    "性能指标": {
      "合约gas消耗": "< 200k gas (标准交易)",
      "API响应时间": "< 100ms (P95)",
      "策略评估延迟": "< 50ms"
    }
  }
}
```

### 4.3 部署后健康检查

智能体部署后必须运行健康检查脚本：

```bash
#!/bin/bash
# scripts/health-check.sh

echo "🏥 运行系统健康检查..."

# 1. 合约健康状态
CONTRACT_HEALTH=$(curl -s $MONAD_RPC_URL -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["'$CONTRACT_ADDRESS'","latest"],"id":1}')

# 2. 数据库连接
DB_HEALTH=$(psql $DATABASE_URL -c "SELECT 1" 2>/dev/null | grep "1 row")

# 3. Redis连接
REDIS_HEALTH=$(redis-cli -u $REDIS_URL ping 2>/dev/null | grep PONG)

# 4. MCP服务器
MCP_HEALTH=$(curl -s http://localhost:3000/health | grep "status.*ok")

# 验证所有健康检查
if [[ -n "$CONTRACT_HEALTH" && -n "$DB_HEALTH" && -n "$REDIS_HEALTH" && -n "$MCP_HEALTH" ]]; then
  echo "✅ 所有系统组件健康"
  exit 0
else
  echo "❌ 健康检查失败"
  exit 1
fi
```

---

## 🔄 5. 智能体开发工作流

### 5.1 标准开发流程

```mermaid
graph TD
    A[接收开发任务] --> B[环境验证]
    B --> C[代码实现]
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

### 5.2 任务完成清单

智能体完成每个开发任务后必须确认：

- [ ] 代码通过所有测试（`npm test`）
- [ ] 代码覆盖率达标（`npm run coverage`）
- [ ] 代码符合规范（`npm run lint`）
- [ ] 类型检查通过（`npm run typecheck`）
- [ ] 文档已更新（相关文档章节）
- [ ] 部署脚本已验证（本地部署测试）
- [ ] 健康检查通过（`npm run health-check`）
- [ ] 版本控制提交（git commit with standard message）

### 5.3 错误处理与恢复

遇到部署失败时，智能体必须：

1. **收集日志**：保存所有相关错误日志
2. **回滚策略**：执行预定义的回滚脚本
3. **问题分析**：根据错误类型采取相应措施
4. **重新部署**：修复问题后重新执行部署

```bash
# 回滚脚本示例
npm run rollback:contracts  # 回滚合约
npm run rollback:database   # 回滚数据库迁移
npm run cleanup:containers  # 清理容器
```

---

## 📊 6. 监控与报告

### 6.1 部署报告模板

部署完成后自动生成报告：

```markdown
# 部署报告 - Agentic Payment System

## 部署信息
- **部署时间**: $(date)
- **部署版本**: $(git describe --tags)
- **部署环境**: monad-testnet
- **部署者**: AI Agent (自主部署)

## 组件状态
| 组件 | 状态 | 版本 | 健康检查 |
|------|------|------|----------|
| 智能合约 | ✅ 运行中 | v1.0.0 | 通过 |
| MCP服务器 | ✅ 运行中 | v1.0.0 | 通过 |
| 数据库 | ✅ 运行中 | PostgreSQL 14 | 通过 |
| Redis缓存 | ✅ 运行中 | Redis 7.2 | 通过 |

## 测试结果
- **合约测试覆盖率**: 92%
- **客户端测试覆盖率**: 88%
- **集成测试通过率**: 100%
- **端到端测试通过率**: 100%

## 文档更新
- [x] 架构文档更新
- [x] API文档生成
- [x] 部署指南完善
- [x] 故障排查手册

## 下一步建议
1. 运行负载测试验证系统性能
2. 配置监控和告警系统
3. 设置定期备份策略
4. 更新生产环境部署配置
```

### 6.2 性能基准测试

部署后必须运行性能基准：

```bash
# 运行性能基准测试
npm run benchmark:transactions  # 交易处理性能
npm run benchmark:policy        # 策略评估性能
npm run benchmark:concurrent    # 并发处理能力

# 生成性能报告
node scripts/generate-performance-report.js
```

---

## 🎯 7. 预设文档使用指南

### 7.1 智能体启动流程

1. **环境准备**：运行 `scripts/setup.sh` 设置开发环境
2. **代码审查**：阅读 `unified_documentation.md` 理解项目架构
3. **任务分解**：根据 `implementation_roadmap.md` 分解开发任务
4. **开发实施**：按照标准工作流进行开发
5. **测试验证**：运行完整的测试套件
6. **文档生成**：更新相关文档并生成新文档
7. **部署验证**：执行自动化部署和健康检查

### 7.2 预设文档维护

本预设文档应随项目演进定期更新：

```bash
# 更新预设文档
npm run update-preset

# 验证预设文档有效性
npm run validate-preset
```

### 7.3 紧急联系人/回退机制

如遇到预设文档无法解决的问题：

1. 检查 `docs/troubleshooting.md` 获取常见问题解决方案
2. 查看 `CHANGELOG.md` 了解最近变更
3. 如有必要，回滚到最后稳定版本：
   ```bash
   git checkout tags/v1.0.0-stable
   npm run deploy:rollback
   ```

---

## 📋 附录

### A. 预设文件清单

```bash
agent_development_preset.md          # 本文件
scripts/setup.sh                     # 环境设置脚本
scripts/deploy-all.sh               # 完整部署脚本
scripts/health-check.sh             # 健康检查脚本
scripts/generate-docs.sh            # 文档生成脚本
.env.example                        # 环境变量模板
```

### B. 参考文档

- [MonSkill官方文档](https://skills.devnads.com/)
- [Monad Payment Protocol](https://mpp.dev/)
- [ERC-4337标准](https://eips.ethereum.org/EIPS/eip-4337)
- [MCP协议规范](https://spec.modelcontextprotocol.io/)

### C. 版本信息

- **文档版本**: 1.0.0
- **最后更新**: 2024-01-01
- **适用项目**: Agentic Payment System
- **目标智能体**: Claude Code, OpenClaw, Codex, Manus等

---

*预设文档设计目标：使AI智能体能够完全自主地部署、开发、测试并生成符合项目标准的文档，确保项目的一致性和质量。*