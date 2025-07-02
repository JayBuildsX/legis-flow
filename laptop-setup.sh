#!/bin/bash

echo "🚀 Starting LEGIS-FLOW on your laptop..."
echo "📦 This will set up everything automatically!"
echo ""

# Check if Docker is running
echo "🔍 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    echo ""
    echo "💡 Tips:"
    echo "   - Download Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo "   - Start Docker Desktop and wait for it to be ready"
    echo "   - Look for the Docker whale icon in your menu bar"
    echo ""
    exit 1
fi

echo "✅ Docker is running"

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Please close any applications using this port."
    echo ""
    echo "To find what's using port 3000, run: lsof -i :3000"
    echo ""
fi

# Stop any existing containers
echo "🛑 Stopping any existing LEGIS-FLOW containers..."
docker-compose -f docker-compose.production.yml down > /dev/null 2>&1

# Clean up previous builds if they exist
echo "🧹 Cleaning up previous builds..."
docker-compose -f docker-compose.production.yml down --volumes --remove-orphans > /dev/null 2>&1

# Build and start all services
echo "🔨 Building LEGIS-FLOW application (this may take 5-10 minutes)..."
echo "   📦 Installing dependencies..."
echo "   🔧 Building application..."
echo "   🐳 Creating Docker containers..."
if ! docker-compose -f docker-compose.production.yml build --no-cache; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "🚀 Starting all services..."
if ! docker-compose -f docker-compose.production.yml up -d; then
    echo "❌ Failed to start services. Please check Docker Desktop."
    exit 1
fi

echo "⏳ Waiting for services to be ready (30 seconds)..."
echo "   - Database initialization..."
echo "   - Search engine startup..."
echo "   - Application startup..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Test if application is responding
echo "🌐 Testing application..."
if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is responding!"
else
    echo "⚠️  Application might still be starting up. Please wait a moment and try accessing http://localhost:3000"
fi

echo ""
echo "🎉 LEGIS-FLOW is ready!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Main Application: http://localhost:3000"
echo "   📊 Database Manager: http://localhost:5555"
echo "   🔍 Search Engine: http://localhost:9200"
echo ""
echo "🔐 Login credentials:"
echo "   📧 Admin: admin@example.com"
echo "   🔑 Password: admin123"
echo ""
echo "📖 Useful commands:"
echo "   🔍 View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   🔄 Restart: docker-compose -f docker-compose.production.yml restart"
echo "   🛑 Stop: docker-compose -f docker-compose.production.yml down"
echo ""
echo "🆘 If something doesn't work:"
echo "   1. Make sure Docker Desktop is running"
echo "   2. Try: docker-compose -f docker-compose.production.yml restart"
echo "   3. For clean restart: docker-compose -f docker-compose.production.yml down -v"
echo "      then run this script again"
echo ""
echo "✨ Your internship project is now running!" 