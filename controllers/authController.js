import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

console.log("✅ authController.js loaded");

// Helper function to validate input
const validateInput = (email, password) => {
  const errors = [];
  
  if (!email || !email.trim()) {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  return errors;
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables");
  }
  
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d" // Token expires in 7 days
  });
};

// Register new user
export const register = async (req, res) => {
  console.log("🔥 Register endpoint called");
  console.log("Request body:", req.body);
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validationErrors = validateInput(email, password);
    if (validationErrors.length > 0) {
      console.log("❌ Validation errors:", validationErrors);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log("📧 Registering user with email:", cleanEmail);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ Password hashed successfully");

    // Create new user
    console.log("👤 Creating new user...");
    const newUser = new User({ 
      email: cleanEmail, 
      password: hashedPassword 
    });
    
    await newUser.save();
    console.log("✅ User created successfully with ID:", newUser._id);

    // Generate JWT token
    const token = generateToken(newUser._id);
    console.log("🎟️ JWT token generated");

    // Send response (exclude password)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          createdAt: newUser.createdAt
        },
        token
      }
    });
    
    console.log("✅ Registration response sent successfully");
    
  } catch (error) {
    console.error("💥 Registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  console.log("🔥 Login endpoint called");
  console.log("Request body:", req.body);
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validationErrors = validateInput(email, password);
    if (validationErrors.length > 0) {
      console.log("❌ Validation errors:", validationErrors);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log("🔍 Looking for user with email:", cleanEmail);
    
    // Find user by email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("👤 User found, verifying password...");
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ Password verified");

    // Generate JWT token
    const token = generateToken(user._id);
    console.log("🎟️ JWT token generated");

    // Send response (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
    
    console.log("✅ Login response sent successfully");
    
  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};