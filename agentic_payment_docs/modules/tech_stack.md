# Technology Stack

## Primary Development Tools (First Step Installation)

### MonSkill - Official Monad AI Development Skill
- **Purpose**: Provides essential context and tooling for Monad development
- **Features**:
  - Monad chain configuration (testnet/mainnet)
  - Smart contract templates and examples
  - Deployment scripts and utilities
  - SDK and API documentation
  - Common patterns and best practices
- **Installation**: https://skills.devnads.com/
- **Supported Environments**: Claude Code, Cursor, Windsurf, and other AI Agent development environments

## Core Dependencies

### MPP (Monad Payment Protocol)
- **Purpose**: Core payment functionality for Monad chain
- **Key Features**:
  - Native payment execution
  - Cross-asset payments
  - Batch payments
  - Payment scheduling
- **Documentation**: https://mpp.dev/
- **TypeScript SDK**: https://github.com/monad-crypto/monad-ts/tree/main/packages/mpp
- **Integration Points**:
  - Transaction construction
  - Payment validation
  - Receipt generation
  - Error handling

### x402 Protocol (Bonus Feature)
- **Purpose**: Machine-payable API protocol for automated payments
- **Key Features**:
  - API call payments
  - Streaming payments
  - Micropayment support
  - Usage-based billing
- **Documentation**: https://docs.monad.xyz/guides/x402-guide
- **Use Cases**:
  - AI Agent API consumption
  - Cloud resource billing
  - Microservice payments
  - Real-time data streaming

## Smart Contract Development

### Solidity
- **Version**: 0.8.20+ (with support for latest features)
- **Key Libraries**:
  - OpenZeppelin Contracts: 4.9.0+
  - Solmate: For gas-optimized utilities
  - ERC-4337 implementations: Account abstraction standards
- **Development Patterns**:
  - Factory pattern for wallet deployment
  - Proxy pattern for upgradeability
  - Modular design for component separation

### Development Frameworks
- **Hardhat**:
  - Local development network
  - Testing framework
  - Deployment scripts
  - Plugin ecosystem (Hardhat-deploy, Hardhat-upgrades)
- **Foundry** (Alternative):
  - Forge testing framework
  - Cast for contract interaction
  - Anvil local node
- **Truffle**: Optional for legacy compatibility

### Testing Tools
- **Hardhat Test**: JavaScript/TypeScript testing
- **Foundry Forge**: Solidity-native testing
- **Waffle**: Additional testing utilities
- **Ethers.js**: Contract interaction library

## Client & Server Development

### TypeScript
- **Version**: 5.0+
- **Configuration**:
  - Strict mode enabled
  - ES2022 target
  - Module resolution: NodeNext
- **Key Libraries**:
  - Ethers.js v6: Blockchain interaction
  - Viem: Alternative lightweight library
  - Zod: Schema validation
  - RxJS: Reactive programming for event streams

### Node.js Runtime
- **Version**: 18.x LTS or 20.x
- **Key Packages**:
  - Express/Fastify: Web server frameworks
  - Prisma: Database ORM
  - TypeORM: Alternative ORM
  - Redis: Caching and session storage
  - Bull/Agenda: Job queue management

### Database Layer
- **Primary Database**: PostgreSQL 14+
  - JSONB support for flexible schema
  - Row-level security
  - Full-text search
  - TimescaleDB extension for time-series data
- **Alternative**: SQLite for lightweight deployments
- **Caching Layer**: Redis 7+
  - Session storage
  - Policy caching
  - Rate limiting
  - Pub/Sub for real-time updates

## Frontend & User Interface

### Web Applications
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **UI Library**: 
  - Material-UI (MUI) v5
  - Tailwind CSS for utility-first styling
  - Radix UI for accessible components
- **Charting**: Recharts or Victory for data visualization

### Mobile Applications
- **Cross-platform**: React Native 0.70+
- **Native Modules**:
  - Secure storage: React Native Keychain
  - Biometrics: React Native Biometrics
  - Push notifications: React Native Push Notification
- **Alternative**: Flutter for high-performance requirements

### Browser Extensions
- **Manifest V3**: Chrome/Firefox/Edge compatibility
- **Frameworks**: Plasmo or WXT for extension development
- **Security**: Content security policy, isolated worlds

## Integration & APIs

### MCP Server Implementation
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: SSE (Server-Sent Events) or WebSocket
- **Authentication**: Bearer tokens with rotation
- **Tool Definition**: JSON schema for tool definitions

### RESTful APIs
- **Framework**: Fastify or Express with TypeScript
- **Documentation**: OpenAPI 3.0 (Swagger)
- **Validation**: Zod with OpenAPI integration
- **Rate Limiting**: Redis-based sliding window
- **Authentication**: JWT with refresh tokens

### GraphQL API
- **Framework**: Apollo Server or Yoga
- **Schema Design**: Federation-ready schema
- **Caching**: Response caching with DataLoader
- **Subscriptions**: Real-time updates via WebSocket

## DevOps & Infrastructure

### Containerization
- **Docker**: Multi-stage builds for optimal image sizes
- **Docker Compose**: Local development environment
- **Base Images**:
  - Node.js: Official images with Alpine variant
  - PostgreSQL: Official image with extensions
  - Redis: Official image

### Orchestration
- **Kubernetes**: Production deployment
  - Helm charts for deployment
  - Ingress controllers for routing
  - ConfigMaps and Secrets for configuration
- **Alternative**: Docker Swarm for simpler deployments

### Monitoring & Observability
- **Metrics**: Prometheus with custom exporters
- **Logging**: Loki with Grafana for log aggregation
- **Tracing**: Jaeger or OpenTelemetry for distributed tracing
- **Alerting**: Alertmanager with Slack/Email/PagerDuty integration

### CI/CD Pipeline
- **Version Control**: GitHub with protected branches
- **CI Platform**: GitHub Actions or GitLab CI
- **Testing Stages**:
  - Unit tests
  - Integration tests
  - Security scanning
  - Performance testing
- **Deployment**: Blue-green or canary deployments

## Security Tooling

### Code Quality
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Static Analysis**: SonarQube or CodeQL
- **Dependency Scanning**: Snyk or Dependabot

### Security Testing
- **Smart Contract Audits**: Slither, MythX, ConsenSys Diligence
- **Penetration Testing**: OWASP ZAP, Burp Suite
- **Secret Detection**: GitGuardian or TruffleHog
- **Container Security**: Trivy or Clair

### Key Management
- **HSM Integration**: AWS KMS, Google Cloud KMS, Azure Key Vault
- **Local Key Management**: Keytar for cross-platform keychain access
- **Hardware Wallet Support**: WebHID API for direct hardware wallet communication

## Development Environment

### Local Setup
- **Node Version Manager**: nvm or fnm for Node.js version management
- **Package Manager**: pnpm (recommended) or npm/yarn
- **IDE Extensions**:
  - Solidity support (Hardhat/Foundry)
  - TypeScript/JavaScript support
  - ESLint/Prettier integration
  - Docker integration

### Testing Environments
- **Local Blockchain**: Anvil (Foundry) or Hardhat Network
- **Test Networks**: Monad testnets (devnet, testnet)
- **Faucets**: Test token faucets for development
- **Monitoring**: Local block explorers and debugging tools

---

*Part of Agentic Payment System Module Documentation*