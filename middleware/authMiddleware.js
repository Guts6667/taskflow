import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware called");
    
    // Get token from header
    const authHeader = req.header("Authorization");
    console.log("📋 Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    
    // Extract token (format: "Bearer <token>")
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format."
      });
    }
    
    console.log("🎟️ Token found, verifying...");
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.id);
    
    // 🔧 FIX: Récupérer le modèle User de manière sûre
    // On utilise mongoose.models.User au lieu de mongoose.model("User")
    const User = mongoose.models.User;
    
    if (!User) {
      console.error("❌ User model not found! Make sure User schema is defined in server.js");
      return res.status(500).json({
        success: false,
        message: "Server configuration error - User model not found"
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user not found."
      });
    }
    
    // Add user to request object
    req.user = user;
    console.log("👤 User authenticated:", user.email);
    
    next();
    
  } catch (error) {
    console.error("💥 Auth middleware error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Authentication failed."
    });
  }
};