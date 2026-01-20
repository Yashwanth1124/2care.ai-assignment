# Digital Health Wallet - Technical Data Flow Documentation

## Table of Contents
1. [User Registration Flow](#1-user-registration-flow)
2. [User Login Flow](#2-user-login-flow)
3. [Authentication Token Management](#3-authentication-token-management)
4. [Upload Medical Report Flow](#4-upload-medical-report-flow)
5. [Add Health Vital Flow](#5-add-health-vital-flow)
6. [View Reports Flow](#6-view-reports-flow)
7. [Filter Reports Flow](#7-filter-reports-flow)
8. [Share Report Flow](#8-share-report-flow)
9. [View Shared Reports Flow](#9-view-shared-reports-flow)
10. [Logout Flow](#10-logout-flow)

---

## 1. User Registration Flow

### Overview
When a new user creates an account, the system validates input, hashes the password, stores user data, and returns a JWT token for immediate authentication.

### Technical Flow

#### Step 1: User Input Collection
**File:** `frontend/src/components/Auth/Register.jsx`

```javascript
// Lines 8-13: Form state initialization
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
```

**Process:**
- User enters name, email, password, and confirmPassword
- React state manages form data via `useState` hook
- `handleChange` function (lines 19-25) updates state on input change

#### Step 2: Form Validation (Client-Side)
**File:** `frontend/src/components/Auth/Register.jsx`

```javascript
// Lines 32-36: Password confirmation validation
if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match');
  setLoading(false);
  return;
}
```

**Process:**
- Validates password match before submission
- Prevents unnecessary API calls

#### Step 3: API Request Initiation
**File:** `frontend/src/components/Auth/Register.jsx`

```javascript
// Lines 39-43: POST request to registration endpoint
const response = await api.post('/auth/register', {
  name: formData.name,
  email: formData.email,
  password: formData.password,
});
```

**File:** `frontend/src/services/api.js`

```javascript
// Lines 3-8: Axios instance configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Process:**
- Axios instance configured with base URL `/api`
- Request sent to `/api/auth/register`
- Payload: `{ name, email, password }`

#### Step 4: Request Interception (Token Addition)
**File:** `frontend/src/services/api.js`

```javascript
// Lines 11-22: Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Process:**
- For registration, no token exists yet, so no Authorization header added
- Interceptor ready for subsequent authenticated requests

#### Step 5: Backend Route Handler
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 10-63: Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
```

**Process:**
- Express router receives POST request at `/api/auth/register`
- Extracts `name`, `email`, `password` from request body
- Validates required fields

#### Step 6: Database User Existence Check
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 19-26: Check for existing user
db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
  if (err) {
    return res.status(500).json({ error: 'Database error' });
  }
  
  if (row) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }
```

**File:** `backend/database/init.js`

```javascript
// Lines 24-31: Users table schema
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'Owner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

**Process:**
- SQLite query checks if email exists
- Uses parameterized query to prevent SQL injection
- Returns error if user already exists

#### Step 7: Password Hashing
**File:** `backend/routes/auth.routes.js`

```javascript
// Line 29: Password hashing with bcryptjs
const passwordHash = await bcrypt.hash(password, 10);
```

**Process:**
- Uses bcryptjs library with salt rounds of 10
- One-way hashing ensures password cannot be reversed
- Hash stored in database, not plain password

#### Step 8: User Record Insertion
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 32-34: Insert new user into DB
db.run(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
  [name, email, passwordHash, 'Owner'],
  function(err) {
```

**Process:**
- Parameterized SQL INSERT statement
- Stores: name, email, password_hash, role='Owner'
- `this.lastID` contains the auto-generated user ID

#### Step 9: JWT Token Generation
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 41-45: JWT token creation
const token = jwt.sign(
  { id: this.lastID, email: email },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

**File:** `backend/middleware/authMiddleware.js`

```javascript
// Line 4: JWT secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

**Process:**
- JWT payload contains: `{ id: userId, email: email }`
- Signed with JWT_SECRET
- Expires in 7 days
- Token used for subsequent authenticated requests

#### Step 10: Response Sent to Frontend
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 47-56: Success response
res.status(201).json({
  message: 'User registered successfully',
  token: token,
  user: {
    id: this.lastID,
    name: name,
    email: email,
    role: 'Owner'
  }
});
```

**Process:**
- HTTP 201 Created status
- JSON response with token and user data
- User data excludes password_hash for security

#### Step 11: Frontend Token Storage & State Update
**File:** `frontend/src/components/Auth/Register.jsx`

```javascript
// Line 44: Call login function from AuthContext
login(response.data.token, response.data.user);
```

**File:** `frontend/src/context/AuthContext.js`

```javascript
// Lines 39-44: Login function
const login = (token, userData) => {
  setToken(token);
  setUser(userData);
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
```

**Process:**
- Token stored in React state (`setToken`)
- User data stored in React state (`setUser`)
- Token persisted in localStorage for session persistence
- Authorization header set in Axios defaults

#### Step 12: Navigation to Dashboard
**File:** `frontend/src/components/Auth/Register.jsx`

```javascript
// Line 45: Navigate to dashboard
navigate('/dashboard');
```

**File:** `frontend/src/App.js`

```javascript
// Lines 20-27: Protected route configuration
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**File:** `frontend/src/components/Common/ProtectedRoute.jsx`

**Process:**
- React Router navigates to `/dashboard`
- ProtectedRoute checks authentication status
- If authenticated, renders Dashboard component

---

## 2. User Login Flow

### Overview
Existing users authenticate with email/password, receive JWT token, and gain access to protected routes.

### Technical Flow

#### Step 1: User Input Collection
**File:** `frontend/src/components/Auth/Login.jsx`

```javascript
// Lines 8-11: Form state
const [formData, setFormData] = useState({
  email: '',
  password: '',
});
```

**Process:**
- User enters email and password
- State managed via React hooks

#### Step 2: API Request
**File:** `frontend/src/components/Auth/Login.jsx`

```javascript
// Line 31: POST request to login endpoint
const response = await api.post('/auth/login', formData);
```

**Process:**
- Sends email and password to `/api/auth/login`

#### Step 3: Backend Route Handler
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 66-111: Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
```

**Process:**
- Validates required fields
- Extracts credentials from request body

#### Step 4: Database User Lookup
**File:** `backend/routes/auth.routes.js`

```javascript
// Line 74: Query database for user
db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
```

**Process:**
- SQLite query finds user by email
- Returns 401 if user not found (security: don't reveal if email exists)

#### Step 5: Password Verification
**File:** `backend/routes/auth.routes.js`

```javascript
// Line 84: Compare password with hash
const isValidPassword = await bcrypt.compare(password, user.password_hash);

if (!isValidPassword) {
  return res.status(401).json({ error: 'Invalid email or password' });
}
```

**Process:**
- bcrypt.compare() verifies plain password against stored hash
- Returns boolean indicating match
- Same error message for invalid email/password (prevents enumeration)

#### Step 6: JWT Token Generation
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 91-95: Generate JWT token
const token = jwt.sign(
  { id: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Process:**
- Same token generation as registration
- 7-day expiration

#### Step 7: Response & Frontend Processing
**File:** `backend/routes/auth.routes.js`

```javascript
// Lines 97-106: Success response
res.json({
  message: 'Login successful',
  token: token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
```

**File:** `frontend/src/components/Auth/Login.jsx`

```javascript
// Lines 32-33: Store token and navigate
login(response.data.token, response.data.user);
navigate('/dashboard');
```

**Process:**
- Token stored in localStorage and state
- User redirected to dashboard
- Authorization header configured for future requests

---

## 3. Authentication Token Management

### Overview
JWT tokens are automatically attached to requests and validated on protected routes.

### Technical Flow

#### Step 1: Token Attachment to Requests
**File:** `frontend/src/services/api.js`

```javascript
// Lines 11-22: Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Process:**
- Every API request automatically includes token from localStorage
- Format: `Authorization: Bearer <token>`
- No manual token management needed in components

#### Step 2: Backend Token Validation
**File:** `backend/middleware/authMiddleware.js`

```javascript
// Lines 6-29: Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists
    db.get('SELECT id, email, name, role FROM users WHERE id = ?', 
      [user.id], (err, row) => {
        if (err || !row) {
          return res.status(403).json({ error: 'User not found' });
        }

        req.user = row; // Attach user to request
        next(); // Continue to route handler
      });
  });
};
```

**Process:**
- Extracts token from Authorization header
- Verifies JWT signature and expiration
- Validates user still exists in database
- Attaches user object to `req.user` for route handlers

#### Step 3: Protected Route Usage
**File:** `backend/routes/reports.routes.js`

```javascript
// Line 11: Middleware applied to route
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  // req.user.id available here
});
```

**Process:**
- `authenticateToken` middleware runs before route handler
- If valid, `req.user` contains authenticated user data
- If invalid, request rejected with 401/403

#### Step 4: Token Refresh on App Load
**File:** `frontend/src/context/AuthContext.js`

```javascript
// Lines 30-37: Check token on mount
useEffect(() => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser();
  } else {
    setLoading(false);
  }
}, [token, fetchUser]);
```

**File:** `frontend/src/context/AuthContext.js`

```javascript
// Lines 18-28: Fetch current user
const fetchUser = useCallback(async () => {
  try {
    const response = await api.get('/auth/me');
    setUser(response.data.user);
  } catch (error) {
    console.error('Error fetching user:', error);
    logout(); // Token invalid, logout user
  } finally {
    setLoading(false);
  }
}, [logout]);
```

**Process:**
- On app load, checks localStorage for token
- If token exists, validates with `/api/auth/me` endpoint
- Updates user state if valid
- Logs out if token invalid/expired

#### Step 5: Automatic Logout on 401
**File:** `frontend/src/services/api.js`

```javascript
// Lines 25-34: Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Process:**
- Intercepts all API responses
- If 401 Unauthorized, clears token and redirects to login
- Prevents stale token usage

---

## 4. Upload Medical Report Flow

### Overview
Users upload PDF/image files with metadata (type, date), files stored in user-specific directories, metadata saved to database.

### Technical Flow

#### Step 1: File Selection & Form Data
**File:** `frontend/src/components/Dashboard/UploadReport.jsx`

```javascript
// Lines 6-10: Form state
const [formData, setFormData] = useState({
  file: null,
  report_type: 'Blood Test',
  report_date: new Date().toISOString().split('T')[0]
});
```

**Process:**
- User selects file via `<input type="file">`
- User selects report type from dropdown
- User selects/enters report date

#### Step 2: FormData Creation
**File:** `frontend/src/components/Dashboard/UploadReport.jsx`

```javascript
// Lines 52-55: Create FormData object
const uploadData = new FormData();
uploadData.append('file', formData.file);
uploadData.append('report_type', formData.report_type);
uploadData.append('report_date', formData.report_date);
```

**Process:**
- FormData used for multipart/form-data encoding
- File and metadata combined in single request
- Required for file uploads

#### Step 3: API Request with File
**File:** `frontend/src/components/Dashboard/UploadReport.jsx`

```javascript
// Lines 57-61: POST request with FormData
await api.post('/reports/upload', uploadData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**Process:**
- POST to `/api/reports/upload`
- Content-Type set to `multipart/form-data`
- Axios automatically handles FormData serialization

#### Step 4: Request Interception (Token Added)
**File:** `frontend/src/services/api.js`

**Process:**
- Token automatically added via interceptor
- Request includes: `Authorization: Bearer <token>`

#### Step 5: Authentication Middleware
**File:** `backend/routes/reports.routes.js`

```javascript
// Line 11: Middleware chain
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
```

**Process:**
- `authenticateToken` validates JWT token
- Sets `req.user` with authenticated user data
- Proceeds to Multer middleware

#### Step 6: File Upload Middleware (Multer)
**File:** `backend/config/upload.js`

```javascript
// Lines 11-26: Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || 'temp';
    const userUploadDir = path.join(uploadsDir, userId.toString());
    
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
```

**Process:**
- Creates user-specific directory: `backend/uploads/{user_id}/`
- Generates unique filename: `{timestamp}-{random}.{ext}`
- Prevents filename conflicts

#### Step 7: File Type Validation
**File:** `backend/config/upload.js`

```javascript
// Lines 28-43: File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type...'), false);
  }
};
```

**Process:**
- Validates MIME type before saving
- Only PDF and images allowed
- Rejects other file types

#### Step 8: File Size Validation
**File:** `backend/config/upload.js`

```javascript
// Lines 45-51: Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});
```

**Process:**
- Maximum file size: 10MB
- Multer rejects larger files automatically

#### Step 9: Route Handler Processing
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 12-24: Validation and extraction
if (!req.file) {
  return res.status(400).json({ error: 'No file uploaded' });
}

const { report_type, report_date } = req.body;

if (!report_type || !report_date) {
  fs.unlinkSync(req.file.path); // Cleanup on validation failure
  return res.status(400).json({ error: 'Report type and date are required' });
}

const filePath = req.file.path;
const fileName = req.file.originalname;
```

**Process:**
- Validates file uploaded successfully
- Extracts metadata from request body
- Gets file path and original filename
- Deletes file if validation fails

#### Step 10: Database Record Creation
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 28-31: Insert report metadata
db.run(
  'INSERT INTO reports (user_id, file_path, file_name, report_type, report_date) VALUES (?, ?, ?, ?, ?)',
  [req.user.id, filePath, fileName, report_type, report_date],
  function(err) {
```

**File:** `backend/database/init.js`

```javascript
// Lines 34-43: Reports table schema
db.run(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`);
```

**Process:**
- Inserts report record with user_id foreign key
- Stores file path for later retrieval
- Stores original filename for display
- Stores metadata (type, date)

#### Step 11: Success Response
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 38-46: Success response
res.status(201).json({
  message: 'Report uploaded successfully',
  report: {
    id: this.lastID,
    file_name: fileName,
    report_type: report_type,
    report_date: report_date
  }
});
```

**Process:**
- HTTP 201 Created
- Returns report ID and metadata
- File path not exposed (security)

#### Step 12: Frontend Success Handling
**File:** `frontend/src/components/Dashboard/UploadReport.jsx`

```javascript
// Lines 63-75: Success handling
setMessage('Report uploaded successfully!');
setFormData({
  file: null,
  report_type: 'Blood Test',
  report_date: new Date().toISOString().split('T')[0]
});

document.getElementById('file-input').value = '';

if (onUpload) {
  onUpload(); // Callback to refresh reports list
}
```

**Process:**
- Shows success message
- Resets form
- Clears file input
- Triggers callback to refresh dashboard

#### Step 13: File Serving (Static Files)
**File:** `backend/server.js`

```javascript
// Line 23: Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**Process:**
- Express serves files from `backend/uploads/` directory
- URL format: `/uploads/{user_id}/{filename}`
- Direct file access for viewing/downloading

---

## 5. Add Health Vital Flow

### Overview
Users record health vitals (BP, Sugar, etc.) with values and timestamps, stored in database for trend analysis.

### Technical Flow

#### Step 1: Form Input Collection
**File:** `frontend/src/components/Dashboard/AddVital.jsx`

```javascript
// Lines 6-10: Form state
const [formData, setFormData] = useState({
  vital_type: 'BP',
  value: '',
  recorded_at: new Date().toISOString().slice(0, 16)
});
```

**Process:**
- User selects vital type (BP, Sugar, Heart Rate, etc.)
- User enters numeric value
- User selects/enters date and time

#### Step 2: Form Submission
**File:** `frontend/src/components/Dashboard/AddVital.jsx`

```javascript
// Lines 30-34: POST request
await api.post('/vitals', {
  vital_type: formData.vital_type,
  value: parseFloat(formData.value),
  recorded_at: formData.recorded_at
});
```

**Process:**
- Converts value to float
- Sends JSON payload (not FormData)
- POST to `/api/vitals`

#### Step 3: Backend Route Handler
**File:** `backend/routes/vitals.routes.js`

```javascript
// Lines 8-14: Validation
router.post('/', authenticateToken, (req, res) => {
  const { vital_type, value, recorded_at } = req.body;

  if (!vital_type || value === undefined || value === null) {
    return res.status(400).json({ error: 'Vital type and value are required' });
  }
```

**Process:**
- Authenticates user via middleware
- Validates required fields
- Checks value is not null/undefined

#### Step 4: Vital Type Validation
**File:** `backend/routes/vitals.routes.js`

```javascript
// Lines 16-19: Validate vital type
const validVitalTypes = ['BP', 'Sugar', 'Heart Rate', 'Oxygen', 'Temperature', 'Weight'];
if (!validVitalTypes.includes(vital_type)) {
  return res.status(400).json({ error: 'Invalid vital type' });
}
```

**Process:**
- Whitelist validation prevents invalid types
- Ensures data consistency

#### Step 5: Database Insertion
**File:** `backend/routes/vitals.routes.js`

```javascript
// Lines 21-25: Insert vital record
const recordTime = recorded_at || new Date().toISOString();

db.run(
  'INSERT INTO vitals (user_id, vital_type, value, recorded_at) VALUES (?, ?, ?, ?)',
  [req.user.id, vital_type, value, recordTime],
  function(err) {
```

**File:** `backend/database/init.js`

```javascript
// Lines 46-53: Vitals table schema
db.run(`CREATE TABLE IF NOT EXISTS vitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vital_type TEXT NOT NULL,
  value REAL NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`);
```

**Process:**
- Uses current timestamp if not provided
- Stores user_id, vital_type, value, recorded_at
- Foreign key ensures data integrity

#### Step 6: Success Response
**File:** `backend/routes/vitals.routes.js`

```javascript
// Lines 31-39: Success response
res.status(201).json({
  message: 'Vital recorded successfully',
  vital: {
    id: this.lastID,
    vital_type: vital_type,
    value: value,
    recorded_at: recordTime
  }
});
```

**Process:**
- Returns created vital record
- Includes generated ID

#### Step 7: Frontend Success Handling
**File:** `frontend/src/components/Dashboard/AddVital.jsx`

```javascript
// Lines 35-43: Success handling
setMessage('Vital recorded successfully!');
setFormData({
  vital_type: 'BP',
  value: '',
  recorded_at: new Date().toISOString().slice(0, 16)
});

setTimeout(() => window.location.reload(), 1000);
```

**Process:**
- Shows success message
- Resets form
- Reloads page to refresh charts (could be optimized with state update)

---

## 6. View Reports Flow

### Overview
Users retrieve their medical reports with optional filtering by date range, type, and associated vital type.

### Technical Flow

#### Step 1: Component Mount & Data Fetching
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 20-22: Fetch reports on mount
useEffect(() => {
  fetchReports();
}, []);
```

**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 28-44: Fetch reports function
const fetchReports = useCallback(async () => {
  setLoading(true);
  try {
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.report_type) params.report_type = filters.report_type;
    if (filters.vital_type) params.vital_type = filters.vital_type;

    const response = await api.get('/reports', { params });
    setReports(response.data.reports || []);
  } catch (error) {
    console.error('Error fetching reports:', error);
  } finally {
    setLoading(false);
  }
}, [filters.start_date, filters.end_date, filters.report_type, filters.vital_type]);
```

**Process:**
- Builds query parameters from filter state
- GET request to `/api/reports` with query params
- Updates reports state with response

#### Step 2: Backend Route Handler
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 58-112: Get reports endpoint
router.get('/', authenticateToken, (req, res) => {
  const { start_date, end_date, report_type, vital_type } = req.query;
```

**Process:**
- Extracts query parameters
- User authenticated via middleware

#### Step 3: Database Query Construction
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 61-85: Dynamic query building
let query = `
  SELECT r.*, 
         GROUP_CONCAT(DISTINCT rv.vital_type) as associated_vitals
  FROM reports r
  LEFT JOIN report_vitals rv ON r.id = rv.report_id
  WHERE r.user_id = ?
`;
const params = [req.user.id];

if (start_date) {
  query += ' AND r.report_date >= ?';
  params.push(start_date);
}

if (end_date) {
  query += ' AND r.report_date <= ?';
  params.push(end_date);
}

if (report_type) {
  query += ' AND r.report_type = ?';
  params.push(report_type);
}

query += ' GROUP BY r.id ORDER BY r.report_date DESC';
```

**Process:**
- Base query filters by user_id (ownership)
- LEFT JOIN with report_vitals for associated vitals
- Dynamically adds WHERE conditions based on filters
- Parameterized queries prevent SQL injection
- Orders by date descending (newest first)

#### Step 4: In-Memory Filtering (Vital Type)
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 92-99: Client-side vital type filtering
let filteredReports = reports;
if (vital_type) {
  filteredReports = reports.filter(report => {
    const vitals = report.associated_vitals ? report.associated_vitals.split(',') : [];
    return vitals.includes(vital_type);
  });
}
```

**Process:**
- Vital type filter applied in memory (could be optimized with SQL)
- Splits comma-separated associated_vitals
- Filters reports containing specified vital type

#### Step 5: File URL Generation
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 101-105: Add file URLs
const reportsWithUrls = filteredReports.map(report => ({
  ...report,
  file_url: `/uploads/${report.user_id}/${path.basename(report.file_path)}`
}));
```

**Process:**
- Generates public URLs for file access
- Extracts filename from file_path
- Creates URL: `/uploads/{user_id}/{filename}`

#### Step 6: Response Sent
**File:** `backend/routes/reports.routes.js`

```javascript
// Line 107: Send response
res.json({ reports: reportsWithUrls });
```

**Process:**
- Returns JSON array of reports
- Each report includes file_url for frontend access

#### Step 7: Frontend Display
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 46-51: Apply client-side filters
const applyFilters = useCallback(() => {
  let filtered = [...reports];
  // Client-side filtering for additional filters if needed
  setFilteredReports(filtered);
}, [reports]);
```

**File:** `frontend/src/components/Reports/ReportList.jsx`

**Process:**
- Reports displayed in list component
- Each report shows: filename, type, date, actions (view, share, delete)

---

## 7. Filter Reports Flow

### Overview
Users apply filters (date range, report type, vital type) to narrow down report list.

### Technical Flow

#### Step 1: Filter State Management
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 10-15: Filter state
const [filters, setFilters] = useState({
  start_date: '',
  end_date: '',
  report_type: '',
  vital_type: ''
});
```

**Process:**
- React state holds filter values
- Initialized as empty strings (no filters)

#### Step 2: Filter Input Changes
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 53-59: Handle filter changes
const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters({
    ...filters,
    [name]: value
  });
};
```

**Process:**
- Updates filter state on input change
- Uses input name attribute to identify field

#### Step 3: Filter Form Submission
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 61-64: Submit filters
const handleFilterSubmit = (e) => {
  e.preventDefault();
  fetchReports();
};
```

**Process:**
- Prevents default form submission
- Calls fetchReports with updated filters

#### Step 4: Reports Refetch with Filters
**File:** `frontend/src/pages/Reports.jsx`

**Process:**
- `fetchReports` uses current filter state
- Builds query parameters from filters
- Sends GET request with query params

#### Step 5: Backend Filter Processing
**File:** `backend/routes/reports.routes.js`

**Process:**
- Query parameters extracted from `req.query`
- SQL WHERE clauses added dynamically
- Results filtered and returned

#### Step 6: Clear Filters
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 66-74: Clear all filters
const handleClearFilters = () => {
  setFilters({
    start_date: '',
    end_date: '',
    report_type: '',
    vital_type: ''
  });
  fetchReports();
};
```

**Process:**
- Resets all filters to empty
- Refetches reports without filters

---

## 8. Share Report Flow

### Overview
Users share medical reports with other users by email address, creating access permissions in database.

### Technical Flow

#### Step 1: Share Modal Trigger
**File:** `frontend/src/pages/Reports.jsx`

```javascript
// Lines 87-90: Handle share button click
const handleShare = (report) => {
  setSelectedReport(report);
  setShowShareModal(true);
};
```

**Process:**
- User clicks "Share" button on report
- Sets selected report in state
- Opens ShareReportModal component

#### Step 2: Email Input
**File:** `frontend/src/components/Reports/ShareReportModal.jsx`

```javascript
// Line 6: Email state
const [email, setEmail] = useState('');
```

**Process:**
- User enters email address in modal
- State managed via React hooks

#### Step 3: Share Request
**File:** `frontend/src/components/Reports/ShareReportModal.jsx`

```javascript
// Lines 22-25: POST request to share endpoint
await api.post('/share', {
  report_id: report.id,
  shared_with_email: email
});
```

**Process:**
- Sends report ID and recipient email
- POST to `/api/share`

#### Step 4: Backend Ownership Verification
**File:** `backend/routes/share.routes.js`

```javascript
// Lines 17-25: Verify report ownership
db.get('SELECT id FROM reports WHERE id = ? AND user_id = ?', 
  [report_id, req.user.id], (err, report) => {
    if (!report) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }
```

**Process:**
- Verifies user owns the report
- Prevents sharing others' reports
- Returns 404 if not owner

#### Step 5: Duplicate Share Check
**File:** `backend/routes/share.routes.js`

```javascript
// Lines 28-36: Check if already shared
db.get('SELECT id FROM shared_access WHERE report_id = ? AND shared_with_email = ?',
  [report_id, shared_with_email], (err, existing) => {
    if (existing) {
      return res.status(400).json({ error: 'Report already shared with this user' });
    }
```

**Process:**
- Prevents duplicate shares
- Checks existing shared_access records

#### Step 6: Create Shared Access Record
**File:** `backend/routes/share.routes.js`

```javascript
// Lines 39-41: Insert shared access
db.run(
  'INSERT INTO shared_access (report_id, shared_with_email, access_type) VALUES (?, ?, ?)',
  [report_id, shared_with_email, 'read'],
  function(err) {
```

**File:** `backend/database/init.js`

```javascript
// Lines 64-71: Shared access table schema
db.run(`CREATE TABLE IF NOT EXISTS shared_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  shared_with_email TEXT NOT NULL,
  access_type TEXT DEFAULT 'read',
  shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
)`);
```

**Process:**
- Creates shared_access record
- Access type: 'read' (read-only)
- Timestamp automatically set

#### Step 7: Success Response
**File:** `backend/routes/share.routes.js`

```javascript
// Lines 47-55: Success response
res.status(201).json({
  message: 'Report shared successfully',
  share: {
    id: this.lastID,
    report_id: report_id,
    shared_with_email: shared_with_email,
    access_type: 'read'
  }
});
```

**Process:**
- Returns created share record
- HTTP 201 Created

#### Step 8: Frontend Success Handling
**File:** `frontend/src/components/Reports/ShareReportModal.jsx`

```javascript
// Lines 27-32: Success handling
setMessage('Report shared successfully!');
setEmail('');

setTimeout(() => {
  onSuccess();
}, 1000);
```

**Process:**
- Shows success message
- Clears email input
- Closes modal after delay
- Triggers callback to refresh UI

---

## 9. View Shared Reports Flow

### Overview
Users can view reports that have been shared with them by other users.

### Technical Flow

#### Step 1: Fetch Shared Reports
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 115-141: Get shared reports endpoint
router.get('/shared', authenticateToken, (req, res) => {
  const query = `
    SELECT r.*, u.name as owner_name, u.email as owner_email
    FROM reports r
    INNER JOIN shared_access sa ON r.id = sa.report_id
    INNER JOIN users u ON r.user_id = u.id
    WHERE sa.shared_with_email = ?
    ORDER BY r.report_date DESC
  `;

  db.all(query, [req.user.email], (err, reports) => {
```

**Process:**
- Query joins reports, shared_access, and users tables
- Filters by current user's email in shared_with_email
- Includes owner information

#### Step 2: File URL Generation
**File:** `backend/routes/reports.routes.js`

```javascript
// Lines 131-134: Add file URLs
const reportsWithUrls = reports.map(report => ({
  ...report,
  file_url: `/uploads/${report.user_id}/${path.basename(report.file_path)}`
}));
```

**Process:**
- Generates file URLs for shared reports
- Same format as owned reports

#### Step 3: Response & Frontend Display
**Process:**
- Returns shared reports array
- Frontend displays in separate section
- Users can view but not delete shared reports

---

## 10. Logout Flow

### Overview
Users log out, clearing authentication state and redirecting to login page.

### Technical Flow

#### Step 1: Logout Button Click
**File:** `frontend/src/components/Common/Navbar.jsx`

```javascript
// Lines 10-13: Logout handler
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

**Process:**
- User clicks "Logout" button in navbar
- Calls logout function from AuthContext
- Navigates to login page

#### Step 2: AuthContext Logout Function
**File:** `frontend/src/context/AuthContext.js`

```javascript
// Lines 11-16: Logout function
const logout = useCallback(() => {
  setToken(null);
  setUser(null);
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
}, []);
```

**Process:**
- Clears token from React state
- Clears user from React state
- Removes token from localStorage
- Removes Authorization header from Axios defaults

#### Step 3: Protected Route Redirect
**File:** `frontend/src/components/Common/ProtectedRoute.jsx`

**Process:**
- ProtectedRoute checks authentication status
- If no user/token, redirects to `/login`
- Prevents access to protected pages

#### Step 4: Session Cleanup
**Process:**
- All authenticated requests will fail (no token)
- User must login again to access protected routes
- Previous session completely cleared

---

## Summary of Key Technical Concepts

### Authentication
- **JWT Tokens**: Stateless authentication tokens with 7-day expiration
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Middleware**: `authenticateToken` validates tokens on protected routes
- **Token Storage**: localStorage for persistence, React state for reactivity

### File Handling
- **Multer**: Handles multipart/form-data file uploads
- **Storage**: User-specific directories (`uploads/{user_id}/`)
- **Validation**: MIME type and file size checks
- **Serving**: Express static middleware serves files

### Database
- **SQLite**: File-based database for development
- **Foreign Keys**: Ensure referential integrity
- **Parameterized Queries**: Prevent SQL injection
- **Cascade Deletes**: Automatic cleanup of related records

### Security
- **Input Validation**: Both client and server-side
- **Ownership Checks**: Users can only access their own data
- **Shared Access**: Controlled via shared_access table
- **Error Messages**: Generic messages prevent information leakage

### Frontend Architecture
- **React Hooks**: useState, useEffect, useContext for state management
- **Context API**: Global authentication state
- **React Router**: Client-side routing with protected routes
- **Axios Interceptors**: Automatic token attachment and error handling

---

**End of Technical Data Flow Documentation**
