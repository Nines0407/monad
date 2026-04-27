import { BaseRepository } from './BaseRepository';
import { PolicyDecision, PolicyDecisionCreate, PolicyStatistics, TimeRange } from '../../models';
import { PolicyDecisionRepository } from '../interfaces';
export declare class PolicyDecisionRepositoryImpl extends BaseRepository implements PolicyDecisionRepository {
    create(decision: PolicyDecisionCreate): Promise<PolicyDecision>;
    findByPaymentId(paymentId: string): Promise<PolicyDecision[]>;
    getStatistics(timeRange: TimeRange): Promise<PolicyStatistics>;
}
//# sourceMappingURL=PolicyDecisionRepositoryImpl.d.ts.map