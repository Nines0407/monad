#!/bin/bash
# Audit System Environment Setup Script
# Based on agent_development_preset.md standards

echo "🚀 Setting up Audit System development environment"

# 1. Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install
npm install -g typescript ts-node jest

# 2. Install smart contract tools (Foundry)
echo "📜 Installing smart contract tools..."
if ! command -v forge &> /dev/null; then
    echo "Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source "$HOME/.foundry/env"
    foundryup
else
    echo "Foundry already installed"
fi

# 3. Verify environment tools
echo "🔧 Verifying environment tools..."
node --version || { echo "❌ Node.js not installed"; exit 1; }
npm --version || { echo "❌ npm not installed"; exit 1; }
git --version || { echo "❌ git not installed"; exit 1; }
forge --version || { echo "❌ forge not installed"; exit 1; }
solc --version || { echo "❌ solc not installed"; exit 1; }

# 4. Set up environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update .env with your actual configuration"
else
    echo "✅ .env file already exists"
fi

# 5. Create necessary directories
echo "📁 Creating project directories..."
mkdir -p logs uploads exports
mkdir -p contracts/src contracts/test contracts/script

# 6. Verify setup
echo "✅ Environment setup completed!"
echo "📋 Next steps:"
echo "   1. Update .env with your database credentials"
echo "   2. Run database migrations: npm run migrate:up"
echo "   3. Start development server: npm run dev"
echo "   4. Run tests: npm test"
echo "   5. For contracts: cd contracts && forge build"