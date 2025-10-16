# ========================================
# Deploy Thư Viện Ảnh - Production
# Windows Server + Cloudflare Tunnel
# Domain: thuvienanh.incanto.my
# ========================================

param(
    [switch]$SkipDocker,
    [switch]$SkipCloudflare,
    [switch]$Clean,
    [switch]$Rebuild,
    [switch]$SetupAutoStart
)

# Require Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Script cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "Nhấn chuột phải PowerShell và chọn 'Run as Administrator'" -ForegroundColor Yellow
    Exit 1
}

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

Clear-Host
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   THƯ VIỆN ẢNH - PRODUCTION DEPLOYMENT            ║" -ForegroundColor Cyan
Write-Host "║   Domain: thuvienanh.incanto.my                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ========================================
# 1. Kiểm tra Docker Desktop
# ========================================
Write-Step "Bước 1: Kiểm tra Docker Desktop"

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Desktop chưa được cài đặt!"
    Write-Info "Tải Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Exit 1
}

# Kiểm tra Docker đang chạy
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Đang khởi động Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    
    $attempts = 0
    while ($attempts -lt 60) {
        Start-Sleep -Seconds 2
        docker info > $null 2>&1
        if ($LASTEXITCODE -eq 0) { break }
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if ($attempts -eq 60) {
        Write-Error "Docker Desktop không thể khởi động!"
        Exit 1
    }
}

Write-Success "Docker Desktop đang chạy"

# ========================================
# 2. Kiểm tra PostgreSQL
# ========================================
Write-Step "Bước 2: Kiểm tra PostgreSQL"

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Success "PostgreSQL đang chạy"
} else {
    Write-Error "PostgreSQL chưa chạy!"
    Write-Info "Vui lòng khởi động PostgreSQL service"
    Exit 1
}

# Test database connection
try {
    $env:PGPASSWORD = "haininh1"
    $result = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d tva -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Kết nối database thành công"
    } else {
        Write-Error "Không thể kết nối database 'tva'"
        Write-Info "Kiểm tra database có tồn tại không"
    }
} catch {
    Write-Info "Không thể test database connection (psql không tìm thấy)"
}

# ========================================
# 3. Chuẩn bị thư mục
# ========================================
Write-Step "Bước 3: Chuẩn bị thư mục"

$projectPath = "D:\Projects\thuvienanh"
if (!(Test-Path $projectPath)) {
    Write-Error "Thư mục dự án không tồn tại: $projectPath"
    Exit 1
}

Set-Location $projectPath

$directories = @("logs", "backups", "public/uploads", "cloudflare")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}

Write-Success "Thư mục đã sẵn sàng"

# ========================================
# 4. Kiểm tra file cần thiết
# ========================================
Write-Step "Bước 4: Kiểm tra file cần thiết"

$requiredFiles = @(
    "docker-compose.production.windows.yml",
    "Dockerfile",
    "package.json",
    ".env.production"
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
    Exit 1
}

Write-Success "Tất cả file cần thiết đã có"

# ========================================
# 5. Dọn dẹp (nếu cần)
# ========================================
if ($Clean) {
    Write-Step "Bước 5: Dọn dẹp Docker"
    
    Write-Info "Dừng containers cũ..."
    docker-compose -f docker-compose.production.windows.yml down 2>$null
    
    if ($Rebuild) {
        Write-Info "Xóa images cũ..."
        docker rmi thuvienanh:production -f 2>$null
    }
    
    Write-Success "Đã dọn dẹp"
}

# ========================================
# 6. Build và Start Docker
# ========================================
if (!$SkipDocker) {
    Write-Step "Bước 6: Deploy Docker Containers"
    
    if ($Rebuild) {
        Write-Info "Build image (có thể mất 5-10 phút)..."
        docker-compose -f docker-compose.production.windows.yml build --no-cache
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build thất bại!"
            Exit 1
        }
    }
    
    Write-Info "Khởi động containers..."
    docker-compose -f docker-compose.production.windows.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Không thể khởi động containers!"
        docker-compose -f docker-compose.production.windows.yml logs
        Exit 1
    }
    
    Write-Success "Containers đã được khởi động"
    
    # Đợi app sẵn sàng
    Write-Info "Đợi app sẵn sàng..."
    Start-Sleep -Seconds 10
    
    $attempts = 0
    while ($attempts -lt 30) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "App đã sẵn sàng"
                break
            }
        } catch {}
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""
}

# ========================================
# 7. Cấu hình Windows Firewall
# ========================================
Write-Step "Bước 7: Cấu hình Windows Firewall"

$ports = @(4000, 9000)
foreach ($port in $ports) {
    Remove-NetFirewallRule -DisplayName "TVA-Prod-$port" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "TVA-Prod-$port" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow | Out-Null
}

Write-Success "Firewall đã được cấu hình"

# ========================================
# 8. Cài đặt và Cấu hình Cloudflare Tunnel
# ========================================
if (!$SkipCloudflare) {
    Write-Step "Bước 8: Cloudflare Tunnel"

    # Kiểm tra cloudflared đã cài chưa
    $cloudflaredPath = "C:\Program Files\cloudflared\cloudflared.exe"

    if (!(Test-Path $cloudflaredPath)) {
        Write-Info "Cloudflared chưa được cài đặt"
        Write-Host ""
        Write-Host "Hướng dẫn cài đặt Cloudflare Tunnel:" -ForegroundColor Yellow
        Write-Host "1. Tải cloudflared từ: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor White
        Write-Host "2. Tải file: cloudflared-windows-amd64.exe" -ForegroundColor White
        Write-Host "3. Đổi tên thành cloudflared.exe" -ForegroundColor White
        Write-Host "4. Di chuyển vào: C:\Program Files\cloudflared\" -ForegroundColor White
        Write-Host "5. Chạy lại script này" -ForegroundColor White
        Write-Host ""

        $download = Read-Host "Bạn có muốn tải cloudflared ngay bây giờ? (y/n)"
        if ($download -eq 'y') {
            Write-Info "Đang tải cloudflared..."

            # Tạo thư mục
            New-Item -Path "C:\Program Files\cloudflared" -ItemType Directory -Force | Out-Null

            # Tải file
            $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
            $outputPath = "C:\Program Files\cloudflared\cloudflared.exe"

            try {
                Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
                Write-Success "Đã tải cloudflared"
            } catch {
                Write-Error "Không thể tải cloudflared: $_"
                Write-Info "Vui lòng tải thủ công từ: $downloadUrl"
                Exit 1
            }
        } else {
            Write-Info "Bỏ qua cài đặt Cloudflare Tunnel"
            Write-Info "Chạy lại script với -SkipCloudflare để bỏ qua bước này"
            Exit 0
        }
    }

    Write-Success "Cloudflared đã được cài đặt"

    # Kiểm tra đã login chưa
    $certPath = "$env:USERPROFILE\.cloudflared\cert.pem"
    if (!(Test-Path $certPath)) {
        Write-Info "Chưa đăng nhập Cloudflare"
        Write-Host ""
        Write-Host "Đang mở trình duyệt để đăng nhập Cloudflare..." -ForegroundColor Yellow
        Write-Host "Vui lòng đăng nhập và authorize cloudflared" -ForegroundColor Yellow
        Write-Host ""

        & $cloudflaredPath tunnel login

        if (!(Test-Path $certPath)) {
            Write-Error "Đăng nhập thất bại!"
            Exit 1
        }

        Write-Success "Đã đăng nhập Cloudflare"
    }

    # Tạo hoặc kiểm tra tunnel
    $tunnelName = "thuvienanh-tunnel"
    $tunnelList = & $cloudflaredPath tunnel list 2>&1

    if ($tunnelList -notmatch $tunnelName) {
        Write-Info "Tạo Cloudflare Tunnel mới..."
        & $cloudflaredPath tunnel create $tunnelName

        if ($LASTEXITCODE -ne 0) {
            Write-Error "Không thể tạo tunnel!"
            Exit 1
        }

        Write-Success "Đã tạo tunnel: $tunnelName"
    } else {
        Write-Success "Tunnel đã tồn tại: $tunnelName"
    }

    # Lấy Tunnel ID
    $tunnelInfo = & $cloudflaredPath tunnel list | Select-String $tunnelName
    $tunnelId = ($tunnelInfo -split '\s+')[0]

    Write-Info "Tunnel ID: $tunnelId"

    # Tạo config file
    $configPath = "$env:USERPROFILE\.cloudflared\config.yml"
    $configContent = @"
tunnel: $tunnelId
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

ingress:
  - hostname: thuvienanh.incanto.my
    service: http://localhost:4000
  - service: http_status:404
"@

    $configContent | Out-File -FilePath $configPath -Encoding UTF8
    Write-Success "Đã tạo config file"

    # Cấu hình DNS (nếu chưa có)
    Write-Info "Cấu hình DNS..."
    Write-Host "Chạy lệnh sau để cấu hình DNS (nếu chưa có):" -ForegroundColor Yellow
    Write-Host "  cloudflared tunnel route dns $tunnelName thuvienanh.incanto.my" -ForegroundColor Gray
    Write-Host ""

    $setupDns = Read-Host "Bạn có muốn cấu hình DNS ngay bây giờ? (y/n)"
    if ($setupDns -eq 'y') {
        & $cloudflaredPath tunnel route dns $tunnelName thuvienanh.incanto.my
    }

    # Dừng service cũ (nếu có)
    Stop-Service -Name "cloudflared" -ErrorAction SilentlyContinue

    # Cài đặt service
    Write-Info "Cài đặt Cloudflare Tunnel service..."
    & $cloudflaredPath service install

    # Khởi động service
    Start-Service -Name "cloudflared"

    # Set auto-start
    Set-Service -Name "cloudflared" -StartupType Automatic

    Write-Success "Cloudflare Tunnel đã được cài đặt và khởi động"
    Write-Info "Domain: https://thuvienanh.incanto.my"
}

# ========================================
# 9. Setup Auto-Start (Optional)
# ========================================
if ($SetupAutoStart) {
    Write-Step "Bước 9: Cấu hình Auto-Start"

    # Docker Desktop auto-start (đã có sẵn trong settings)
    Write-Info "Docker Desktop: Đảm bảo 'Start Docker Desktop when you log in' đã được bật"

    # Cloudflare Tunnel đã được cài như service, sẽ tự động start
    Write-Success "Cloudflare Tunnel service đã được cấu hình auto-start"

    # Tạo Task Scheduler để start Docker containers
    $taskName = "ThuVienAnh-AutoStart"
    $taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

    if ($taskExists) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    $action = New-ScheduledTaskAction -Execute "docker-compose" -Argument "-f $projectPath\docker-compose.production.windows.yml up -d" -WorkingDirectory $projectPath
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings | Out-Null

    Write-Success "Đã tạo Task Scheduler: $taskName"
}

# ========================================
# 10. Hiển thị thông tin
# ========================================
Write-Step "✅ DEPLOYMENT HOÀN TẤT!"

Write-Host ""
Write-Host "📊 Trạng thái Containers:" -ForegroundColor Cyan
docker-compose -f docker-compose.production.windows.yml ps

Write-Host ""
Write-Host "🌐 Địa chỉ truy cập:" -ForegroundColor Cyan
Write-Host "  Production (HTTPS):  https://thuvienanh.incanto.my" -ForegroundColor Green
Write-Host "  Local (HTTP):        http://localhost:4000" -ForegroundColor White
Write-Host "  Portainer:           http://localhost:9000" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Lệnh quản lý:" -ForegroundColor Cyan
Write-Host "  Xem logs:            docker-compose -f docker-compose.production.windows.yml logs -f" -ForegroundColor Gray
Write-Host "  Restart app:         docker-compose -f docker-compose.production.windows.yml restart app" -ForegroundColor Gray
Write-Host "  Stop:                docker-compose -f docker-compose.production.windows.yml stop" -ForegroundColor Gray
Write-Host "  Start:               docker-compose -f docker-compose.production.windows.yml start" -ForegroundColor Gray

Write-Host ""
Write-Host "☁️  Cloudflare Tunnel:" -ForegroundColor Cyan
Write-Host "  Status:              Get-Service cloudflared" -ForegroundColor Gray
Write-Host "  Restart:             Restart-Service cloudflared" -ForegroundColor Gray
Write-Host "  Logs:                cloudflared tunnel info thuvienanh-tunnel" -ForegroundColor Gray

Write-Host ""
Write-Host "💾 Backup Database:" -ForegroundColor Cyan
Write-Host "  pg_dump -U postgres -d tva > backups\backup_`$(Get-Date -Format 'yyyyMMdd_HHmmss').sql" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Dự án đã sẵn sàng tại: https://thuvienanh.incanto.my" -ForegroundColor Green
Write-Host ""

