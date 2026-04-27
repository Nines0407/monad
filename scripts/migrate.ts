#!/usr/bin/env ts-node
/**
 * Database migration script for Audit System
 * Usage: ts-node scripts/migrate.ts [up|down|latest|rollback]
 */

import * as knex from 'knex';
import * as config from '../knexfile';

async function runMigrations() {
  const command = process.argv[2] || 'latest';
  const environment = process.env.NODE_ENV || 'development';
  
  console.log(`Running migrations for ${environment} environment...`);
  
  const db = knex.default(config[environment as keyof typeof config]);
  
  try {
    switch (command) {
      case 'up':
        await db.migrate.up();
        console.log('✅ Migrations applied successfully');
        break;
      case 'down':
        await db.migrate.down();
        console.log('✅ Migrations rolled back successfully');
        break;
      case 'latest':
        await db.migrate.latest();
        console.log('✅ Migrations up to date');
        break;
      case 'rollback':
        await db.migrate.rollback();
        console.log('✅ Migrations rolled back');
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Available commands: up, down, latest, rollback');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();