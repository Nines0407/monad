import { BaseRepository } from './BaseRepository';
import {
  PolicyDecision,
  PolicyDecisionCreate,
  PolicyStatistics,
  TimeRange
} from '../../models';
import { PolicyDecisionRepository } from '../interfaces';

export class PolicyDecisionRepositoryImpl extends BaseRepository implements PolicyDecisionRepository {
  async create(decision: PolicyDecisionCreate): Promise<PolicyDecision> {
    const [created] = await this.db('policy_decisions')
      .insert({
        ...decision,
        evaluated_rules: JSON.stringify(decision.evaluated_rules),
        violations: JSON.stringify(decision.violations || [])
      })
      .returning('*');

    return this.mapPolicyDecision(created);
  }

  async findByPaymentId(paymentId: string): Promise<PolicyDecision[]> {
    const rows = await this.db('policy_decisions')
      .where({ payment_id: paymentId })
      .orderBy('created_at', 'desc');

    return rows.map(this.mapPolicyDecision);
  }

  async getStatistics(timeRange: TimeRange): Promise<PolicyStatistics> {
    const decisions = await this.db('policy_decisions')
      .whereBetween('created_at', [timeRange.from, timeRange.to]);

    const totalDecisions = decisions.length;
    const allowed = decisions.filter(d => d.decision === 'allow').length;
    const denied = decisions.filter(d => d.decision === 'deny').length;
    const requireApproval = decisions.filter(d => d.decision === 'require_approval').length;

    // Extract common violations
    const violationMap = new Map<string, number>();
    decisions.forEach(decision => {
      const violations = typeof decision.violations === 'string' 
        ? JSON.parse(decision.violations) 
        : decision.violations;
      
      violations.forEach((violation: any) => {
        const rule = violation.rule || violation.message;
        violationMap.set(rule, (violationMap.get(rule) || 0) + 1);
      });
    });

    const commonViolations = Array.from(violationMap.entries())
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalDecisions,
      allowed,
      denied,
      requireApproval,
      commonViolations
    };
  }
}