import { Router } from 'express';
import { AuditRepositoryImpl } from '../../repositories/impl/AuditRepositoryImpl';
import { EventFilter } from '../../models';

const router = Router();
const repository = new AuditRepositoryImpl();

// Get audit events with filtering
router.get('/', async (req, res, next) => {
  try {
    const {
      eventType,
      actorType,
      actorId,
      targetType,
      targetId,
      dateFrom,
      dateTo,
      limit = '100'
    } = req.query;

    const filter: EventFilter = {
      eventType: eventType as any,
      actorType: actorType as any,
      actorId: actorId as string,
      targetType: targetType as string,
      targetId: targetId as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      limit: parseInt(limit as string, 10)
    };

    const events = await repository.getEvents(filter);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Log new audit event
router.post('/', async (req, res, next) => {
  try {
    await repository.logEvent(req.body);
    res.status(201).json({ message: 'Event logged' });
  } catch (error) {
    next(error);
  }
});

// Get system health events
router.get('/system-health', async (_req, res, next) => {
  try {
    const events = await repository.getSystemHealthEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

export default router;