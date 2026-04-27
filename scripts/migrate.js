#!/usr/bin/env ts-node
"use strict";
/**
 * Database migration script for Audit System
 * Usage: ts-node scripts/migrate.ts [up|down|latest|rollback]
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex = __importStar(require("knex"));
const config = __importStar(require("../knexfile"));
async function runMigrations() {
    const command = process.argv[2] || 'latest';
    const environment = process.env.NODE_ENV || 'development';
    console.log(`Running migrations for ${environment} environment...`);
    const db = knex.default(config[environment]);
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
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await db.destroy();
    }
}
runMigrations();
//# sourceMappingURL=migrate.js.map