# Testing Strategy

## Testing Philosophy

### Core Principles
1. **Security First**: All security-critical paths must have comprehensive test coverage
2. **Agent-Centric**: Tests must simulate real Agent behavior and scenarios
3. **Deterministic**: Tests must be reproducible and consistent across environments
4. **Performance Aware**: Tests must validate performance under realistic loads
5. **Failure Tolerant**: Tests must validate graceful degradation and recovery

### Testing Pyramid
```
          E2E Tests (10%)
           /         \
Integration Tests (20%)
         /             \
    Unit Tests (70%)
```

## Unit Testing

### Smart Contract Unit Tests

#### Test Framework
- **Primary**: Hardhat Test (JavaScript/TypeScript)
- **Secondary**: Foundry Forge (Solidity)
- **Coverage Tools**: Istanbul (Hardhat), forge coverage (Foundry)

#### Test Categories

##### 1. Wallet Contract Tests
```typescript
describe('AgentWallet', () => {
  describe('initialization', () => {
    it('should initialize with correct owner', async () => {});
    it('should set up entry point correctly', async () => {});
    it('should reject initialization with zero address', async () => {});
  });
  
  describe('user operations', () => {
    it('should execute valid user operations', async () => {});
    it('should reject operations with invalid signatures', async () => {});
    it('should handle batch operations correctly', async () => {});
    it('should validate gas limits', async () => {});
  });
});
```

##### 2. Session Key Manager Tests
```typescript
describe('SessionKeyManager', () => {
  describe('key registration', () => {
    it('should register new session keys', async () => {});
    it('should enforce permission constraints', async () => {});
    it('should reject duplicate key registration', async () => {});
    it('should validate key expiry', async () => {});
  });
  
  describe('key validation', () => {
    it('should validate allowed recipients', async () => {});
    it('should validate amount limits', async () => {});
    it('should validate function permissions', async () => {});
    it('should reject expired keys', async () => {});
  });
  
  describe('key revocation', () => {
    it('should revoke keys immediately', async () => {});
    it('should prevent revoked keys from authorizing', async () => {});
    it('should emit revocation events', async () => {});
  });
});
```

##### 3. Policy Engine Tests
```typescript
describe('PolicyEngine', () => {
  describe('policy evaluation', () => {
    it('should evaluate simple policies correctly', async () => {});
    it('should handle policy conflicts with priority', async () => {});
    it('should evaluate complex nested conditions', async () => {});
    it('should handle time-based policies', async () => {});
  });
  
  describe('policy management', () => {
    it('should add new policies', async () => {});
    it('should update existing policies', async () => {});
    it('should remove policies', async () => {});
    it('should enforce governance for critical changes', async () => {});
  });
});
```

##### 4. Audit Log Contract Tests
```typescript
describe('AuditLog', () => {
  describe('event emission', () => {
    it('should emit structured events for all operations', async () => {});
    it('should include all required metadata', async () => {});
    it('should handle high-frequency event emission', async () => {});
    it('should maintain event ordering', async () => {});
  });
  
  describe('gas optimization', () => {
    it('should minimize gas for frequent operations', async () => {});
    it('should batch events where possible', async () => {});
    it('should use efficient data encoding', async () => {});
  });
});
```

#### Test Utilities
- **Fixture Management**: Reusable test setup and teardown
- **Mock Contracts**: Mock implementations of external dependencies
- **Test Data Generators**: Generate realistic test data
- **Snapshot Testing**: Compare contract state before/after operations

### Client Unit Tests

#### Test Framework
- **Primary**: Jest with TypeScript
- **Test Runner**: Jest in watch mode for development
- **Coverage**: Istanbul with lcov reports

#### Test Categories

##### 1. Key Management Tests
```typescript
describe('KeyManager', () => {
  describe('key storage', () => {
    it('should store keys securely', async () => {});
    it('should encrypt sensitive data', async () => {});
    it('should handle keychain integration', async () => {});
    it('should support hardware wallets', async () => {});
  });
  
  describe('key operations', () => {
    it('should generate secure keys', async () => {});
    it('should sign transactions correctly', async () => {});
    it('should validate signatures', async () => {});
    it('should clear keys from memory', async () => {});
  });
});
```

##### 2. Session Key Generator Tests
```typescript
describe('SessionKeyGenerator', () => {
  describe('key generation', () => {
    it('should generate cryptographically secure keys', async () => {});
    it('should encode permissions correctly', async () => {});
    it('should create valid delegation signatures', async () => {});
    it('should distribute keys securely', async () => {});
  });
  
  describe('permission encoding', () => {
    it('should encode time limits', async () => {});
    it('should encode amount limits', async () => {});
    it('should encode recipient restrictions', async () => {});
    it('should encode function permissions', async () => {});
  });
});
```

##### 3. Policy Checker Tests
```typescript
describe('PolicyChecker', () => {
  describe('policy evaluation', () => {
    it('should evaluate local policies quickly', async () => {});
    it('should cache policies effectively', async () => {});
    it('should detect policy conflicts', async () => {});
    it('should simulate transactions accurately', async () => {});
  });
  
  describe('policy synchronization', () => {
    it('should sync policies from server', async () => {});
    it('should handle policy updates', async () => {});
    it('should resolve version conflicts', async () => {});
  });
});
```

##### 4. Transaction Constructor Tests
```typescript
describe('TransactionConstructor', () => {
  describe('transaction building', () => {
    it('should construct valid transactions', async () => {});
    it('should estimate gas accurately', async () => {});
    it('should handle batch transactions', async () => {});
    it('should optimize for Monad network', async () => {});
  });
  
  describe('error handling', () => {
    it('should handle RPC errors gracefully', async () => {});
    it('should retry failed transactions', async () => {});
    it('should provide clear error messages', async () => {});
  });
});
```

#### Mock Implementations
- **WebHID Mock**: Mock hardware wallet interface
- **Keychain Mock**: Mock OS keychain services
- **RPC Mock**: Mock blockchain RPC responses
- **Storage Mock**: Mock encrypted storage

## Integration Testing

### End-to-End Payment Flow Tests

#### Test Environment
- **Network**: Monad testnet or local Anvil node
- **Contracts**: Deployed test contracts
- **Agents**: Simulated Agent clients
- **Database**: Test database with seed data

#### Test Scenarios

##### 1. Happy Path - Approved Payment
```typescript
describe('Payment Flow - Approved', () => {
  it('should complete end-to-end payment with approval', async () => {
    // 1. Agent requests payment
    const request = createPaymentRequest();
    
    // 2. Local policy check passes
    const localCheck = await policyChecker.check(request);
    expect(localCheck.allowed).toBe(true);
    
    // 3. Session key signs
    const signature = await sessionKeyGenerator.sign(request);
    
    // 4. Transaction constructed and submitted
    const tx = await transactionConstructor.build(request, signature);
    const receipt = await submitTransaction(tx);
    
    // 5. Audit record created
    const auditRecord = await auditService.get(receipt.transactionHash);
    expect(auditRecord).toBeDefined();
    
    // 6. Result returned to Agent
    expect(receipt.status).toBe('success');
  });
});
```

##### 2. Policy Rejection Path
```typescript
describe('Payment Flow - Policy Rejection', () => {
  it('should reject payment violating policies', async () => {
    // 1. Agent requests payment exceeding limits
    const request = createLargePaymentRequest();
    
    // 2. Local policy check fails
    const localCheck = await policyChecker.check(request);
    expect(localCheck.allowed).toBe(false);
    expect(localCheck.reason).toContain('exceeds daily limit');
    
    // 3. No transaction submitted
    // 4. Audit record created for rejection
    const auditRecord = await auditService.getLatest();
    expect(auditRecord.status).toBe('rejected');
  });
});
```

##### 3. Manual Approval Path
```typescript
describe('Payment Flow - Manual Approval', () => {
  it('should require manual approval for threshold payments', async () => {
    // 1. Agent requests payment requiring approval
    const request = createThresholdPaymentRequest();
    
    // 2. Local policy check flags for approval
    const localCheck = await policyChecker.check(request);
    expect(localCheck.requiresApproval).toBe(true);
    
    // 3. Approval request sent to user
    const approvalRequest = await approvalService.create(request);
    
    // 4. User approves
    await approvalService.approve(approvalRequest.id);
    
    // 5. Payment proceeds
    const receipt = await executeApprovedPayment(approvalRequest);
    expect(receipt.status).toBe('success');
  });
});
```

### Multi-Agent Scenario Tests

#### Concurrent Agent Tests
```typescript
describe('Multi-Agent Scenarios', () => {
  it('should handle concurrent payments from multiple Agents', async () => {
    const agents = ['agent-1', 'agent-2', 'agent-3'];
    const requests = agents.map(agentId => createAgentPaymentRequest(agentId));
    
    const results = await Promise.allSettled(
      requests.map(req => paymentService.process(req))
    );
    
    // Verify all processed correctly
    expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    
    // Verify budget enforcement across agents
    const budgetStatus = await budgetService.getStatus();
    expect(budgetStatus.totalSpent).toBe('150 USDC'); // 50 each from 3 agents
  });
});
```

#### Permission Conflict Tests
```typescript
describe('Permission Conflicts', () => {
  it('should handle permission updates during active sessions', async () => {
    // 1. Agent starts payment
    const request = createPaymentRequest();
    const sessionKey = await sessionKeyGenerator.generate(request);
    
    // 2. User reduces permissions while payment is processing
    await permissionService.update({
      agentId: request.agentId,
      dailyLimit: '10 USDC' // Reduced from 100
    });
    
    // 3. Payment should still complete with old permissions
    const result = await completePaymentWithSessionKey(sessionKey);
    expect(result.status).toBe('success');
    
    // 4. Subsequent payments should use new limits
    const newRequest = createPaymentRequest();
    const newCheck = await policyChecker.check(newRequest);
    expect(newCheck.allowed).toBe(false); // Now exceeds new limit
  });
});
```

### Failure Recovery Tests

#### Network Failure Tests
```typescript
describe('Network Failures', () => {
  it('should handle RPC connection failures', async () => {
    // Mock RPC failure
    mockRPC.setResponse('eth_sendRawTransaction', () => {
      throw new Error('Connection failed');
    });
    
    // Payment should retry with backoff
    const request = createPaymentRequest();
    const result = await paymentService.processWithRetry(request);
    
    // Should eventually succeed or fail gracefully
    expect(['success', 'failed_after_retry']).toContain(result.status);
  });
});
```

#### Contract Failure Tests
```typescript
describe('Contract Failures', () => {
  it('should handle contract reverts gracefully', async () => {
    // Deploy failing mock contract
    const failingContract = await deployFailingContract();
    
    // Attempt payment to failing contract
    const request = createPaymentToContract(failingContract.address);
    
    const result = await paymentService.process(request);
    
    // Should detect revert and report appropriately
    expect(result.status).toBe('failed');
    expect(result.error).toContain('execution reverted');
  });
});
```

## Security Testing

### Permission Bypass Testing

#### Test Matrix
| Attack Vector | Test Method | Expected Result |
|--------------|-------------|-----------------|
| Modified Session Key | Attempt to sign with modified permissions | Rejection with invalid signature |
| Replayed Signature | Reuse signature for different transaction | Rejection with replay protection |
| Forged Approval | Submit transaction with forged user approval | Rejection with approval validation |
| Time Manipulation | Attempt to use expired session key | Rejection with expiry check |

#### Test Implementation
```typescript
describe('Security - Permission Bypass', () => {
  it('should reject transactions with modified permissions', async () => {
    // Create valid session key
    const originalKey = await sessionKeyGenerator.generate(validRequest);
    
    // Modify permissions in key
    const modifiedKey = modifyPermissions(originalKey, {
      maxAmount: '1000 USDC' // Increased from 100
    });
    
    // Attempt to use modified key
    const result = await attemptPaymentWithKey(modifiedKey);
    
    expect(result.status).toBe('rejected');
    expect(result.reason).toContain('invalid signature');
  });
});
```

### Session Key Abuse Testing

#### Test Scenarios
1. **Key Extraction**: Attempt to extract keys from memory
2. **Key Brute Force**: Attempt to brute force key generation
3. **Key Collision**: Test for key generation collisions
4. **Key Distribution**: Test security of key distribution channel

#### Test Implementation
```typescript
describe('Security - Session Key Abuse', () => {
  it('should prevent memory extraction attacks', async () => {
    // Generate session key
    const key = await sessionKeyGenerator.generate(validRequest);
    
    // Attempt to access key memory directly
    const memoryAccess = attemptMemoryAccess(key);
    
    // Should be protected
    expect(memoryAccess.success).toBe(false);
    expect(memoryAccess.error).toContain('access denied');
  });
});
```

### Replay Attack Protection

#### Test Implementation
```typescript
describe('Security - Replay Attacks', () => {
  it('should reject replayed transactions', async () => {
    // Create and execute valid transaction
    const request = createPaymentRequest();
    const firstResult = await paymentService.process(request);
    expect(firstResult.status).toBe('success');
    
    // Attempt to replay same transaction
    const replayResult = await paymentService.process(request);
    
    // Should be rejected
    expect(replayResult.status).toBe('rejected');
    expect(replayResult.reason).toContain('replay');
  });
});
```

### Frontend Security Testing

#### Test Categories
1. **XSS Protection**: Test injection prevention
2. **CSRF Protection**: Test cross-site request forgery prevention
3. **Clickjacking**: Test UI redressing attacks
4. **Information Leakage**: Test data exposure

#### Test Implementation
```typescript
describe('Security - Frontend', () => {
  it('should prevent XSS attacks', async () => {
    // Attempt XSS injection in payment reason
    const maliciousRequest = createPaymentRequest({
      reason: '<script>alert("xss")</script>'
    });
    
    const result = await paymentService.process(maliciousRequest);
    
    // Should sanitize or reject
    expect(result.status).toBe('rejected');
    expect(result.reason).not.toContain('<script>');
  });
});
```

## Performance Testing

### Load Testing

#### Test Scenarios
1. **High Frequency Payments**: Many small payments in short time
2. **Large Payment Volume**: Few large payments with complex policy evaluation
3. **Concurrent Agents**: Multiple Agents operating simultaneously
4. **Policy Evaluation Load**: Heavy policy evaluation under load

#### Test Metrics
- **Throughput**: Payments per second
- **Latency**: End-to-end payment time (P50, P95, P99)
- **Resource Usage**: CPU, memory, network under load
- **Error Rate**: Percentage of failed payments under load

#### Test Implementation
```typescript
describe('Performance - Load Testing', () => {
  it('should handle 100 payments per second', async () => {
    const paymentRate = 100; // payments per second
    const duration = 10; // seconds
    
    const results = await loadTest({
      paymentRate,
      duration,
      onProgress: (stats) => {
        console.log(`Processed ${stats.processed} payments`);
        console.log(`Error rate: ${stats.errorRate}%`);
      }
    });
    
    expect(results.errorRate).toBeLessThan(1); // <1% errors
    expect(results.throughput).toBeGreaterThan(90); // >90 payments/sec
  });
});
```

### Scalability Testing

#### Test Scenarios
1. **Increasing Agent Count**: From 10 to 10,000 Agents
2. **Increasing Policy Count**: From 10 to 1,000 policies
3. **Database Scaling**: From 10,000 to 10,000,000 audit records
4. **Network Scaling**: From local to global deployment

#### Test Implementation
```typescript
describe('Performance - Scalability', () => {
  it('should scale linearly with Agent count', async () => {
    const agentCounts = [10, 100, 1000];
    const results = [];
    
    for (const count of agentCounts) {
      const result = await testWithAgents(count);
      results.push({ count, ...result });
    }
    
    // Verify near-linear scaling
    const scalingFactor = calculateScalingFactor(results);
    expect(scalingFactor).toBeGreaterThan(0.8); // At least 80% linear scaling
  });
});
```

## Regression Testing

### Test Suite Organization

#### Test Categories
1. **Core Functionality**: Basic payment flows
2. **Security Features**: All security-critical paths
3. **Edge Cases**: Boundary conditions and error states
4. **Integration Points**: External system integrations
5. **Performance Benchmarks**: Performance regression detection

#### Test Execution
```bash
# Run all tests
npm test

# Run specific test suites
npm test:unit
npm test:integration
npm test:security
npm test:performance

# Run with coverage
npm test:coverage

# Run in CI mode
npm test:ci
```

### Test Data Management

#### Fixture Strategy
- **Minimal Fixtures**: Only essential test data
- **Isolated Environments**: Each test runs in isolation
- **Cleanup**: Automatic cleanup after tests
- **Seeding**: Consistent test data seeding

#### Mock Strategy
- **Contract Mocks**: Mock external contracts
- **Service Mocks**: Mock external services
- **Network Mocks**: Mock network conditions
- **Storage Mocks**: Mock storage systems

## Continuous Testing

### CI/CD Pipeline Integration

#### Pipeline Stages
1. **Pre-commit**: Quick lint and unit tests
2. **Pull Request**: Full test suite + security scans
3. **Merge**: Integration tests + performance benchmarks
4. **Deployment**: End-to-end tests in staging
5. **Post-deployment**: Smoke tests in production

#### Test Automation
```yaml
# GitHub Actions example
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test:unit
      - run: npm test:integration
      - run: npm test:security
      - run: npm test:performance
```

### Monitoring and Alerting

#### Test Metrics Monitoring
- **Test Pass Rate**: Percentage of passing tests
- **Test Duration**: Time to run complete test suite
- **Flaky Tests**: Identification of inconsistent tests
- **Coverage Trends**: Test coverage over time

#### Alerting Rules
- **Test Failure**: Immediate alert on test failure
- **Performance Regression**: Alert on performance degradation
- **Coverage Drop**: Alert on significant coverage decrease
- **Security Issue**: Alert on security test failures

---

*Part of Agentic Payment System Module Documentation*