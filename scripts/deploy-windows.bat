@echo off
echo ========================================
echo Deploy Thuvienanh to Windows Server
echo ========================================
echo.

cd C:\Users\Administrator\thuvienanh

echo [1/4] Stopping container...
docker-compose -f docker-compose.production.windows.yml down

echo.
echo [2/4] Removing old image...
docker rmi thuvienanh:production

echo.
echo [3/4] Building new image...
docker-compose -f docker-compose.production.windows.yml build --no-cache app

echo.
echo [4/4] Starting container...
docker-compose -f docker-compose.production.windows.yml up -d app

echo.
echo ========================================
echo Deploy completed!
echo ========================================
echo.
echo Waiting for container to start...
timeout /t 5 /nobreak

echo.
echo Checking container status...
docker ps | findstr thuvienanh

echo.
echo Testing database connection...
curl -s https://thuvienanh.ninh.app/api/health/db

echo.
echo.
echo Done! Website should be available at https://thuvienanh.ninh.app
pause

