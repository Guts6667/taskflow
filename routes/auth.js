// Importing the 'express' module to create routes and handle HTTP requests
import express from 'express';

// Importing the 'register' function from the authController.js file
// This function handles the business logic for user registration
import { register, login } from '../controllers/authController.js';

console.log("✅ auth.js chargé");
// Creating an Express router to define specific routes
const router = express.Router();

// Defining a POST route for "/register"
// When this route is called, the 'register' function will be executed
router.post("/register", register);

// Defining a POST route for "/loginm"
// 
router.post("/login", login);

// Exporting the router so it can be used in other parts of the application
export default router;