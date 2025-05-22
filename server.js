import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import projectRoutes from "./routes/projects.js";
import hourRoutes from "./routes/hours.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 Starting TaskFlow with Express 4...");
console.log("Environment check:");
console.log("- PORT:", PORT);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);  
  }
  next();
});

// Health check route
app.get("/", (req, res) => {
  console.log("🏠 Health check requested");
  res.json({ 
    message: "TaskFlow API is running ✅",
    version: "2.0.0",
    express: "4.x",
    port: PORT,
    timestamp: new Date().toISOString(),
    features: [
      "User Authentication",
      "Task Management", 
      "Project Management",
      "Time Tracking"
    ],
    endpoints: {
      health: "GET /",
      auth: "/api/auth/*",
      tasks: "/api/tasks/*",
      projects: "/api/projects/*",
      hours: "/api/hours/*"
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/hours", hourRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/tasks/:id',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id',
      'GET /api/tasks/stats',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id',
      'GET /api/projects/:id/stats',
      'POST /api/projects/:id/hours',
      'GET /api/projects/:id/hours',
      'GET /api/hours',
      'GET /api/hours/stats',
      'GET /api/hours/:id',
      'PUT /api/hours/:id',
      'DELETE /api/hours/:id'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global error handler caught:", err);
  console.error("Stack trace:", err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🗄️ Database name:", mongoose.connection.name);
    
    app.listen(PORT, () => {
      console.log("\n🎉 TASKFLOW SERVER READY!");
      console.log(`🚀 Server running on port ${PORT} with Express 4.x`);
      console.log(`🌐 Health check: http://localhost:${PORT}/`);
      console.log(`📡 Available API endpoints:`);
      console.log(`   Auth:     http://localhost:${PORT}/api/auth/*`);
      console.log(`   Tasks:    http://localhost:${PORT}/api/tasks/*`);
      console.log(`   Projects: http://localhost:${PORT}/api/projects/*`);
      console.log(`   Hours:    http://localhost:${PORT}/api/hours/*`);
      console.log("\n⏱️  Time tracking system ready!");
      console.log("👁️  Ready for requests...\n");
    });
  })
  .catch((err) => {
    console.error("💀 MongoDB connection failed:", err.message);
    process.exit(1);
  });