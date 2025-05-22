import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔧 Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 Starting TaskFlow with Express 4...");
console.log("Environment check:");
console.log("- PORT:", PORT);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

// 🛠️ Middleware de base
app.use(cors({
  origin: "*", // En développement - à restreindre en production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // Pour parser le JSON des requêtes

// 📝 Middleware de logging pour voir les requêtes
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", req.body);
  }
  next();
});

// 👤 Modèle utilisateur (Mongoose Schema)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Pas de doublons
    lowercase: true, // Force en minuscules
    trim: true // Enlève les espaces
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { 
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

const User = mongoose.model("User", userSchema);

// 🏠 Route de santé (health check)
app.get("/", (req, res) => {
  console.log("🏠 Health check requested");
  res.json({ 
    message: "TaskFlow API is running ✅",
    version: "1.0.0",
    express: "4.x",
    port: PORT,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login"
    }
  });
});

// 📝 Route d'inscription (Register)
app.post("/api/auth/register", async (req, res) => {
  console.log("🔥 Register endpoint called");
  
  try {
    const { email, password } = req.body;
    
    // 🔍 Validation des données
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    console.log("📧 Attempting to register user:", cleanEmail);
    
    // 🔍 Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // 🔐 Hasher le mot de passe
    console.log("🔐 Hashing password...");
    const saltRounds = 12; // Plus secure que 10
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ Password hashed successfully");
    
    // 👤 Créer le nouvel utilisateur
    console.log("👤 Creating new user...");
    const newUser = new User({
      email: cleanEmail,
      password: hashedPassword
    });
    
    await newUser.save();
    console.log("✅ User created with ID:", newUser._id);
    
    // 🎟️ Générer le token JWT
    console.log("🎟️ Generating JWT token...");
    const token = jwt.sign(
      { id: newUser._id }, // Payload - les données qu'on veut "cacher"
      process.env.JWT_SECRET, // Clé secrète
      { expiresIn: "7d" } // Le token expire dans 7 jours
    );
    console.log("✅ JWT token generated successfully");
    
    // 📤 Réponse de succès
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          createdAt: newUser.createdAt
        },
        token: token // ← LE TOKEN QUE TU CHERCHAIS !
      }
    });
    
    console.log("✅ Registration successful for:", cleanEmail);
    
  } catch (error) {
    console.error("💥 Registration error:", error);
    
    // Gestion d'erreur MongoDB (email dupliqué)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
});

// 🔑 Route de connexion (Login)
app.post("/api/auth/login", async (req, res) => {
  console.log("🔥 Login endpoint called");
  
  try {
    const { email, password } = req.body;
    
    // 🔍 Validation
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    console.log("🔍 Looking for user:", cleanEmail);
    
    // 👤 Chercher l'utilisateur en base
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password" // Message volontairement vague pour la sécurité
      });
    }
    
    console.log("👤 User found, verifying password...");
    
    // 🔐 Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    console.log("✅ Password verified successfully");
    
    // 🎟️ Générer le token JWT
    console.log("🎟️ Generating JWT token...");
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ JWT token generated");
    
    // 📤 Réponse de succès
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        },
        token: token // ← LE TOKEN POUR LES REQUÊTES SUIVANTES
      }
    });
    
    console.log("✅ Login successful for:", cleanEmail);
    
  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});

// 🚫 Gestion des routes non trouvées (404)
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// 🗄️ Connexion MongoDB et démarrage du serveur
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🗄️ Database name:", mongoose.connection.name);
    
    // 🚀 Démarrage du serveur Express
    app.listen(PORT, () => {
      console.log("\n🎉 TASKFLOW SERVER READY!");
      console.log(`🚀 Server running on port ${PORT} with Express 4.x`);
      console.log(`🌐 Health check: http://localhost:${PORT}/`);
      console.log(`📡 Available endpoints:`);
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log("\n👁️  Ready for requests...\n");
    });
  })
  .catch((err) => {
    console.error("💀 MongoDB connection failed:", err.message);
    process.exit(1); // Arrête le serveur si MongoDB ne fonctionne pas
  });