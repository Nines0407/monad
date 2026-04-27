import { PaymentRequest, Policy, PolicyRule } from '../types';

export class PolicyChecker {

  private budgetCache: Map<string, { amount: bigint; period: string }> = new Map();

  evaluateRequest(request: PaymentRequest, policies: Policy[]): {
    allowed: boolean;
    reason?: string;
    requiresApproval: boolean;
    approvalThreshold?: bigint;
  } {
    // Policies are passed as parameter, not stored
    let allowed = true;
    let requiresApproval = false;
    let approvalThreshold: bigint | undefined;

    // Sort policies by priority (higher priority first)
    const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      for (const rule of policy.rules) {
        const result = this.evaluateRule(rule, request);
        if (!result.allowed) {
          return {
            allowed: false,
            reason: result.reason,
            requiresApproval: false,
          };
        }
        if (result.requiresApproval) {
          requiresApproval = true;
          approvalThreshold = result.approvalThreshold;
        }
      }
    }

    return {
      allowed,
      requiresApproval,
      approvalThreshold,
    };
  }

  checkBudget(request: PaymentRequest, period: 'daily' | 'weekly' | 'monthly'): {
    remaining: bigint;
    exceeded: boolean;
  } {
    const key = `${request.agentId}_${period}`;
    // Note: Cache implementation would check cached value here
    // Period boundaries would be calculated in a real implementation

    // In real implementation, fetch spent amount from database
    const spent = BigInt(0); // Placeholder
    const limit = this.getBudgetLimit(period);

    const remaining = limit - spent;
    const exceeded = request.amount > remaining;

    if (!exceeded) {
      this.budgetCache.set(key, {
        amount: spent + request.amount,
        period: period,
      });
    }

    return { remaining, exceeded };
  }

  validateRecipient(recipient: string, whitelist: string[], blacklist: string[]): boolean {
    if (blacklist.includes(recipient)) {
      return false;
    }
    if (whitelist.length > 0 && !whitelist.includes(recipient)) {
      return false;
    }
    return true;
  }

  getApprovalRequirements(request: PaymentRequest, policies: Policy[]): {
    requiresApproval: boolean;
    threshold?: bigint;
    notifyChannels: string[];
  } {
    const result = this.evaluateRequest(request, policies);
    const notifyChannels: string[] = [];

    // Collect notification channels from manual approval rules
    for (const policy of policies) {
      for (const rule of policy.rules) {
        if (rule.type === 'manual-approval' && request.amount >= rule.threshold) {
          notifyChannels.push(...rule.notifyChannels);
        }
      }
    }

    return {
      requiresApproval: result.requiresApproval,
      threshold: result.approvalThreshold,
      notifyChannels: Array.from(new Set(notifyChannels)),
    };
  }

  simulatePolicy(request: PaymentRequest, policies: Policy[]): {
    allowed: boolean;
    reasons: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const result = this.evaluateRequest(request, policies);
    const reasons: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!result.allowed) {
      reasons.push(result.reason || 'Policy violation');
    }

    if (result.requiresApproval) {
      warnings.push(`Requires manual approval (threshold: ${result.approvalThreshold})`);
      suggestions.push('Consider breaking into smaller transactions');
    }

    // Check budget
    const dailyBudget = this.checkBudget(request, 'daily');
    if (dailyBudget.exceeded) {
      warnings.push(`Daily budget exceeded: ${dailyBudget.remaining} remaining`);
    }

    return {
      allowed: result.allowed,
      reasons,
      warnings,
      suggestions,
    };
  }

  private evaluateRule(rule: PolicyRule, request: PaymentRequest): {
    allowed: boolean;
    reason?: string;
    requiresApproval: boolean;
    approvalThreshold?: bigint;
  } {
    switch (rule.type) {
      case 'amount-limit':
        if (request.amount > rule.maxPerTransaction) {
          return {
            allowed: false,
            reason: `Amount ${request.amount} exceeds per-transaction limit ${rule.maxPerTransaction}`,
            requiresApproval: false,
          };
        }
        // Check daily limit via budget system
        return { allowed: true, requiresApproval: false };

      case 'recipient':
        const valid = this.validateRecipient(request.recipient, rule.whitelist, rule.blacklist);
        return {
          allowed: valid,
          reason: valid ? undefined : `Recipient ${request.recipient} not allowed`,
          requiresApproval: false,
        };

      case 'time-restriction':
        const now = new Date();
        const currentHour = now.getHours();
        const allowed = rule.allowedHours.some(
          ({ start, end }) => currentHour >= start && currentHour <= end
        );
        return {
          allowed,
          reason: allowed ? undefined : `Current time ${currentHour} not in allowed hours`,
          requiresApproval: false,
        };

      case 'token-restriction':
        const tokenAllowed = !request.tokenAddress || rule.allowedTokens.includes(request.tokenAddress);
        return {
          allowed: tokenAllowed,
          reason: tokenAllowed ? undefined : `Token ${request.tokenAddress} not allowed`,
          requiresApproval: false,
        };

      case 'manual-approval':
        const requiresApproval = request.amount >= rule.threshold;
        return {
          allowed: true,
          requiresApproval,
          approvalThreshold: rule.threshold,
        };

      case 'compound':
        // Evaluate sub-rules based on operator
        const subRuleResults = rule.rules.map(subRule => this.evaluateRule(subRule, request));
        if (rule.operator === 'and') {
          const allAllowed = subRuleResults.every(r => r.allowed);
          const anyRequiresApproval = subRuleResults.some(r => r.requiresApproval);
          const maxThreshold = subRuleResults.reduce((max, r) => 
            r.approvalThreshold && r.approvalThreshold > max ? r.approvalThreshold : max, BigInt(0)
          );
          return {
            allowed: allAllowed,
            reason: allAllowed ? undefined : 'Compound AND rule failed',
            requiresApproval: anyRequiresApproval,
            approvalThreshold: maxThreshold > 0 ? maxThreshold : undefined,
          };
        } else if (rule.operator === 'or') {
          const anyAllowed = subRuleResults.some(r => r.allowed);
          const anyRequiresApproval = subRuleResults.some(r => r.requiresApproval);
          const maxThreshold = subRuleResults.reduce((max, r) => 
            r.approvalThreshold && r.approvalThreshold > max ? r.approvalThreshold : max, BigInt(0)
          );
          return {
            allowed: anyAllowed,
            reason: anyAllowed ? undefined : 'Compound OR rule failed',
            requiresApproval: anyRequiresApproval,
            approvalThreshold: maxThreshold > 0 ? maxThreshold : undefined,
          };
        } else if (rule.operator === 'not') {
          // NOT operator expects exactly one sub-rule
          if (subRuleResults.length !== 1) {
            return { allowed: false, reason: 'NOT rule must have exactly one sub-rule', requiresApproval: false };
          }
          const subResult = subRuleResults[0];
          return {
            allowed: !subResult.allowed,
            reason: subResult.allowed ? 'NOT rule disallowed' : undefined,
            requiresApproval: subResult.requiresApproval,
            approvalThreshold: subResult.approvalThreshold,
          };
        }
        break;

      default:
        return { allowed: true, requiresApproval: false };
    }
    
    // Should never reach here
    return { allowed: true, requiresApproval: false };
  }

  // Period calculation methods would be implemented in a real system
  // but are not used in this simplified version

  private getBudgetLimit(period: string): bigint {
    // In real implementation, get from policy rules
    switch (period) {
      case 'daily':
        return BigInt(1000);
      case 'weekly':
        return BigInt(5000);
      case 'monthly':
        return BigInt(20000);
      default:
        return BigInt(0);
    }
  }
}