#!/bin/bash
set -e

echo "🏗️ 开始集成层部署流程"

# 阶段1: 构建所有组件
echo "1️⃣ 构建所有集成组件..."
npm run build:integration

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
npm run health-check:integration

echo "🎊 集成层部署成功完成！"
echo "📊 集成组件状态:"
echo "  - MCP服务器: http://localhost:3000 (PID: $MCP_PID)"
echo "  - REST/GraphQL API: http://localhost:3001 (PID: $API_PID)"
echo "  - WebSocket服务器: ws://localhost:3002 (PID: $WS_PID)"