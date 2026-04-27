@echo off
echo Starting Agentic Payment System...

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running.
    exit /b 1
)

REM Start database containers
echo Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

REM Wait for databases to be ready
echo Waiting for databases to start...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo Running database migrations...
npm run migrate:up

REM Install dependencies if needed
echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    echo Setting npm registry to taobao mirror for faster installation...
    npm config set registry https://registry.npmmirror.com
    npm install
    if %errorlevel% neq 0 (
        echo ❌ npm install failed. Trying with default registry...
        npm config set registry https://registry.npmjs.org
        npm install
        if %errorlevel% neq 0 (
            echo ❌ Failed to install dependencies. Please check your network connection.
            exit /b 1
        )
    )
)

REM Build TypeScript
echo Building TypeScript...
npm run build

REM Copy configuration files
echo Copying configuration files...
copy knexfile.js dist\ >nul
copy .env dist\ >nul

REM Start the audit system
echo Starting Audit System API...
echo.
echo ========================================
echo Audit System API will run on port 3001
echo PostgreSQL is running on port 5432
echo Redis is running on port 6379
echo ========================================
echo.
echo To test the API, open another terminal and run:
echo   curl http://localhost:3001/health
echo.
echo Press Ctrl+C to stop all services.
echo.

cd dist
node src/index.js