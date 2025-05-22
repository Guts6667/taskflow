import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

console.log("✅ Loading auth routes...");

// POST /api/auth/register - Register new user
router.post("/register", register);

// POST /api/auth/login - Login user
router.post("/login", login);

console.log("📝 Auth routes registered:");
console.log("   POST /api/auth/register");
console.log("   POST /api/auth/login");

export default router;