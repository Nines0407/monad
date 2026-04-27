import { BaseRepository } from './BaseRepository';
import { ManualApproval, ManualApprovalCreate, QueryOptions } from '../../models';
import { ManualApprovalRepository } from '../interfaces';
export declare class ManualApprovalRepositoryImpl extends BaseRepository implements ManualApprovalRepository {
    create(approval: ManualApprovalCreate): Promise<ManualApproval>;
    findByPaymentId(paymentId: string): Promise<ManualApproval[]>;
    findByApproverId(approverId: string, options?: QueryOptions): Promise<ManualApproval[]>;
}
//# sourceMappingURL=ManualApprovalRepositoryImpl.d.ts.map