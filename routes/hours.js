import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getHourEntry,
  updateHourEntry,
  deleteHourEntry,
  getAllHourEntries,
  getHourStats
} from '../controllers/hourController.js';

const router = express.Router();

console.log("✅ Loading hour entry routes...");

// Apply auth middleware to all hour routes
router.use(authMiddleware);

// GET /api/hours/stats - Get hour statistics (must be before /:id)
router.get("/stats", getHourStats);

// GET /api/hours - Get all hour entries for user
router.get("/", getAllHourEntries);

// GET /api/hours/:id - Get single hour entry
router.get("/:id", getHourEntry);

// PUT /api/hours/:id - Update hour entry
router.put("/:id", updateHourEntry);

// DELETE /api/hours/:id - Delete hour entry
router.delete("/:id", deleteHourEntry);

console.log("✅ Hour entry routes configured:");
console.log("   GET    /api/hours");
console.log("   GET    /api/hours/stats");
console.log("   GET    /api/hours/:id");
console.log("   PUT    /api/hours/:id");
console.log("   DELETE /api/hours/:id");

export default router;