import { KeyManager } from './key-manager';
import { SessionKeyGenerator } from './session-key-generator';
import { PolicyChecker } from './policy-checker';
import { TransactionConstructor } from './transaction-constructor';
import { PaymentRequest, PermissionSet, Policy } from './types';

export class AgenticPaymentClient {
  private keyManager: KeyManager;
  private sessionKeyGenerator: SessionKeyGenerator;
  private policyChecker: PolicyChecker;
  private transactionConstructor: TransactionConstructor;

  constructor(rpcUrl: string, chainId: number) {
    this.keyManager = new KeyManager();
    this.sessionKeyGenerator = new SessionKeyGenerator();
    this.policyChecker = new PolicyChecker();
    this.transactionConstructor = new TransactionConstructor(rpcUrl, chainId);
  }

  async initializeWallet() {
    return await this.keyManager.initializeWallet('create');
  }

  async processPaymentRequest(
    request: PaymentRequest,
    policies: Policy[]
  ): Promise<{
    allowed: boolean;
    requiresApproval: boolean;
    transaction?: any;
    sessionKey?: any;
    error?: string;
  }> {
    try {
      // Step 1: Policy check
      const policyResult = this.policyChecker.evaluateRequest(request, policies);
      if (!policyResult.allowed) {
        return {
          allowed: false,
          requiresApproval: false,
          error: policyResult.reason,
        };
      }

      // Step 2: Generate session key if needed
      const permissions: PermissionSet = {
        maxAmount: request.amount * BigInt(2), // Allow some buffer
        allowedRecipients: [request.recipient],
        allowedFunctions: ['transfer'],
        expiry: Date.now() + 3600000, // 1 hour
      };

      const masterPublicKey = await this.keyManager.getPublicKey();
      const signature = await this.keyManager.signMessage(
        JSON.stringify(permissions)
      );

      const sessionKey = await this.sessionKeyGenerator.generateSessionKey(
        permissions,
        masterPublicKey,
        signature
      );

      // Step 3: Build transaction
      const transaction = await this.transactionConstructor.buildPaymentTx(request);

      return {
        allowed: true,
        requiresApproval: policyResult.requiresApproval,
        transaction,
        sessionKey,
      };
    } catch (error) {
      return {
        allowed: false,
        requiresApproval: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getWalletAddress(): Promise<string> {
    return await this.keyManager.getAddress();
  }

  async backupWallet(password: string): Promise<string> {
    return await this.keyManager.backupKeys(password);
  }

  async simulatePayment(request: PaymentRequest, policies: Policy[]) {
    return this.policyChecker.simulatePolicy(request, policies);
  }
}

// Example usage
if (require.main === module) {
  (async () => {
    const client = new AgenticPaymentClient(
      'https://testnet.monad.xyz',
      10143
    );

    console.log('🚀 Initializing wallet...');
    const wallet = await client.initializeWallet();
    console.log(`✅ Wallet created: ${wallet.address}`);

    const request: PaymentRequest = {
      amount: BigInt(100000000000000000), // 0.1 ETH
      recipient: '0x1234567890123456789012345678901234567890',
      agentId: 'claude-code',
      taskId: 'task-123',
      reason: 'API usage fee',
    };

    const policies: Policy[] = [
      {
        id: 'default',
        name: 'Default Policy',
        priority: 1,
        rules: [
          {
            type: 'amount-limit',
            maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
            maxDaily: BigInt(5000000000000000000), // 5 ETH
          },
          {
            type: 'recipient',
            whitelist: [],
            blacklist: [],
          },
        ],
      },
    ];

    console.log('🔍 Processing payment request...');
    const result = await client.processPaymentRequest(request, policies);

    if (result.allowed) {
      console.log('✅ Payment allowed');
      if (result.requiresApproval) {
        console.log('⚠️ Requires manual approval');
      }
      console.log(`📝 Session key: ${result.sessionKey?.publicKey?.slice(0, 16)}...`);
      console.log(`⛽ Gas limit: ${result.transaction?.gasLimit}`);
    } else {
      console.log('❌ Payment rejected:', result.error);
    }
  })().catch(console.error);
}