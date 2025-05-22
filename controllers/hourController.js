import HourEntry from "../models/HourEntry.js";
import Project from "../models/Project.js";

console.log("✅ hourController.js loaded");

// Get single hour entry
export const getHourEntry = async (req, res) => {
  console.log("⏰ Get hour entry called:", req.params.id);
  
  try {
    const hourEntry = await HourEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('projectId', 'name');
    
    if (!hourEntry) {
      return res.status(404).json({
        success: false,
        message: "Hour entry not found"
      });
    }
    
    console.log("✅ Hour entry found");
    
    res.json({
      success: true,
      data: hourEntry
    });
    
  } catch (error) {
    console.error("💥 Get hour entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hour entry"
    });
  }
};

// Update hour entry
export const updateHourEntry = async (req, res) => {
  console.log("✏️ Update hour entry called:", req.params.id);
  console.log("Update data:", req.body);
  
  try {
    const { hours, description, date } = req.body;
    
    const hourEntry = await HourEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!hourEntry) {
      return res.status(404).json({
        success: false,
        message: "Hour entry not found"
      });
    }
    
    // Store old hours to update project total
    const oldHours = hourEntry.hours;
    
    // Update fields
    if (hours !== undefined) hourEntry.hours = parseFloat(hours);
    if (description !== undefined) hourEntry.description = description.trim();
    if (date !== undefined) hourEntry.date = new Date(date);
    
    await hourEntry.save();
    console.log("✅ Hour entry updated successfully");
    
    // Update project total hours if hours changed
    if (hours !== undefined && hours !== oldHours) {
      const project = await Project.findById(hourEntry.projectId);
      if (project) {
        const hoursDifference = parseFloat(hours) - oldHours;
        project.totalHours += hoursDifference;
        await project.save();
        console.log("✅ Project total hours updated by:", hoursDifference);
      }
    }
    
    // Populate project info for response
    await hourEntry.populate('projectId', 'name totalHours targetHours');
    
    res.json({
      success: true,
      message: "Hour entry updated successfully",
      data: hourEntry
    });
    
  } catch (error) {
    console.error("💥 Update hour entry error:", error);
    
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
      message: "Failed to update hour entry"
    });
  }
};

// Delete hour entry
export const deleteHourEntry = async (req, res) => {
  console.log("🗑️ Delete hour entry called:", req.params.id);
  
  try {
    const hourEntry = await HourEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!hourEntry) {
      return res.status(404).json({
        success: false,
        message: "Hour entry not found"
      });
    }
    
    // Update project total hours before deleting
    const project = await Project.findById(hourEntry.projectId);
    if (project) {
      project.totalHours -= hourEntry.hours;
      project.totalHours = Math.max(0, project.totalHours); // Ensure non-negative
      await project.save();
      console.log("✅ Project total hours reduced by:", hourEntry.hours);
    }
    
    await HourEntry.findByIdAndDelete(req.params.id);
    console.log("✅ Hour entry deleted");
    
    res.json({
      success: true,
      message: "Hour entry deleted successfully",
      data: hourEntry
    });
    
  } catch (error) {
    console.error("💥 Delete hour entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete hour entry"
    });
  }
};

// Get all hour entries for user (across all projects)
export const getAllHourEntries = async (req, res) => {
  console.log("⏰ Get all hour entries called for user:", req.user.email);
  
  try {
    const { startDate, endDate, projectId, limit = 100 } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    
    if (projectId) {
      filter.projectId = projectId;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const hourEntries = await HourEntry.find(filter)
      .populate('projectId', 'name status')
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${hourEntries.length} hour entries`);
    
    res.json({
      success: true,
      count: hourEntries.length,
      data: hourEntries
    });
    
  } catch (error) {
    console.error("💥 Get all hour entries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hour entries"
    });
  }
};

// Get hour entry statistics for user
export const getHourStats = async (req, res) => {
  console.log("📊 Get hour stats called for user:", req.user.email);
  
  try {
    const { period = 'all' } = req.query; // all, week, month, year
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { date: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = { date: { $gte: monthAgo } };
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = { date: { $gte: yearAgo } };
        break;
    }
    
    const stats = await HourEntry.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      {
        $group: {
          _id: '$projectId',
          totalHours: { $sum: '$hours' },
          entryCount: { $sum: 1 },
          avgHoursPerEntry: { $avg: '$hours' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectName: '$project.name',
          projectTargetHours: '$project.targetHours',
          totalHours: { $round: ['$totalHours', 2] },
          entryCount: 1,
          avgHoursPerEntry: { $round: ['$avgHoursPerEntry', 2] },
          progressPercentage: {
            $round: [
              { $multiply: [{ $divide: ['$totalHours', '$project.targetHours'] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);
    
    // Overall stats
    const totalHours = stats.reduce((sum, stat) => sum + stat.totalHours, 0);
    const totalEntries = stats.reduce((sum, stat) => sum + stat.entryCount, 0);
    
    const result = {
      period,
      overall: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalEntries,
        avgHoursPerEntry: totalEntries > 0 ? Math.round((totalHours / totalEntries) * 100) / 100 : 0,
        projectCount: stats.length
      },
      projects: stats
    };
    
    console.log("📊 Hour stats calculated for period:", period);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("💥 Get hour stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hour statistics"
    });
  }
};