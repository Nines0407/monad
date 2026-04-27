# Audit System Architecture

## Overview
The Audit System provides complete traceability and explainability for all payment activities in the Agentic Payment System. It captures, stores, and enables querying of payment records, policy decisions, audit events, session key lifecycle events, and manual approvals.

## Database Schema

### Core Tables

#### 1. Payments
Primary payment records with the following structure:
- `id` (UUID) - Primary key
- `transaction_hash` (string) - Blockchain transaction hash
- `task_id` (string) - Task identifier
- `agent_id` (string) - Agent identifier
- `user_id` (UUID) - User identifier
- `amount` (numeric) - Payment amount with 18 decimal precision
- `currency` (string) - Currency code (e.g., USDC)
- `recipient` (string) - Recipient address
- `status` (enum) - Payment status: pending, approved, rejected, executed, failed
- `category` (enum) - Payment category: api, compute, storage, data, service, other
- `reason` (text) - Payment reason/description
- `created_at`, `updated_at`, `executed_at` (timestamps)

#### 2. Policy Decisions
Policy evaluation results for each payment:
- `payment_id` (UUID) - Foreign key to payments
- `policy_id` (string) - Policy identifier
- `decision` (enum) - allow, deny, require_approval
- `evaluated_rules` (jsonb) - Detailed rule evaluations
- `violations` (jsonb) - Specific violations if any

#### 3. Audit Events
System-wide audit trail:
- `event_type` (enum) - Type of event (payment_created, policy_updated, etc.)
- `actor_type` (enum) - agent, user, system
- `actor_id` (string) - Actor identifier
- `target_type`, `target_id` (string) - Target of the event
- `metadata` (jsonb) - Additional event data

#### 4. Session Key Events
Session key lifecycle tracking:
- `session_key` (string) - Session key identifier
- `event_type` (enum) - registered, used, revoked, expired
- `permissions_snapshot` (jsonb) - Permissions at time of event
- `related_payment_id` (UUID) - Associated payment (if any)

#### 5. Manual Approvals
Manual approval decisions:
- `payment_id` (UUID) - Foreign key to payments
- `approver_id` (UUID) - Approver identifier
- `decision` (enum) - approved, rejected
- `reason` (text) - Approval reason

## Performance Optimizations

### Indexing Strategy
- Primary keys on all tables
- Composite indexes for common query patterns:
  - `payments(user_id, created_at)` - User payment history
  - `payments(agent_id, created_at)` - Agent payment history
  - `payments(status, created_at)` - Status-based queries
  - `audit_events(created_at)` - Time-based event queries
- Full-text search index on `payments.reason`

### Partitioning
- Payments table partitioned monthly for time-series data
- Audit events table optimized with TimescaleDB extension

### Caching
- Redis caching for frequently accessed payment records
- Materialized views for dashboard statistics

## Data Flow

1. **Payment Creation**: Client application creates payment record
2. **Policy Evaluation**: Policy engine evaluates and logs decision
3. **Event Logging**: System components log relevant audit events
4. **Session Key Tracking**: Key manager logs key lifecycle events
5. **Manual Approval**: Approval system records manual decisions
6. **Query & Export**: Users query and export audit data via API

## Scalability Considerations

### Horizontal Scaling
- Database read replicas for analytics queries
- User-based sharding for large deployments
- Connection pooling with configurable pool sizes

### Data Retention
- Hot storage: Last 90 days of data
- Warm storage: 90 days to 2 years (compressed)
- Cold storage: Archived data beyond 2 years

## Security

### Access Control
- Role-based access (admin, auditor, user)
- JWT-based authentication
- API rate limiting

### Data Protection
- Encryption at rest for sensitive fields
- Audit trail for audit system itself
- Regular backup and recovery testing

## Integration Points

### Internal Integrations
- Payment execution system
- Policy engine
- Session key manager
- User authentication system

### External APIs
- REST API for CRUD operations
- GraphQL API for flexible queries
- WebSocket API for real-time updates
- Webhook support for external systems