#!/usr/bin/env ts-node
"use strict";
/**
 * Health check script for Audit System
 * Based on agent_development_preset.md standards
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
const db_1 = require("../src/db");
const redis = __importStar(require("redis"));
async function checkDatabase() {
    try {
        const healthy = await (0, db_1.testConnection)();
        return healthy;
    }
    catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
}
async function checkRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = redis.createClient({ url: redisUrl });
    try {
        await client.connect();
        const pong = await client.ping();
        await client.disconnect();
        return pong === 'PONG';
    }
    catch (error) {
        console.error('❌ Redis health check failed:', error);
        return false;
    }
}
async function checkServer() {
    const port = process.env.PORT || 3001;
    const url = `http://localhost:${port}/health`;
    try {
        const response = await fetch(url);
        return response.ok;
    }
    catch (error) {
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
    const results = await Promise.all(checks.map(async ({ name, check }) => {
        const healthy = await check();
        return { name, healthy };
    }));
    console.log('\n📊 Health Check Results:');
    results.forEach(({ name, healthy }) => {
        console.log(`  ${healthy ? '✅' : '❌'} ${name}: ${healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    });
    const allHealthy = results.every(r => r.healthy);
    if (allHealthy) {
        console.log('\n✅ All health checks passed!');
        process.exit(0);
    }
    else {
        console.log('\n❌ Some health checks failed');
        process.exit(1);
    }
}
runHealthChecks();
//# sourceMappingURL=health-check.js.map