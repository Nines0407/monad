"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = void 0;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../../knexfile"));
const environment = process.env.NODE_ENV || 'development';
const dbConfig = knexfile_1.default[environment];
// Create Knex instance with connection pooling
const db = (0, knex_1.default)(dbConfig);
// Test connection on startup
async function testConnection() {
    try {
        await db.raw('SELECT 1');
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
exports.testConnection = testConnection;
// Graceful shutdown
async function closeConnection() {
    await db.destroy();
    console.log('Database connection closed');
}
exports.closeConnection = closeConnection;
exports.default = db;
//# sourceMappingURL=index.js.map