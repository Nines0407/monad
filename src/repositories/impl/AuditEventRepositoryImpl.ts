import { BaseRepository } from './BaseRepository';
import {
  AuditEvent,
  AuditEventCreate,
  EventFilter
} from '../../models';
import { AuditEventRepository } from '../interfaces';

export class AuditEventRepositoryImpl extends BaseRepository implements AuditEventRepository {
  async logEvent(event: AuditEventCreate): Promise<void> {
    await this.db('audit_events').insert({
      ...event,
      metadata: JSON.stringify(event.metadata || {})
    });
  }

  async getEvents(filter: EventFilter): Promise<AuditEvent[]> {
    let query = this.db('audit_events');

    if (filter.eventType) {
      query = query.where({ event_type: filter.eventType });
    }
    if (filter.actorType) {
      query = query.where({ actor_type: filter.actorType });
    }
    if (filter.actorId) {
      query = query.where({ actor_id: filter.actorId });
    }
    if (filter.targetType) {
      query = query.where({ target_type: filter.targetType });
    }
    if (filter.targetId) {
      query = query.where({ target_id: filter.targetId });
    }
    if (filter.dateFrom) {
      query = query.where('created_at', '>=', filter.dateFrom);
    }
    if (filter.dateTo) {
      query = query.where('created_at', '<=', filter.dateTo);
    }

    query = query.orderBy('created_at', 'desc');

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const rows = await query;
    return rows.map(this.mapAuditEvent);
  }

  async getSystemHealthEvents(): Promise<AuditEvent[]> {
    const rows = await this.db('audit_events')
      .whereIn('event_type', ['system_alert', 'emergency_paused'])
      .orderBy('created_at', 'desc')
      .limit(100);

    return rows.map(this.mapAuditEvent);
  }
}