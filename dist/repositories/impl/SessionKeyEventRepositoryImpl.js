"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionKeyEventRepositoryImpl = void 0;
const BaseRepository_1 = require("./BaseRepository");
class SessionKeyEventRepositoryImpl extends BaseRepository_1.BaseRepository {
    async create(event) {
        const [created] = await this.db('session_key_events')
            .insert({
            ...event,
            permissions_snapshot: JSON.stringify(event.permissions_snapshot)
        })
            .returning('*');
        return this.mapSessionKeyEvent(created);
    }
    async findBySessionKey(sessionKey, options) {
        let query = this.db('session_key_events').where({ session_key: sessionKey });
        if (options?.orderBy) {
            query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
        }
        else {
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
    async findByPaymentId(paymentId) {
        const rows = await this.db('session_key_events')
            .where({ related_payment_id: paymentId })
            .orderBy('created_at', 'desc');
        return rows.map(this.mapSessionKeyEvent);
    }
}
exports.SessionKeyEventRepositoryImpl = SessionKeyEventRepositoryImpl;
//# sourceMappingURL=SessionKeyEventRepositoryImpl.js.map