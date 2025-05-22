import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  logHours,
  getProjectHours
} from '../controllers/projectController.js';

const router = express.Router();

console.log("✅ Loading project routes...");

// Apply auth middleware to all project routes
router.use(authMiddleware);

// GET /api/projects - Get all projects for user
router.get("/", getProjects);

// POST /api/projects - Create new project
router.post("/", createProject);

// GET /api/projects/:id - Get single project
router.get("/:id", getProject);

// PUT /api/projects/:id - Update project
router.put("/:id", updateProject);

// DELETE /api/projects/:id - Delete project
router.delete("/:id", deleteProject);

// GET /api/projects/:id/stats - Get project statistics
router.get("/:id/stats", getProjectStats);

// POST /api/projects/:id/hours - Log hours to project
router.post("/:id/hours", logHours);

// GET /api/projects/:id/hours - Get hour entries for project
router.get("/:id/hours", getProjectHours);

console.log("✅ Project routes configured:");
console.log("   GET    /api/projects");
console.log("   POST   /api/projects");
console.log("   GET    /api/projects/:id");
console.log("   PUT    /api/projects/:id");
console.log("   DELETE /api/projects/:id");
console.log("   GET    /api/projects/:id/stats");
console.log("   POST   /api/projects/:id/hours");
console.log("   GET    /api/projects/:id/hours");

export default router;