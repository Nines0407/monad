#!/bin/bash
# 智能体自主部署主脚本
# Based on agent_development_preset.md standards

set -e # 遇到错误立即退出

echo "🏗️ 开始Agentic Payment System部署流程"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found, using defaults"
fi

# 阶段1: 智能合约部署
echo "1️⃣ 部署智能合约到Monad测试网络..."
cd contracts
forge build
# 检查是否有部署密钥
if [ -z "$DEPLOYER_KEY" ]; then
    echo "⚠️  DEPLOYER_KEY未设置，跳过合约部署"
    echo "   运行: forge create --rpc-url \$MONAD_RPC_URL --private-key \$DEPLOYER_KEY src/AgentWallet.sol:AgentWallet"
    CONTRACT_ADDRESS="未部署（需要DEPLOYER_KEY）"
else
    forge create --rpc-url $MONAD_RPC_URL \
      --private-key $DEPLOYER_KEY \
      src/AgentWallet.sol:AgentWallet
    CONTRACT_ADDRESS=$(forge create --rpc-url $MONAD_RPC_URL --private-key $DEPLOYER_KEY src/AgentWallet.sol:AgentWallet --json | jq -r '.deployedTo')
    echo "✅ 合约部署完成: $CONTRACT_ADDRESS"
fi
cd ..

# 阶段2: 客户端构建
echo "2️⃣ 构建客户端应用程序..."
cd client
npm run build
npm run typecheck
cd ..

# 阶段3: MCP服务器启动
echo "3️⃣ 启动MCP服务器..."
cd integration/mcp-server
npm start &
MCP_PID=$!
sleep 5 # 等待服务器启动
cd ../..

# 阶段4: 数据库初始化
echo "4️⃣ 初始化数据库..."
npm run migrate:up

# 阶段5: 构建并启动审计系统API
echo "5️⃣ 构建并启动审计系统API..."
npm run build
npm start &
API_PID=$!
sleep 5

# 阶段6: 健康检查
echo "6️⃣ 运行部署后健康检查..."
npm run health-check || exit 1

echo "🎊 部署成功完成！"
echo "📊 系统组件状态:"
echo "  - 智能合约: $CONTRACT_ADDRESS"
echo "  - MCP服务器: http://localhost:3000"
echo "  - 审计系统API: http://localhost:3001"
echo "  - 数据库: PostgreSQL运行中"
echo "  - Redis缓存: 运行中"