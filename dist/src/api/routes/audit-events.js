"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditRepositoryImpl_1 = require("../../repositories/impl/AuditRepositoryImpl");
const router = (0, express_1.Router)();
const repository = new AuditRepositoryImpl_1.AuditRepositoryImpl();
// Get audit events with filtering
router.get('/', async (req, res, next) => {
    try {
        const { eventType, actorType, actorId, targetType, targetId, dateFrom, dateTo, limit = '100' } = req.query;
        const filter = {
            eventType: eventType,
            actorType: actorType,
            actorId: actorId,
            targetType: targetType,
            targetId: targetId,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            limit: parseInt(limit, 10)
        };
        const events = await repository.getEvents(filter);
        res.json(events);
    }
    catch (error) {
        next(error);
    }
});
// Log new audit event
router.post('/', async (req, res, next) => {
    try {
        await repository.logEvent(req.body);
        res.status(201).json({ message: 'Event logged' });
    }
    catch (error) {
        next(error);
    }
});
// Get system health events
router.get('/system-health', async (_req, res, next) => {
    try {
        const events = await repository.getSystemHealthEvents();
        res.json(events);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=audit-events.js.map