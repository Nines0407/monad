import { PolicyChecker } from './index';
import { PaymentRequest, Policy } from '../types';

describe('PolicyChecker', () => {
  let checker: PolicyChecker;

  const mockRequest: PaymentRequest = {
    amount: BigInt(100),
    recipient: '0x1234567890123456789012345678901234567890',
    agentId: 'agent-1',
    taskId: 'task-1',
    reason: 'Test payment',
  };

  const mockPolicies: Policy[] = [
    {
      id: 'policy-1',
      name: 'Test Policy',
      priority: 1,
      rules: [
        {
          type: 'amount-limit',
          maxPerTransaction: BigInt(1000),
          maxDaily: BigInt(5000),
        },
        {
          type: 'recipient',
          whitelist: ['0x1234567890123456789012345678901234567890'],
          blacklist: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    checker = new PolicyChecker();
  });

  test('should evaluate request and allow', () => {
    const result = checker.evaluateRequest(mockRequest, mockPolicies);
    expect(result.allowed).toBe(true);
  });

  test('should reject request exceeding amount limit', () => {
    const largeRequest: PaymentRequest = {
      ...mockRequest,
      amount: BigInt(2000),
    };
    const result = checker.evaluateRequest(largeRequest, mockPolicies);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('exceeds');
  });

  test('should reject blacklisted recipient', () => {
    const policyWithBlacklist: Policy[] = [
      {
        id: 'policy-2',
        name: 'Blacklist Policy',
        priority: 1,
        rules: [
          {
            type: 'recipient',
            whitelist: [],
            blacklist: ['0x1234567890123456789012345678901234567890'],
          },
        ],
      },
    ];
    const result = checker.evaluateRequest(mockRequest, policyWithBlacklist);
    expect(result.allowed).toBe(false);
  });

  test('should check budget', () => {
    const budget = checker.checkBudget(mockRequest, 'daily');
    expect(budget).toHaveProperty('remaining');
    expect(budget).toHaveProperty('exceeded');
  });

  test('should validate recipient', () => {
    const valid = checker.validateRecipient(
      '0x1234',
      ['0x1234', '0x5678'],
      []
    );
    expect(valid).toBe(true);

    const invalid = checker.validateRecipient(
      '0x1234',
      [],
      ['0x1234']
    );
    expect(invalid).toBe(false);
  });

  test('should get approval requirements', () => {
    const manualApprovalPolicy: Policy[] = [
      {
        id: 'policy-3',
        name: 'Manual Approval',
        priority: 1,
        rules: [
          {
            type: 'manual-approval',
            threshold: BigInt(500),
            notifyChannels: ['email', 'sms'],
          },
        ],
      },
    ];

    const smallRequest = { ...mockRequest, amount: BigInt(100) };
    const largeRequest = { ...mockRequest, amount: BigInt(600) };

    const smallResult = checker.getApprovalRequirements(smallRequest, manualApprovalPolicy);
    expect(smallResult.requiresApproval).toBe(false);

    const largeResult = checker.getApprovalRequirements(largeRequest, manualApprovalPolicy);
    expect(largeResult.requiresApproval).toBe(true);
    expect(largeResult.notifyChannels).toContain('email');
  });

  test('should simulate policy', () => {
    const simulation = checker.simulatePolicy(mockRequest, mockPolicies);
    expect(simulation).toHaveProperty('allowed');
    expect(simulation).toHaveProperty('reasons');
    expect(simulation).toHaveProperty('warnings');
  });
});