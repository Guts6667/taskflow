import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  status: {
    type: String,
    enum: {
      values: ["todo", "in-progress", "completed"],
      message: "Status must be: todo, in-progress, or completed"
    },
    default: "todo"
  },
  priority: {
    type: String,
    enum: {
      values: ["low", "medium", "high"],
      message: "Priority must be: low, medium, or high"
    },
    default: "medium"
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= new Date().setHours(0, 0, 0, 0);
      },
      message: "Due date cannot be in the past"
    }
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

// Middleware to automatically manage completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      console.log("✅ Task marked as completed");
    } else if (this.status !== 'completed') {
      this.completedAt = null;
      console.log("🔄 Task moved back to in-progress/todo");
    }
  }
  next();
});

// Indexes for faster queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Task", taskSchema);