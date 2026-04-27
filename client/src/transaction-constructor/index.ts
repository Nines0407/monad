import { PaymentRequest, Transaction, UserOperation } from '../types';

export class TransactionConstructor {
  private rpcUrl: string;
  private chainId: number;

  constructor(rpcUrl: string, chainId: number) {
    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
  }

  async buildPaymentTx(request: PaymentRequest): Promise<Transaction> {
    const tx: Transaction = {
      to: request.recipient,
      value: request.amount,
      data: request.data || '0x',
      gasLimit: await this.estimateGas(request),
      chainId: this.chainId,
    };

    // Add gas price estimation
    const gasPrice = await this.estimateGasPrice();
    tx.gasPrice = gasPrice;

    return tx;
  }

  async estimateGas(request: PaymentRequest): Promise<bigint> {
    // Heuristic gas estimation
    let gas = BigInt(21000); // Base gas

    if (request.data && request.data !== '0x') {
      gas += BigInt(10000); // Additional gas for contract calls
    }

    if (request.tokenAddress) {
      gas += BigInt(50000); // ERC-20 transfer gas
    }

    // Add 10% buffer
    gas = (gas * BigInt(110)) / BigInt(100);

    return gas;
  }

  async estimateGasPrice(): Promise<bigint> {
    // Fetch current gas price from RPC
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        }),
      });
      const data = await response.json() as any;
      return BigInt(data.result);
    } catch {
      // Fallback to default gas price
      return BigInt(20000000000); // 20 Gwei
    }
  }

  async createUserOp(
    sender: string,
    callData: string,
    nonce: bigint,
    signature: string
  ): Promise<UserOperation> {
    const gasLimits = await this.estimateUserOpGas(sender, callData);

    const userOp: UserOperation = {
      sender,
      nonce,
      initCode: '0x',
      callData,
      callGasLimit: gasLimits.callGasLimit,
      verificationGasLimit: gasLimits.verificationGasLimit,
      preVerificationGas: gasLimits.preVerificationGas,
      maxFeePerGas: await this.estimateMaxFeePerGas(),
      maxPriorityFeePerGas: await this.estimatePriorityFee(),
      paymasterAndData: '0x',
      signature,
    };

    return userOp;
  }

  async batchTransactions(transactions: Transaction[]): Promise<Transaction> {
    if (transactions.length === 0) {
      throw new Error('No transactions to batch');
    }

    // Encode multiple calls into single transaction data
    const calls = transactions.map(tx => ({
      target: tx.to,
      value: tx.value,
      data: tx.data,
    }));

    // For now, return first transaction as placeholder
    // In real implementation, use Multicall contract or similar
    return {
      ...transactions[0],
      data: this.encodeBatchCalls(calls),
    };
  }

  optimizeForFee(transaction: Transaction): Transaction {
    // Apply fee optimization strategies
    const optimized = { ...transaction };

    // Remove gasPrice if using EIP-1559
    if (optimized.maxFeePerGas && optimized.maxPriorityFeePerGas) {
      delete optimized.gasPrice;
    }

    // Round gas limit to nearest thousand
    if (optimized.gasLimit) {
      const rounded = (optimized.gasLimit / BigInt(1000)) * BigInt(1000) + BigInt(1000);
      optimized.gasLimit = rounded;
    }

    return optimized;
  }

  private async estimateUserOpGas(
    _sender: string,
    _callData: string
  ): Promise<{
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
  }> {
    // Estimate gas for UserOperation components
    return {
      callGasLimit: BigInt(100000),
      verificationGasLimit: BigInt(100000),
      preVerificationGas: BigInt(50000),
    };
  }

  private async estimateMaxFeePerGas(): Promise<bigint> {
    const baseFee = await this.estimateBaseFee();
    const priorityFee = await this.estimatePriorityFee();
    return baseFee + priorityFee;
  }

  private async estimateBaseFee(): Promise<bigint> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: ['latest', false],
          id: 1,
        }),
      });
      const data = await response.json() as any;
      return BigInt(data.result.baseFeePerGas || '0x0');
    } catch {
      return BigInt(15000000000); // 15 Gwei fallback
    }
  }

  private async estimatePriorityFee(): Promise<bigint> {
    // Simple priority fee estimation
    return BigInt(1500000000); // 1.5 Gwei
  }

  private encodeBatchCalls(calls: Array<{ target: string; value: bigint; data: string }>): string {
    // Placeholder for batch encoding
    // In real implementation, use Multicall contract ABI
    return `0x${calls.length.toString(16).padStart(64, '0')}`;
  }
}