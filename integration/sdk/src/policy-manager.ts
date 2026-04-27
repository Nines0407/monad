import { AxiosInstance } from 'axios';
import { PolicyEvaluation, PolicyRule, PolicyViolation, IntegrationError, ErrorCodes } from '@agent-pay/shared';

export interface Policy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  rules: PolicyRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyUpdate {
  name?: string;
  description?: string;
  enabled?: boolean;
  priority?: number;
  rules?: PolicyRule[];
}

export interface PolicyEvaluationRequest {
  amount: string;
  currency: string;
  recipient: string;
  category: string;
  agentId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class PolicyManager {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Get all policies
   */
  async getAllPolicies(): Promise<Policy[]> {
    try {
      const response = await this.axiosInstance.get<Policy[]>('/api/v1/policies');
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get policies',
        { originalError: error }
      );
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicy(policyId: string): Promise<Policy> {
    try {
      const response = await this.axiosInstance.get<Policy>(`/api/v1/policies/${policyId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get policy',
        { policyId, originalError: error }
      );
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    try {
      const response = await this.axiosInstance.post<Policy>('/api/v1/policies', policy);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to create policy',
        { policy, originalError: error }
      );
    }
  }

  /**
   * Update a policy
   */
  async updatePolicy(policyId: string, updates: PolicyUpdate): Promise<Policy> {
    try {
      const response = await this.axiosInstance.put<Policy>(`/api/v1/policies/${policyId}`, updates);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to update policy',
        { policyId, updates, originalError: error }
      );
    }
  }

  /**
   * Delete a policy
   */
  async deletePolicy(policyId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.axiosInstance.delete(`/api/v1/policies/${policyId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to delete policy',
        { policyId, originalError: error }
      );
    }
  }

  /**
   * Enable a policy
   */
  async enablePolicy(policyId: string): Promise<Policy> {
    return this.updatePolicy(policyId, { enabled: true });
  }

  /**
   * Disable a policy
   */
  async disablePolicy(policyId: string): Promise<Policy> {
    return this.updatePolicy(policyId, { enabled: false });
  }

  /**
   * Evaluate policies for a payment request
   */
  async evaluatePolicies(request: PolicyEvaluationRequest): Promise<PolicyEvaluation[]> {
    try {
      const response = await this.axiosInstance.post<PolicyEvaluation[]>('/api/v1/policies/evaluate', request);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to evaluate policies',
        { request, originalError: error }
      );
    }
  }

  /**
   * Get policy statistics
   */
  async getStatistics(options: {
    startDate?: Date;
    endDate?: Date;
    policyId?: string;
  } = {}): Promise<{
    totalEvaluations: number;
    allowed: number;
    denied: number;
    requireApproval: number;
    averageEvaluationTime: number;
    mostActivePolicies: Array<{ policyId: string; name: string; evaluationCount: number }>;
  }> {
    try {
      const params: Record<string, any> = {};
      if (options.startDate) params.startDate = options.startDate.toISOString();
      if (options.endDate) params.endDate = options.endDate.toISOString();
      if (options.policyId) params.policyId = options.policyId;

      const response = await this.axiosInstance.get('/api/v1/policies/statistics', { params });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get policy statistics',
        { options, originalError: error }
      );
    }
  }

  /**
   * Check if a payment would be allowed
   */
  async wouldAllow(request: PolicyEvaluationRequest): Promise<{
    allowed: boolean;
    requiresApproval: boolean;
    evaluations: PolicyEvaluation[];
    violations: PolicyViolation[];
  }> {
    const evaluations = await this.evaluatePolicies(request);
    
    const violations = evaluations.flatMap(eval => eval.violations);
    const requiresApproval = evaluations.some(eval => eval.decision === 'require_approval');
    const denied = evaluations.some(eval => eval.decision === 'deny');
    const allowed = !denied && !requiresApproval;

    return {
      allowed,
      requiresApproval,
      evaluations,
      violations,
    };
  }

  /**
   * Validate a policy rule
   */
  validateRule(rule: Partial<PolicyRule>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id || rule.id.trim().length === 0) {
      errors.push('Rule ID is required');
    }

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.condition || rule.condition.trim().length === 0) {
      errors.push('Rule condition is required');
    }

    if (!rule.action || !['allow', 'deny', 'require_approval'].includes(rule.action)) {
      errors.push('Rule action must be one of: allow, deny, require_approval');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a full policy
   */
  validatePolicy(policy: Partial<Policy>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required');
    }

    if (!policy.rules || policy.rules.length === 0) {
      errors.push('Policy must have at least one rule');
    } else {
      policy.rules.forEach((rule, index) => {
        const ruleValidation = this.validateRule(rule);
        if (!ruleValidation.valid) {
          ruleValidation.errors.forEach(error => {
            errors.push(`Rule ${index + 1} (${rule.id || 'unnamed'}): ${error}`);
          });
        }
      });
    }

    if (policy.priority !== undefined && (policy.priority < 1 || policy.priority > 100)) {
      errors.push('Policy priority must be between 1 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}