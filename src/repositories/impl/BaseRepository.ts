import db from '../../db';

export abstract class BaseRepository {
  protected db = db;

  protected async withTransaction<T>(callback: (trx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  protected mapPayment(row: any): any {
    return {
      ...row,
      amount: row.amount.toString(),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      executed_at: row.executed_at ? new Date(row.executed_at) : undefined
    };
  }

  protected mapPolicyDecision(row: any): any {
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

  protected mapAuditEvent(row: any): any {
    return {
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      created_at: new Date(row.created_at)
    };
  }

  protected mapSessionKeyEvent(row: any): any {
    return {
      ...row,
      permissions_snapshot: typeof row.permissions_snapshot === 'string'
        ? JSON.parse(row.permissions_snapshot)
        : row.permissions_snapshot,
      created_at: new Date(row.created_at)
    };
  }

  protected mapManualApproval(row: any): any {
    return {
      ...row,
      approved_at: new Date(row.approved_at)
    };
  }

  protected buildWhereClause(
    query: any,
    filters: Record<string, any>,
    columnMapping: Record<string, string> = {}
  ): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const column = columnMapping[key] || key;
        if (Array.isArray(value)) {
          query.whereIn(column, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query.where(column, 'like', value);
        } else {
          query.where(column, value);
        }
      }
    });
    return query;
  }
}