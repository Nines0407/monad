# Deployment and Operations Guide

## Overview
This guide covers deployment, configuration, monitoring, and maintenance of the Agentic Payment System client application.

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, Linux Ubuntu 20.04+
- **Node.js**: v18.0.0 or higher
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 1 GB free space
- **Network**: Broadband internet connection

### Recommended Requirements
- **CPU**: 4 cores minimum
- **RAM**: 16 GB for production use
- **Storage**: SSD with 10 GB free space
- **Network**: 100 Mbps+ with low latency to Monad RPC nodes

## Installation

### Automated Installation
```bash
# Clone the repository
git clone https://github.com/agentic/payment-client.git
cd payment-client

# Run setup script
npm run setup

# Verify installation
npm run verify-environment
```

### Manual Installation
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run type checking
npm run typecheck
```

### Docker Installation
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY config ./config

CMD ["node", "dist/index.js"]
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Monad Network Configuration
MONAD_RPC_URL=https://testnet.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_EXPLORER=https://explorer.monad.xyz

# Security Configuration
ENCRYPTION_KEY=generated_32_byte_key_here
SESSION_KEY_EXPIRY=3600

# Database Configuration (if using SQLite)
DATABASE_PATH=./data/payments.db

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Performance Configuration
CACHE_TTL=300000
MAX_CONCURRENT_REQUESTS=10
```

### Policy Configuration
Create `config/policies.yaml`:

```yaml
default_policy:
  name: "Default Security Policy"
  rules:
    - type: amount_limit
      max_per_transaction: "1.0"  # ETH
      max_daily: "10.0"
      max_weekly: "50.0"
    
    - type: recipient_control
      whitelist:
        - "0x742d35Cc6634C0532925a3b844Bc9e90F1A2B3C4"
        - "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
      blacklist: []
    
    - type: manual_approval
      threshold: "0.5"  # ETH
      notify_channels:
        - email
        - push
```

### Hardware Wallet Configuration
```yaml
hardware_wallets:
  ledger:
    enabled: true
    path: "44'/60'/0'/0"
  
  trezor:
    enabled: true
    passphrase_enabled: false
  
  keystone:
    enabled: true
    airgapped: true
```

## Deployment

### Local Development
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### Production Deployment

#### Systemd Service (Linux)
Create `/etc/systemd/system/agentic-payment.service`:

```ini
[Unit]
Description=Agentic Payment Client
After=network.target

[Service]
Type=simple
User=agentic
WorkingDirectory=/opt/agentic-payment
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Windows Service
```powershell
# Install as Windows Service
nssm install AgenticPayment "C:\Program Files\nodejs\node.exe" "C:\agentic-payment\dist\index.js"
nssm set AgenticPayment AppDirectory "C:\agentic-payment"
nssm set AgenticPayment AppStdout "C:\agentic-payment\logs\stdout.log"
nssm set AgenticPayment AppStderr "C:\agentic-payment\logs\stderr.log"
```

#### Docker Compose
```yaml
version: '3.8'
services:
  payment-client:
    image: agentic/payment-client:latest
    container_name: agentic-payment
    restart: unless-stopped
    volumes:
      - ./data:/app/data
      - ./config:/app/config
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
```

## Monitoring

### Health Checks
```bash
# Basic health check
curl http://localhost:3000/health

# Detailed health check
curl http://localhost:3000/health/detailed

# Metrics endpoint
curl http://localhost:3000/metrics
```

### Key Metrics to Monitor
- **Wallet Health**: Key accessibility, signing success rate
- **Policy Evaluation**: Average evaluation time, rejection rate
- **Transaction Success**: Success rate, average confirmation time
- **Session Keys**: Active count, generation rate, revocation rate
- **System Resources**: CPU, memory, disk usage

### Logging Configuration
```javascript
// config/logging.js
module.exports = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
};
```

### Alerting Rules
```yaml
alerts:
  - name: high_rejection_rate
    condition: policy_rejections_per_minute > 10
    severity: warning
    channels: [email, slack]
  
  - name: wallet_unavailable
    condition: wallet_health_status == "unhealthy"
    severity: critical
    channels: [pagerduty, sms]
  
  - name: high_gas_prices
    condition: average_gas_price > 200000000000
    severity: warning
    channels: [slack]
```

## Maintenance

### Regular Tasks

#### Daily
- Review transaction logs for anomalies
- Check system health metrics
- Verify backup completion

#### Weekly
- Rotate session keys (automatic, but verify)
- Update policy configurations if needed
- Clean up old logs (keep 30 days)

#### Monthly
- Rotate master keys (if configured)
- Update dependencies (`npm audit`, `npm update`)
- Security audit of configuration files

### Backup Strategy

#### What to Backup
```bash
# Wallet backups (encrypted)
./data/wallets/*.encrypted

# Policy configurations
./config/policies.yaml
./config/policies_backup/

# Database (if using SQLite)
./data/payments.db
./data/payments.db-shm
./data/payments.db-wal

# Logs (optional)
./logs/
```

#### Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backup/agentic-payment/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup wallets
cp -r ./data/wallets $BACKUP_DIR/

# Backup config
cp -r ./config $BACKUP_DIR/

# Backup database
sqlite3 ./data/payments.db ".backup $BACKUP_DIR/payments.db"

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# Upload to cloud storage (example)
aws s3 cp $BACKUP_DIR.tar.gz s3://agentic-backups/

# Cleanup old backups (keep 7 days)
find /backup/agentic-payment -type f -mtime +7 -delete
```

### Key Rotation

#### Session Keys
Automatically rotated based on expiry. Manual rotation:

```bash
npm run rotate-session-keys
```

#### Master Keys
Manual process:
1. Generate new key pair
2. Migrate funds (if any)
3. Update authorized applications
4. Revoke old keys

```typescript
// Manual key rotation script
import { KeyManager } from './key-manager';

async function rotateMasterKey() {
  const keyManager = new KeyManager();
  const newWallet = await keyManager.rotateKeys();
  
  // TODO: Implement fund migration
  console.log('New wallet address:', newWallet.address);
}
```

## Troubleshooting

### Common Issues

#### "Wallet not initialized"
```bash
# Solution: Initialize wallet
npm run initialize-wallet
```

#### "Policy evaluation timeout"
```bash
# Check policy complexity
# Reduce number of active policies
# Increase CACHE_TTL in configuration
```

#### "Transaction stuck"
```bash
# Check gas price
npm run check-gas-price

# Cancel stuck transaction (if nonce management enabled)
npm run cancel-transaction -- --nonce 5
```

#### "Hardware wallet connection failed"
```bash
# Check device connection
# Update hardware wallet firmware
# Reinstall device drivers
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm start

# Or use debug flag
npm start -- --debug
```

### Diagnostic Tools
```bash
# Run diagnostic suite
npm run diagnose

# Check system health
npm run health-check

# Generate diagnostic report
npm run diagnostic-report
```

## Security Considerations

### Access Control
- Limit application access to authorized users only
- Use OS-level permissions for key storage
- Implement rate limiting for API endpoints

### Network Security
- Use TLS for all RPC connections
- Validate RPC endpoint certificates
- Implement firewall rules to restrict outgoing connections

### Data Protection
- Encrypt all sensitive data at rest
- Use secure deletion for temporary files
- Implement audit logging for all sensitive operations

### Incident Response
1. **Detection**: Monitor for unusual activity
2. **Containment**: Temporarily disable affected components
3. **Investigation**: Analyze logs and transaction history
4. **Recovery**: Restore from backups if necessary
5. **Post-mortem**: Document lessons learned

## Performance Tuning

### Configuration Optimizations
```yaml
performance:
  cache:
    enabled: true
    ttl: 300000  # 5 minutes
    max_size: 1000
  
  database:
    connection_limit: 10
    query_timeout: 5000
  
  network:
    rpc_timeout: 30000
    retry_attempts: 3
    retry_delay: 1000
```

### Monitoring Performance
```bash
# Run performance benchmark
npm run benchmark

# Generate performance report
npm run performance-report

# Monitor in real-time
npm run monitor
```

## Updates and Upgrades

### Version Upgrade Process
1. Backup current installation
2. Review changelog for breaking changes
3. Update dependencies (`npm install`)
4. Run migration scripts if needed
5. Test thoroughly before production deployment

### Rollback Procedure
```bash
# If upgrade fails, rollback to previous version
git checkout v1.0.0
npm install
npm run build
npm restart
```

---

*Document Version: 1.0.0*  
*Last Updated: 2024-01-01*  
*Operations Maintainer: AI Agent (autonomous documentation)*