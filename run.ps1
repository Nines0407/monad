Write-Host "Starting Agentic Payment System..." -ForegroundColor Green

# Check if Docker is running
try {
    docker --version | Out-Null
} catch {
    Write-Host "Error: Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

# Start database containers
Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait for databases to be ready
Write-Host "Waiting for databases to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run migrate:up

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "Setting npm registry to taobao mirror for faster installation..." -ForegroundColor Gray
    npm config set registry https://registry.npmmirror.com
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed. Trying with default registry..." -ForegroundColor Red
        npm config set registry https://registry.npmjs.org
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies. Please check your network connection." -ForegroundColor Red
            exit 1
        }
    }
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

# Copy configuration files
Write-Host "Copying configuration files..." -ForegroundColor Yellow
Copy-Item knexfile.js dist\ -Force
Copy-Item .env dist\ -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Audit System API will run on port 3001" -ForegroundColor Cyan
Write-Host "PostgreSQL is running on port 5432" -ForegroundColor Cyan
Write-Host "Redis is running on port 6379" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the API, open another terminal and run:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow
Write-Host ""

Set-Location dist
node src/index.js