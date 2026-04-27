import { BaseRepository } from './BaseRepository';
import {
  ManualApproval,
  ManualApprovalCreate,
  QueryOptions
} from '../../models';
import { ManualApprovalRepository } from '../interfaces';

export class ManualApprovalRepositoryImpl extends BaseRepository implements ManualApprovalRepository {
  async create(approval: ManualApprovalCreate): Promise<ManualApproval> {
    const [created] = await this.db('manual_approvals')
      .insert(approval)
      .returning('*');

    return this.mapManualApproval(created);
  }

  async findByPaymentId(paymentId: string): Promise<ManualApproval[]> {
    const rows = await this.db('manual_approvals')
      .where({ payment_id: paymentId })
      .orderBy('approved_at', 'desc');

    return rows.map(this.mapManualApproval);
  }

  async findByApproverId(approverId: string, options?: QueryOptions): Promise<ManualApproval[]> {
    let query = this.db('manual_approvals').where({ approver_id: approverId });

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    } else {
      query = query.orderBy('approved_at', 'desc');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    return rows.map(this.mapManualApproval);
  }
}