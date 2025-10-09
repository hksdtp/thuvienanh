# 🔧 PostgreSQL Setup Script for Windows
# Run this script as Administrator in PowerShell

Write-Host "🔍 Checking PostgreSQL installation..." -ForegroundColor Yellow

# Find PostgreSQL installation
$pgPath = "C:\Program Files\PostgreSQL\18"
$dataPath = "$pgPath\data"
$configFile = "$dataPath\postgresql.conf"
$hbaFile = "$dataPath\pg_hba.conf"

Write-Host "📁 PostgreSQL Path: $pgPath" -ForegroundColor Green

# Check if files exist
if (Test-Path $configFile) {
    Write-Host "✅ Found postgresql.conf" -ForegroundColor Green
} else {
    Write-Host "❌ postgresql.conf not found at $configFile" -ForegroundColor Red
    exit 1
}

if (Test-Path $hbaFile) {
    Write-Host "✅ Found pg_hba.conf" -ForegroundColor Green
} else {
    Write-Host "❌ pg_hba.conf not found at $hbaFile" -ForegroundColor Red
    exit 1
}

# Backup original files
Write-Host "💾 Creating backups..." -ForegroundColor Yellow
Copy-Item $configFile "$configFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $hbaFile "$hbaFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Update postgresql.conf
Write-Host "⚙️ Updating postgresql.conf..." -ForegroundColor Yellow
$configContent = Get-Content $configFile
$newConfigContent = @()

foreach ($line in $configContent) {
    if ($line -match "^#?listen_addresses") {
        $newConfigContent += "listen_addresses = '*'"
        Write-Host "  ✅ Updated listen_addresses" -ForegroundColor Green
    }
    elseif ($line -match "^#?port") {
        $newConfigContent += "port = 5499"
        Write-Host "  ✅ Updated port to 5499" -ForegroundColor Green
    }
    else {
        $newConfigContent += $line
    }
}

$newConfigContent | Set-Content $configFile

# Update pg_hba.conf
Write-Host "⚙️ Updating pg_hba.conf..." -ForegroundColor Yellow
$hbaContent = Get-Content $hbaFile
$hbaContent += ""
$hbaContent += "# Allow Tailscale connections"
$hbaContent += "host    all             all             100.0.0.0/8            md5"
$hbaContent += "host    all             all             0.0.0.0/0              md5"

$hbaContent | Set-Content $hbaFile
Write-Host "  ✅ Added remote connection rules" -ForegroundColor Green

# Open Windows Firewall
Write-Host "🔥 Opening Windows Firewall..." -ForegroundColor Yellow
try {
    New-NetFirewallRule -DisplayName "PostgreSQL-5499" -Direction Inbound -Protocol TCP -LocalPort 5499 -Action Allow -Force
    Write-Host "  ✅ Firewall rule added" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Firewall rule may already exist" -ForegroundColor Yellow
}

# Restart PostgreSQL service
Write-Host "🔄 Restarting PostgreSQL service..." -ForegroundColor Yellow
$serviceName = (Get-Service *postgres*).Name | Select-Object -First 1

if ($serviceName) {
    Write-Host "  📋 Service name: $serviceName" -ForegroundColor Cyan
    try {
        Restart-Service $serviceName -Force
        Write-Host "  ✅ PostgreSQL service restarted" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to restart service: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ PostgreSQL service not found" -ForegroundColor Red
}

# Test configuration
Write-Host "🧪 Testing configuration..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if port is listening
$portCheck = netstat -an | Select-String ":5499"
if ($portCheck) {
    Write-Host "  ✅ Port 5499 is listening" -ForegroundColor Green
    Write-Host "  📋 $portCheck" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ Port 5499 is not listening" -ForegroundColor Red
}

# Test local connection
$psqlPath = "$pgPath\bin\psql.exe"
if (Test-Path $psqlPath) {
    Write-Host "  📋 Testing local connection..." -ForegroundColor Cyan
    # Note: This will prompt for password
    Write-Host "  💡 You can test connection with: $psqlPath -U postgres -h localhost -p 5499" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ psql.exe not found at $psqlPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test from Mac: nc -zv 100.101.50.87 5499" -ForegroundColor Cyan
Write-Host "  2. Create database: $psqlPath -U postgres -h localhost -p 5499 -c 'CREATE DATABASE fabric_library;'" -ForegroundColor Cyan
Write-Host "  3. Update Mac .env file to use Windows database" -ForegroundColor Cyan
