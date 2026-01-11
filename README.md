# Digital Health Wallet

A comprehensive web application for storing, tracking, and sharing medical reports and health vitals.

## 🎯 Overview

The Digital Health Wallet is a secure, user-centric web application that allows individuals to:
- **Store** medical reports (PDF/Images) with metadata
- **Track** health vitals over time with visual charts
- **Retrieve** reports based on date, vital type, and category
- **Share** specific reports with doctors, family members, and friends
- **Control access** with fine-grained permissions

## 🛠️ Technology Stack

### Frontend
- **ReactJS** (v18.2.0) - UI library
- **React Router** (v6.20.0) - Client-side routing
- **Recharts** (v2.10.3) - Chart visualization
- **Axios** (v1.6.0) - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** (v4.18.2) - Web framework
- **SQLite3** (v5.1.6) - Database
- **JWT** (v9.0.2) - Authentication
- **Bcryptjs** (v2.4.3) - Password hashing
- **Multer** (v1.4.5) - File upload handling

### Database
- **SQLite** - Lightweight, file-based database

## 📁 Project Structure

```
2care.ai-Assignment/
├── backend/
│   ├── config/
│   │   └── upload.js          # Multer configuration for file uploads
│   ├── database/
│   │   ├── init.js            # Database initialization and schema
│   │   └── healthwallet.db    # SQLite database (generated)
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT authentication middleware
│   │   └── roleMiddleware.js  # Role-based access control
│   ├── routes/
│   │   ├── auth.routes.js     # Authentication routes
│   │   ├── reports.routes.js  # Report CRUD operations
│   │   ├── vitals.routes.js   # Vitals tracking routes
│   │   └── share.routes.js    # Report sharing routes
│   ├── uploads/               # Uploaded files storage
│   ├── server.js              # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Auth.css
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Navbar.css
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── VitalsChart.jsx
│   │   │   │   ├── AddVital.jsx
│   │   │   │   ├── UploadReport.jsx
│   │   │   │   └── RecentReports.jsx
│   │   │   └── Reports/
│   │   │       ├── ReportList.jsx
│   │   │       └── ShareReportModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Reports.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication state management
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with interceptors
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

### Quick Setup (Recommended)

From the root directory, install dependencies and start both servers:

```bash
# Install all dependencies (backend + frontend)
npm install

# Start both servers in development mode
npm run dev
```

This will:
- Install dependencies for both backend and frontend
- Start the backend server on `http://localhost:5000`
- Start the frontend server on `http://localhost:3000`

### Manual Setup (Alternative)

If you prefer to set up backend and frontend separately:

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional, uses defaults if not present):
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env
   
   # On Linux/Mac:
   cp .env.example .env
   ```
   
   Edit `.env` and set your configuration:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend server will run on `http://localhost:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Running the Application

**Option 1: Quick Start (Recommended)**
```bash
# From root directory
npm install      # Install all dependencies
npm run dev      # Start both servers
```

**Option 2: Separate Terminals**
1. **Start the backend server** (in one terminal):
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📊 Database Schema

### Tables

#### `users`
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `role` (TEXT) - Default: 'Owner'
- `created_at` (DATETIME)

#### `reports`
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `file_path` (TEXT)
- `file_name` (TEXT)
- `report_type` (TEXT)
- `report_date` (DATE)
- `created_at` (DATETIME)

#### `vitals`
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `vital_type` (TEXT)
- `value` (REAL)
- `recorded_at` (DATETIME)

#### `report_vitals`
- `report_id` (INTEGER, FK to reports)
- `vital_type` (TEXT)
- PRIMARY KEY (report_id, vital_type)

#### `shared_access`
- `id` (INTEGER PRIMARY KEY)
- `report_id` (INTEGER, FK to reports)
- `shared_with_email` (TEXT)
- `access_type` (TEXT) - Default: 'read'
- `shared_at` (DATETIME)

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  "name": "string",
  "email": "string",
  "password": "string"
}
Response: {
  "token": "string",
  "user": { ... }
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "string",
  "password": "string"
}
Response: {
  "token": "string",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: {
  "user": { ... }
}
```

### Reports Endpoints

#### Upload Report
```
POST /api/reports/upload
Headers: Authorization: Bearer <token>
Body: FormData {
  file: File,
  report_type: "string",
  report_date: "YYYY-MM-DD"
}
Response: {
  "message": "string",
  "report": { ... }
}
```

#### Get Reports (with filters)
```
GET /api/reports?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&report_type=string&vital_type=string
Headers: Authorization: Bearer <token>
Response: {
  "reports": [ ... ]
}
```

#### Get Single Report
```
GET /api/reports/:id
Headers: Authorization: Bearer <token>
Response: {
  "report": { ... }
}
```

#### Delete Report
```
DELETE /api/reports/:id
Headers: Authorization: Bearer <token>
Response: {
  "message": "string"
}
```

#### Get Shared Reports
```
GET /api/reports/shared
Headers: Authorization: Bearer <token>
Response: {
  "reports": [ ... ]
}
```

### Vitals Endpoints

#### Add Vital
```
POST /api/vitals
Headers: Authorization: Bearer <token>
Body: {
  "vital_type": "string",
  "value": number,
  "recorded_at": "ISO datetime"
}
Response: {
  "message": "string",
  "vital": { ... }
}
```

#### Get Vitals
```
GET /api/vitals?vital_type=string&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
Headers: Authorization: Bearer <token>
Response: {
  "vitals": [ ... ]
}
```

#### Get Vitals Trends (for charts)
```
GET /api/vitals/trends?vital_type=string&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
Headers: Authorization: Bearer <token>
Response: {
  "trends": {
    "BP": [{ value, date }, ...],
    "Sugar": [{ value, date }, ...],
    ...
  }
}
```

#### Delete Vital
```
DELETE /api/vitals/:id
Headers: Authorization: Bearer <token>
Response: {
  "message": "string"
}
```

### Sharing Endpoints

#### Share Report
```
POST /api/share
Headers: Authorization: Bearer <token>
Body: {
  "report_id": number,
  "shared_with_email": "string"
}
Response: {
  "message": "string",
  "share": { ... }
}
```

#### Get Shared Reports (sent)
```
GET /api/share/sent
Headers: Authorization: Bearer <token>
Response: {
  "shares": [ ... ]
}
```

#### Revoke Access
```
DELETE /api/share/:id
Headers: Authorization: Bearer <token>
Response: {
  "message": "string"
}
```

## 🔐 Security Considerations

### Authentication & Authorization
- **JWT-based authentication**: Secure token-based authentication
- **Password hashing**: Bcrypt with salt rounds (10)
- **Token expiry**: 7 days (configurable)
- **Protected routes**: Middleware validates tokens on protected endpoints

### Access Control
- **Ownership validation**: Users can only access their own data
- **Shared access**: Reports can be shared with specific email addresses
- **Read-only sharing**: Shared users have read-only access
- **Role-based access**: Owner and Viewer roles (extensible)

### File Upload Security
- **File type validation**: Only PDF and image files allowed
- **File size limits**: Maximum 10MB per file
- **Secure storage**: Files stored in user-specific directories
- **MIME type validation**: Validates file content type

### Data Protection
- **SQL injection prevention**: Parameterized queries
- **CORS configuration**: Configured for frontend-backend communication
- **Environment variables**: Sensitive data stored in .env
- **Input validation**: Request validation on all endpoints

## 🏗️ Architecture

### Frontend Architecture

- **Component-based**: Modular React components
- **Context API**: Global state management for authentication
- **Routing**: React Router for navigation
- **API Integration**: Axios with interceptors for auth tokens
- **Chart Visualization**: Recharts for vitals trends

### Backend Architecture

- **RESTful API**: Standard REST endpoints
- **Middleware pattern**: Authentication and authorization middleware
- **File storage**: Local file system (easily upgradeable to cloud storage)
- **Database**: SQLite for development (can be migrated to PostgreSQL for production)

### Data Flow

1. **User Registration/Login**: 
   - Frontend → Backend → Database
   - Returns JWT token

2. **Report Upload**:
   - Frontend (FormData) → Backend (Multer) → File Storage + Database

3. **Vitals Tracking**:
   - Frontend → Backend API → Database
   - Frontend retrieves data for chart rendering

4. **Report Sharing**:
   - Owner shares → Database (shared_access table)
   - Viewer accesses → Authorization check → Report access

## 📈 Features

### ✅ Implemented Features

1. **User Management**
   - Registration and login
   - JWT-based authentication
   - User profile access

2. **Health Reports**
   - Upload PDF/Image reports
   - Store metadata (type, date)
   - View and download reports
   - Delete reports

3. **Vitals Tracking**
   - Record vitals (BP, Sugar, Heart Rate, Oxygen, Temperature, Weight)
   - View trends with charts
   - Filter by date range and type
   - Visual representation using Recharts

4. **Report Retrieval**
   - Filter by date range
   - Filter by report type
   - Filter by associated vital type
   - Search functionality

5. **Access Control**
   - Share reports via email
   - View shared reports
   - Revoke shared access
   - Read-only access for viewers

## 🎨 UI Features

- **Responsive design**: Works on desktop and mobile
- **Modern UI**: Clean and intuitive interface
- **Interactive charts**: Visual representation of vitals over time
- **Modal dialogs**: For sharing and interactions
- **Form validation**: Client-side validation
- **Loading states**: User feedback during operations
- **Error handling**: Clear error messages

## 🔄 Future Enhancements

### Scalability Improvements
- Migrate to PostgreSQL for production
- Implement cloud storage (AWS S3, GCP Storage)
- Add caching layer (Redis)
- Implement pagination for large datasets

### Additional Features
- Email notifications for shared reports
- WhatsApp integration (as mentioned in requirements)
- Mobile app (React Native)
- PDF parsing for automatic metadata extraction
- AI-based health insights
- Export data functionality
- Multi-language support

## 🧪 Testing

To test the application:

1. **Register a new user**
2. **Login with credentials**
3. **Upload a medical report** (PDF or image)
4. **Add some vitals** (BP, Sugar, etc.)
5. **View vitals charts** on dashboard
6. **Filter reports** by date/type
7. **Share a report** with another email
8. **View shared reports** (if logged in with shared email)

## 📝 Notes

- **Database**: SQLite database is created automatically on first run
- **File Storage**: Files are stored in `backend/uploads/{user_id}/`
- **Development**: Use `npm run dev` in backend for auto-reload
- **Production**: Set `NODE_ENV=production` and configure proper JWT_SECRET

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed: `npm install`
- Check database file permissions

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify proxy settings in package.json

### File upload fails
- Check file size (max 10MB)
- Verify file type (PDF/Images only)
- Ensure uploads directory exists and is writable

### Authentication errors
- Clear browser localStorage
- Check JWT_SECRET in .env
- Verify token hasn't expired

## 📄 License

This project is created for the 2care.ai assignment.

## 👤 Author

Created for 2care.ai Digital Health Wallet Assignment

---

**Note**: This is a development version. For production deployment, ensure proper security configurations, environment variables, and database migrations.