# ========================================
# Docker Management Script for Windows
# ========================================

param(
    [string]$Action = "menu"
)

# Colors
function Write-Title {
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

# Check if in project directory
if (!(Test-Path "docker-compose.yml")) {
    Write-Error "docker-compose.yml not found!"
    Write-Info "Please run this script from the project directory"
    Write-Host "Expected: D:\Projects\thuvienanh" -ForegroundColor Gray
    Exit 1
}

# Functions
function Show-Status {
    Write-Title "Container Status"
    docker-compose ps
    
    Write-Host "`n📊 Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream
    
    Write-Host "`n🌐 Testing Endpoints:" -ForegroundColor Cyan
    
    # Test app
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "App: http://localhost:4000 (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-Error "App: http://localhost:4000 (Not responding)"
    }
    
    # Test pgAdmin
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5051" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        Write-Success "pgAdmin: http://localhost:5051 (HTTP $($response.StatusCode))"
    } catch {
        Write-Error "pgAdmin: http://localhost:5051 (Not responding)"
    }
    
    # Test database
    $dbHealth = docker exec tva-postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL: Ready"
    } else {
        Write-Error "PostgreSQL: Not ready"
    }
}

function Show-Logs {
    Write-Title "View Logs"
    Write-Host "1. All services" -ForegroundColor White
    Write-Host "2. App only" -ForegroundColor White
    Write-Host "3. Database only" -ForegroundColor White
    Write-Host "4. pgAdmin only" -ForegroundColor White
    Write-Host "5. Last 50 lines (all)" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Select (1-5)"
    
    switch ($choice) {
        "1" { docker-compose logs -f }
        "2" { docker-compose logs -f fabric-library }
        "3" { docker-compose logs -f postgres }
        "4" { docker-compose logs -f pgadmin }
        "5" { docker-compose logs --tail=50 }
        default { Write-Error "Invalid choice" }
    }
}

function Restart-Services {
    Write-Title "Restart Services"
    Write-Host "1. Restart all" -ForegroundColor White
    Write-Host "2. Restart app only" -ForegroundColor White
    Write-Host "3. Restart database only" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Select (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Info "Restarting all services..."
            docker-compose restart
            Write-Success "All services restarted"
        }
        "2" {
            Write-Info "Restarting app..."
            docker-compose restart fabric-library
            Write-Success "App restarted"
        }
        "3" {
            Write-Info "Restarting database..."
            docker-compose restart postgres
            Write-Success "Database restarted"
        }
        default { Write-Error "Invalid choice" }
    }
}

function Stop-Services {
    Write-Title "Stop Services"
    Write-Host "⚠️  This will stop all containers" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/n)"
    
    if ($confirm -eq 'y') {
        docker-compose stop
        Write-Success "All services stopped"
    }
}

function Start-Services {
    Write-Title "Start Services"
    docker-compose start
    
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 5
    
    Show-Status
}

function Rebuild-Services {
    Write-Title "Rebuild Services"
    Write-Host "⚠️  This will rebuild all Docker images" -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes" -ForegroundColor Gray
    Write-Host ""
    $confirm = Read-Host "Continue? (y/n)"
    
    if ($confirm -eq 'y') {
        Write-Info "Building images..."
        docker-compose build --no-cache
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build completed"
            
            $start = Read-Host "Start services now? (y/n)"
            if ($start -eq 'y') {
                docker-compose up -d
                Write-Success "Services started"
            }
        } else {
            Write-Error "Build failed!"
        }
    }
}

function Backup-Database {
    Write-Title "Backup Database"
    
    $backupDir = "backups"
    if (!(Test-Path $backupDir)) {
        New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$backupDir\db_$timestamp.sql"
    
    Write-Info "Creating backup..."
    docker exec tva-postgres pg_dump -U postgres tva > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        $size = (Get-Item $backupFile).Length / 1KB
        Write-Success "Backup created: $backupFile ($([math]::Round($size, 2)) KB)"
        
        # Also backup uploads
        $uploadsBackup = "$backupDir\uploads_$timestamp.zip"
        if (Test-Path "public\uploads") {
            Compress-Archive -Path "public\uploads" -DestinationPath $uploadsBackup -Force
            Write-Success "Uploads backed up: $uploadsBackup"
        }
    } else {
        Write-Error "Backup failed!"
    }
}

function Restore-Database {
    Write-Title "Restore Database"
    
    $backups = Get-ChildItem "backups\*.sql" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Error "No backup files found in backups\ directory"
        return
    }
    
    Write-Host "Available backups:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $size = $backups[$i].Length / 1KB
        Write-Host "  $($i+1). $($backups[$i].Name) - $([math]::Round($size, 2)) KB - $($backups[$i].LastWriteTime)" -ForegroundColor White
    }
    
    Write-Host ""
    $choice = Read-Host "Select backup to restore (1-$($backups.Count))"
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $backups.Count) {
        $selectedBackup = $backups[[int]$choice - 1]
        
        Write-Host "⚠️  This will replace current database!" -ForegroundColor Yellow
        $confirm = Read-Host "Restore from $($selectedBackup.Name)? (y/n)"
        
        if ($confirm -eq 'y') {
            Write-Info "Restoring database..."
            Get-Content $selectedBackup.FullName | docker exec -i tva-postgres psql -U postgres tva
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database restored successfully"
            } else {
                Write-Error "Restore failed!"
            }
        }
    } else {
        Write-Error "Invalid choice"
    }
}

function Clean-Docker {
    Write-Title "Clean Docker"
    Write-Host "⚠️  This will:" -ForegroundColor Yellow
    Write-Host "  - Stop and remove all containers" -ForegroundColor White
    Write-Host "  - Remove all volumes (DATABASE WILL BE DELETED!)" -ForegroundColor Red
    Write-Host "  - Remove unused images" -ForegroundColor White
    Write-Host ""
    $confirm = Read-Host "Are you sure? (type 'yes' to confirm)"
    
    if ($confirm -eq 'yes') {
        Write-Info "Stopping containers..."
        docker-compose down -v
        
        Write-Info "Cleaning Docker system..."
        docker system prune -af --volumes
        
        Write-Success "Docker cleaned"
        Write-Info "Run .\deploy-windows-tailscale.ps1 to redeploy"
    }
}

function Show-Menu {
    Clear-Host
    Write-Title "Docker Management Menu"
    
    Write-Host ""
    Write-Host "📊 Status & Monitoring" -ForegroundColor Cyan
    Write-Host "  1. Show status" -ForegroundColor White
    Write-Host "  2. View logs" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Service Management" -ForegroundColor Cyan
    Write-Host "  3. Start services" -ForegroundColor White
    Write-Host "  4. Stop services" -ForegroundColor White
    Write-Host "  5. Restart services" -ForegroundColor White
    Write-Host "  6. Rebuild images" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Backup & Restore" -ForegroundColor Cyan
    Write-Host "  7. Backup database" -ForegroundColor White
    Write-Host "  8. Restore database" -ForegroundColor White
    Write-Host ""
    Write-Host "🧹 Maintenance" -ForegroundColor Cyan
    Write-Host "  9. Clean Docker" -ForegroundColor White
    Write-Host ""
    Write-Host "  0. Exit" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Select option (0-9)"
    
    switch ($choice) {
        "1" { Show-Status }
        "2" { Show-Logs }
        "3" { Start-Services }
        "4" { Stop-Services }
        "5" { Restart-Services }
        "6" { Rebuild-Services }
        "7" { Backup-Database }
        "8" { Restore-Database }
        "9" { Clean-Docker }
        "0" { 
            Write-Host "`nGoodbye!" -ForegroundColor Cyan
            Exit 0
        }
        default { Write-Error "Invalid choice" }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

# Main
if ($Action -eq "menu") {
    Show-Menu
} else {
    switch ($Action.ToLower()) {
        "status" { Show-Status }
        "logs" { Show-Logs }
        "start" { Start-Services }
        "stop" { Stop-Services }
        "restart" { Restart-Services }
        "rebuild" { Rebuild-Services }
        "backup" { Backup-Database }
        "restore" { Restore-Database }
        "clean" { Clean-Docker }
        default {
            Write-Error "Unknown action: $Action"
            Write-Host "Usage: .\manage-docker.ps1 [action]" -ForegroundColor Gray
            Write-Host "Actions: status, logs, start, stop, restart, rebuild, backup, restore, clean" -ForegroundColor Gray
        }
    }
}

