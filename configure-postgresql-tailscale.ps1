# ============================================
# Configure PostgreSQL for Tailscale Access
# ============================================
# Script tự động cấu hình PostgreSQL để cho phép
# kết nối từ Mac qua Tailscale
# ============================================

Write-Host "🔧 PostgreSQL Tailscale Configuration Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Yêu cầu chạy với quyền Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Script này cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "   Right-click PowerShell và chọn 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

# Cấu hình
$PG_DATA_DIR = "D:\Ninh\pg\tva"
$PG_HBA_FILE = "$PG_DATA_DIR\pg_hba.conf"
$PG_CONF_FILE = "$PG_DATA_DIR\postgresql.conf"
$SERVICE_NAME = "postgresql-x64-16"

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "   Data Directory: $PG_DATA_DIR"
Write-Host "   pg_hba.conf:    $PG_HBA_FILE"
Write-Host "   postgresql.conf: $PG_CONF_FILE"
Write-Host "   Service:        $SERVICE_NAME"
Write-Host ""

# Kiểm tra file tồn tại
if (-not (Test-Path $PG_HBA_FILE)) {
    Write-Host "❌ Không tìm thấy file pg_hba.conf tại: $PG_HBA_FILE" -ForegroundColor Red
    Write-Host "   Vui lòng kiểm tra lại đường dẫn PostgreSQL data directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

# Backup files
Write-Host "📦 Creating backups..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $PG_HBA_FILE "$PG_HBA_FILE.backup_$timestamp"
Copy-Item $PG_CONF_FILE "$PG_CONF_FILE.backup_$timestamp"
Write-Host "   ✅ Backup created: pg_hba.conf.backup_$timestamp" -ForegroundColor Green
Write-Host "   ✅ Backup created: postgresql.conf.backup_$timestamp" -ForegroundColor Green
Write-Host ""

# Cấu hình pg_hba.conf
Write-Host "🔧 Configuring pg_hba.conf..." -ForegroundColor Yellow

$tailscaleEntry = @"

# ============================================
# Tailscale Network Access
# Added by configure-postgresql-tailscale.ps1
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================
# Allow connections from Tailscale network (100.x.x.x)
host    all             all             100.0.0.0/8             md5

# Allow connections from specific Mac IP
host    all             all             100.82.243.45/32        md5

# Allow connections from local network (optional)
host    all             all             192.168.0.0/16          md5
host    all             all             10.0.0.0/8              md5
"@

# Kiểm tra xem đã có entry chưa
$content = Get-Content $PG_HBA_FILE -Raw
if ($content -match "100.0.0.0/8") {
    Write-Host "   ⚠️  Tailscale entry đã tồn tại trong pg_hba.conf" -ForegroundColor Yellow
} else {
    Add-Content -Path $PG_HBA_FILE -Value $tailscaleEntry
    Write-Host "   ✅ Added Tailscale entries to pg_hba.conf" -ForegroundColor Green
}
Write-Host ""

# Cấu hình postgresql.conf
Write-Host "🔧 Configuring postgresql.conf..." -ForegroundColor Yellow

$confContent = Get-Content $PG_CONF_FILE
$listenAddressFound = $false
$newContent = @()

foreach ($line in $confContent) {
    if ($line -match "^\s*#?\s*listen_addresses\s*=") {
        if (-not $listenAddressFound) {
            $newContent += "listen_addresses = '*'		# Listen on all interfaces (modified by script)"
            $listenAddressFound = $true
            Write-Host "   ✅ Updated listen_addresses = '*'" -ForegroundColor Green
        }
    } else {
        $newContent += $line
    }
}

if (-not $listenAddressFound) {
    $newContent += "listen_addresses = '*'		# Listen on all interfaces (added by script)"
    Write-Host "   ✅ Added listen_addresses = '*'" -ForegroundColor Green
}

$newContent | Set-Content $PG_CONF_FILE
Write-Host ""

# Cấu hình Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow

try {
    # Kiểm tra rule đã tồn tại chưa
    $existingRule = Get-NetFirewallRule -DisplayName "PostgreSQL Port 5432" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "   ⚠️  Firewall rule đã tồn tại" -ForegroundColor Yellow
    } else {
        New-NetFirewallRule -DisplayName "PostgreSQL Port 5432" `
                           -Direction Inbound `
                           -Protocol TCP `
                           -LocalPort 5432 `
                           -Action Allow `
                           -Profile Any | Out-Null
        Write-Host "   ✅ Added firewall rule for port 5432" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not configure firewall: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Restart PostgreSQL Service
Write-Host "🔄 Restarting PostgreSQL service..." -ForegroundColor Yellow

try {
    $service = Get-Service -Name $SERVICE_NAME -ErrorAction Stop
    
    if ($service.Status -eq "Running") {
        Write-Host "   Stopping service..." -ForegroundColor Gray
        Stop-Service -Name $SERVICE_NAME -Force
        Start-Sleep -Seconds 2
    }
    
    Write-Host "   Starting service..." -ForegroundColor Gray
    Start-Service -Name $SERVICE_NAME
    Start-Sleep -Seconds 3
    
    $service = Get-Service -Name $SERVICE_NAME
    if ($service.Status -eq "Running") {
        Write-Host "   ✅ PostgreSQL service restarted successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Service failed to start. Status: $($service.Status)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error restarting service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please restart manually: Restart-Service $SERVICE_NAME" -ForegroundColor Yellow
}
Write-Host ""

# Kiểm tra port đang listen
Write-Host "🔍 Checking if PostgreSQL is listening on port 5432..." -ForegroundColor Yellow
$listening = netstat -an | Select-String "5432.*LISTENING"
if ($listening) {
    Write-Host "   ✅ PostgreSQL is listening on port 5432" -ForegroundColor Green
    Write-Host "   $listening" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Port 5432 not found in listening state" -ForegroundColor Yellow
}
Write-Host ""

# Tổng kết
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ CONFIGURATION COMPLETED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor White
Write-Host "   ✅ pg_hba.conf configured for Tailscale (100.0.0.0/8)" -ForegroundColor Green
Write-Host "   ✅ postgresql.conf set to listen on all interfaces" -ForegroundColor Green
Write-Host "   ✅ Windows Firewall rule added for port 5432" -ForegroundColor Green
Write-Host "   ✅ PostgreSQL service restarted" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. On Mac, run: node test-db-connection.js" -ForegroundColor White
Write-Host "   2. If successful, restart Next.js: npm run dev" -ForegroundColor White
Write-Host "   3. Access web app: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "📁 Backup files created:" -ForegroundColor Cyan
Write-Host "   - pg_hba.conf.backup_$timestamp" -ForegroundColor Gray
Write-Host "   - postgresql.conf.backup_$timestamp" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  If you need to rollback:" -ForegroundColor Yellow
Write-Host "   Copy-Item '$PG_HBA_FILE.backup_$timestamp' '$PG_HBA_FILE' -Force" -ForegroundColor Gray
Write-Host "   Copy-Item '$PG_CONF_FILE.backup_$timestamp' '$PG_CONF_FILE' -Force" -ForegroundColor Gray
Write-Host "   Restart-Service $SERVICE_NAME" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

