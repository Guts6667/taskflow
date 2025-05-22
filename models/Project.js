import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
    maxlength: [100, "Project name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  targetHours: {
    type: Number,
    default: 100,
    min: [1, "Target hours must be at least 1"],
    max: [10000, "Target hours cannot exceed 10000"]
  },
  totalHours: {
    type: Number,
    default: 0,
    min: [0, "Total hours cannot be negative"]
  },
  status: {
    type: String,
    enum: {
      values: ["active", "completed", "abandoned"],
      message: "Status must be: active, completed, or abandoned"
    },
    default: "active"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual field for progress percentage
projectSchema.virtual('progressPercentage').get(function() {
  if (this.targetHours === 0) return 0;
  return Math.min(Math.round((this.totalHours / this.targetHours) * 100), 100);
});

// Virtual field to check if target is reached
projectSchema.virtual('isTargetReached').get(function() {
  return this.totalHours >= this.targetHours;
});

// Middleware to automatically set completedAt when status changes to completed
projectSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      console.log("✅ Project marked as completed");
    } else if (this.status !== 'completed') {
      this.completedAt = null;
      console.log("🔄 Project status changed from completed");
    }
  }
  next();
});

// Indexes for faster queries
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });

// Include virtuals when converting to JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.model("Project", projectSchema);