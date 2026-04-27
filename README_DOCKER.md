# Docker 部署 - Agentic Payment System

## 快速开始

### 前提条件
1. **Windows 10/11** (64位，专业版/企业版/教育版)
2. **Docker Desktop** 已安装并运行
3. **至少 5GB 磁盘空间**

### 一键启动 (推荐)
```powershell
# 在 F:\monad 目录中运行
powershell -ExecutionPolicy Bypass -File start.ps1
```

### 手动步骤
```powershell
# 1. 切换到项目目录
cd F:\monad

# 2. 启动 Docker 服务
docker-compose up -d

# 3. 查看状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f
```

## 已创建的配置文件

### Docker 配置文件
1. **`docker-compose.yml`** - Docker Compose 服务配置
   - PostgreSQL 15 数据库
   - Redis 7 缓存
   - 审计系统后端 (Node.js)
   - MCP 服务器 (AI Agent 接口)
   - WebSocket 实时 API

2. **`Dockerfile.audit`** - 审计系统 Dockerfile
3. **`integration/mcp-server/Dockerfile.mcp`** - MCP 服务器 Dockerfile
4. **`integration/websocket/Dockerfile.ws`** - WebSocket API Dockerfile

### 环境配置
1. **`.env`** - 环境变量配置 (已生成安全密钥)
   - 加密密钥: `ENCRYPTION_KEY`
   - JWT 密钥: `JWT_SECRET`
   - 数据库连接: `DATABASE_URL`
   - Redis 连接: `REDIS_URL`

2. **数据目录**
   - `data/postgres/` - PostgreSQL 数据存储
   - `data/redis/` - Redis 数据存储
   - `logs/` - 应用程序日志

### 部署工具
1. **`start.ps1`** - PowerShell 启动脚本
2. **`DEPLOYMENT_GUIDE.md`** - 完整部署指南

## 服务架构

### 容器服务列表
| 服务 | 端口 | 描述 | 健康检查 |
|------|------|------|----------|
| **postgres** | 5432 | PostgreSQL 15 数据库 | `pg_isready` |
| **redis** | 6379 | Redis 7 缓存 | `redis-cli ping` |
| **audit-backend** | 3001 | 审计系统 REST/GraphQL API | HTTP `/health` |
| **mcp-server** | 3000 | MCP 协议服务器 (AI Agent) | HTTP `/health` |
| **websocket** | 3002 | WebSocket 实时通信 | WebSocket 连接测试 |

### 网络架构
```
浏览器/客户端 ↔ 审计API (3001) ↔ PostgreSQL (5432)
         ↕                   ↕
    WebSocket (3002)     Redis (6379)
         ↕
    MCP服务器 (3000) ↔ AI Agent 环境
```

## 验证部署

### 1. 检查所有服务状态
```powershell
docker-compose ps
```
所有服务应为 `running` 状态。

### 2. 健康检查
```powershell
# 审计系统健康检查
curl http://localhost:3001/health

# 数据库连接检查
docker-compose exec postgres pg_isready -U postgres

# Redis 连接检查
docker-compose exec redis redis-cli ping
```

### 3. API 测试
```powershell
# REST API 测试
curl http://localhost:3001/api/v1/payments

# GraphQL API 测试
# 访问 http://localhost:3001/graphql
```

## 管理命令

### 启动/停止
```powershell
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose stop

# 停止并移除容器
docker-compose down

# 重启服务
docker-compose restart
```

### 查看日志
```powershell
# 查看所有日志
docker-compose logs

# 跟踪实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs audit-backend
```

### 数据库管理
```powershell
# 运行数据库迁移
docker-compose exec audit-backend npx knex migrate:latest

# 执行 SQL 查询
docker-compose exec postgres psql -U postgres -d agent_pay_audit

# 备份数据库
docker-compose exec postgres pg_dump -U postgres agent_pay_audit > backup.sql
```

## 故障排除

### 常见问题

#### 1. Docker 未安装
```
错误: 'docker' 不是内部或外部命令
```
**解决方案**:
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 安装后重启计算机
3. 启动 Docker Desktop 应用程序

#### 2. 端口冲突
```
错误: 端口 5432/3001/3000 已被占用
```
**解决方案**:
1. 修改 `docker-compose.yml` 中的端口映射
2. 或停止占用端口的其他服务

#### 3. 容器启动失败
```
错误: 健康检查超时
```
**解决方案**:
```powershell
# 查看详细错误信息
docker-compose logs --tail=100 [服务名]

# 增加启动等待时间
docker-compose up -d --wait-timeout 300
```

#### 4. 数据库连接错误
```
错误: 无法连接到 PostgreSQL
```
**解决方案**:
```powershell
# 检查 PostgreSQL 日志
docker-compose logs postgres

# 重新创建数据库容器
docker-compose down postgres
docker-compose up -d postgres
```

## 数据持久化

### 数据存储位置
所有数据持久化存储在本地目录：

| 数据 | 存储位置 | 说明 |
|------|----------|------|
| **PostgreSQL 数据** | `F:\monad\data\postgres\` | 数据库文件 |
| **Redis 数据** | `F:\monad\data\redis\` | Redis 持久化文件 |
| **应用程序日志** | `F:\monad\logs\` | 审计系统日志 |

### 备份策略
```powershell
# 备份 PostgreSQL
docker-compose exec postgres pg_dump -U postgres agent_pay_audit > backup_$(Get-Date -Format "yyyyMMdd").sql

# 备份 Redis
docker-compose exec redis redis-cli SAVE
Copy-Item "F:\monad\data\redis\dump.rdb" "backup_$(Get-Date -Format "yyyyMMdd").rdb"
```

## 性能优化

### 资源限制
在 `docker-compose.yml` 中可添加资源限制：
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### 数据库优化
```sql
-- 在 PostgreSQL 中执行
ALTER DATABASE agent_pay_audit SET work_mem = '16MB';
ALTER DATABASE agent_pay_audit SET maintenance_work_mem = '256MB';
```

## 安全建议

### 1. 修改默认密码
```powershell
# 编辑 .env 文件，修改以下值：
DATABASE_URL="postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/agent_pay_audit"
```

### 2. 启用 HTTPS
配置反向代理 (Nginx/Traefik) 启用 HTTPS。

### 3. 防火墙配置
限制访问 IP 范围，仅允许可信网络访问端口 3001、3000、3002。

## 扩展部署

### 添加监控
```yaml
# 在 docker-compose.yml 中添加
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3003:3000"
```

### 添加负载均衡
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

## 联系支持

- **部署问题**: 查看 `DEPLOYMENT_GUIDE.md` 文档
- **技术修复**: 查看 `TECHNICAL_REPAIR_AND_USAGE.md` (包含问题修复和使用指南)
- **项目文档**: 查看 `PROJECT_ANALYSIS.md` 和 `README_AUDIT_SYSTEM.md`
- **开发规范**: 查看 `development_spec.md` 和 `agent_development_preset.md`

---

## 版本信息

- **Docker Compose 配置版本**: 1.0
- **项目版本**: Agentic Payment System v0.1.0
- **创建日期**: 2025-04-12
- **最后更新**: 2026-04-12

---

**下一步**: 安装 Docker Desktop 后运行 `powershell -ExecutionPolicy Bypass -File start.ps1`