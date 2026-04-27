"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEventRepositoryImpl = void 0;
const BaseRepository_1 = require("./BaseRepository");
class AuditEventRepositoryImpl extends BaseRepository_1.BaseRepository {
    async logEvent(event) {
        await this.db('audit_events').insert({
            ...event,
            metadata: JSON.stringify(event.metadata || {})
        });
    }
    async getEvents(filter) {
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
    async getSystemHealthEvents() {
        const rows = await this.db('audit_events')
            .whereIn('event_type', ['system_alert', 'emergency_paused'])
            .orderBy('created_at', 'desc')
            .limit(100);
        return rows.map(this.mapAuditEvent);
    }
}
exports.AuditEventRepositoryImpl = AuditEventRepositoryImpl;
//# sourceMappingURL=AuditEventRepositoryImpl.js.map