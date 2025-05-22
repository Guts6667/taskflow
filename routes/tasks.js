import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';

const router = express.Router();

console.log("✅ Loading task routes...");

// Apply auth middleware to all task routes
router.use(authMiddleware);

// GET /api/tasks/stats - Get task statistics (must be before /:id)
router.get("/stats", getTaskStats);

// GET /api/tasks - Get all tasks for user
router.get("/", getTasks);

// GET /api/tasks/:id - Get single task
router.get("/:id", getTask);

// POST /api/tasks - Create new task
router.post("/", createTask);

// PUT /api/tasks/:id - Update task
router.put("/:id", updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", deleteTask);

console.log("✅ Task routes configured:");
console.log("   GET    /api/tasks");
console.log("   GET    /api/tasks/stats");
console.log("   GET    /api/tasks/:id");
console.log("   POST   /api/tasks");
console.log("   PUT    /api/tasks/:id");
console.log("   DELETE /api/tasks/:id");

export default router;