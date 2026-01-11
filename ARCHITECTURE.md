# Digital Health Wallet - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                    (React.js Frontend)                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Dashboard  │  │   Reports    │  │    Auth      │        │
│  │   Component  │  │   Component  │  │  Components  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                     │
│                  ┌────────▼────────┐                           │
│                  │   API Service   │                           │
│                  │   (Axios)       │                           │
│                  └────────┬────────┘                           │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            │ HTTPS (REST API)
                            │ JWT Authentication
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                      BACKEND LAYER                             │
│                   (Node.js + Express)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Express Server                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Auth       │  │   Reports    │  │   Vitals     │ │  │
│  │  │   Routes     │  │   Routes     │  │   Routes     │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐                   │  │
│  │  │   Share      │  │   Upload     │                   │  │
│  │  │   Routes     │  │   Middleware │                   │  │
│  │  └──────────────┘  └──────────────┘                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────┐         │
│  │          Authentication Middleware                │         │
│  │         (JWT Token Validation)                    │         │
│  └────────────────────────┬─────────────────────────┘         │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                      DATA LAYER                                │
│                      (SQLite)                                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   users     │  │  reports    │  │   vitals    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │ shared_access│ │ report_vitals│                           │
│  └─────────────┘  └─────────────┘                           │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ File Paths
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                   FILE STORAGE LAYER                           │
│              (Local File System /uploads/)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  /uploads/                                               │  │
│  │    ├── 1/ (User ID 1)                                   │  │
│  │    │   ├── report1.pdf                                  │  │
│  │    │   └── report2.jpg                                  │  │
│  │    ├── 2/ (User ID 2)                                   │  │
│  │    │   └── report1.pdf                                  │  │
│  │    └── ...                                              │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── Navbar
│   ├── Routes
│   │   ├── /login → Login Component
│   │   ├── /register → Register Component
│   │   ├── /dashboard → Dashboard (Protected)
│   │   │   ├── AddVital
│   │   │   ├── UploadReport
│   │   │   ├── VitalsChart
│   │   │   └── RecentReports
│   │   └── /reports → Reports (Protected)
│   │       ├── ReportList
│   │       └── ShareReportModal
│   └── ProtectedRoute (Middleware)
```

### Backend Routes Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
├── /reports
│   ├── POST /upload (multipart/form-data)
│   ├── GET / (with query filters)
│   ├── GET /shared
│   ├── GET /:id
│   └── DELETE /:id
├── /vitals
│   ├── POST /
│   ├── GET / (with query filters)
│   ├── GET /trends (for charts)
│   └── DELETE /:id
└── /share
    ├── POST /
    ├── GET /sent
    └── DELETE /:id
```

## Data Flow Diagrams

### Authentication Flow

```
User → Frontend (Login Form)
  ↓
POST /api/auth/login
  ↓
Backend (Verify credentials)
  ↓
Database (Check user)
  ↓
Backend (Generate JWT)
  ↓
Frontend (Store token in localStorage)
  ↓
Frontend (Set Authorization header)
```

### Report Upload Flow

```
User → Frontend (Upload Form)
  ↓
POST /api/reports/upload (FormData)
  ↓
Backend (Multer middleware)
  ↓
Validate file (type, size)
  ↓
Save file to /uploads/{user_id}/
  ↓
Database (Insert report metadata)
  ↓
Frontend (Success message, refresh list)
```

### Report Sharing Flow

```
Owner → Frontend (Share Modal)
  ↓
POST /api/share {report_id, email}
  ↓
Backend (Verify ownership)
  ↓
Database (Insert into shared_access)
  ↓
Frontend (Success message)
  ↓
Viewer (Login with shared email)
  ↓
GET /api/reports/shared
  ↓
Backend (Check shared_access table)
  ↓
Frontend (Display shared reports)
```

### Vitals Chart Flow

```
User → Frontend (Dashboard)
  ↓
GET /api/vitals/trends?start_date&end_date
  ↓
Backend (Query database)
  ↓
Database (SELECT vitals WHERE date_range)
  ↓
Backend (Group by vital_type)
  ↓
Frontend (Recharts component)
  ↓
User (View chart)
```

## Database Schema Relationships

```
users (1) ──────< (many) reports
  │                      │
  │                      │
  │                      └───< (many) shared_access
  │                                  │
  │                                  │
  └───< (many) vitals               │
                                      │
                                      │
                            (many) shared_access
                                   └───> (1) users (shared_with_email)
```

## Security Architecture

### Authentication & Authorization Layers

```
┌─────────────────────────────────────────┐
│  Request with JWT Token                 │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Authentication Middleware              │
│  - Verify JWT signature                 │
│  - Check token expiry                   │
│  - Validate user exists                 │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Route Handler                          │
│  - Check ownership (for user data)      │
│  - Check shared access (for reports)    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Database Query                         │
│  - Parameterized queries (SQL injection)│
└─────────────────────────────────────────┘
```

## File Storage Strategy

### Current Implementation (Local)

```
backend/uploads/
├── {user_id}/
│   ├── {timestamp}-{random}.pdf
│   ├── {timestamp}-{random}.jpg
│   └── ...
```

**Advantages:**
- Simple to implement
- No external dependencies
- Suitable for development/MVP

**Disadvantages:**
- Not scalable for production
- Requires server file system access
- Backup complexity

### Future Scalability (Cloud Storage)

```
┌─────────────────┐
│   Application   │
└────────┬────────┘
         │
         │ Pre-signed URL
         ▼
┌─────────────────┐
│  AWS S3 / GCP   │
│  Cloud Storage  │
└─────────────────┘
```

**Benefits:**
- Scalable storage
- CDN integration
- Automatic backup
- Cost-effective

## Technology Stack Justification

### Frontend: ReactJS
- **Component-based architecture**: Modular and reusable UI
- **Large ecosystem**: Rich library support (charts, routing)
- **Virtual DOM**: Efficient rendering
- **Developer experience**: Excellent tooling and community

### Backend: Node.js + Express
- **JavaScript everywhere**: Single language (JS) for full-stack
- **Fast development**: Rapid API development
- **Rich ecosystem**: npm packages for everything
- **Performance**: Non-blocking I/O for concurrent requests

### Database: SQLite
- **Zero configuration**: File-based, no server setup
- **Lightweight**: Perfect for MVP/development
- **ACID compliant**: Reliable transactions
- **Easy migration**: Can migrate to PostgreSQL later

## Scalability Considerations

### Current Architecture (MVP)
- Single server instance
- SQLite database
- Local file storage
- Synchronous file operations

### Production Scalability Path

1. **Database Migration**
   - SQLite → PostgreSQL
   - Connection pooling
   - Read replicas for reporting

2. **File Storage Migration**
   - Local → Cloud Storage (S3/GCP)
   - CDN for file delivery
   - Pre-signed URLs

3. **Backend Scaling**
   - Load balancer
   - Multiple server instances
   - Stateless API design (already implemented)

4. **Caching Layer**
   - Redis for session storage
   - Cache frequently accessed data
   - Query result caching

5. **Frontend Optimization**
   - Code splitting
   - CDN hosting
   - Service workers (PWA)

## API Design Principles

- **RESTful**: Standard HTTP methods (GET, POST, DELETE)
- **Stateless**: Each request contains all necessary information
- **JSON**: Lightweight data format
- **Error handling**: Consistent error response format
- **Versioning**: Ready for /api/v1/ if needed
- **Documentation**: OpenAPI/Swagger ready structure