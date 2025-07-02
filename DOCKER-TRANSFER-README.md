# 🐳 LEGIS-FLOW Docker Transfer Guide

**Complete Docker setup for your internship project - ready to run anywhere!**

## 📦 What's Included

This package contains your complete LEGIS-FLOW system:
- ✅ **Full application** (Next.js + React + TypeScript)
- ✅ **Real database data** (all your documents, users, workflows)
- ✅ **Search engine** (Elasticsearch)
- ✅ **Database management** (Prisma Studio)
- ✅ **Production-ready Docker setup**

## 🚀 Quick Start on Your Laptop

### Prerequisites
1. **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop
   - Make sure it's running (Docker icon in system tray)

### Super Simple Setup

**Windows:**
```bash
# Double-click this file:
laptop-setup.bat
```

**Mac/Linux:**
```bash
# Run this command:
chmod +x laptop-setup.sh
./laptop-setup.sh
```

**Manual Setup (any OS):**
```bash
# Build and start everything
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds, then access:
# http://localhost:3000
```

## 🌐 Access Your Application

After setup completes, open these in your browser:

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | http://localhost:3000 | Your LEGIS-FLOW application |
| **Database** | http://localhost:5555 | Prisma Studio (database viewer) |
| **Search** | http://localhost:9200 | Elasticsearch (search engine) |

## 🔐 Login Credentials

| Account | Email | Password | Access Level |
|---------|-------|----------|--------------|
| **Admin** | admin@example.com | admin123 | Full system access |
| **Your Account** | y.jebbar75@gmail.com | (your password) | Regular user |

## 📊 What You'll See

Your application includes:
- **4 Documents** with real content (not mock data!)
- **4 Users** including admin and your account
- **3 Workflows** with 15 configured steps
- **5 Document Types** (Legislation, Policy Brief, etc.)
- **Version History** for all documents
- **Full search functionality**

## 🛠️ Useful Commands

### View Running Services
```bash
docker-compose -f docker-compose.production.yml ps
```

### View Application Logs
```bash
docker-compose -f docker-compose.production.yml logs -f legis-flow
```

### Stop Everything
```bash
docker-compose -f docker-compose.production.yml down
```

### Restart Everything
```bash
docker-compose -f docker-compose.production.yml restart
```

### Clean Start (if something goes wrong)
```bash
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

## 📁 File Structure

```
legis-flow/
├── 📱 Application Files
│   ├── src/                          # Source code
│   ├── prisma/                       # Database schema
│   ├── package.json                  # Dependencies
│   └── next.config.ts                # App configuration
│
├── 🐳 Docker Files
│   ├── Dockerfile.production         # App container
│   ├── docker-compose.production.yml # All services
│   ├── laptop-setup.bat             # Windows setup
│   └── laptop-setup.sh              # Mac/Linux setup
│
├── 💾 Database Backup
│   ├── legisflow-backup.sql         # Your data
│   └── 01-restore-legisflow.sh      # Restore script
│
└── 📚 Documentation
    └── DOCKER-TRANSFER-README.md    # This file
```

## 🔧 Troubleshooting

### Port Already in Use
If you get port errors:
```bash
# Check what's using the ports
netstat -an | grep :3000
netstat -an | grep :5432

# Change ports in docker-compose.production.yml if needed
```

### Docker Not Running
- Start Docker Desktop
- Wait for the Docker icon to show "running"
- Try the setup again

### Database Connection Issues
```bash
# Restart just the database
docker-compose -f docker-compose.production.yml restart postgres

# Wait 10 seconds, then restart the app
docker-compose -f docker-compose.production.yml restart legis-flow
```

### Clean Reinstall
```bash
# Remove everything and start fresh
docker-compose -f docker-compose.production.yml down -v
docker system prune -f
docker-compose -f docker-compose.production.yml up -d --build
```

## 📈 System Resources

**Minimum Requirements:**
- RAM: 4GB (8GB recommended)
- Disk: 2GB free space
- CPU: Any modern processor

**Docker will use approximately:**
- RAM: ~1.5GB
- Disk: ~1GB

## 🎯 Demo Features for Your Presentation

1. **User Management**
   - Login as admin → View users panel
   - Create new users with different roles

2. **Document Management**
   - Create new documents
   - Edit existing documents (see real-time save)
   - View version history

3. **Search Functionality**
   - Search documents by title, content, tags
   - Use filters (status, type, date)

4. **Workflow Management**
   - View workflow steps
   - See document progression

5. **Database Admin**
   - Open Prisma Studio (localhost:5555)
   - Show real data structure

## 🏆 Your Achievement

**You've built a complete enterprise-grade legal document management system!**

✅ **Full-stack application** (Frontend + Backend + Database)  
✅ **Modern architecture** (Docker, microservices, REST APIs)  
✅ **Real user authentication** (JWT, roles, permissions)  
✅ **Advanced features** (search, workflows, versioning)  
✅ **Production-ready** (scalable, secure, maintainable)  

## 🆘 Need Help?

If something doesn't work:
1. Check Docker Desktop is running
2. Run: `docker-compose -f docker-compose.production.yml logs`
3. Try the clean reinstall steps above

---

**🎓 This is your complete internship project - ready to impress!** 🚀 