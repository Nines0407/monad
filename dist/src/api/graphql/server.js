"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("./schema");
const resolvers_1 = __importDefault(require("./resolvers"));
// Custom scalar implementations
const scalarResolvers = {
    JSON: {
        serialize: (value) => value,
        parseValue: (value) => value,
        parseLiteral: (ast) => {
            try {
                return JSON.parse(ast.value);
            }
            catch {
                return ast.value;
            }
        }
    },
    DateTime: {
        serialize: (value) => value.toISOString(),
        parseValue: (value) => new Date(value),
        parseLiteral: (ast) => new Date(ast.value)
    }
};
// Merge scalar resolvers with our main resolvers
const mergedResolvers = {
    ...scalarResolvers,
    ...resolvers_1.default
};
// Create Apollo Server instance
const apolloServer = new apollo_server_express_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: mergedResolvers,
    context: ({ req }) => ({
        // Add authentication context here if needed
        auth: req.headers.authorization
    }),
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        // Don't expose internal error details in production
        if (process.env.NODE_ENV === 'production') {
            return {
                message: 'Internal server error',
                locations: error.locations,
                path: error.path
            };
        }
        return error;
    }
});
exports.default = apolloServer;
//# sourceMappingURL=server.js.map