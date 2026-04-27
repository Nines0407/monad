#!/bin/bash
# Health check script for Agentic Payment System
# Based on agent_development_preset.md standards

set -e

echo "🏥 Running system health check..."

# 1. Check Node.js services
echo "1️⃣ Checking Node.js services..."
if [ -f package.json ]; then
    npm run typecheck 2>/dev/null || echo "⚠️  TypeScript type check failed"
    npm run lint 2>/dev/null || echo "⚠️  ESLint check failed"
else
    echo "✅ No Node.js project detected"
fi

# 2. Check smart contracts
echo "2️⃣ Checking smart contracts..."
if [ -d "contracts" ]; then
    cd contracts
    if command -v forge &> /dev/null; then
        forge build --force 2>/dev/null && echo "✅ Contracts compile successfully" || echo "❌ Contract compilation failed"
    else
        echo "⚠️  Forge not installed, skipping contract check"
    fi
    cd ..
else
    echo "✅ No contracts directory detected"
fi

# 3. Check environment variables
echo "3️⃣ Checking environment variables..."
if [ -f .env ]; then
    source .env 2>/dev/null || true
    if [ -z "$MONAD_RPC_URL" ]; then
        echo "⚠️  MONAD_RPC_URL not set"
    else
        echo "✅ MONAD_RPC_URL is set"
    fi
else
    echo "⚠️  .env file not found"
fi

# 4. Check essential directories
echo "4️⃣ Checking directory structure..."
directories=("src" "tests" "scripts" "docs")
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir directory exists"
    else
        echo "⚠️  $dir directory missing"
    fi
done

# 5. Overall health status
echo "📊 Health check completed!"
echo "✅ System is healthy if no critical errors above"
echo "⚠️  Address any warnings before deployment"