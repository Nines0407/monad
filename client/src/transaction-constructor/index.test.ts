import { TransactionConstructor } from './index';
import { PaymentRequest } from '../types';

describe('TransactionConstructor', () => {
  let constructor: TransactionConstructor;
  const mockRpcUrl = 'https://testnet.monad.xyz';
  const mockChainId = 10143;

  const mockRequest: PaymentRequest = {
    amount: BigInt(1000000000000000000), // 1 ETH
    recipient: '0x1234567890123456789012345678901234567890',
    agentId: 'agent-1',
    taskId: 'task-1',
    reason: 'Test payment',
  };

  beforeEach(() => {
    constructor = new TransactionConstructor(mockRpcUrl, mockChainId);
  });

  test('should build payment transaction', async () => {
    const tx = await constructor.buildPaymentTx(mockRequest);
    expect(tx).toHaveProperty('to', mockRequest.recipient);
    expect(tx).toHaveProperty('value', mockRequest.amount);
    expect(tx).toHaveProperty('gasLimit');
    expect(tx).toHaveProperty('chainId', mockChainId);
  });

  test('should estimate gas', async () => {
    const gas = await constructor.estimateGas(mockRequest);
    expect(gas).toBeGreaterThan(BigInt(0));
  });

  test('should estimate gas price', async () => {
    const gasPrice = await constructor.estimateGasPrice();
    expect(gasPrice).toBeGreaterThan(BigInt(0));
  });

  test('should create user operation', async () => {
    const userOp = await constructor.createUserOp(
      '0xsender',
      '0xcalldata',
      BigInt(1),
      '0xsignature'
    );
    expect(userOp).toHaveProperty('sender');
    expect(userOp).toHaveProperty('nonce');
    expect(userOp).toHaveProperty('callData');
    expect(userOp).toHaveProperty('signature');
  });

  test('should batch transactions', async () => {
    const tx1: any = {
      to: '0x1111',
      value: BigInt(100),
      data: '0x',
      gasLimit: BigInt(21000),
      chainId: mockChainId,
    };
    const tx2: any = {
      to: '0x2222',
      value: BigInt(200),
      data: '0x',
      gasLimit: BigInt(21000),
      chainId: mockChainId,
    };

    const batched = await constructor.batchTransactions([tx1, tx2]);
    expect(batched).toBeDefined();
  });

  test('should optimize for fee', async () => {
    const tx = await constructor.buildPaymentTx(mockRequest);
    const optimized = constructor.optimizeForFee(tx);
    expect(optimized).toBeDefined();
    // Check that gas limit is rounded
    if (optimized.gasLimit) {
      expect(optimized.gasLimit % BigInt(1000)).toBe(BigInt(0));
    }
  });

  test('should handle empty batch', async () => {
    await expect(constructor.batchTransactions([])).rejects.toThrow();
  });
});