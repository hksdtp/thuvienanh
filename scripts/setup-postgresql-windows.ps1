# PowerShell Script để cài đặt và cấu hình PostgreSQL trên Windows
# Copy script này và paste vào PowerShell trên PC Windows (Run as Administrator)

Write-Host "🚀 Thiết lập PostgreSQL Database Backend trên Windows" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# Kiểm tra quyền Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Script cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Tạo thư mục temp
Write-Host "📁 Tạo thư mục temp..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "C:\temp" | Out-Null

# Kiểm tra PostgreSQL đã cài chưa
Write-Host "🔍 Kiểm tra PostgreSQL hiện tại..." -ForegroundColor Cyan
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "⚠️  PostgreSQL đã được cài đặt: $($pgService.Name)" -ForegroundColor Yellow
    $continue = Read-Host "Tiếp tục cấu hình? (y/n)"
    if ($continue -ne "y") { exit 0 }
} else {
    Write-Host "📦 Downloading PostgreSQL 13..." -ForegroundColor Cyan
    
    # Download PostgreSQL
    $url = "https://get.enterprisedb.com/postgresql/postgresql-13.13-1-windows-x64.exe"
    $output = "C:\temp\postgresql-13.exe"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host "✅ Download completed: $output" -ForegroundColor Green
    } catch {
        Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Install PostgreSQL
    Write-Host "🔧 Installing PostgreSQL..." -ForegroundColor Cyan
    Write-Host "   Port: 5499" -ForegroundColor Yellow
    Write-Host "   Password: Demo1234" -ForegroundColor Yellow
    Write-Host "   Please wait..." -ForegroundColor Yellow
    
    $installArgs = @(
        "--mode", "unattended",
        "--superpassword", "Demo1234",
        "--serverport", "5499",
        "--servicename", "postgresql-13",
        "--datadir", "C:\Program Files\PostgreSQL\13\data",
        "--bindir", "C:\Program Files\PostgreSQL\13\bin"
    )
    
    try {
        Start-Process -FilePath $output -ArgumentList $installArgs -Wait -NoNewWindow
        Write-Host "✅ PostgreSQL installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Đợi service khởi động
Write-Host "⏳ Waiting for PostgreSQL service..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Cấu hình postgresql.conf
Write-Host "⚙️  Configuring postgresql.conf..." -ForegroundColor Cyan
$configPath = "C:\Program Files\PostgreSQL\13\data\postgresql.conf"

if (Test-Path $configPath) {
    # Backup original config
    Copy-Item $configPath "$configPath.backup" -Force
    
    # Read and modify config
    $config = Get-Content $configPath
    $config = $config -replace "#listen_addresses = 'localhost'", "listen_addresses = '*'"
    $config = $config -replace "#port = 5432", "port = 5499"
    $config | Set-Content $configPath
    
    Write-Host "✅ postgresql.conf updated" -ForegroundColor Green
} else {
    Write-Host "❌ postgresql.conf not found at $configPath" -ForegroundColor Red
}

# Cấu hình pg_hba.conf
Write-Host "⚙️  Configuring pg_hba.conf..." -ForegroundColor Cyan
$hbaPath = "C:\Program Files\PostgreSQL\13\data\pg_hba.conf"

if (Test-Path $hbaPath) {
    # Backup original config
    Copy-Item $hbaPath "$hbaPath.backup" -Force
    
    # Add Tailscale network access
    $tailscaleRule = "`nhost    all             all             100.0.0.0/8             md5"
    Add-Content $hbaPath $tailscaleRule
    
    Write-Host "✅ pg_hba.conf updated" -ForegroundColor Green
} else {
    Write-Host "❌ pg_hba.conf not found at $hbaPath" -ForegroundColor Red
}

# Cấu hình Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Cyan
try {
    # Remove existing rule if exists
    Remove-NetFirewallRule -DisplayName "PostgreSQL Tailscale" -ErrorAction SilentlyContinue
    
    # Add new rule
    New-NetFirewallRule -DisplayName "PostgreSQL Tailscale" -Direction Inbound -Protocol TCP -LocalPort 5499 -RemoteAddress "100.0.0.0/8" -Action Allow
    Write-Host "✅ Firewall rule added" -ForegroundColor Green
} catch {
    Write-Host "❌ Firewall configuration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Restart PostgreSQL service
Write-Host "🔄 Restarting PostgreSQL service..." -ForegroundColor Cyan
try {
    Restart-Service -Name "postgresql-13" -Force
    Start-Sleep -Seconds 5
    Write-Host "✅ PostgreSQL service restarted" -ForegroundColor Green
} catch {
    Write-Host "❌ Service restart failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Tạo database
Write-Host "💾 Creating database 'Ninh96'..." -ForegroundColor Cyan
$psqlPath = "C:\Program Files\PostgreSQL\13\bin\psql.exe"

if (Test-Path $psqlPath) {
    $env:PGPASSWORD = "Demo1234"
    
    try {
        # Create database
        & $psqlPath -U postgres -h localhost -p 5499 -c "CREATE DATABASE `"Ninh96`";" 2>$null
        
        # Create tables
        $createTables = @"
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fabric_images (
    id SERIAL PRIMARY KEY,
    album_id INTEGER REFERENCES albums(id),
    filename VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO albums (name, description) VALUES 
('Test Album 1', 'Album thử nghiệm 1'),
('Test Album 2', 'Album thử nghiệm 2');
"@
        
        & $psqlPath -U postgres -h localhost -p 5499 -d "Ninh96" -c $createTables 2>$null
        
        Write-Host "✅ Database and tables created" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Database creation may have failed, but continuing..." -ForegroundColor Yellow
    }
    
    Remove-Item Env:PGPASSWORD
} else {
    Write-Host "❌ psql.exe not found" -ForegroundColor Red
}

# Test kết nối
Write-Host "🧪 Testing database connection..." -ForegroundColor Cyan
$env:PGPASSWORD = "Demo1234"
try {
    $result = & $psqlPath -U postgres -h localhost -p 5499 -d "Ninh96" -c "SELECT COUNT(*) FROM albums;" -t 2>$null
    if ($result) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
        Write-Host "   Albums count: $($result.Trim())" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Connection test failed, but database may still work" -ForegroundColor Yellow
}
Remove-Item Env:PGPASSWORD

Write-Host ""
Write-Host "🎉 SETUP COMPLETED!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Database Information:" -ForegroundColor Cyan
Write-Host "   Host: localhost (or 100.101.50.87 from MacBook)" -ForegroundColor White
Write-Host "   Port: 5499" -ForegroundColor White
Write-Host "   Database: Ninh96" -ForegroundColor White
Write-Host "   Username: postgres" -ForegroundColor White
Write-Host "   Password: Demo1234" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps on MacBook:" -ForegroundColor Cyan
Write-Host "   1. ./scripts/test-windows-database.sh" -ForegroundColor White
Write-Host "   2. ./scripts/switch-database.sh" -ForegroundColor White
Write-Host "   3. npm run dev" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
