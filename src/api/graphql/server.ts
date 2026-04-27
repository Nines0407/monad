import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import resolvers from './resolvers';

// Custom scalar implementations
const scalarResolvers = {
  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => {
      try {
        return JSON.parse(ast.value);
      } catch {
        return ast.value;
      }
    }
  },
  DateTime: {
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value)
  }
};

// Merge scalar resolvers with our main resolvers
const mergedResolvers = {
  ...scalarResolvers,
  ...resolvers
};

// Create Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
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

export default apolloServer;