# Agentic Payment System 启动脚本
# 用法: powershell -ExecutionPolicy Bypass -File start.ps1

param(
    [switch]$InstallDocker = $false,
    [switch]$CheckOnly = $false,
    [switch]$Stop = $false,
    [switch]$Restart = $false,
    [switch]$Logs = $false
)

# 颜色定义
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$White = "White"

function Write-Color {
    param([string]$Message, [string]$Color = $White)
    Write-Host $Message -ForegroundColor $Color
}

function Show-Header {
    Clear-Host
    Write-Color "╔═══════════════════════════════════════════════════╗" $Cyan
    Write-Color "║    Agentic Payment System - Docker 部署工具      ║" $Cyan
    Write-Color "╚═══════════════════════════════════════════════════╝" $Cyan
    Write-Color ""
}

function Test-Docker {
    Write-Color "检查 Docker 环境..." $White
    $dockerVersion = docker --version 2>$null
    $dockerComposeVersion = docker-compose --version 2>$null
    
    if ($dockerVersion) {
        Write-Color "✅ Docker 已安装: $dockerVersion" $Green
    } else {
        Write-Color "❌ Docker 未安装或未启动" $Red
        return $false
    }
    
    if ($dockerComposeVersion) {
        Write-Color "✅ Docker Compose 已安装: $dockerComposeVersion" $Green
    } else {
        Write-Color "⚠️  Docker Compose 未找到，尝试使用 docker compose..." $Yellow
    }
    
    # 测试 Docker 服务运行状态
    $dockerInfo = docker info 2>$null
    if ($dockerInfo) {
        Write-Color "✅ Docker 服务运行正常" $Green
        return $true
    } else {
        Write-Color "❌ Docker 服务未运行" $Red
        Write-Color "请启动 Docker Desktop 应用程序" $Yellow
        return $false
    }
}

function Show-DockerInstallGuide {
    Write-Color "`nDocker 安装指南:" $Cyan
    Write-Color "1. 下载 Docker Desktop for Windows:" $White
    Write-Color "   https://www.docker.com/products/docker-desktop/" $Cyan
    Write-Color "2. 运行安装程序并重启计算机" $White
    Write-Color "3. 启动 Docker Desktop 应用程序" $White
    Write-Color "4. 等待 Docker 服务启动完成" $White
    Write-Color "`n快速安装命令 (需要管理员权限):" $Cyan
    Write-Color "   winget install Docker.DockerDesktop" $White
}

function Start-Services {
    Write-Color "`n启动 Agentic Payment System 服务..." $Cyan
    
    # 检查必要的目录
    if (-not (Test-Path "F:\monad\data")) {
        Write-Color "创建数据目录..." $Yellow
        New-Item -ItemType Directory -Path "F:\monad\data" -Force | Out-Null
        New-Item -ItemType Directory -Path "F:\monad\data\postgres" -Force | Out-Null
        New-Item -ItemType Directory -Path "F:\monad\data\redis" -Force | Out-Null
        Write-Color "✅ 数据目录创建完成" $Green
    }
    
    # 检查环境文件
    if (-not (Test-Path "F:\monad\.env")) {
        Write-Color "创建 .env 配置文件..." $Yellow
        if (Test-Path "F:\monad\.env.example") {
            Copy-Item "F:\monad\.env.example" "F:\monad\.env"
            Write-Color "✅ 从 .env.example 创建 .env 文件" $Green
            Write-Color "⚠️  请手动更新 .env 文件中的安全密钥" $Yellow
        }
    }
    
    # 启动 Docker Compose
    Write-Color "启动 Docker 容器..." $White
    try {
        # 尝试使用 docker-compose
        $composeCommand = "docker-compose"
        if (-not (Get-Command $composeCommand -ErrorAction SilentlyContinue)) {
            # 尝试使用 docker compose (新版本)
            $composeCommand = "docker compose"
        }
        
        & $composeCommand up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Color "✅ 服务启动命令已发送" $Green
        } else {
            Write-Color "❌ 服务启动失败" $Red
            return $false
        }
    }
    catch {
        Write-Color "❌ 启动过程中出错: $_" $Red
        return $false
    }
    
    # 显示状态
    Start-Sleep -Seconds 3
    Show-ServicesStatus
    
    return $true
}

function Stop-Services {
    Write-Color "`n停止 Agentic Payment System 服务..." $Cyan
    try {
        $composeCommand = "docker-compose"
        if (-not (Get-Command $composeCommand -ErrorAction SilentlyContinue)) {
            $composeCommand = "docker compose"
        }
        
        & $composeCommand down
        Write-Color "✅ 服务已停止" $Green
    }
    catch {
        Write-Color "❌ 停止服务时出错: $_" $Red
    }
}

function Restart-Services {
    Write-Color "`n重启 Agentic Payment System 服务..." $Cyan
    try {
        $composeCommand = "docker-compose"
        if (-not (Get-Command $composeCommand -ErrorAction SilentlyContinue)) {
            $composeCommand = "docker compose"
        }
        
        & $composeCommand restart
        Write-Color "✅ 服务重启命令已发送" $Green
        Show-ServicesStatus
    }
    catch {
        Write-Color "❌ 重启服务时出错: $_" $Red
    }
}

function Show-ServicesStatus {
    Write-Color "`n服务状态:" $Cyan
    
    try {
        $composeCommand = "docker-compose"
        if (-not (Get-Command $composeCommand -ErrorAction SilentlyContinue)) {
            $composeCommand = "docker compose"
        }
        
        & $composeCommand ps
    }
    catch {
        Write-Color "无法获取服务状态: $_" $Yellow
    }
    
    Write-Color "`n服务端点:" $Cyan
    Write-Color "审计系统 API:  http://localhost:3001" $White
    Write-Color "MCP 服务器:    http://localhost:3000" $White
    Write-Color "WebSocket API: ws://localhost:3002" $White
    Write-Color "PostgreSQL:    localhost:5432" $White
    Write-Color "Redis:         localhost:6379" $White
}

function Show-Logs {
    Write-Color "`n显示服务日志 (Ctrl+C 退出)..." $Cyan
    try {
        $composeCommand = "docker-compose"
        if (-not (Get-Command $composeCommand -ErrorAction SilentlyContinue)) {
            $composeCommand = "docker compose"
        }
        
        & $composeCommand logs -f
    }
    catch {
        Write-Color "显示日志时出错: $_" $Red
    }
}

# 主程序
Show-Header

# 切换到项目目录
try {
    Set-Location "F:\monad"
}
catch {
    Write-Color "错误: 无法切换到 F:\monad 目录" $Red
    Write-Color "请确保项目路径正确" $Yellow
    exit 1
}

# 处理参数
if ($CheckOnly) {
    Test-Docker
    exit
}

if ($Stop) {
    Stop-Services
    exit
}

if ($Restart) {
    Restart-Services
    exit
}

if ($Logs) {
    Show-Logs
    exit
}

# 检查 Docker
$dockerReady = Test-Docker
if (-not $dockerReady) {
    if ($InstallDocker) {
        Show-DockerInstallGuide
    } else {
        Write-Color "`n建议使用 -InstallDocker 参数查看安装指南" $Yellow
        Write-Color "或手动安装 Docker Desktop" $Yellow
    }
    exit 1
}

# 启动服务
$success = Start-Services

if ($success) {
    Write-Color "`n═══════════════════════════════════════════════════" $Green
    Write-Color "部署成功！" $Green
    Write-Color "═══════════════════════════════════════════════════" $Green
    Write-Color "" $White
    Write-Color "下一步操作:" $Cyan
    Write-Color "1. 等待 1-2 分钟让服务完全启动" $White
    Write-Color "2. 运行健康检查: curl http://localhost:3001/health" $White
    Write-Color "3. 查看详细日志: powershell -File start.ps1 -Logs" $White
    Write-Color "4. 访问 API 文档: http://localhost:3001/api-docs" $White
    Write-Color "" $White
    Write-Color "管理命令:" $Cyan
    Write-Color "停止服务:   powershell -File start.ps1 -Stop" $White
    Write-Color "重启服务:   powershell -File start.ps1 -Restart" $White
    Write-Color "查看状态:   powershell -File start.ps1 -CheckOnly" $White
    Write-Color "" $White
    Write-Color "更多信息请查看 DEPLOYMENT_GUIDE.md 文件" $Cyan
} else {
    Write-Color "`n部署过程中出现问题，请检查以上错误信息" $Red
    Write-Color "查看详细日志: powershell -File start.ps1 -Logs" $Yellow
}