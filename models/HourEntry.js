import mongoose from "mongoose";

const hourEntrySchema = new mongoose.Schema({
  hours: {
    type: Number,
    required: [true, "Hours is required"],
    min: [0.1, "Hours must be at least 0.1"],
    max: [24, "Hours cannot exceed 24 per day"],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places (e.g., 2.5 hours)
        return Number(value.toFixed(2)) === value;
      },
      message: "Hours can have at most 2 decimal places"
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, "Description cannot exceed 300 characters"]
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    validate: {
      validator: function(date) {
        // Allow dates up to today (not future dates)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      message: "Date cannot be in the future"
    }
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Project ID is required"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  }
}, {
  timestamps: true
});

// Ensure user can't log more than 24 hours total per day across all projects
hourEntrySchema.pre('save', async function(next) {
  try {
    const startOfDay = new Date(this.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(this.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find all hour entries for this user on this date (excluding current if updating)
    const query = {
      userId: this.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };
    
    // If updating, exclude current entry
    if (!this.isNew) {
      query._id = { $ne: this._id };
    }
    
    const existingEntries = await this.constructor.find(query);
    const totalExistingHours = existingEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    if (totalExistingHours + this.hours > 24) {
      const availableHours = 24 - totalExistingHours;
      const error = new Error(`Cannot log ${this.hours} hours. Only ${availableHours.toFixed(1)} hours available for ${this.date.toDateString()}`);
      error.name = 'ValidationError';
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for faster queries
hourEntrySchema.index({ userId: 1, projectId: 1 });
hourEntrySchema.index({ userId: 1, date: -1 });
hourEntrySchema.index({ projectId: 1, date: -1 });

// Compound index to prevent duplicate entries for same user/project/date
// (Optional: uncomment if you want only one entry per project per day)
// hourEntrySchema.index({ userId: 1, projectId: 1, date: 1 }, { unique: true });

export default mongoose.model("HourEntry", hourEntrySchema);