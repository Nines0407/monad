#!/bin/bash
echo "🏥 运行集成层健康检查..."

# 检查MCP服务器
echo "检查MCP服务器..."
MCP_HEALTH=$(curl -s -f http://localhost:3000/health 2>/dev/null || echo "FAIL")
if [[ "$MCP_HEALTH" == "FAIL" ]]; then
  echo "❌ MCP服务器健康检查失败"
  exit 1
fi

# 检查REST API
echo "检查REST API..."
API_HEALTH=$(curl -s -f http://localhost:3001/health 2>/dev/null || echo "FAIL")
if [[ "$API_HEALTH" == "FAIL" ]]; then
  echo "❌ REST API健康检查失败"
  exit 1
fi

# 检查WebSocket连接（简单TCP连接测试）
echo "检查WebSocket服务器..."
timeout 2 bash -c "cat < /dev/null > /dev/tcp/localhost/3002" 2>/dev/null
WS_HEALTH=$?
if [[ $WS_HEALTH -ne 0 ]]; then
  echo "❌ WebSocket服务器健康检查失败"
  exit 1
fi

echo "✅ 所有集成组件健康"
exit 0