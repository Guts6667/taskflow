import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: false
}));

// Add explicit OPTIONS handler for preflight requests
app.options('*', cors());

// Parse JSON requests - MUST come after CORS
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TaskFlow API is running ✅");
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
      console.log(`📡 Available routes:`);
      console.log(`   GET  http://localhost:${process.env.PORT}/`);
      console.log(`   POST http://localhost:${process.env.PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${process.env.PORT}/api/auth/login`);
    });
  })
  .catch((err) => {
    console.error("💀 MongoDB connection error:", err);
  });