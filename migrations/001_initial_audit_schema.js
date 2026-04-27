/**
 * Initial audit system schema
 * Includes: payments, policy_decisions, audit_events, session_key_events, manual_approvals
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('payments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('transaction_hash').index();
      table.string('task_id').index();
      table.string('agent_id').index();
      table.uuid('user_id').notNullable();
      table.decimal('amount', 36, 18).notNullable(); // Supports large numbers with 18 decimals
      table.string('currency').notNullable();
      table.string('recipient').notNullable();
      table.enum('status', ['pending', 'approved', 'rejected', 'executed', 'failed']).notNullable().defaultTo('pending');
      table.enum('category', ['api', 'compute', 'storage', 'data', 'service', 'other']).notNullable().defaultTo('other');
      table.text('reason');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('executed_at');
      
      // Composite indexes for common queries
      table.index(['user_id', 'created_at']);
      table.index(['agent_id', 'created_at']);
      table.index(['status', 'created_at']);
      table.index(['category', 'created_at']);
    })
    .createTable('policy_decisions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('payment_id').notNullable().references('id').inTable('payments').onDelete('CASCADE');
      table.string('policy_id').notNullable();
      table.enum('decision', ['allow', 'deny', 'require_approval']).notNullable();
      table.jsonb('evaluated_rules').notNullable().defaultTo('[]');
      table.jsonb('violations').defaultTo('[]');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['payment_id']);
      table.index(['policy_id']);
      table.index(['decision']);
    })
    .createTable('audit_events', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.enum('event_type', [
        'payment_created', 'policy_updated', 'key_registered', 'emergency_paused',
        'user_login', 'permission_changed', 'system_alert', 'export_generated'
      ]).notNullable();
      table.enum('actor_type', ['agent', 'user', 'system']).notNullable();
      table.string('actor_id').notNullable();
      table.string('target_type');
      table.string('target_id');
      table.jsonb('metadata').defaultTo('{}');
      table.timestamp('created_at').defaultTo(knex.fn.now()).index();
      
      // Indexes for common query patterns
      table.index(['event_type', 'created_at']);
      table.index(['actor_type', 'actor_id']);
      table.index(['target_type', 'target_id']);
    })
    .createTable('session_key_events', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('session_key').notNullable().index();
      table.enum('event_type', ['registered', 'used', 'revoked', 'expired']).notNullable();
      table.jsonb('permissions_snapshot').notNullable().defaultTo('{}');
      table.uuid('related_payment_id').references('id').inTable('payments').onDelete('SET NULL');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['session_key', 'created_at']);
      table.index(['event_type']);
      table.index(['related_payment_id']);
    })
    .createTable('manual_approvals', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('payment_id').notNullable().references('id').inTable('payments').onDelete('CASCADE');
      table.uuid('approver_id').notNullable(); // References users table (to be defined)
      table.enum('decision', ['approved', 'rejected']).notNullable();
      table.text('reason');
      table.timestamp('approved_at').defaultTo(knex.fn.now());
      
      table.index(['payment_id']);
      table.index(['approver_id']);
      table.index(['decision']);
    })
    .then(() => {
      // Create full-text search index on payments.reason
      return knex.raw(`
        CREATE INDEX payments_reason_fts_idx ON payments 
        USING gin(to_tsvector('english', reason));
      `);
    })
    .then(() => {
      // Create index for JSONB queries
      return knex.raw(`
        CREATE INDEX policy_decisions_rules_idx ON policy_decisions 
        USING gin(evaluated_rules);
      `);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('manual_approvals')
    .dropTableIfExists('session_key_events')
    .dropTableIfExists('audit_events')
    .dropTableIfExists('policy_decisions')
    .dropTableIfExists('payments');
};