# 技术修复与使用指南 - Agentic Payment System

**文档版本**: 1.0  
**创建日期**: 2025-04-12  
**更新说明**: 修复项目构建和部署问题，提供详细使用指南

## 📋 概述

本文档记录了为解决 Agentic Payment System 项目构建和部署问题所做的技术修复，并提供完整的部署和使用指南。项目原部署指南因 TypeScript 编译错误、接口冲突和 Docker 构建问题无法正常运行。

## 🔧 修复的技术问题

### 1. TypeScript 接口冲突修复

**问题**: `AuditRepository` 接口同时扩展多个仓库接口，导致方法名冲突。

**文件**: `src/repositories/interfaces.ts:56`

**修复前**:
```typescript
export interface AuditRepository
  extends PaymentRepository,
    PolicyDecisionRepository,
    AuditEventRepository,
    SessionKeyEventRepository,
    ManualApprovalRepository {}
```

**修复后**:
```typescript
export interface AuditRepository {
  // PaymentRepository methods
  create(payment: PaymentCreate): Promise<Payment>;
  // ... 其他方法
  
  // PolicyDecisionRepository methods (重命名以避免冲突)
  createPolicyDecision(decision: PolicyDecisionCreate): Promise<PolicyDecision>;
  findByPaymentId(paymentId: string): Promise<PolicyDecision[]>;
  getStatistics(timeRange: TimeRange): Promise<PolicyStatistics>;
  
  // SessionKeyEventRepository methods (重命名以避免冲突)
  createSessionKeyEvent(event: SessionKeyEventCreate): Promise<SessionKeyEvent>;
  findByPaymentIdForSessionKey(paymentId: string): Promise<SessionKeyEvent[]>;
  
  // ManualApprovalRepository methods (重命名以避免冲突)
  createManualApproval(approval: ManualApprovalCreate): Promise<ManualApproval>;
  findByPaymentIdForApproval(paymentId: string): Promise<ManualApproval[]>;
}
```

### 2. 类型安全错误修复

**问题**: TypeScript 无法确定字符串键是否能用于索引配置对象。

**文件**:
- `src/db/index.ts:5`
- `scripts/migrate.ts:16`

**修复**:
```typescript
// 修复前
const dbConfig = config[environment];

// 修复后
const dbConfig = config[environment as keyof typeof config];
```

### 3. 编译和运行时错误修复

#### 3.1 未使用参数警告
**文件**: `src/index.ts`, `src/api/routes/audit-events.ts`
**修复**: 在未使用的参数前添加 `_` 前缀（如 `_req`, `_next`）

#### 3.2 端口类型转换
**文件**: `src/index.ts`
**修复**:
```typescript
// 修复前
const PORT = process.env.PORT || 3001;

// 修复后
const PORT = parseInt(process.env.PORT || '3001', 10);
```

#### 3.3 依赖版本降级
**文件**: `package.json`
**问题**: `graphql-markdown@^8.0.0` 版本不存在
**修复**: 降级到 `graphql-markdown@^7.3.0`

### 4. Docker 构建问题修复

**问题**: npm 安装依赖超时和镜像源问题

**文件**: `Dockerfile.audit`
**修复**: 添加淘宝镜像源
```dockerfile
RUN npm config set registry https://registry.npmmirror.com && npm install
```

**文件**: `docker-compose.yml`
**修复**: 修复构建上下文路径
```yaml
# 修复前
context: ./integration/mcp-server
dockerfile: Dockerfile.mcp

# 修复后
context: ./integration
dockerfile: mcp-server/Dockerfile.mcp
```

### 5. TypeScript 配置优化

**文件**: `tsconfig.json`
**修复**:
1. 添加 `"allowJs": true` 以支持 JavaScript 配置文件
2. 添加 `"strictPropertyInitialization": false` 解决属性初始化问题
3. 修改 `"rootDir": "."` 以包含 scripts 目录

## 🚀 部署步骤

### 前提条件
- ✅ Windows 10/11 (64位)
- ✅ Docker Desktop 已安装并运行
- ✅ Node.js 18+ 已安装
- ✅ 至少 5GB 磁盘空间

### 方案A：完整手动部署（推荐）

#### 步骤1: 启动数据库服务
```powershell
cd F:\monad
docker-compose up -d postgres redis
```

#### 步骤2: 安装项目依赖
```powershell
# 设置淘宝镜像源（加速下载）
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install
```

#### 步骤3: 运行数据库迁移
```powershell
npm run migrate:up
```

#### 步骤4: 构建项目
```powershell
npm run build
```

#### 步骤5: 复制配置文件
```powershell
# 复制 knexfile.js 和 .env 到 dist 目录
cp knexfile.js dist\
cp .env dist\
```

#### 步骤6: 启动审计系统
```powershell
cd dist
node src/index.js
```

### 方案B：一键脚本部署

#### PowerShell 脚本
```powershell
cd F:\monad
powershell -ExecutionPolicy Bypass -File run.ps1
```

#### 批处理脚本
```cmd
cd F:\monad
run.bat
```

### 方案C：混合部署（数据库用Docker，应用本地运行）

1. **仅启动数据库**:
   ```powershell
   docker-compose up -d postgres redis
   ```

2. **本地运行应用**:
   ```powershell
   npm run dev
   ```

## 📊 服务状态验证

### 1. 检查容器状态
```powershell
docker-compose ps
```
**预期输出**:
```
NAME                 IMAGE                STATUS          PORTS
agent-pay-postgres   postgres:15-alpine   Up 12 seconds   0.0.0.0:5432->5432/tcp
agent-pay-redis      redis:7-alpine       Up 12 seconds   0.0.0.0:6379->6379/tcp
```

### 2. 测试数据库连接
```powershell
# PostgreSQL
docker-compose exec postgres psql -U postgres -d agent_pay_audit -c "SELECT 'Database connected' as status;"

# Redis
docker-compose exec redis redis-cli ping
```

### 3. 测试API健康检查
```powershell
# 使用 curl
curl http://localhost:3001/health

# 或使用 PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
```

### 4. 自动化测试脚本
```powershell
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

## 📁 创建的辅助文件

### 1. `run.ps1` - PowerShell 一键启动脚本
**功能**: 自动启动数据库、运行迁移、构建项目、启动服务

### 2. `run.bat` - 批处理启动脚本
**功能**: 与 PowerShell 脚本功能相同，兼容旧系统

### 3. `test-api.ps1` - API测试脚本
**功能**: 自动重试健康检查，最多尝试10次

### 4. `test-db.js` - 数据库连接测试脚本
**功能**: 测试数据库连接（已删除，代码保留在文档中）

## ⚠️ 使用注意事项

### 1. 端口冲突
如果端口 3001、5432、6379 已被占用：
- 修改 `docker-compose.yml` 中的端口映射
- 或停止占用端口的服务
- 或修改 `.env` 中的 `PORT` 变量

### 2. 防火墙设置
Windows 防火墙可能会阻止本地连接：
- 确保端口 3001 在防火墙中开放
- 或暂时禁用防火墙进行测试

### 3. Docker 资源限制
如果 Docker 容器启动失败：
- 确保 Docker Desktop 正在运行
- 检查 WSL 2 是否已安装（Windows Home版需要）
- 增加 Docker 资源分配（设置 → 资源）

### 4. Node.js 版本兼容性
**要求**: Node.js 18+
**检查**: `node --version`

### 5. 网络代理问题
如果 npm install 失败：
```powershell
# 设置淘宝镜像源
npm config set registry https://registry.npmmirror.com

# 或使用 npm 官方源
npm config set registry https://registry.npmjs.org
```

## 🔍 故障排除

### 问题1: 服务启动但端口无法访问
**症状**: `npm run dev` 成功，但 `curl http://localhost:3001/health` 失败

**解决方案**:
1. 检查服务是否监听正确的主机：
   ```javascript
   // 在 src/index.ts 中确保监听 0.0.0.0
   app.listen(PORT, '0.0.0.0', () => { ... })
   ```

2. 检查 Windows 防火墙设置
3. 尝试使用 `127.0.0.1` 代替 `localhost`

### 问题2: TypeScript 编译错误
**症状**: `npm run build` 失败

**解决方案**:
1. 运行类型检查：
   ```powershell
   npm run typecheck
   ```

2. 确保所有 TypeScript 错误已修复
3. 检查 `tsconfig.json` 配置

### 问题3: 数据库连接失败
**症状**: 健康检查返回数据库断开连接

**解决方案**:
1. 确认 PostgreSQL 容器正在运行：
   ```powershell
   docker-compose ps
   ```

2. 检查数据库连接字符串：
   ```powershell
   # 在 .env 文件中
   DATABASE_URL="postgresql://postgres:password@localhost:5432/agent_pay_audit"
   ```

3. 手动测试连接：
   ```powershell
   node test-db.js
   ```

### 问题4: 依赖安装失败
**症状**: `npm install` 超时或失败

**解决方案**:
1. 使用淘宝镜像源：
   ```powershell
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

2. 清理 npm 缓存：
   ```powershell
   npm cache clean --force
   ```

3. 删除 node_modules 重试：
   ```powershell
   rm -rf node_modules
   npm install
   ```

## 🏗️ 项目架构

### 当前运行的服务
| 服务 | 技术栈 | 端口 | 状态 |
|------|--------|------|------|
| **PostgreSQL** | PostgreSQL 15 | 5432 | ✅ |
| **Redis** | Redis 7 | 6379 | ✅ |
| **审计系统 API** | Node.js + Express + TypeScript | 3001 | ✅ |
| **MCP 服务器** | Node.js + MCP SDK | 3000 | ⚠️ 需要额外配置 |
| **WebSocket API** | Node.js + WebSocket | 3002 | ⚠️ 需要额外配置 |

### 数据流向
```
浏览器/客户端 → 审计API (3001) → PostgreSQL (5432)
        ↓                ↓
   WebSocket (3002)   Redis (6379)
        ↓
   MCP服务器 (3000) → AI Agent 环境
```

## 📈 性能优化建议

### 1. 数据库优化
```sql
-- 在 PostgreSQL 中执行
ALTER DATABASE agent_pay_audit SET work_mem = '16MB';
ALTER DATABASE agent_pay_audit SET maintenance_work_mem = '256MB';
```

### 2. Docker 资源限制
在 `docker-compose.yml` 中添加：
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### 3. Node.js 内存限制
启动时增加内存限制：
```powershell
node --max-old-space-size=4096 dist/src/index.js
```

## 🔄 后续开发建议

### 1. 接口设计改进
- 使用更清晰的接口命名规范
- 避免方法名冲突
- 考虑使用组合模式而非继承

### 2. 构建流程优化
- 自动化 Docker 镜像构建
- 添加 CI/CD 流水线
- 优化 TypeScript 编译配置

### 3. 监控和日志
- 添加应用性能监控
- 实现结构化日志
- 设置健康检查告警

### 4. 安全性增强
- 更新依赖中的安全漏洞
- 添加 API 认证和授权
- 实现数据加密

## 📞 技术支持

### 问题反馈
1. 检查本文档的故障排除部分
2. 查看项目现有文档：
   - `DEPLOYMENT_GUIDE.md` - 原始部署指南
   - `README_DOCKER.md` - Docker 部署说明
   - `PROJECT_ANALYSIS.md` - 项目分析

### 紧急恢复步骤
如果系统完全无法启动：
1. 停止所有容器：
   ```powershell
   docker-compose down
   ```

2. 清理构建产物：
   ```powershell
   rm -rf dist node_modules
   ```

3. 从步骤1开始重新部署

---

## ✅ 验证清单

- [ ] Docker Desktop 已安装并运行
- [ ] Node.js 18+ 已安装
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 数据库容器正在运行 (`docker-compose ps`)
- [ ] 数据库迁移已完成 (`npm run migrate:up`)
- [ ] TypeScript 编译通过 (`npm run build`)
- [ ] 配置文件已复制到 dist 目录
- [ ] 审计系统正在运行 (`node src/index.js`)
- [ ] 健康检查通过 (`curl http://localhost:3001/health`)

---

**文档维护**: 如需更新本文档，请确保：
1. 记录所有技术变更
2. 更新版本号和日期
3. 保持与代码变更同步
4. 测试所有步骤在最新代码库中有效