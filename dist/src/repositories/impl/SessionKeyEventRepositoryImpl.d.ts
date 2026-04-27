import { BaseRepository } from './BaseRepository';
import { SessionKeyEvent, SessionKeyEventCreate, QueryOptions } from '../../models';
import { SessionKeyEventRepository } from '../interfaces';
export declare class SessionKeyEventRepositoryImpl extends BaseRepository implements SessionKeyEventRepository {
    create(event: SessionKeyEventCreate): Promise<SessionKeyEvent>;
    findBySessionKey(sessionKey: string, options?: QueryOptions): Promise<SessionKeyEvent[]>;
    findByPaymentId(paymentId: string): Promise<SessionKeyEvent[]>;
}
//# sourceMappingURL=SessionKeyEventRepositoryImpl.d.ts.map