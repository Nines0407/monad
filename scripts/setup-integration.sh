#!/bin/bash

echo "🚀 开始设置集成层开发环境"

# 1. 安装Node.js依赖
echo "📦 安装Node.js依赖..."
npm install

# 2. 安装集成层特定依赖
echo "📦 安装集成层依赖..."
cd integration/mcp-server && npm install
cd ../cli && npm install  
cd ../sdk && npm install
cd ../api && npm install
cd ../websocket && npm install
cd ../shared && npm install
cd ../..

# 3. 构建共享包
echo "🔨 构建共享包..."
cd integration/shared && npm run build
cd ../..

# 4. 验证环境
echo "✅ 验证环境配置..."
node scripts/verify-environment.js

echo "🎉 集成层环境设置完成！运行 'npm test:integration' 验证配置"