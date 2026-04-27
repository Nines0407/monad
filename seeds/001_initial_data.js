/**
 * Seed initial data for Audit System development and testing
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('manual_approvals').del();
  await knex('session_key_events').del();
  await knex('audit_events').del();
  await knex('policy_decisions').del();
  await knex('payments').del();

  // Insert sample payments
  const paymentIds = await knex('payments').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      transaction_hash: '0x1234567890abcdef',
      task_id: 'task_001',
      agent_id: 'agent_claude',
      user_id: 'user_001',
      amount: '100.50',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBc8',
      status: 'executed',
      category: 'api',
      reason: 'Payment for OpenAI API usage',
      created_at: knex.fn.now(),
      executed_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      transaction_hash: '0xabcdef1234567890',
      task_id: 'task_002',
      agent_id: 'agent_openclaw',
      user_id: 'user_002',
      amount: '250.00',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBc9',
      status: 'approved',
      category: 'compute',
      reason: 'AWS EC2 instance for model training',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      transaction_hash: '0xfedcba0987654321',
      task_id: 'task_003',
      agent_id: 'agent_codex',
      user_id: 'user_001',
      amount: '50.25',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBcA',
      status: 'rejected',
      category: 'storage',
      reason: 'S3 storage costs - exceeded budget',
      created_at: knex.fn.now()
    }
  ]).returning('id');

  // Insert policy decisions
  await knex('policy_decisions').insert([
    {
      payment_id: '550e8400-e29b-41d4-a716-446655440000',
      policy_id: 'budget_policy',
      decision: 'allow',
      evaluated_rules: JSON.stringify([
        { rule: 'daily_limit', passed: true, value: '100.50', limit: '1000.00' },
        { rule: 'recipient_whitelist', passed: true, recipient: '0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBc8' }
      ]),
      violations: JSON.stringify([])
    },
    {
      payment_id: '550e8400-e29b-41d4-a716-446655440001',
      policy_id: 'budget_policy',
      decision: 'require_approval',
      evaluated_rules: JSON.stringify([
        { rule: 'daily_limit', passed: true, value: '250.00', limit: '1000.00' },
        { rule: 'single_transaction_limit', passed: false, value: '250.00', limit: '200.00' }
      ]),
      violations: JSON.stringify([
        { rule: 'single_transaction_limit', message: 'Exceeds single transaction limit of 200 USDC' }
      ])
    },
    {
      payment_id: '550e8400-e29b-41d4-a716-446655440002',
      policy_id: 'budget_policy',
      decision: 'deny',
      evaluated_rules: JSON.stringify([
        { rule: 'daily_limit', passed: false, value: '50.25', limit: '40.00' }
      ]),
      violations: JSON.stringify([
        { rule: 'daily_limit', message: 'Exceeds daily limit of 40 USDC' }
      ])
    }
  ]);

  // Insert audit events
  await knex('audit_events').insert([
    {
      event_type: 'payment_created',
      actor_type: 'agent',
      actor_id: 'agent_claude',
      target_type: 'payment',
      target_id: '550e8400-e29b-41d4-a716-446655440000',
      metadata: JSON.stringify({ amount: '100.50', currency: 'USDC' })
    },
    {
      event_type: 'policy_updated',
      actor_type: 'user',
      actor_id: 'user_001',
      target_type: 'policy',
      target_id: 'budget_policy',
      metadata: JSON.stringify({ change: 'daily_limit increased to 1000' })
    },
    {
      event_type: 'key_registered',
      actor_type: 'system',
      actor_id: 'key_manager',
      target_type: 'session_key',
      target_id: 'key_001',
      metadata: JSON.stringify({ permissions: ['payment_create'] })
    }
  ]);

  // Insert session key events
  await knex('session_key_events').insert([
    {
      session_key: '0xsessionkey123',
      event_type: 'registered',
      permissions_snapshot: JSON.stringify({
        maxAmount: '1000.00',
        allowedRecipients: ['0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBc8'],
        expiry: '2024-12-31T23:59:59Z'
      }),
      related_payment_id: '550e8400-e29b-41d4-a716-446655440000'
    },
    {
      session_key: '0xsessionkey456',
      event_type: 'used',
      permissions_snapshot: JSON.stringify({
        maxAmount: '500.00',
        allowedRecipients: ['0x742d35Cc6634C0532925a3b844Bc9e90F1b6fBc9'],
        expiry: '2024-12-31T23:59:59Z'
      }),
      related_payment_id: '550e8400-e29b-41d4-a716-446655440001'
    }
  ]);

  // Insert manual approvals
  await knex('manual_approvals').insert([
    {
      payment_id: '550e8400-e29b-41d4-a716-446655440001',
      approver_id: 'user_admin_001',
      decision: 'approved',
      reason: 'Approved after review, special project budget allocated'
    }
  ]);

  console.log('✅ Sample audit data seeded successfully');
};