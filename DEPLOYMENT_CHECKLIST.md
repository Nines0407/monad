# 部署检查清单 - Agentic Payment System

## ✅ 前置检查
- [ ] Windows 10/11 (64位) 操作系统
- [ ] Docker Desktop 已安装并运行 (`docker --version`)
- [ ] Node.js 18+ 已安装 (`node --version`)
- [ ] 至少 5GB 可用磁盘空间
- [ ] 项目目录: `F:\monad`

## 🚀 快速部署步骤

### 方案A: 一键脚本启动 (推荐)
```powershell
cd F:\monad
powershell -ExecutionPolicy Bypass -File run.ps1
```

### 方案B: 手动分步部署
1. **启动数据库**:
   ```powershell
   docker-compose up -d postgres redis
   ```

2. **安装依赖**:
   ```powershell
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

3. **运行数据库迁移**:
   ```powershell
   npm run migrate:up
   ```

4. **构建项目**:
   ```powershell
   npm run build
   ```

5. **复制配置文件**:
   ```powershell
   cp knexfile.js dist\
   cp .env dist\
   ```

6. **启动服务**:
   ```powershell
   cd dist
   node src/index.js
   ```

## 🔍 验证步骤

### 1. 容器状态检查
```powershell
docker-compose ps
```
**预期结果**:
- `agent-pay-postgres`: Up (healthy)
- `agent-pay-redis`: Up (healthy)

### 2. 数据库连接测试
```powershell
# PostgreSQL
docker-compose exec postgres psql -U postgres -d agent_pay_audit -c "SELECT 1;"

# Redis
docker-compose exec redis redis-cli ping
```

### 3. API 健康检查
```powershell
# 方法1: 使用 curl
curl http://localhost:3001/health

# 方法2: 使用 PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5

# 方法3: 自动化测试脚本
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

## ⚠️ 常见问题排查

### 问题1: 端口被占用
**症状**: `Error: port already in use`
**解决**:
1. 修改 `docker-compose.yml` 中的端口映射
2. 或停止占用端口的程序
3. 或修改 `.env` 中的 `PORT` 变量

### 问题2: Docker 容器无法启动
**解决**:
1. 确保 Docker Desktop 正在运行
2. 检查 WSL 2 是否已安装 (Windows Home版需要)
3. 重启 Docker Desktop

### 问题3: npm install 失败
**解决**:
```powershell
# 1. 清理缓存
npm cache clean --force

# 2. 删除 node_modules 重试
rm -rf node_modules
npm install

# 3. 使用淘宝镜像源
npm config set registry https://registry.npmmirror.com
```

### 问题4: TypeScript 编译错误
**解决**:
```powershell
# 1. 检查类型错误
npm run typecheck

# 2. 参考技术修复文档
# 查看: TECHNICAL_REPAIR_AND_USAGE.md
```

## 📁 重要文件说明

| 文件 | 用途 | 位置 |
|------|------|------|
| `docker-compose.yml` | Docker 服务配置 | 项目根目录 |
| `.env` | 环境变量配置 | 项目根目录 |
| `knexfile.js` | 数据库配置 | 项目根目录 |
| `run.ps1` | PowerShell 启动脚本 | 项目根目录 |
| `run.bat` | 批处理启动脚本 | 项目根目录 |
| `test-api.ps1` | API 测试脚本 | 项目根目录 |
| `TECHNICAL_REPAIR_AND_USAGE.md` | 技术修复文档 | 项目根目录 |

## 🔧 技术修复摘要 (重要)

### 已修复的问题:
1. **TypeScript 接口冲突** - `AuditRepository` 方法名冲突
2. **类型安全错误** - 配置对象索引问题
3. **编译错误** - 未使用参数、端口类型转换
4. **Docker 构建问题** - npm 安装超时、镜像源问题
5. **依赖版本问题** - `graphql-markdown@^8.0.0` 版本不存在

### 详细修复记录:
请查看 `TECHNICAL_REPAIR_AND_USAGE.md` 文档。

## 📞 支持资源

1. **技术文档**: `TECHNICAL_REPAIR_AND_USAGE.md`
2. **部署指南**: `DEPLOYMENT_GUIDE.md`
3. **Docker 说明**: `README_DOCKER.md`
4. **项目分析**: `PROJECT_ANALYSIS.md`

## 🔄 恢复步骤 (系统完全无法启动时)

1. **停止所有服务**:
   ```powershell
   docker-compose down
   ```

2. **清理构建产物**:
   ```powershell
   rm -rf dist node_modules
   ```

3. **从第一步重新开始部署**

---

**最后更新**: 2026-04-12  
**参考文档**: `TECHNICAL_REPAIR_AND_USAGE.md` (完整技术修复记录)