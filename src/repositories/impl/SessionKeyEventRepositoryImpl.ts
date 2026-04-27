import { BaseRepository } from './BaseRepository';
import {
  SessionKeyEvent,
  SessionKeyEventCreate,
  QueryOptions
} from '../../models';
import { SessionKeyEventRepository } from '../interfaces';

export class SessionKeyEventRepositoryImpl extends BaseRepository implements SessionKeyEventRepository {
  async create(event: SessionKeyEventCreate): Promise<SessionKeyEvent> {
    const [created] = await this.db('session_key_events')
      .insert({
        ...event,
        permissions_snapshot: JSON.stringify(event.permissions_snapshot)
      })
      .returning('*');

    return this.mapSessionKeyEvent(created);
  }

  async findBySessionKey(sessionKey: string, options?: QueryOptions): Promise<SessionKeyEvent[]> {
    let query = this.db('session_key_events').where({ session_key: sessionKey });

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
    return rows.map(this.mapSessionKeyEvent);
  }

  async findByPaymentId(paymentId: string): Promise<SessionKeyEvent[]> {
    const rows = await this.db('session_key_events')
      .where({ related_payment_id: paymentId })
      .orderBy('created_at', 'desc');

    return rows.map(this.mapSessionKeyEvent);
  }
}