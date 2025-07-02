@echo off
echo 🚀 Starting LEGIS-FLOW on your laptop...
echo 📦 This will set up everything automatically!
echo.

REM Check if Docker is running
echo 🔍 Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    echo.
    echo 💡 Tips:
    echo    - Download Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo    - Start Docker Desktop and wait for it to be ready
    echo    - Look for the Docker whale icon in your system tray
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check for port conflicts
echo 🔍 Checking for port conflicts...
netstat -an | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 3000 is already in use. Please close any applications using this port.
    echo.
    pause
)

REM Stop any existing containers
echo 🛑 Stopping any existing LEGIS-FLOW containers...
docker-compose -f docker-compose.production.yml down >nul 2>&1

REM Clean up previous builds if they exist
echo 🧹 Cleaning up previous builds...
docker-compose -f docker-compose.production.yml down --volumes --remove-orphans >nul 2>&1

REM Build and start all services
echo 🔨 Building LEGIS-FLOW application (this may take 5-10 minutes)...
echo    📦 Installing dependencies...
echo    🔧 Building application...
echo    🐳 Creating Docker containers...
docker-compose -f docker-compose.production.yml build --no-cache
if errorlevel 1 (
    echo ❌ Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo 🚀 Starting all services...
docker-compose -f docker-compose.production.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start services. Please check Docker Desktop.
    pause
    exit /b 1
)

echo ⏳ Waiting for services to be ready (30 seconds)...
echo    - Database initialization...
echo    - Search engine startup...
echo    - Application startup...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose -f docker-compose.production.yml ps

REM Test if application is responding
echo 🌐 Testing application...
curl -s -I http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Application might still be starting up. Please wait a moment and try accessing http://localhost:3000
) else (
    echo ✅ Application is responding!
)

echo.
echo 🎉 LEGIS-FLOW is ready!
echo.
echo 📱 Access your application:
echo    🌐 Main Application: http://localhost:3000
echo    📊 Database Manager: http://localhost:5555
echo    🔍 Search Engine: http://localhost:9200
echo.
echo 🔐 Login credentials:
echo    📧 Admin: admin@example.com
echo    🔑 Password: admin123
echo.
echo 📖 Useful commands:
echo    🔍 View logs: docker-compose -f docker-compose.production.yml logs -f
echo    🔄 Restart: docker-compose -f docker-compose.production.yml restart
echo    🛑 Stop: docker-compose -f docker-compose.production.yml down
echo.
echo 🆘 If something doesn't work:
echo    1. Make sure Docker Desktop is running
echo    2. Try: docker-compose -f docker-compose.production.yml restart
echo    3. For clean restart: docker-compose -f docker-compose.production.yml down -v
echo       then run this script again
echo.
echo ✨ Your internship project is now running!
echo.
pause 