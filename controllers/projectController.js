import Project from "../models/Project.js";
import HourEntry from "../models/HourEntry.js";

console.log("✅ projectController.js loaded");

// Get all projects for authenticated user
export const getProjects = async (req, res) => {
  console.log("📋 Get projects called for user:", req.user.email);
  
  try {
    const { status, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    console.log("🔍 Filter:", filter);
    
    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };
    
    const projects = await Project.find(filter).sort(sort);
    
    console.log(`✅ Found ${projects.length} projects`);
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
    
  } catch (error) {
    console.error("💥 Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects"
    });
  }
};

// Get single project by ID
export const getProject = async (req, res) => {
  console.log("📋 Get single project called:", req.params.id);
  
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    console.log("✅ Project found:", project.name);
    
    res.json({
      success: true,
      data: project
    });
    
  } catch (error) {
    console.error("💥 Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project"
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  console.log("➕ Create project called");
  console.log("Request body:", req.body);
  
  try {
    const { name, description, targetHours } = req.body;
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }
    
    // Create project
    const newProject = new Project({
      name: name.trim(),
      description: description?.trim() || "",
      targetHours: targetHours || 100,
      userId: req.user._id
    });
    
    await newProject.save();
    console.log("✅ Project created:", newProject._id);
    
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject
    });
    
  } catch (error) {
    console.error("💥 Create project error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create project"
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  console.log("✏️ Update project called:", req.params.id);
  console.log("Update data:", req.body);
  
  try {
    const { name, description, targetHours, status } = req.body;
    
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Update fields
    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (targetHours !== undefined) project.targetHours = targetHours;
    if (status !== undefined) project.status = status;
    
    await project.save();
    console.log("✅ Project updated successfully");
    
    res.json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
    
  } catch (error) {
    console.error("💥 Update project error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update project"
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  console.log("🗑️ Delete project called:", req.params.id);
  
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Check if there are hour entries for this project
    const hourEntriesCount = await HourEntry.countDocuments({ projectId: req.params.id });
    
    if (hourEntriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project. It has ${hourEntriesCount} hour entries. Delete hour entries first or archive the project instead.`
      });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    console.log("✅ Project deleted:", project.name);
    
    res.json({
      success: true,
      message: "Project deleted successfully",
      data: project
    });
    
  } catch (error) {
    console.error("💥 Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project"
    });
  }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
  console.log("📊 Get project stats called:", req.params.id);
  
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Get hour entries for this project
    const hourEntries = await HourEntry.find({ 
      projectId: req.params.id,
      userId: req.user._id
    }).sort({ date: -1 });
    
    // Calculate stats
    const totalHours = hourEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalDays = hourEntries.length;
    const averageHoursPerDay = totalDays > 0 ? (totalHours / totalDays) : 0;
    
    // Get date range
    const firstEntry = hourEntries[hourEntries.length - 1];
    const lastEntry = hourEntries[0];
    
    // Hours by month for charting
    const hoursByMonth = {};
    hourEntries.forEach(entry => {
      const monthKey = entry.date.toISOString().slice(0, 7); // YYYY-MM
      hoursByMonth[monthKey] = (hoursByMonth[monthKey] || 0) + entry.hours;
    });
    
    const stats = {
      project: {
        id: project._id,
        name: project.name,
        targetHours: project.targetHours,
        totalHours: project.totalHours,
        progressPercentage: project.progressPercentage,
        isTargetReached: project.isTargetReached,
        status: project.status
      },
      timeTracking: {
        totalHours,
        totalDays,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        firstLogDate: firstEntry ? firstEntry.date : null,
        lastLogDate: lastEntry ? lastEntry.date : null
      },
      analytics: {
        hoursByMonth,
        recentEntries: hourEntries.slice(0, 10) // Last 10 entries
      }
    };
    
    console.log("📊 Stats calculated for project:", project.name);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error("💥 Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project statistics"
    });
  }
};

// Log hours to a project
export const logHours = async (req, res) => {
  console.log("⏰ Log hours called for project:", req.params.id);
  console.log("Request body:", req.body);
  
  try {
    const { hours, description, date } = req.body;
    
    // Validation
    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hours must be a positive number"
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }
    
    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Create hour entry
    const hourEntry = new HourEntry({
      hours: parseFloat(hours),
      description: description?.trim() || "",
      date: new Date(date),
      projectId: req.params.id,
      userId: req.user._id
    });
    
    await hourEntry.save();
    console.log("✅ Hours logged:", hours, "for project:", project.name);
    
    // Update project total hours
    project.totalHours += parseFloat(hours);
    await project.save();
    console.log("✅ Project total hours updated:", project.totalHours);
    
    res.status(201).json({
      success: true,
      message: "Hours logged successfully",
      data: {
        hourEntry,
        project: {
          id: project._id,
          name: project.name,
          totalHours: project.totalHours,
          targetHours: project.targetHours,
          progressPercentage: project.progressPercentage
        }
      }
    });
    
  } catch (error) {
    console.error("💥 Log hours error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to log hours"
    });
  }
};

// Get hour entries for a project
export const getProjectHours = async (req, res) => {
  console.log("⏰ Get project hours called:", req.params.id);
  
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Build filter
    const filter = { 
      projectId: req.params.id,
      userId: req.user._id
    };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const hourEntries = await HourEntry.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${hourEntries.length} hour entries`);
    
    res.json({
      success: true,
      count: hourEntries.length,
      data: hourEntries
    });
    
  } catch (error) {
    console.error("💥 Get project hours error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project hours"
    });
  }
};