# Windows 10 Deployment Requirements Checker
# Kiểm tra xem máy Windows 10 có đủ điều kiện để deploy không

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KIỂM TRA YÊU CẦU HỆ THỐNG" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$requirements = @{
    "Windows Version" = $true
    "RAM" = $true
    "CPU Cores" = $true
    "Disk Space" = $true
    "Network" = $true
    "Ports" = $true
    "Admin Rights" = $true
}

$canDeploy = $true

# Check Windows version
Write-Host "🔍 Checking Windows version..." -ForegroundColor Yellow
$os = Get-CimInstance -ClassName Win32_OperatingSystem
$version = $os.Version
$edition = $os.Caption

if ($edition -like "*Windows 10*") {
    if ($edition -like "*Pro*" -or $edition -like "*Enterprise*" -or $edition -like "*Education*") {
        Write-Host "  ✅ $edition (Good for deployment)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $edition (Home edition has limitations)" -ForegroundColor Yellow
        Write-Host "     Recommended: Upgrade to Pro/Enterprise" -ForegroundColor Gray
        $requirements["Windows Version"] = $false
    }
} else {
    Write-Host "  ❌ $edition (Not Windows 10)" -ForegroundColor Red
    $requirements["Windows Version"] = $false
    $canDeploy = $false
}

# Check RAM
Write-Host "🔍 Checking RAM..." -ForegroundColor Yellow
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB, 2)
if ($totalRAM -ge 8) {
    Write-Host "  ✅ RAM: ${totalRAM}GB (Good)" -ForegroundColor Green
} elseif ($totalRAM -ge 4) {
    Write-Host "  ⚠️  RAM: ${totalRAM}GB (Minimum, may be slow)" -ForegroundColor Yellow
    $requirements["RAM"] = $false
} else {
    Write-Host "  ❌ RAM: ${totalRAM}GB (Not enough)" -ForegroundColor Red
    $requirements["RAM"] = $false
    $canDeploy = $false
}

# Check CPU
Write-Host "🔍 Checking CPU..." -ForegroundColor Yellow
$cpu = Get-CimInstance Win32_Processor
$cores = $cpu.NumberOfCores
$logical = $cpu.NumberOfLogicalProcessors
$cpuName = $cpu.Name

if ($cores -ge 4) {
    Write-Host "  ✅ CPU: $cpuName" -ForegroundColor Green
    Write-Host "     Cores: $cores, Logical: $logical (Good)" -ForegroundColor Green
} elseif ($cores -ge 2) {
    Write-Host "  ⚠️  CPU: $cpuName" -ForegroundColor Yellow
    Write-Host "     Cores: $cores, Logical: $logical (Minimum)" -ForegroundColor Yellow
    $requirements["CPU Cores"] = $false
} else {
    Write-Host "  ❌ CPU: Only $cores cores (Not enough)" -ForegroundColor Red
    $requirements["CPU Cores"] = $false
    $canDeploy = $false
}

# Check Disk Space
Write-Host "🔍 Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free/1GB, 2)
$totalGB = [math]::Round(($drive.Used + $drive.Free)/1GB, 2)

if ($freeGB -ge 50) {
    Write-Host "  ✅ Disk C: ${freeGB}GB free of ${totalGB}GB (Good)" -ForegroundColor Green
} elseif ($freeGB -ge 20) {
    Write-Host "  ⚠️  Disk C: ${freeGB}GB free of ${totalGB}GB (Tight)" -ForegroundColor Yellow
    $requirements["Disk Space"] = $false
} else {
    Write-Host "  ❌ Disk C: ${freeGB}GB free (Not enough)" -ForegroundColor Red
    $requirements["Disk Space"] = $false
    $canDeploy = $false
}

# Check Network
Write-Host "🔍 Checking network..." -ForegroundColor Yellow
$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
if ($adapters) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object -First 1).IPAddress
    Write-Host "  ✅ Network adapter active" -ForegroundColor Green
    Write-Host "     Local IP: $ip" -ForegroundColor Gray
    
    # Check public IP
    try {
        $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 5
        Write-Host "     Public IP: $publicIP" -ForegroundColor Gray
    } catch {
        Write-Host "     ⚠️  Cannot get public IP (check internet connection)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ No active network adapter" -ForegroundColor Red
    $requirements["Network"] = $false
    $canDeploy = $false
}

# Check if required ports are available
Write-Host "🔍 Checking required ports..." -ForegroundColor Yellow
$portsToCheck = @(3000, 5432)
$portsInUse = @()

foreach ($port in $portsToCheck) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
        Write-Host "  ⚠️  Port $port is already in use" -ForegroundColor Yellow
    }
}

if ($portsInUse.Count -eq 0) {
    Write-Host "  ✅ All required ports available (3000, 5432)" -ForegroundColor Green
} else {
    $requirements["Ports"] = $false
    Write-Host "  ⚠️  Some ports are in use: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "     You'll need to use different ports or stop conflicting services" -ForegroundColor Gray
}

# Check Admin rights
Write-Host "🔍 Checking administrator rights..." -ForegroundColor Yellow
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if ($isAdmin) {
    Write-Host "  ✅ Running as Administrator" -ForegroundColor Green
} else {
    Write-Host "  ❌ Not running as Administrator" -ForegroundColor Red
    Write-Host "     Re-run this script as Administrator" -ForegroundColor Gray
    $requirements["Admin Rights"] = $false
}

# Check installed software
Write-Host ""
Write-Host "📦 Checking installed software..." -ForegroundColor Yellow

function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

$software = @{
    "Node.js" = Test-Command "node"
    "Git" = Test-Command "git"  
    "PostgreSQL" = Test-Command "psql"
    "PM2" = Test-Command "pm2"
}

foreach ($app in $software.Keys) {
    if ($software[$app]) {
        if ($app -eq "Node.js") {
            $version = node --version
            Write-Host "  ✅ $app installed ($version)" -ForegroundColor Green
        } else {
            Write-Host "  ✅ $app installed" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  $app not installed (will be installed during deployment)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KẾT QUẢ KIỂM TRA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passedChecks = ($requirements.Values | Where-Object {$_ -eq $true}).Count
$totalChecks = $requirements.Count

if ($canDeploy) {
    Write-Host "✅ HỆ THỐNG ĐỦ ĐIỀU KIỆN DEPLOY!" -ForegroundColor Green
    Write-Host "   Passed $passedChecks/$totalChecks critical checks" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run .\deploy-windows.ps1 as Administrator" -ForegroundColor White
    Write-Host "2. Configure router port forwarding" -ForegroundColor White
    Write-Host "3. Setup Dynamic DNS (if no static IP)" -ForegroundColor White
} else {
    Write-Host "❌ HỆ THỐNG CHƯA ĐỦ ĐIỀU KIỆN!" -ForegroundColor Red
    Write-Host "   Passed only $passedChecks/$totalChecks critical checks" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please fix the following issues:" -ForegroundColor Yellow
    foreach ($req in $requirements.Keys) {
        if (-not $requirements[$req]) {
            Write-Host "  - $req" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📝 Recommendations:" -ForegroundColor Yellow
Write-Host "  • Consider using a VPS for better performance" -ForegroundColor White
Write-Host "  • Linux VPS options: DigitalOcean ($6/mo), Vultr ($5/mo)" -ForegroundColor White
Write-Host "  • Free option: Oracle Cloud Free Tier" -ForegroundColor White
Write-Host "  • Or use Windows Server 2019/2022 for production" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
