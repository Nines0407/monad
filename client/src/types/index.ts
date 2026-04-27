export interface Wallet {
  address: string;
  publicKey: string;
  privateKey?: never; // never exposed
}

export interface SessionKey {
  publicKey: string;
  permissions: PermissionSet;
  expiry: number; // UNIX timestamp
  signature: string; // signed by master key
}

export interface PermissionSet {
  maxAmount: bigint;
  allowedRecipients: string[];
  allowedFunctions: string[];
  expiry: number;
  dailyLimit?: bigint;
  tokenRestrictions?: string[]; // ERC-20 addresses
}

export interface PaymentRequest {
  amount: bigint;
  recipient: string;
  tokenAddress?: string; // native if undefined
  data?: string; // calldata for contract calls
  agentId: string;
  taskId: string;
  reason: string;
}

export interface Policy {
  id: string;
  name: string;
  rules: PolicyRule[];
  priority: number;
}

export type PolicyRule =
  | AmountLimitRule
  | RecipientRule
  | TimeRestrictionRule
  | TokenRestrictionRule
  | ManualApprovalRule
  | CompoundRule;

export interface AmountLimitRule {
  type: 'amount-limit';
  maxPerTransaction: bigint;
  maxDaily: bigint;
  maxWeekly?: bigint;
  maxMonthly?: bigint;
}

export interface RecipientRule {
  type: 'recipient';
  whitelist: string[];
  blacklist: string[];
}

export interface TimeRestrictionRule {
  type: 'time-restriction';
  allowedHours: { start: number; end: number }[]; // 0-23
  cooldownSeconds?: number;
}

export interface TokenRestrictionRule {
  type: 'token-restriction';
  allowedTokens: string[];
}

export interface ManualApprovalRule {
  type: 'manual-approval';
  threshold: bigint;
  notifyChannels: string[]; // email, sms, push
}

export interface CompoundRule {
  type: 'compound';
  operator: 'and' | 'or' | 'not';
  rules: PolicyRule[];
}

export interface Transaction {
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  chainId: number;
}

export interface UserOperation {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;
  signature: string;
}

export interface KeyStorage {
  storeEncryptedKey(keyId: string, encryptedData: string): Promise<void>;
  retrieveEncryptedKey(keyId: string): Promise<string | null>;
  deleteKey(keyId: string): Promise<void>;
}