"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualApprovalRepositoryImpl = void 0;
const BaseRepository_1 = require("./BaseRepository");
class ManualApprovalRepositoryImpl extends BaseRepository_1.BaseRepository {
    async create(approval) {
        const [created] = await this.db('manual_approvals')
            .insert(approval)
            .returning('*');
        return this.mapManualApproval(created);
    }
    async findByPaymentId(paymentId) {
        const rows = await this.db('manual_approvals')
            .where({ payment_id: paymentId })
            .orderBy('approved_at', 'desc');
        return rows.map(this.mapManualApproval);
    }
    async findByApproverId(approverId, options) {
        let query = this.db('manual_approvals').where({ approver_id: approverId });
        if (options?.orderBy) {
            query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
        }
        else {
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
exports.ManualApprovalRepositoryImpl = ManualApprovalRepositoryImpl;
//# sourceMappingURL=ManualApprovalRepositoryImpl.js.map