# TypeScript SDK Reference

## Overview
The Agentic Payment Client SDK provides a comprehensive TypeScript interface for integrating the payment system into applications. This reference covers all public APIs, types, and usage examples.

## Installation

```bash
npm install @agentic/payment-client
```

## Quick Start

```typescript
import { AgenticPaymentClient } from '@agentic/payment-client';

// Initialize client
const client = new AgenticPaymentClient(
  'https://testnet.monad.xyz',
  10143
);

// Create wallet
const wallet = await client.initializeWallet();
console.log(`Wallet address: ${wallet.address}`);

// Process payment request
const result = await client.processPaymentRequest(request, policies);
```

## Core Classes

### AgenticPaymentClient

Main entry point for the payment system.

#### Constructor
```typescript
new AgenticPaymentClient(rpcUrl: string, chainId: number)
```

**Parameters**:
- `rpcUrl`: Monad RPC endpoint URL
- `chainId`: Monad network chain ID (10143 for testnet)

#### Methods

##### `initializeWallet()`
```typescript
async initializeWallet(): Promise<Wallet>
```
Creates a new wallet or loads existing wallet from secure storage.

**Returns**: `Wallet` object with address and public key

**Example**:
```typescript
const wallet = await client.initializeWallet();
```

##### `processPaymentRequest(request, policies)`
```typescript
async processPaymentRequest(
  request: PaymentRequest,
  policies: Policy[]
): Promise<PaymentResult>
```
Processes a payment request through the complete pipeline: policy check, session key generation, transaction construction.

**Parameters**:
- `request`: Payment request details
- `policies`: Array of security policies to evaluate

**Returns**: `PaymentResult` with approval status and transaction data

**Example**:
```typescript
const result = await client.processPaymentRequest(request, policies);
if (result.allowed) {
  console.log('Transaction:', result.transaction);
}
```

##### `getWalletAddress()`
```typescript
async getWalletAddress(): Promise<string>
```
Returns the current wallet address.

**Returns**: Ethereum address string

##### `backupWallet(password)`
```typescript
async backupWallet(password: string): Promise<string>
```
Creates an encrypted backup of the wallet.

**Parameters**:
- `password`: Encryption password

**Returns**: Encrypted backup string

##### `simulatePayment(request, policies)`
```typescript
async simulatePayment(
  request: PaymentRequest,
  policies: Policy[]
): Promise<SimulationResult>
```
Simulates policy evaluation without actually creating transactions.

**Returns**: Detailed simulation results with warnings and suggestions

## Component APIs

### KeyManager

#### Initialization
```typescript
import { KeyManager } from '@agentic/payment-client/key-manager';

const keyManager = new KeyManager();
```

#### Methods
- `initializeWallet(method, data?)`: Initialize wallet (create, import, hardware)
- `getPublicKey()`: Get public key without exposing private key
- `getAddress()`: Get wallet address
- `signTransaction(transactionHash)`: Sign transaction hash
- `signMessage(message)`: Sign arbitrary message
- `backupKeys(password)`: Create encrypted backup
- `restoreFromBackup(backup, password)`: Restore from backup
- `rotateKeys()`: Generate new key pair

### SessionKeyGenerator

#### Initialization
```typescript
import { SessionKeyGenerator } from '@agentic/payment-client/session-key-generator';

const generator = new SessionKeyGenerator();
```

#### Methods
- `generateSessionKey(permissions, masterPublicKey, signature)`: Generate new session key
- `encodePermissions(permissions)`: Encode permissions to binary format
- `validateSessionKey(keyId)`: Check if session key is valid
- `revokeSessionKey(keyId)`: Immediately revoke session key
- `getSessionKey(keyId)`: Retrieve session key by ID
- `getAllSessionKeys()`: Get all active session keys
- `rotateSessionKeys()`: Clean up expired keys

### PolicyChecker

#### Initialization
```typescript
import { PolicyChecker } from '@agentic/payment-client/policy-checker';

const checker = new PolicyChecker();
```

#### Methods
- `evaluateRequest(request, policies)`: Evaluate payment request against policies
- `checkBudget(request, period)`: Check remaining budget for time period
- `validateRecipient(recipient, whitelist, blacklist)`: Validate recipient against lists
- `getApprovalRequirements(request, policies)`: Determine if manual approval needed
- `simulatePolicy(request, policies)`: Simulate policy evaluation

### TransactionConstructor

#### Initialization
```typescript
import { TransactionConstructor } from '@agentic/payment-client/transaction-constructor';

const constructor = new TransactionConstructor(rpcUrl, chainId);
```

#### Methods
- `buildPaymentTx(request)`: Build payment transaction
- `estimateGas(request)`: Estimate gas for transaction
- `estimateGasPrice()`: Get current gas price
- `createUserOp(sender, callData, nonce, signature)`: Create ERC-4337 UserOperation
- `batchTransactions(transactions)`: Batch multiple transactions
- `optimizeForFee(transaction)`: Optimize transaction fees

## Type Definitions

### PaymentRequest
```typescript
interface PaymentRequest {
  amount: bigint;           // Amount in wei
  recipient: string;        // Recipient address
  tokenAddress?: string;    // ERC-20 token address (native if undefined)
  data?: string;           // Calldata for contract calls
  agentId: string;         // ID of requesting agent
  taskId: string;          // Task identifier
  reason: string;          // Payment reason/description
}
```

### Policy
```typescript
interface Policy {
  id: string;              // Unique policy identifier
  name: string;            // Human-readable name
  rules: PolicyRule[];     // Array of policy rules
  priority: number;        // Evaluation priority (higher = earlier)
}
```

### PermissionSet
```typescript
interface PermissionSet {
  maxAmount: bigint;       // Maximum amount per transaction
  allowedRecipients: string[]; // Allowed recipient addresses
  allowedFunctions: string[];  // Allowed contract functions
  expiry: number;          // UNIX timestamp expiry
  dailyLimit?: bigint;     // Optional daily limit
  tokenRestrictions?: string[]; // Allowed ERC-20 tokens
}
```

### PaymentResult
```typescript
interface PaymentResult {
  allowed: boolean;        // Whether payment is allowed
  requiresApproval: boolean; // Whether manual approval needed
  transaction?: Transaction; // Built transaction (if allowed)
  sessionKey?: SessionKey; // Generated session key (if allowed)
  error?: string;          // Error message (if not allowed)
}
```

## Error Handling

### Common Errors

```typescript
try {
  const result = await client.processPaymentRequest(request, policies);
} catch (error) {
  if (error instanceof WalletNotInitializedError) {
    console.error('Wallet not initialized. Call initializeWallet() first.');
  } else if (error instanceof PolicyViolationError) {
    console.error('Policy violation:', error.message);
  } else if (error instanceof InsufficientBalanceError) {
    console.error('Insufficient balance');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types
- `WalletNotInitializedError`: Wallet not initialized
- `PolicyViolationError`: Payment request violates policies
- `InsufficientBalanceError`: Insufficient funds
- `NetworkError`: RPC connection failure
- `SecurityError`: Security violation detected

## Examples

### Complete Payment Flow
```typescript
import { AgenticPaymentClient } from '@agentic/payment-client';

async function processAgentPayment() {
  const client = new AgenticPaymentClient(RPC_URL, CHAIN_ID);
  
  // Initialize or load wallet
  await client.initializeWallet();
  
  // Define payment request
  const request = {
    amount: ethers.parseEther('0.1'),
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1A2B3C4',
    agentId: 'claude-code',
    taskId: 'api-call-123',
    reason: 'API usage fee for image generation',
  };
  
  // Define security policies
  const policies = [{
    id: 'default',
    name: 'Default Security Policy',
    priority: 1,
    rules: [{
      type: 'amount-limit',
      maxPerTransaction: ethers.parseEther('1'),
      maxDaily: ethers.parseEther('10'),
    }],
  }];
  
  // Process payment
  const result = await client.processPaymentRequest(request, policies);
  
  if (result.allowed) {
    if (result.requiresApproval) {
      console.log('Payment requires manual approval');
      // Trigger approval workflow
    } else {
      console.log('Payment approved automatically');
      // Broadcast transaction
      const txHash = await broadcastTransaction(result.transaction);
      console.log('Transaction sent:', txHash);
    }
  } else {
    console.log('Payment rejected:', result.error);
  }
}
```

### Policy Configuration
```typescript
const policies = [
  {
    id: 'amount-limits',
    name: 'Amount Limits',
    priority: 2,
    rules: [
      {
        type: 'amount-limit',
        maxPerTransaction: ethers.parseEther('0.5'),
        maxDaily: ethers.parseEther('5'),
        maxWeekly: ethers.parseEther('20'),
      },
    ],
  },
  {
    id: 'recipient-controls',
    name: 'Recipient Controls',
    priority: 1,
    rules: [
      {
        type: 'recipient',
        whitelist: [
          '0x742d35Cc6634C0532925a3b844Bc9e90F1A2B3C4',
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        ],
        blacklist: [],
      },
    ],
  },
  {
    id: 'manual-approval',
    name: 'Manual Approval',
    priority: 3,
    rules: [
      {
        type: 'manual-approval',
        threshold: ethers.parseEther('0.2'),
        notifyChannels: ['email', 'push'],
      },
    ],
  },
];
```

## Best Practices

### Security
1. **Never expose private keys**: Use the SDK's secure key management
2. **Regular key rotation**: Use `rotateKeys()` periodically
3. **Policy review**: Regularly review and update security policies
4. **Backup strategy**: Maintain encrypted backups with strong passwords

### Performance
1. **Batch transactions**: Use `batchTransactions()` for multiple payments
2. **Policy caching**: Cache policy evaluation results when possible
3. **Gas optimization**: Use `optimizeForFee()` before broadcasting

### Integration
1. **Error handling**: Implement comprehensive error handling
2. **Monitoring**: Log all payment attempts and policy decisions
3. **Testing**: Use `simulatePayment()` for testing policy configurations

---

*API Version: 1.0.0*  
*Last Updated: 2024-01-01*  
*SDK Maintainer: AI Agent (autonomous documentation)*