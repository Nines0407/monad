"use strict";
// Shared types for the integration layer
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.IntegrationError = void 0;
// Error types
class IntegrationError extends Error {
    code;
    details;
    statusCode;
    constructor(code, message, details, statusCode = 500) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = statusCode;
        this.name = 'IntegrationError';
    }
}
exports.IntegrationError = IntegrationError;
exports.ErrorCodes = {
    // Payment errors
    PAYMENT_INSUFFICIENT_BUDGET: 'PAYMENT_INSUFFICIENT_BUDGET',
    PAYMENT_RECIPIENT_BLOCKED: 'PAYMENT_RECIPIENT_BLOCKED',
    PAYMENT_CATEGORY_NOT_ALLOWED: 'PAYMENT_CATEGORY_NOT_ALLOWED',
    PAYMENT_AMOUNT_EXCEEDS_LIMIT: 'PAYMENT_AMOUNT_EXCEEDS_LIMIT',
    PAYMENT_REQUIRES_APPROVAL: 'PAYMENT_REQUIRES_APPROVAL',
    // Agent errors
    AGENT_NOT_AUTHORIZED: 'AGENT_NOT_AUTHORIZED',
    AGENT_PERMISSION_DENIED: 'AGENT_PERMISSION_DENIED',
    AGENT_BUDGET_EXCEEDED: 'AGENT_BUDGET_EXCEEDED',
    // Policy errors
    POLICY_EVALUATION_FAILED: 'POLICY_EVALUATION_FAILED',
    POLICY_VIOLATION_DETECTED: 'POLICY_VIOLATION_DETECTED',
    // System errors
    SYSTEM_EMERGENCY_PAUSED: 'SYSTEM_EMERGENCY_PAUSED',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    // Network errors
    NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    // Authentication errors
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    // Database errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    // External service errors
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};
//# sourceMappingURL=types.js.map