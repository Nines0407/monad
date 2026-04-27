"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditRepositoryImpl_1 = require("../../repositories/impl/AuditRepositoryImpl");
const router = (0, express_1.Router)();
const repository = new AuditRepositoryImpl_1.AuditRepositoryImpl();
// Get all payments with pagination and filtering
router.get('/', async (req, res, next) => {
    try {
        const { userId, agentId, taskId, status, category, dateFrom, dateTo, minAmount, maxAmount, recipient, page = '1', limit = '50', orderBy = 'created_at', orderDirection = 'desc' } = req.query;
        const criteria = {
            userId: userId,
            agentId: agentId,
            taskId: taskId,
            status: status,
            category: category,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            minAmount: minAmount,
            maxAmount: maxAmount,
            recipient: recipient
        };
        const options = {
            limit: parseInt(limit, 10),
            offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            orderBy: orderBy,
            orderDirection: orderDirection
        };
        const result = await repository.search(criteria, options);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get payment by ID
router.get('/:id', async (req, res, next) => {
    try {
        const payment = await repository.findById(req.params.id);
        if (!payment) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        next(error);
    }
});
// Create new payment
router.post('/', async (req, res, next) => {
    try {
        const payment = await repository.create(req.body);
        res.status(201).json(payment);
    }
    catch (error) {
        next(error);
    }
});
// Update payment status
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ error: 'Status is required' });
            return;
        }
        await repository.updateStatus(req.params.id, status);
        res.status(200).json({ message: 'Status updated' });
    }
    catch (error) {
        next(error);
    }
});
// Get payments by task ID
router.get('/task/:taskId', async (req, res, next) => {
    try {
        const payments = await repository.findByTaskId(req.params.taskId);
        res.json(payments);
    }
    catch (error) {
        next(error);
    }
});
// Get payments by agent ID
router.get('/agent/:agentId', async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const options = {
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined
        };
        const payments = await repository.findByAgentId(req.params.agentId, options);
        res.json(payments);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map