import { AgenticPaymentClient } from './index';
import { PaymentRequest, Policy } from './types';

describe('AgenticPaymentClient Integration', () => {
  let client: AgenticPaymentClient;

  beforeAll(() => {
    client = new AgenticPaymentClient('https://testnet.monad.xyz', 10143);
  });

  test('should initialize wallet', async () => {
    const wallet = await client.initializeWallet();
    expect(wallet).toHaveProperty('address');
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should process valid payment request', async () => {
    await client.initializeWallet();

    const request: PaymentRequest = {
      amount: BigInt(100000000000000000), // 0.1 ETH
      recipient: '0x1234567890123456789012345678901234567890',
      agentId: 'test-agent',
      taskId: 'test-task',
      reason: 'Integration test',
    };

    const policies: Policy[] = [
      {
        id: 'test-policy',
        name: 'Test Policy',
        priority: 1,
        rules: [
          {
            type: 'amount-limit',
            maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
            maxDaily: BigInt(5000000000000000000), // 5 ETH
          },
        ],
      },
    ];

    const result = await client.processPaymentRequest(request, policies);
    expect(result.allowed).toBe(true);
    expect(result).toHaveProperty('transaction');
  });

  test('should reject payment exceeding limit', async () => {
    await client.initializeWallet();

    const request: PaymentRequest = {
      amount: BigInt(2000000000000000000), // 2 ETH - exceeds limit
      recipient: '0x1234567890123456789012345678901234567890',
      agentId: 'test-agent',
      taskId: 'test-task',
      reason: 'Integration test',
    };

    const policies: Policy[] = [
      {
        id: 'test-policy',
        name: 'Test Policy',
        priority: 1,
        rules: [
          {
            type: 'amount-limit',
            maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
            maxDaily: BigInt(5000000000000000000), // 5 ETH
          },
        ],
      },
    ];

    const result = await client.processPaymentRequest(request, policies);
    expect(result.allowed).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should get wallet address', async () => {
    await client.initializeWallet();
    const address = await client.getWalletAddress();
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should simulate payment', async () => {
    const request: PaymentRequest = {
      amount: BigInt(500000000000000000), // 0.5 ETH
      recipient: '0x1234567890123456789012345678901234567890',
      agentId: 'test-agent',
      taskId: 'test-task',
      reason: 'Simulation',
    };

    const policies: Policy[] = [
      {
        id: 'test-policy',
        name: 'Test Policy',
        priority: 1,
        rules: [
          {
            type: 'amount-limit',
            maxPerTransaction: BigInt(1000000000000000000), // 1 ETH
            maxDaily: BigInt(5000000000000000000), // 5 ETH
          },
        ],
      },
    ];

    const simulation = await client.simulatePayment(request, policies);
    expect(simulation).toHaveProperty('allowed');
    expect(simulation).toHaveProperty('reasons');
  });
});