"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PolicyDecisionRepositoryImpl_1 = require("../../repositories/impl/PolicyDecisionRepositoryImpl");
const router = (0, express_1.Router)();
const repository = new PolicyDecisionRepositoryImpl_1.PolicyDecisionRepositoryImpl();
// Get policy decisions by payment ID
router.get('/payment/:paymentId', async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const decisions = await repository.findByPaymentId(paymentId);
        res.json(decisions);
    }
    catch (error) {
        next(error);
    }
});
// Get policy statistics
router.get('/statistics', async (req, res, next) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            res.status(400).json({ error: 'Missing required query parameters: from and to' });
            return;
        }
        const timeRange = {
            from: new Date(from),
            to: new Date(to)
        };
        const statistics = await repository.getStatistics(timeRange);
        res.json(statistics);
    }
    catch (error) {
        next(error);
    }
});
// Create a new policy decision
router.post('/', async (req, res, next) => {
    try {
        const decision = await repository.create(req.body);
        res.status(201).json(decision);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=policy-decisions.js.map