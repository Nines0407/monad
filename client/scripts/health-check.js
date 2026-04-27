const { AgenticPaymentClient } = require('../dist/index');

async function healthCheck() {
  console.log('🏥 Starting Agentic Payment Client health check...\n');

  const checks = [
    { name: 'Environment Variables', fn: checkEnvVars },
    { name: 'RPC Connection', fn: checkRpcConnection },
    { name: 'Wallet Initialization', fn: checkWalletInit },
    { name: 'Policy Evaluation', fn: checkPolicyEval },
    { name: 'Transaction Building', fn: checkTxBuilding },
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      console.log(`🔍 ${check.name}...`);
      await check.fn();
      console.log(`✅ ${check.name}: PASS\n`);
    } catch (error) {
      console.error(`❌ ${check.name}: FAIL - ${error.message}\n`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('🎉 All health checks passed! System is ready.');
    process.exit(0);
  } else {
    console.error('💥 Some health checks failed. Please review errors.');
    process.exit(1);
  }
}

async function checkEnvVars() {
  const required = ['MONAD_RPC_URL', 'MONAD_CHAIN_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function checkRpcConnection() {
  // Simple fetch to RPC endpoint
  const response = await fetch(process.env.MONAD_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC responded with status ${response.status}`);
  }

  const data = await response.json();
  const chainId = parseInt(data.result, 16);
  const expectedChainId = parseInt(process.env.MONAD_CHAIN_ID);

  if (chainId !== expectedChainId) {
    throw new Error(`Chain ID mismatch: expected ${expectedChainId}, got ${chainId}`);
  }
}

async function checkWalletInit() {
  const client = new AgenticPaymentClient(
    process.env.MONAD_RPC_URL,
    parseInt(process.env.MONAD_CHAIN_ID)
  );
  
  const wallet = await client.initializeWallet();
  
  if (!wallet.address || !wallet.publicKey) {
    throw new Error('Wallet initialization failed');
  }

  const address = await client.getWalletAddress();
  if (address !== wallet.address) {
    throw new Error('Wallet address mismatch');
  }
}

async function checkPolicyEval() {
  const client = new AgenticPaymentClient(
    process.env.MONAD_RPC_URL,
    parseInt(process.env.MONAD_CHAIN_ID)
  );

  const request = {
    amount: BigInt(100000000000000000), // 0.1 ETH
    recipient: '0x0000000000000000000000000000000000000000',
    agentId: 'health-check',
    taskId: 'health-check-1',
    reason: 'Health check',
  };

  const policies = [{
    id: 'health-check-policy',
    name: 'Health Check Policy',
    priority: 1,
    rules: [{
      type: 'amount-limit',
      maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
      maxDaily: BigInt(5000000000000000000), // 5 ETH
    }],
  }];

  const result = await client.processPaymentRequest(request, policies);
  
  if (!result.allowed) {
    throw new Error(`Payment should be allowed: ${result.error}`);
  }
}

async function checkTxBuilding() {
  const client = new AgenticPaymentClient(
    process.env.MONAD_RPC_URL,
    parseInt(process.env.MONAD_CHAIN_ID)
  );

  const request = {
    amount: BigInt(100000000000000000), // 0.1 ETH
    recipient: '0x0000000000000000000000000000000000000000',
    agentId: 'health-check',
    taskId: 'health-check-2',
    reason: 'Transaction building test',
  };

  const policies = [{
    id: 'test-policy',
    name: 'Test Policy',
    priority: 1,
    rules: [{
      type: 'amount-limit',
      maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
      maxDaily: BigInt(5000000000000000000), // 5 ETH
    }],
  }];

  const result = await client.processPaymentRequest(request, policies);
  
  if (!result.transaction) {
    throw new Error('Transaction not built');
  }

  const tx = result.transaction;
  if (!tx.to || !tx.value || !tx.gasLimit || !tx.chainId) {
    throw new Error('Transaction missing required fields');
  }
}

// Run health check if called directly
if (require.main === module) {
  require('dotenv').config();
  healthCheck().catch(error => {
    console.error('💥 Health check failed with unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { healthCheck };