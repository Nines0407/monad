import { BaseRepository } from './BaseRepository';
import { Payment, PaymentCreate, PaymentSearchCriteria, PaymentSearchResult, QueryOptions, PaymentStatus } from '../../models';
import { PaymentRepository } from '../interfaces';
export declare class PaymentRepositoryImpl extends BaseRepository implements PaymentRepository {
    create(payment: PaymentCreate): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByTaskId(taskId: string): Promise<Payment[]>;
    findByAgentId(agentId: string, options?: QueryOptions): Promise<Payment[]>;
    findByUserId(userId: string, options?: QueryOptions): Promise<Payment[]>;
    updateStatus(id: string, status: PaymentStatus): Promise<void>;
    search(criteria: PaymentSearchCriteria, options?: QueryOptions): Promise<PaymentSearchResult>;
    export(criteria: PaymentSearchCriteria): Promise<any>;
}
//# sourceMappingURL=PaymentRepositoryImpl.d.ts.map