# ========================================
# Deploy Thư Viện Ảnh trên Windows 10
# Sử dụng Docker + Tailscale
# ========================================

param(
    [switch]$SkipDocker,
    [switch]$Clean,
    [switch]$Rebuild
)

# Colors
function Write-Step {
    param($Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

# Check Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Script cần chạy với quyền Administrator!"
    Write-Info "Nhấn chuột phải PowerShell và chọn 'Run as Administrator'"
    Exit 1
}

Clear-Host
Write-Step "THƯ VIỆN ẢNH - DOCKER DEPLOYMENT"

# ========================================
# 1. Kiểm tra Docker Desktop
# ========================================
Write-Step "Bước 1: Kiểm tra Docker Desktop"

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Desktop chưa được cài đặt!"
    Write-Host ""
    Write-Info "Hướng dẫn cài đặt Docker Desktop:"
    Write-Host "1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Chạy file cài đặt" -ForegroundColor White
    Write-Host "3. Khởi động lại máy tính" -ForegroundColor White
    Write-Host "4. Mở Docker Desktop và đợi khởi động hoàn tất" -ForegroundColor White
    Write-Host "5. Chạy lại script này" -ForegroundColor White
    Write-Host ""
    
    $install = Read-Host "Bạn có muốn tải Docker Desktop ngay bây giờ? (y/n)"
    if ($install -eq 'y') {
        Start-Process "https://www.docker.com/products/docker-desktop/"
    }
    Exit 1
}

# Kiểm tra Docker đang chạy
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Docker Desktop chưa chạy. Đang khởi động..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    
    Write-Host "Đợi Docker khởi động (có thể mất 1-2 phút)..." -ForegroundColor Yellow
    $attempts = 0
    while ($attempts -lt 60) {
        Start-Sleep -Seconds 2
        docker info > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            break
        }
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if ($attempts -eq 60) {
        Write-Error "Docker Desktop không thể khởi động!"
        Write-Info "Vui lòng mở Docker Desktop thủ công và chạy lại script"
        Exit 1
    }
}

Write-Success "Docker Desktop đang chạy"

# ========================================
# 2. Kiểm tra Tailscale
# ========================================
Write-Step "Bước 2: Kiểm tra Tailscale"

$tailscaleIP = "100.101.50.87"
$currentIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "100.*"}).IPAddress

if ($currentIP -eq $tailscaleIP) {
    Write-Success "Tailscale đang chạy - IP: $tailscaleIP"
} else {
    Write-Info "Tailscale IP hiện tại: $currentIP"
    Write-Info "IP mong đợi: $tailscaleIP"
    Write-Info "Nếu IP khác, cần cập nhật file .env và docker-compose.yml"
}

# ========================================
# 3. Chuẩn bị thư mục dự án
# ========================================
Write-Step "Bước 3: Chuẩn bị thư mục dự án"

$projectPath = "D:\Projects\thuvienanh"
Write-Host "Thư mục dự án: $projectPath" -ForegroundColor White

if (!(Test-Path $projectPath)) {
    Write-Info "Tạo thư mục dự án..."
    New-Item -Path $projectPath -ItemType Directory -Force | Out-Null
}

Set-Location $projectPath

# Kiểm tra Git
if (!(Test-Path ".git")) {
    Write-Info "Chưa có Git repository. Bạn cần:"
    Write-Host "1. Clone code từ repository" -ForegroundColor White
    Write-Host "2. Hoặc copy code từ máy Mac qua Tailscale" -ForegroundColor White
    Write-Host ""
    Write-Host "Ví dụ clone:" -ForegroundColor Yellow
    Write-Host "  git clone <repository-url> ." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ví dụ copy từ Mac qua SCP:" -ForegroundColor Yellow
    Write-Host "  scp -r nihdev@<mac-tailscale-ip>:/Users/nihdev/Web/thuvienanh/* ." -ForegroundColor Gray
    
    $continue = Read-Host "`nBạn đã có code trong thư mục này chưa? (y/n)"
    if ($continue -ne 'y') {
        Exit 1
    }
}

Write-Success "Thư mục dự án OK"

# ========================================
# 4. Kiểm tra file cần thiết
# ========================================
Write-Step "Bước 4: Kiểm tra file cần thiết"

$requiredFiles = @(
    "docker-compose.yml",
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
    Write-Error "Thiếu các file sau:"
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Info "Vui lòng copy đầy đủ code vào thư mục $projectPath"
    Exit 1
}

Write-Success "Tất cả file cần thiết đã có"

# ========================================
# 5. Tạo thư mục cần thiết
# ========================================
Write-Step "Bước 5: Tạo thư mục"

$directories = @("logs", "backups", "public/uploads")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}

Write-Success "Thư mục đã được tạo"

# ========================================
# 6. Dọn dẹp (nếu cần)
# ========================================
if ($Clean) {
    Write-Step "Bước 6: Dọn dẹp Docker"
    
    Write-Info "Dừng và xóa containers cũ..."
    docker-compose down -v 2>$null
    
    Write-Info "Xóa images cũ..."
    docker system prune -af --volumes
    
    Write-Success "Đã dọn dẹp Docker"
}

# ========================================
# 7. Build và Start Docker
# ========================================
Write-Step "Bước 7: Khởi động Docker Containers"

if ($Rebuild) {
    Write-Info "Build lại images (có thể mất 5-10 phút)..."
    docker-compose build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build thất bại!"
        Exit 1
    }
}

Write-Info "Khởi động containers..."
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Không thể khởi động containers!"
    Write-Host ""
    Write-Host "Xem logs để debug:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs" -ForegroundColor Gray
    Exit 1
}

Write-Success "Containers đã được khởi động"

# ========================================
# 8. Đợi services sẵn sàng
# ========================================
Write-Step "Bước 8: Kiểm tra services"

Write-Info "Đợi PostgreSQL sẵn sàng..."
$attempts = 0
while ($attempts -lt 30) {
    $pgHealth = docker exec tva-postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL đã sẵn sàng"
        break
    }
    Start-Sleep -Seconds 2
    $attempts++
    Write-Host "." -NoNewline
}
Write-Host ""

if ($attempts -eq 30) {
    Write-Error "PostgreSQL không khởi động được!"
    docker-compose logs postgres
    Exit 1
}

Write-Info "Đợi Next.js app sẵn sàng..."
Start-Sleep -Seconds 5

$attempts = 0
while ($attempts -lt 30) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "Next.js app đã sẵn sàng"
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
    $attempts++
    Write-Host "." -NoNewline
}
Write-Host ""

# ========================================
# 9. Cấu hình Firewall
# ========================================
Write-Step "Bước 9: Cấu hình Windows Firewall"

$ports = @(4000, 5051, 5434)
foreach ($port in $ports) {
    Remove-NetFirewallRule -DisplayName "TVA-Port-$port" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "TVA-Port-$port" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow | Out-Null
}

Write-Success "Firewall đã được cấu hình"

# ========================================
# 10. Hiển thị thông tin
# ========================================
Write-Step "✅ DEPLOYMENT HOÀN TẤT!"

Write-Host ""
Write-Host "📊 Trạng thái Containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🌐 Địa chỉ truy cập:" -ForegroundColor Cyan
Write-Host "  Local (Windows):     http://localhost:4000" -ForegroundColor White
Write-Host "  Tailscale Network:   http://$tailscaleIP:4000" -ForegroundColor White
Write-Host "  pgAdmin:             http://localhost:5051" -ForegroundColor White
Write-Host "                       Email: admin@tva.com" -ForegroundColor Gray
Write-Host "                       Pass:  Villad24@" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 Lệnh quản lý hữu ích:" -ForegroundColor Cyan
Write-Host "  Xem logs:            docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Xem logs app:        docker-compose logs -f fabric-library" -ForegroundColor Gray
Write-Host "  Restart app:         docker-compose restart fabric-library" -ForegroundColor Gray
Write-Host "  Stop tất cả:         docker-compose stop" -ForegroundColor Gray
Write-Host "  Start lại:           docker-compose start" -ForegroundColor Gray
Write-Host "  Xóa tất cả:          docker-compose down -v" -ForegroundColor Gray

Write-Host ""
Write-Host "📱 Truy cập từ Mac qua Tailscale:" -ForegroundColor Cyan
Write-Host "  http://$tailscaleIP:4000" -ForegroundColor White

Write-Host ""
Write-Host "💾 Backup Database:" -ForegroundColor Cyan
Write-Host "  docker exec tva-postgres pg_dump -U postgres tva > backup.sql" -ForegroundColor Gray

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

