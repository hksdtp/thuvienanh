# Deploy Thư Viện Ảnh on Windows 10 - Automated Script
# Run PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  THƯ VIỆN ẢNH - WINDOWS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Script cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "Nhấn chuột phải PowerShell và chọn 'Run as Administrator'" -ForegroundColor Yellow
    Exit 1
}

# Configuration
$AppPath = "C:\apps\thuvienanh"
$NodeVersion = "18"
$PostgresPassword = "Demo1234"
$DbName = "Ninh96"
$AppPort = 3000

Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Install Chocolatey if not exists
if (!(Test-Command choco)) {
    Write-Host "📦 Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# Install Node.js if not exists
if (!(Test-Command node)) {
    Write-Host "📦 Installing Node.js..." -ForegroundColor Yellow
    choco install nodejs-lts -y
    refreshenv
} else {
    $nodeVer = node --version
    Write-Host "✅ Node.js installed: $nodeVer" -ForegroundColor Green
}

# Install Git if not exists
if (!(Test-Command git)) {
    Write-Host "📦 Installing Git..." -ForegroundColor Yellow
    choco install git -y
    refreshenv
} else {
    Write-Host "✅ Git installed" -ForegroundColor Green
}

# Install PostgreSQL if not exists
if (!(Test-Command psql)) {
    Write-Host "📦 Installing PostgreSQL..." -ForegroundColor Yellow
    choco install postgresql15 --params '/Password:Demo1234' -y
    refreshenv
    
    # Wait for PostgreSQL to start
    Start-Sleep -Seconds 10
    
    # Set PostgreSQL to auto-start
    Set-Service -Name "postgresql-x64-15" -StartupType Automatic
} else {
    Write-Host "✅ PostgreSQL installed" -ForegroundColor Green
}

# Install PM2 globally
Write-Host "📦 Installing PM2..." -ForegroundColor Yellow
npm install -g pm2 --silent
npm install -g pm2-windows-startup --silent

Write-Host ""
Write-Host "🚀 Setting up application..." -ForegroundColor Yellow

# Create app directory
if (!(Test-Path $AppPath)) {
    New-Item -Path $AppPath -ItemType Directory -Force | Out-Null
}

Set-Location $AppPath

# Clone repository if not exists
if (!(Test-Path ".git")) {
    Write-Host "📥 Cloning repository..." -ForegroundColor Yellow
    git clone https://github.com/hksdtp/thuvienanh.git . 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Using placeholder repository URL. Please update with actual URL!" -ForegroundColor Yellow
        git init
    }
} else {
    Write-Host "📥 Pulling latest changes..." -ForegroundColor Yellow
    git pull origin main 2>$null
}

# Create .env file
Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
@"
NODE_ENV=production
PORT=$AppPort

# Database Configuration
DATABASE_URL=postgresql://postgres:$PostgresPassword@localhost:5432/$DbName
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PostgresPassword
POSTGRES_DB=$DbName

# Synology NAS Configuration
SYNOLOGY_HOST=222.252.23.248
SYNOLOGY_PORT=6868
SYNOLOGY_USERNAME=your_username
SYNOLOGY_PASSWORD=your_password
SMB_HOST=222.252.23.248
SMB_PORT=445
SMB_USERNAME=your_username
SMB_PASSWORD=your_password
SMB_SHARE=marketing

# API Configuration
ALLOWED_ORIGIN=*
NEXT_PUBLIC_API_URL=http://localhost:$AppPort
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --silent

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

# Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow

# Create database if not exists
$env:PGPASSWORD = $PostgresPassword
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = '$DbName'" | Out-Null
if ($LASTEXITCODE -ne 0) {
    psql -U postgres -c "CREATE DATABASE `"$DbName`";" 2>$null
}

# Run database migrations if init.sql exists
if (Test-Path "database/init.sql") {
    Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
    psql -U postgres -d $DbName -f "database/init.sql" 2>$null
}

# Create PM2 ecosystem file
Write-Host "⚙️ Creating PM2 configuration..." -ForegroundColor Yellow
@"
module.exports = {
  apps: [{
    name: 'thuvienanh',
    script: 'npm',
    args: 'start',
    cwd: '$AppPath',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $AppPort
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
"@ | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

# Create logs directory
New-Item -Path "logs" -ItemType Directory -Force | Out-Null

# Configure Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Thư Viện Ảnh App" -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Thư Viện Ảnh App" -Direction Inbound -Protocol TCP -LocalPort $AppPort -Action Allow | Out-Null
Write-Host "✅ Firewall rule added for port $AppPort" -ForegroundColor Green

# Stop existing PM2 processes
Write-Host "🔄 Restarting application..." -ForegroundColor Yellow
pm2 kill 2>$null

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
Write-Host "⚙️ Setting up auto-start..." -ForegroundColor Yellow
pm2-startup install
pm2 save

# Get system info for access
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet -ErrorAction SilentlyContinue).IPAddress
if (!$localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object -First 1).IPAddress
}

$publicIP = (Invoke-RestMethod -Uri "https://api.ipify.org" -ErrorAction SilentlyContinue)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Application Status:" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Local:    http://localhost:$AppPort" -ForegroundColor White
if ($localIP) {
    Write-Host "  LAN:      http://${localIP}:$AppPort" -ForegroundColor White
}
if ($publicIP) {
    Write-Host "  Public:   http://${publicIP}:$AppPort" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Note: For public access, configure port forwarding on your router:" -ForegroundColor Yellow
    Write-Host "  External Port $AppPort -> Internal IP ${localIP}:$AppPort" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "  pm2 status          - Check app status" -ForegroundColor White
Write-Host "  pm2 logs            - View logs" -ForegroundColor White
Write-Host "  pm2 restart all     - Restart app" -ForegroundColor White
Write-Host "  pm2 stop all        - Stop app" -ForegroundColor White

Write-Host ""
Write-Host "🔒 Security Recommendations:" -ForegroundColor Yellow
Write-Host "  1. Change default PostgreSQL password" -ForegroundColor White
Write-Host "  2. Setup SSL certificate (Let's Encrypt)" -ForegroundColor White  
Write-Host "  3. Configure Dynamic DNS if no static IP" -ForegroundColor White
Write-Host "  4. Enable Windows Updates auto-install" -ForegroundColor White
Write-Host "  5. Setup regular backups" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
