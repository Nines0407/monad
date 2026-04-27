"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const db_1 = __importDefault(require("../../db"));
class BaseRepository {
    db = db_1.default;
    async withTransaction(callback) {
        return this.db.transaction(callback);
    }
    mapPayment(row) {
        return {
            ...row,
            amount: row.amount.toString(),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            executed_at: row.executed_at ? new Date(row.executed_at) : undefined
        };
    }
    mapPolicyDecision(row) {
        return {
            ...row,
            evaluated_rules: typeof row.evaluated_rules === 'string'
                ? JSON.parse(row.evaluated_rules)
                : row.evaluated_rules,
            violations: typeof row.violations === 'string'
                ? JSON.parse(row.violations)
                : row.violations,
            created_at: new Date(row.created_at)
        };
    }
    mapAuditEvent(row) {
        return {
            ...row,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
            created_at: new Date(row.created_at)
        };
    }
    mapSessionKeyEvent(row) {
        return {
            ...row,
            permissions_snapshot: typeof row.permissions_snapshot === 'string'
                ? JSON.parse(row.permissions_snapshot)
                : row.permissions_snapshot,
            created_at: new Date(row.created_at)
        };
    }
    mapManualApproval(row) {
        return {
            ...row,
            approved_at: new Date(row.approved_at)
        };
    }
    buildWhereClause(query, filters, columnMapping = {}) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const column = columnMapping[key] || key;
                if (Array.isArray(value)) {
                    query.whereIn(column, value);
                }
                else if (typeof value === 'string' && value.includes('%')) {
                    query.where(column, 'like', value);
                }
                else {
                    query.where(column, value);
                }
            }
        });
        return query;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map