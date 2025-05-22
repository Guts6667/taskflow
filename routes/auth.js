import express from 'express';
import { register, login } from '../controllers/authController.js';

console.log("✅ auth.js routes loaded");

const router = express.Router();

// POST /api/auth/register - Register new user
router.post("/register", register);

// POST /api/auth/login - Login user
router.post("/login", login);

// GET /api/auth/test - Test route (optional)
router.get("/test", (req, res) => {
  res.json({ 
    message: "Auth routes are working ✅",
    availableEndpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login"
    ]
  });
});

console.log("📝 Auth routes registered:");
console.log("   POST /api/auth/register");
console.log("   POST /api/auth/login");
console.log("   GET  /api/auth/test");

export default router;