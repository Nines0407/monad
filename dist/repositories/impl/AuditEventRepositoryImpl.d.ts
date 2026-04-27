import { BaseRepository } from './BaseRepository';
import { AuditEvent, AuditEventCreate, EventFilter } from '../../models';
import { AuditEventRepository } from '../interfaces';
export declare class AuditEventRepositoryImpl extends BaseRepository implements AuditEventRepository {
    logEvent(event: AuditEventCreate): Promise<void>;
    getEvents(filter: EventFilter): Promise<AuditEvent[]>;
    getSystemHealthEvents(): Promise<AuditEvent[]>;
}
//# sourceMappingURL=AuditEventRepositoryImpl.d.ts.map