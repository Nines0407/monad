export declare abstract class BaseRepository {
    protected db: import("knex").Knex<any, any[]>;
    protected withTransaction<T>(callback: (trx: any) => Promise<T>): Promise<T>;
    protected mapPayment(row: any): any;
    protected mapPolicyDecision(row: any): any;
    protected mapAuditEvent(row: any): any;
    protected mapSessionKeyEvent(row: any): any;
    protected mapManualApproval(row: any): any;
    protected buildWhereClause(query: any, filters: Record<string, any>, columnMapping?: Record<string, string>): any;
}
//# sourceMappingURL=BaseRepository.d.ts.map