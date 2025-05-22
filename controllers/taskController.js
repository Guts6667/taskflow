import Task from "../models/Task.js";

console.log("✅ taskController.js loaded");

// Get all tasks for authenticated user
export const getTasks = async (req, res) => {
  console.log("📋 Get tasks called for user:", req.user.email);
  
  try {
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    console.log("🔍 Filter:", filter);
    
    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };
    
    const tasks = await Task.find(filter).sort(sort);
    
    console.log(`✅ Found ${tasks.length} tasks`);
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
    
  } catch (error) {
    console.error("💥 Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks"
    });
  }
};

// Get single task by ID
export const getTask = async (req, res) => {
  console.log("📋 Get single task called:", req.params.id);
  
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    console.log("✅ Task found:", task.title);
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    console.error("💥 Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task"
    });
  }
};

// Create new task
export const createTask = async (req, res) => {
  console.log("➕ Create task called");
  console.log("Request body:", req.body);
  
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task title is required"
      });
    }
    
    // Create task
    const newTask = new Task({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.user._id
    });
    
    await newTask.save();
    console.log("✅ Task created:", newTask._id);
    
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask
    });
    
  } catch (error) {
    console.error("💥 Create task error:", error);
    
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
      message: "Failed to create task"
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  console.log("✏️ Update task called:", req.params.id);
  console.log("Update data:", req.body);
  
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }
    
    await task.save();
    console.log("✅ Task updated successfully");
    
    res.json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
    
  } catch (error) {
    console.error("💥 Update task error:", error);
    
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
      message: "Failed to update task"
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  console.log("🗑️ Delete task called:", req.params.id);
  
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    
    console.log("✅ Task deleted:", task.title);
    
    res.json({
      success: true,
      message: "Task deleted successfully",
      data: task
    });
    
  } catch (error) {
    console.error("💥 Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task"
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  console.log("📊 Get task stats called");
  
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format stats
    const formattedStats = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      completed: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    console.log("📊 Stats:", formattedStats);
    
    res.json({
      success: true,
      data: formattedStats
    });
    
  } catch (error) {
    console.error("💥 Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task statistics"
    });
  }
};