#!/usr/bin/env ts-node
/**
 * Health check script for Audit System
 * Based on agent_development_preset.md standards
 */

import { testConnection } from '../src/db';
import * as redis from 'redis';

async function checkDatabase(): Promise<boolean> {
  try {
    const healthy = await testConnection();
    return healthy;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = redis.createClient({ url: redisUrl });

  try {
    await client.connect();
    const pong = await client.ping();
    await client.disconnect();
    return pong === 'PONG';
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
}

async function checkServer(): Promise<boolean> {
  const port = process.env.PORT || 3001;
  const url = `http://localhost:${port}/health`;

  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    return false;
  }
}

async function runHealthChecks() {
  console.log('🏥 Running Audit System health checks...');

  const checks = [
    { name: 'Database', check: checkDatabase },
    { name: 'Redis', check: checkRedis },
    { name: 'API Server', check: checkServer }
  ];

  const results = await Promise.all(
    checks.map(async ({ name, check }) => {
      const healthy = await check();
      return { name, healthy };
    })
  );

  console.log('\n📊 Health Check Results:');
  results.forEach(({ name, healthy }) => {
    console.log(`  ${healthy ? '✅' : '❌'} ${name}: ${healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  });

  const allHealthy = results.every(r => r.healthy);
  
  if (allHealthy) {
    console.log('\n✅ All health checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some health checks failed');
    process.exit(1);
  }
}

runHealthChecks();