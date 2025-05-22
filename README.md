# 📝 TaskFlow

TaskFlow is a fullstack personal task management application, designed for developers who want to practice on a concrete, complete, and well-structured project.

---

## 🚀 Objective

Create a simple web application that allows a user to:

- ✅ Create an account and log in
- ✅ Secure authentication with JWT
- ✅ Add, modify, delete their tasks
- ✅ Filter tasks by status (todo, in-progress, completed)
- ✅ View task statistics
- 🚧 Track time spent on projects (coming soon)

---

## 🧱 Tech Stack

### Backend (Current):

- ✅ **Node.js** - JavaScript runtime
- ✅ **Express 4.x** - Web framework
- ✅ **MongoDB** - NoSQL database
- ✅ **Mongoose** - MongoDB ODM
- ✅ **JWT** - Token-based authentication
- ✅ **bcrypt** - Secure password hashing
- ✅ **CORS** - Cross-origin request handling

### Frontend (Planned):

- React
- Tailwind CSS
- Axios

---

## 📦 Implemented Features

### Authentication ✅
- [x] User registration (`POST /api/auth/register`)
- [x] User login (`POST /api/auth/login`)
- [x] Secure password hashing (bcrypt)
- [x] JWT token generation (7-day expiration)
- [x] Input validation
- [x] Proper error handling

### Task Management ✅
- [x] Create tasks (`POST /api/tasks`)
- [x] List user tasks (`GET /api/tasks`)
- [x] Get single task (`GET /api/tasks/:id`)
- [x] Update tasks (`PUT /api/tasks/:id`)
- [x] Delete tasks (`DELETE /api/tasks/:id`)
- [x] Task statistics (`GET /api/tasks/stats`)
- [x] Filter by status and priority
- [x] Sort by multiple fields
- [x] Automatic completion timestamp tracking

### Coming Soon 🚧
- [ ] Project management with time tracking
- [ ] Manual hour logging system
- [ ] Project progress dashboard (target: 100h per project)
- [ ] Link tasks to projects
- [ ] Advanced analytics and insights

---

## 🏗️ Project Architecture

### Clean MVC Structure
```
taskflow/
├── models/              # Data models
│   ├── User.js         # User schema
│   └── Task.js         # Task schema
├── controllers/         # Business logic
│   ├── authController.js # Authentication logic
│   └── taskController.js # Task operations
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   └── tasks.js        # Task routes
├── middleware/         # Custom middleware
│   └── authMiddleware.js # JWT authentication
├── docs/               # API documentation
│   ├── api.yaml        # OpenAPI specification
│   └── README.md       # Documentation guide
├── server.js          # Application entry point
├── .env              # Environment variables
└── package.json      # Dependencies and scripts
```

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. **Register/Login** → Generate JWT token
2. **Subsequent requests** → Include token in headers
3. **Token verification** → Server validates token for each request

**Token format in headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ Installation and Setup

### Prerequisites:

- Node.js v18+
- npm or yarn
- MongoDB Atlas account

### Steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Guts6667/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Verify it's working**
   ```bash
   curl http://localhost:3000/
   ```

---

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Task Management

#### List Tasks
```http
GET /api/tasks
Authorization: Bearer your-jwt-token

# With filters (optional)
GET /api/tasks?status=todo&priority=high&sortBy=dueDate&order=asc
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "dueDate": "2024-02-15"
}
```

#### Update Task
```http
PUT /api/tasks/{id}
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
Authorization: Bearer your-jwt-token
```

#### Task Statistics
```http
GET /api/tasks/stats
Authorization: Bearer your-jwt-token
```

### System

#### Health Check
```http
GET /
```

---

## 🧪 Testing with Postman/cURL

### 1. Test API Health
```bash
curl http://localhost:3000/
```

### 2. Create Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"high"}'
```

### 5. List Tasks
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 API Documentation

Complete interactive API documentation is available:

1. **View Documentation**: Open `docs/api.yaml` in [Swagger Editor](https://editor.swagger.io/)
2. **Test Endpoints**: Use the interactive interface to test all endpoints
3. **Authentication**: Use the "Authorize" button to test protected routes

See `docs/README.md` for detailed instructions.

---

## 🎯 Data Models

### User
```javascript
{
  id: "ObjectId",
  email: "user@example.com",
  password: "hashed_password",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

### Task
```javascript
{
  id: "ObjectId",
  title: "Complete project",
  description: "Finish the TaskFlow application",
  status: "todo" | "in-progress" | "completed",
  priority: "low" | "medium" | "high",
  dueDate: "2024-02-15T00:00:00.000Z",
  completedAt: "2024-01-15T15:30:00.000Z", // auto-set when completed
  userId: "ObjectId", // Reference to User
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

### Code Structure Guidelines
- **Models**: Data schemas and validation
- **Controllers**: Business logic and data processing
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and request processing

---

## 🎯 Upcoming Features

### Phase 1: Project Management ⏱️
- Create and manage projects
- Set time goals (default: 100 hours)
- Manual time logging system
- Project progress tracking

### Phase 2: Integration 🔗
- Link tasks to projects
- Time attribution to specific tasks
- Enhanced project analytics

### Phase 3: Frontend 🌐
- React-based user interface
- Dashboard with charts and statistics
- Real-time updates
- Responsive design

### Phase 4: Advanced Features 📊
- Time tracking insights
- Productivity analytics
- Project completion predictions
- Export functionality

