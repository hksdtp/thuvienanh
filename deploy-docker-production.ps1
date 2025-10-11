# Production Deployment Script - Thư Viện Ảnh
# Requires: Windows 10 Pro/Enterprise with Docker Desktop

param(
    [switch]$SkipBuild,
    [switch]$Clean,
    [switch]$Backup
)

# Colors for output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Status {
    param($Message, $Color = "Cyan")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Header
Clear-Host
Write-Status "================================================" "Cyan"
Write-Status "     THƯ VIỆN ẢNH - PRODUCTION DEPLOYMENT" "Cyan"
Write-Status "================================================" "Cyan"
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Script requires Administrator privileges!"
    Write-Warning "Please run PowerShell as Administrator"
    Exit 1
}

# Check Docker Desktop
Write-Status "🔍 Checking Docker Desktop..." "Yellow"
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Desktop is not installed!"
    Write-Warning "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    Write-Host ""
    Write-Host "Installation steps:" -ForegroundColor Yellow
    Write-Host "1. Download Docker Desktop for Windows" -ForegroundColor White
    Write-Host "2. Install and restart computer" -ForegroundColor White
    Write-Host "3. Enable WSL 2 in Docker settings" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Exit 1
}

# Check if Docker is running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker Desktop is not running!"
    Write-Warning "Starting Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    
    Write-Host "Waiting for Docker to start (this may take 1-2 minutes)..." -ForegroundColor Yellow
    $attempts = 0
    while ($attempts -lt 30) {
        Start-Sleep -Seconds 2
        docker info > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            break
        }
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if ($attempts -eq 30) {
        Write-Error "Docker Desktop failed to start!"
        Exit 1
    }
}

Write-Success "Docker Desktop is running"

# Check WSL2
Write-Status "🔍 Checking WSL2..." "Yellow"
$wslVersion = wsl --status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warning "WSL2 not installed. Installing..."
    wsl --install
    Write-Warning "Please restart your computer after WSL2 installation completes"
    Exit 1
}
Write-Success "WSL2 is installed"

# System Requirements Check
Write-Host ""
Write-Status "📊 System Requirements Check" "Cyan"

# RAM Check
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB, 2)
if ($totalRAM -ge 16) {
    Write-Success "RAM: ${totalRAM}GB (Excellent)"
} elseif ($totalRAM -ge 8) {
    Write-Warning "RAM: ${totalRAM}GB (Minimum - may experience slowness)"
} else {
    Write-Error "RAM: ${totalRAM}GB (Insufficient - need at least 8GB)"
    Exit 1
}

# Disk Space Check
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free/1GB, 2)
if ($freeGB -ge 50) {
    Write-Success "Disk Space: ${freeGB}GB free (Good)"
} elseif ($freeGB -ge 20) {
    Write-Warning "Disk Space: ${freeGB}GB free (Tight - monitor usage)"
} else {
    Write-Error "Disk Space: ${freeGB}GB free (Insufficient)"
    Exit 1
}

# Create backup if requested
if ($Backup) {
    Write-Host ""
    Write-Status "💾 Creating backup..." "Yellow"
    
    $backupDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
    
    # Backup database if exists
    docker exec tva-postgres-prod pg_dump -U postgres Ninh96 > "$backupDir\database.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database backed up"
    }
    
    # Backup uploads if exists
    if (Test-Path ".\public\uploads") {
        Compress-Archive -Path ".\public\uploads" -DestinationPath "$backupDir\uploads.zip"
        Write-Success "Uploads backed up"
    }
}

# Clean everything if requested
if ($Clean) {
    Write-Host ""
    Write-Status "🧹 Cleaning Docker environment..." "Yellow"
    docker-compose -f docker-compose.prod.windows.yml down -v
    docker system prune -af --volumes
    Write-Success "Docker environment cleaned"
}

# Pull latest code
Write-Host ""
Write-Status "📥 Pulling latest code..." "Yellow"
git pull origin main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Code updated"
} else {
    Write-Warning "Could not pull latest code (may not be a git repository)"
}

# Check for required files
Write-Host ""
Write-Status "📁 Checking required files..." "Yellow"

$requiredFiles = @(
    "docker-compose.prod.windows.yml",
    "Dockerfile",
    "package.json",
    "next.config.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error "Missing required files:"
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Exit 1
}
Write-Success "All required files present"

# Create necessary directories
Write-Status "📁 Creating directories..." "Yellow"
$directories = @("logs", "backups", "nginx", "nginx/ssl")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}
Write-Success "Directories created"

# Stop existing containers
Write-Host ""
Write-Status "🛑 Stopping existing containers..." "Yellow"
docker-compose -f docker-compose.prod.windows.yml stop 2>$null
Write-Success "Existing containers stopped"

# Build images
if (!$SkipBuild) {
    Write-Host ""
    Write-Status "🔨 Building production images..." "Yellow"
    Write-Host "This may take 5-10 minutes on first run..." -ForegroundColor Gray
    
    docker-compose -f docker-compose.prod.windows.yml build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        Exit 1
    }
    Write-Success "Images built successfully"
}

# Start services
Write-Host ""
Write-Status "🚀 Starting production services..." "Yellow"
docker-compose -f docker-compose.prod.windows.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start services!"
    Write-Host "Check logs with: docker-compose -f docker-compose.prod.windows.yml logs" -ForegroundColor Yellow
    Exit 1
}

# Wait for services to be healthy
Write-Host ""
Write-Status "⏳ Waiting for services to be healthy..." "Yellow"
Write-Host "Checking PostgreSQL..." -ForegroundColor Gray

$attempts = 0
$maxAttempts = 30
while ($attempts -lt $maxAttempts) {
    $pgHealth = docker exec tva-postgres-prod pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL is ready"
        break
    }
    Start-Sleep -Seconds 2
    $attempts++
    Write-Host "." -NoNewline
}
Write-Host ""

if ($attempts -eq $maxAttempts) {
    Write-Error "PostgreSQL failed to start!"
    docker-compose -f docker-compose.prod.windows.yml logs postgres
    Exit 1
}

Write-Host "Checking Next.js app..." -ForegroundColor Gray
Start-Sleep -Seconds 5

$attempts = 0
while ($attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "Next.js app is ready"
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
    $attempts++
    Write-Host "." -NoNewline
}
Write-Host ""

if ($attempts -eq $maxAttempts) {
    Write-Warning "App may still be starting. Check logs for details."
}

# Get system information
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
$publicIP = $null
try {
    $publicIP = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 5 -ErrorAction SilentlyContinue)
} catch {}

# Configure Windows Firewall
Write-Host ""
Write-Status "🔥 Configuring Windows Firewall..." "Yellow"
$firewallRules = @(
    @{Name="Docker HTTP"; Port=80},
    @{Name="Docker HTTPS"; Port=443},
    @{Name="Docker App"; Port=3000},
    @{Name="Docker Portainer"; Port=9000}
)

foreach ($rule in $firewallRules) {
    Remove-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol TCP -LocalPort $rule.Port -Action Allow | Out-Null
}
Write-Success "Firewall configured"

# Display summary
Write-Host ""
Write-Status "================================================" "Green"
Write-Status "     ✅ DEPLOYMENT SUCCESSFUL!" "Green"
Write-Status "================================================" "Green"
Write-Host ""

Write-Status "📊 Service Status:" "Cyan"
docker-compose -f docker-compose.prod.windows.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Status "🌐 Access URLs:" "Cyan"
Write-Host "  Application:    " -NoNewline
Write-Host "http://localhost" -ForegroundColor White
if ($localIP) {
    Write-Host "  LAN Access:     " -NoNewline
    Write-Host "http://${localIP}" -ForegroundColor White
}
if ($publicIP) {
    Write-Host "  Public IP:      " -NoNewline
    Write-Host "http://${publicIP}" -ForegroundColor White
}
Write-Host "  Portainer UI:   " -NoNewline
Write-Host "http://localhost:9000" -ForegroundColor White

Write-Host ""
Write-Status "🔧 Management Commands:" "Cyan"
Write-Host "  View logs:      " -NoNewline
Write-Host "docker-compose -f docker-compose.prod.windows.yml logs -f app" -ForegroundColor Gray
Write-Host "  Restart app:    " -NoNewline
Write-Host "docker-compose -f docker-compose.prod.windows.yml restart app" -ForegroundColor Gray
Write-Host "  Stop all:       " -NoNewline
Write-Host "docker-compose -f docker-compose.prod.windows.yml stop" -ForegroundColor Gray
Write-Host "  Check status:   " -NoNewline
Write-Host "docker-compose -f docker-compose.prod.windows.yml ps" -ForegroundColor Gray
Write-Host "  Backup DB:      " -NoNewline
Write-Host "docker exec tva-postgres-prod pg_dump -U postgres Ninh96 > backup.sql" -ForegroundColor Gray

if ($publicIP) {
    Write-Host ""
    Write-Status "⚠️  For Public Access:" "Yellow"
    Write-Host "  1. Configure port forwarding on your router:" -ForegroundColor White
    Write-Host "     - External Port 80 → Internal ${localIP}:80" -ForegroundColor Gray
    Write-Host "     - External Port 443 → Internal ${localIP}:443 (for HTTPS)" -ForegroundColor Gray
    Write-Host "  2. Consider using Dynamic DNS if no static IP" -ForegroundColor White
    Write-Host "  3. Setup SSL certificate for HTTPS" -ForegroundColor White
}

Write-Host ""
Write-Status "📝 Important Notes:" "Yellow"
Write-Host "  • Windows 10 limits: Max 20 concurrent connections" -ForegroundColor White
Write-Host "  • For production: Consider VPS (DigitalOcean, Vultr, Oracle Free)" -ForegroundColor White
Write-Host "  • Monitor resources: Open Portainer at http://localhost:9000" -ForegroundColor White
Write-Host "  • Backup regularly: Use -Backup flag when running this script" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
