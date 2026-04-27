# Docker 容器部署指南 - Agentic Payment System

## 系统要求

### 硬件要求
- **磁盘空间**: 至少 5GB 可用空间
- **内存**: 8GB RAM 以上
- **处理器**: 现代双核处理器

### 软件要求
1. **Windows 10/11 Pro, Enterprise, or Education** (64位)
   - Home版本需要安装WSL2后端
2. **Docker Desktop for Windows**
3. **Git** (可选，用于版本控制)
4. **Node.js 18+** (用于密钥生成和脚本执行)

## 第一步：安装 Docker Desktop

### 1.1 下载 Docker Desktop
访问 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) 下载安装程序。

### 1.2 安装步骤
1. 双击下载的 `Docker Desktop Installer.exe`
2. 安装过程中选择以下选项：
   - ✅ 使用 WSL 2 而不是 Hyper-V（推荐）
   - ✅ 将 Docker Desktop 添加到系统 PATH
   - ✅ 安装所需的 Windows 组件

3. 安装完成后重启计算机

### 1.3 验证安装
打开 PowerShell 或命令提示符，运行：
```powershell
docker --version
docker-compose --version
```

应该显示版本信息，例如：
```
Docker version 24.0.0, build xxx
Docker Compose version v2.20.0
```

## 第二步：配置项目环境

### 2.1 确保项目文件完整
项目应包含以下关键文件：
```
F:\monad\
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile.audit            # 审计系统 Dockerfile
├── .env                        # 环境变量配置
├── data\                       # 数据库存储目录
├── integration\                # 集成层服务
└── src\                        # 源代码
```

### 2.2 环境变量配置
已自动生成以下安全密钥：
- **ENCRYPTION_KEY**: 用于数据加密 (AES-256-GCM)
- **JWT_SECRET**: 用于 API 身份验证

如需重新生成，运行：
```powershell
cd F:\monad
node -e "console.log('ENCRYPTION_KEY=\"' + require('crypto').randomBytes(32).toString('hex') + '\"')"
node -e "console.log('JWT_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"')"
```

## 第三步：启动 Docker 容器

### 3.1 启动所有服务
```powershell
# 切换到项目目录
cd F:\monad

# 启动 Docker Compose 服务
docker-compose up -d
```

### 3.2 监控启动状态
```powershell
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs audit-backend
docker-compose logs postgres
docker-compose logs redis
```

### 3.3 等待服务就绪
所有服务健康检查通过需要 1-2 分钟：
- ✅ PostgreSQL: 数据库初始化完成
- ✅ Redis: 缓存服务就绪
- ✅ Audit Backend: API 服务启动
- ✅ MCP Server: AI Agent 接口就绪
- ✅ WebSocket: 实时通信服务就绪

## 第四步：验证部署

### 4.1 健康检查
```powershell
# 运行健康检查脚本
docker-compose exec audit-backend node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# 或使用 curl (如果已安装)
curl http://localhost:3001/health
```

### 4.2 服务端点验证

| 服务 | 端点 | 端口 | 验证命令 |
|------|------|------|----------|
| **审计系统 API** | `http://localhost:3001` | 3001 | `curl http://localhost:3001/health` |
| **MCP 服务器** | `http://localhost:3000` | 3000 | `curl http://localhost:3000/health` |
| **WebSocket** | `ws://localhost:3002` | 3002 | 浏览器开发者工具连接测试 |
| **PostgreSQL** | `localhost:5432` | 5432 | `pg_isready -h localhost` |
| **Redis** | `localhost:6379` | 6379 | `redis-cli ping` |

### 4.3 数据库初始化
```powershell
# 运行数据库迁移
docker-compose exec audit-backend npx knex migrate:latest

# 可选：加载种子数据
docker-compose exec audit-backend npx knex seed:run
```

## 第五步：使用系统

### 5.1 REST API 示例
```bash
# 获取所有支付记录
curl http://localhost:3001/api/v1/payments

# 创建测试支付记录
curl -X POST http://localhost:3001/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.50",
    "currency": "USDC",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e90F1b6c1a7",
    "reason": "API usage fee"
  }'
```

### 5.2 GraphQL API 示例
访问 `http://localhost:3001/graphql` 使用 GraphQL Playground。

### 5.3 MCP 服务器连接
配置 AI Agent (如 Claude Code) 连接 MCP 服务器：
```
MCP Server URL: http://localhost:3000
```

## 管理命令

### 停止服务
```powershell
# 停止所有容器（保留数据）
docker-compose stop

# 停止并移除容器（数据保留在 volumes 中）
docker-compose down
```

### 重启服务
```powershell
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart audit-backend
```

### 查看服务状态
```powershell
# 查看资源使用情况
docker-compose stats

# 查看容器日志
docker-compose logs [service-name]

# 进入容器 shell
docker-compose exec postgres psql -U postgres
docker-compose exec audit-backend sh
```

### 数据备份
```powershell
# 备份 PostgreSQL 数据
docker-compose exec postgres pg_dump -U postgres agent_pay_audit > backup_$(date +%Y%m%d).sql

# 备份 Redis 数据
docker-compose exec redis redis-cli SAVE
cp F:\monad\data\redis\dump.rdb backup_$(date +%Y%m%d).rdb
```

## 故障排除

### 常见问题

#### 1. Docker 启动失败
```
错误：WSL 2 installation is incomplete
```
**解决方案**：
1. 安装 WSL 2：`wsl --install`
2. 设置默认版本：`wsl --set-default-version 2`
3. 重启 Docker Desktop

#### 2. 端口冲突
```
错误：端口已被占用
```
**解决方案**：
1. 修改 `docker-compose.yml` 中的端口映射
2. 或停止占用端口的服务

#### 3. 数据库连接失败
```
错误：无法连接到 PostgreSQL
```
**解决方案**：
```powershell
# 检查 PostgreSQL 日志
docker-compose logs postgres

# 重启数据库服务
docker-compose restart postgres
```

#### 4. 容器启动超时
```
错误：健康检查失败
```
**解决方案**：
```powershell
# 增加启动等待时间
docker-compose up -d --wait

# 查看详细错误信息
docker-compose logs --tail=100 [service-name]
```

### 调试命令
```powershell
# 查看所有 Docker 容器
docker ps -a

# 查看 Docker 网络
docker network ls

# 查看 Docker 卷
docker volume ls

# 清理未使用的资源
docker system prune -a
```

## 生产环境建议

### 安全配置
1. **修改默认密码**：更新 `.env` 中的数据库密码
2. **启用 HTTPS**：配置反向代理（Nginx/Apache）
3. **防火墙规则**：限制访问 IP 范围
4. **定期更新**：更新 Docker 镜像和安全补丁

### 监控与日志
1. **启用日志轮转**：配置日志文件大小限制
2. **设置监控告警**：监控服务健康状态
3. **备份策略**：定期备份数据库和 Redis 数据

### 性能优化
1. **资源限制**：为容器设置内存和 CPU 限制
2. **数据库优化**：调整 PostgreSQL 配置参数
3. **缓存策略**：优化 Redis 缓存配置

## 附录

### Docker Compose 服务说明

| 服务 | 镜像 | 端口 | 数据卷 | 功能 |
|------|------|------|--------|------|
| **postgres** | postgres:15-alpine | 5432 | postgres_data | PostgreSQL 数据库 |
| **redis** | redis:7-alpine | 6379 | redis_data | Redis 缓存 |
| **audit-backend** | 自定义构建 | 3001 | ./logs, ./src | 审计系统 API |
| **mcp-server** | 自定义构建 | 3000 | - | MCP 协议服务器 |
| **websocket** | 自定义构建 | 3002 | - | WebSocket 实时 API |

### 数据持久化
所有数据存储在 `F:\monad\data\` 目录：
- `data/postgres/`：PostgreSQL 数据库文件
- `data/redis/`：Redis 持久化数据
- `logs/`：应用程序日志文件

### 环境变量参考
完整环境变量说明见 `.env.example` 文件。

---

## 快速启动脚本

创建 `start.ps1` 文件：

```powershell
# start.ps1
Write-Host "启动 Agentic Payment System..." -ForegroundColor Green

# 检查 Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Docker 未安装" -ForegroundColor Red
    exit 1
}

# 切换到项目目录
Set-Location F:\monad

# 启动服务
docker-compose up -d

Write-Host "服务启动中，请稍候..." -ForegroundColor Yellow
Write-Host "运行 'docker-compose logs -f' 查看日志" -ForegroundColor Cyan
Write-Host "运行 'docker-compose ps' 查看状态" -ForegroundColor Cyan
```

运行脚本：
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

---

*部署指南版本: 1.0*
*更新日期: 2026-04-12*
*适用于: Agentic Payment System v0.1.0*

---

**重要提示**: 如遇到构建或部署问题，请参考 `TECHNICAL_REPAIR_AND_USAGE.md` 文档，其中包含针对常见问题的技术修复方案。