# 📝 TaskFlow

A personal task management API with **project time tracking** to validate the **100-hour rule** before deciding whether to continue or abandon a project.

> *"Commit 100 hours to a project before making any go/no-go decisions"*

---

## 🎯 Core Concept

TaskFlow helps you track time spent on projects to make informed decisions:

1. **Create a project** (e.g., "Learn React", "Build SaaS", "Write Book")
2. **Set a target** (default: 100 hours)  
3. **Log your daily hours** manually
4. **Track progress** until you reach your goal
5. **Decide** whether to continue or move on

---

## ✨ Features

### 🔐 **Authentication**
- Secure user registration and login
- JWT-based authentication

### 📋 **Task Management** 
- Create, read, update, delete tasks
- Filter by status and priority
- Task statistics and insights

### 🎯 **Project Management**
- Create projects with custom hour targets
- Track total hours and progress percentage
- Project status management (active, completed, abandoned)

### ⏰ **Time Tracking**
- Manual daily hour logging
- Automatic progress calculation
- Validation (max 24h/day)
- Comprehensive time analytics

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Installation
```bash
# Clone repository
git clone https://github.com/Guts6667/taskflow.git
cd taskflow

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm start
```

### First Steps
1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` 
3. **Create project**: `POST /api/projects`
4. **Log hours**: `POST /api/projects/:id/hours`
5. **Track progress**: `GET /api/projects`

---

## 📚 Documentation

**Complete API documentation**: [Swagger Editor](https://editor.swagger.io/)
1. Copy content from `docs/api.yaml`
2. Paste in Swagger Editor
3. Interactive testing with authentication

See `docs/README.md` for detailed instructions.

---

## 🏗️ Architecture

```
TaskFlow API
├── Authentication (JWT)
├── Task Management (CRUD)
├── Project Management
└── Time Tracking System
```

**Tech Stack**: Node.js, Express 4, MongoDB, Mongoose, JWT, bcrypt

**Structure**: Clean MVC architecture with separated models, controllers, and routes

---

## 🔧 Development

```bash
# Development with auto-reload
npm run dev

# Run tests (if available)
npm test

# Check API health
curl http://localhost:3000/
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

---

## 🌟 Coming Soon

- **React Frontend** - Visual dashboard and time tracking interface
- **Task-Project Integration** - Link tasks to specific projects
- **Advanced Analytics** - Charts, trends, and productivity insights
- **Mobile App** - Quick hour logging on the go

---

## 💡 The 100-Hour Rule

*"Most people overestimate what they can accomplish in a day, and underestimate what they can accomplish in a year"*

The 100-hour rule helps you:
- **Commit** fully before judging
- **Measure** real effort vs. perceived effort  
- **Decide** based on substantial investment
- **Avoid** premature project abandonment

Track your hours. Make informed decisions. Build better projects.