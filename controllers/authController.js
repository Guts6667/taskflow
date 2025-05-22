import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


console.log("✅ authController.js chargé");
// New User Registration
export const register = async (req, res) => {
  console.log("🔥 /register called with:", req.body);
  try {
    console.log("Registering user...");
    const { email, password } = req.body;
    console.log("Email:", email);
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed Password:", hashedPassword);


    // Create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    console.log("New user created:", newUser);

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Extracting email and password from user input

    // Check if user exists
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token containing user ID
    const token = jwt.sign(
      { id: user._id }, // Sign the token with the user's ID
      process.env.JWT_SECRET, // Use the secret key from environment variables
      { expiresIn: "3d" }
    ); // Set token expiration to 3 days

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
      },
      token, // Send the generated token back to the client
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
