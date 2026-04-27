import { BaseRepository } from './BaseRepository';
import {
  Payment,
  PaymentCreate,
  PaymentSearchCriteria,
  PaymentSearchResult,
  QueryOptions,
  PaymentStatus,
  ExportResult
} from '../../models';
import { PaymentRepository } from '../interfaces';

export class PaymentRepositoryImpl extends BaseRepository implements PaymentRepository {
  async create(payment: PaymentCreate): Promise<Payment> {
    const [created] = await this.db('payments')
      .insert({
        ...payment,
        status: payment.status || 'pending',
        category: payment.category || 'other'
      })
      .returning('*');

    return this.mapPayment(created);
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.db('payments').where({ id }).first();
    return row ? this.mapPayment(row) : null;
  }

  async findByTaskId(taskId: string): Promise<Payment[]> {
    const rows = await this.db('payments')
      .where({ task_id: taskId })
      .orderBy('created_at', 'desc');

    return rows.map(this.mapPayment);
  }

  async findByAgentId(agentId: string, options?: QueryOptions): Promise<Payment[]> {
    let query = this.db('payments').where({ agent_id: agentId });

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    return rows.map(this.mapPayment);
  }

  async findByUserId(userId: string, options?: QueryOptions): Promise<Payment[]> {
    let query = this.db('payments').where({ user_id: userId });

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    return rows.map(this.mapPayment);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    await this.db('payments')
      .where({ id })
      .update({
        status,
        updated_at: this.db.fn.now(),
        ...(status === 'executed' ? { executed_at: this.db.fn.now() } : {})
      });
  }

  async search(criteria: PaymentSearchCriteria, options?: QueryOptions): Promise<PaymentSearchResult> {
    let query = this.db('payments');
    
    // Apply filters
    if (criteria.userId) {
      query = query.where({ user_id: criteria.userId });
    }
    if (criteria.agentId) {
      query = query.where({ agent_id: criteria.agentId });
    }
    if (criteria.taskId) {
      query = query.where({ task_id: criteria.taskId });
    }
    if (criteria.status) {
      query = query.where({ status: criteria.status });
    }
    if (criteria.category) {
      query = query.where({ category: criteria.category });
    }
    if (criteria.dateFrom) {
      query = query.where('created_at', '>=', criteria.dateFrom);
    }
    if (criteria.dateTo) {
      query = query.where('created_at', '<=', criteria.dateTo);
    }
    if (criteria.minAmount) {
      query = query.where('amount', '>=', criteria.minAmount);
    }
    if (criteria.maxAmount) {
      query = query.where('amount', '<=', criteria.maxAmount);
    }
    if (criteria.recipient) {
      query = query.where('recipient', 'like', `%${criteria.recipient}%`);
    }

    // Get total count
    const countResult = await query.clone().count('* as total').first();
    const total = parseInt(countResult?.total as string, 10) || 0;

    // Apply ordering and pagination
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    const pageSize = options?.limit || 50;
    const page = options?.offset ? Math.floor(options.offset / pageSize) + 1 : 1;
    
    query = query.limit(pageSize);
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const rows = await query;
    const payments = rows.map(this.mapPayment);

    return {
      payments,
      total,
      page,
      pageSize
    };
  }

  async export(criteria: PaymentSearchCriteria): Promise<ExportResult> {
    const payments = await this.search(criteria, { limit: 100000 }); // Max export limit
    return {
      data: payments.payments,
      format: 'json',
      exportedAt: new Date(),
      recordCount: payments.payments.length,
      metadata: {
        criteria,
        total: payments.total,
        page: payments.page,
        pageSize: payments.pageSize,
      }
    };
  }
}