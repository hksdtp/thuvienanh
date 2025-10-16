# Install Docker Desktop on Windows
# Run this script as Administrator

Write-Host "🐳 Installing Docker Desktop on Windows..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check Windows version
$osInfo = Get-CimInstance Win32_OperatingSystem
Write-Host "📋 Windows Version: $($osInfo.Caption) $($osInfo.Version)" -ForegroundColor Green

# Step 1: Enable WSL 2
Write-Host ""
Write-Host "📦 Step 1: Enabling WSL 2..." -ForegroundColor Yellow

# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "✅ WSL features enabled" -ForegroundColor Green

# Step 2: Download and install WSL 2 kernel update
Write-Host ""
Write-Host "📥 Step 2: Installing WSL 2 kernel update..." -ForegroundColor Yellow

$wslUpdateUrl = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
$wslUpdatePath = "$env:TEMP\wsl_update_x64.msi"

try {
    Write-Host "Downloading WSL 2 kernel update..."
    Invoke-WebRequest -Uri $wslUpdateUrl -OutFile $wslUpdatePath -UseBasicParsing
    
    Write-Host "Installing WSL 2 kernel update..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i $wslUpdatePath /quiet /norestart"
    
    Write-Host "✅ WSL 2 kernel update installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WSL 2 kernel update failed, but continuing..." -ForegroundColor Yellow
}

# Set WSL 2 as default
wsl --set-default-version 2

# Step 3: Download Docker Desktop
Write-Host ""
Write-Host "📥 Step 3: Downloading Docker Desktop..." -ForegroundColor Yellow

$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"

try {
    Write-Host "Downloading Docker Desktop (this may take a few minutes)..."
    Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller -UseBasicParsing
    Write-Host "✅ Docker Desktop downloaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Docker Desktop" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Install Docker Desktop
Write-Host ""
Write-Host "📦 Step 4: Installing Docker Desktop..." -ForegroundColor Yellow
Write-Host "This will take several minutes. Please wait..." -ForegroundColor Yellow

try {
    Start-Process -FilePath $dockerInstaller -ArgumentList "install --quiet --accept-license" -Wait
    Write-Host "✅ Docker Desktop installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop installation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item $dockerInstaller -ErrorAction SilentlyContinue
Remove-Item $wslUpdatePath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: You MUST restart your computer now!" -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart:" -ForegroundColor Cyan
Write-Host "  1. Docker Desktop will start automatically" -ForegroundColor White
Write-Host "  2. Accept the Docker Desktop Service Agreement" -ForegroundColor White
Write-Host "  3. Wait for Docker to finish starting (check system tray)" -ForegroundColor White
Write-Host "  4. Open PowerShell and run: docker --version" -ForegroundColor White
Write-Host ""
Write-Host "Do you want to restart now? (Y/N): " -ForegroundColor Yellow -NoNewline
$restart = Read-Host

if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host "Restarting in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Restart-Computer -Force
} else {
    Write-Host "Please restart your computer manually to complete the installation." -ForegroundColor Yellow
}

