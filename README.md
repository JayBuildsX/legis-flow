# 🏛️ LEGIS-FLOW - Legislative Document Management System

A modern, full-stack legal document management platform built with Next.js, Prisma, and Elasticsearch, designed for legislative and regulatory text processing.

## ✨ Features

- 📝 **Document Management** - Full CRUD operations with version control
- 🔍 **Advanced Search** - Elasticsearch-powered full-text search with filters
- 👥 **User Management** - Role-based access control with admin panel
- 🔄 **Workflow System** - Configurable approval workflows
- 📊 **Analytics Dashboard** - Document statistics and insights
- 🔐 **Digital Signatures** - Electronic signature capabilities
- 📱 **Responsive Design** - Modern UI with Tailwind CSS
- 🐳 **Docker Ready** - Complete containerized deployment

## 🚀 Quick Start

### For Laptop/Demo Setup (Production Mode)
Perfect for presentations, demos, or running on a laptop:

**Windows:**
```bash
# Double-click this file:
laptop-setup.bat
```

**Mac/Linux:**
```bash
chmod +x laptop-setup.sh
./laptop-setup.sh
```

**Access your application:**
- 🌐 Main App: http://localhost:3000
- 📊 Database: http://localhost:5555  
- 🔍 Search: http://localhost:9200

**Login:** admin@example.com / admin123

### For Development Setup
If you want to modify the code and develop new features:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development services
docker-compose up -d postgres elasticsearch

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL 15
- **Search:** Elasticsearch 8.12
- **Styling:** Tailwind CSS, Radix UI
- **Authentication:** JWT, bcrypt
- **File Storage:** Local file system
- **Deployment:** Docker, Docker Compose

## 📁 Project Structure

```
legis-flow/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── (auth)/            # Protected routes
│   │   ├── (public)/          # Public routes
│   │   └── api/               # API endpoints
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   └── hooks/                 # Custom React hooks
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
├── scripts/                   # Utility scripts
└── docker-compose*.yml       # Docker configurations
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npx prisma studio              # Database GUI
npx prisma migrate dev         # Apply migrations
npx prisma generate           # Generate client
npm run seed                  # Seed database

# Linting & formatting
npm run lint                  # ESLint
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

### Development with Docker
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 🔐 Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/legisflow"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Search
ELASTICSEARCH_URL="http://localhost:9200"

# File Storage
STORAGE_DIR="./storage"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 📊 Database Schema

Key entities:
- **Users** - Authentication and role management
- **Documents** - Core document storage with metadata
- **DocumentVersions** - Version control and history
- **DocumentTypes** - Document categorization
- **Workflows** - Approval process definitions
- **DocumentTemplates** - Template system

## 🔍 API Endpoints

### Documents
- `GET /api/v1/documents` - List documents with filters
- `POST /api/v1/documents` - Create new document
- `GET /api/v1/documents/[id]` - Get document details
- `PUT /api/v1/documents/[id]` - Update document
- `DELETE /api/v1/documents/[id]` - Delete document

### Search
- `GET /api/v1/search` - Full-text search with filters
- `GET /api/v1/search/raw` - Raw Elasticsearch query

### Authentication
- `POST /api/v1/auth` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/mfa` - MFA operations

## 🧪 Testing

```bash
# Run test scripts
node scripts/test-comprehensive-health.js
node scripts/test-search-functionality.js
node scripts/test-document-upload.js
```

## 🚨 Troubleshooting

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Docker Issues
```bash
# Clean restart
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset
npm run seed
```

## 📈 Performance

- **Build time:** ~30 seconds
- **Cold start:** ~5 seconds
- **Search response:** <100ms
- **Document upload:** ~2 seconds for 10MB files

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection
- File upload validation

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## 📄 License

This project is part of an internship assignment and is for educational purposes.

## 🎯 Demo Features

Perfect for presentations:
1. **User Authentication** - Login/logout with different roles
2. **Document CRUD** - Create, read, update, delete documents
3. **Search & Filter** - Powerful search with multiple filters
4. **Version Control** - Document history and comparisons
5. **Workflow Management** - Approval processes
6. **Admin Panel** - User and system management
7. **Analytics** - Usage statistics and insights

## 🏆 Project Highlights

This system demonstrates:
- ✅ Modern full-stack development practices
- ✅ Production-ready architecture
- ✅ Advanced search implementation
- ✅ Scalable database design
- ✅ Docker containerization
- ✅ TypeScript best practices
- ✅ Responsive UI/UX design
- ✅ Real-world business logic

---

**Built with ❤️ for legislative efficiency and transparency**
