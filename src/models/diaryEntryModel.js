import mongoose from "mongoose";

const diaryEntrySchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Personal",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // Store only date part (YYYY-MM-DD) - time will be set to 00:00:00
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      // Optional - can be null if still working
    },
    totalHours: {
      type: Number,
      default: 0,
      // Calculated field in hours (decimal)
    },
    notes: {
      type: String,
      // Optional notes for the day
    },
    isMaestro: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "diary_entries",
  }
);

// Compound index for efficient queries - one entry per worker per day per project
diaryEntrySchema.index({ project: 1, worker: 1, date: 1 }, { unique: true });

// Additional indexes for common queries
diaryEntrySchema.index({ project: 1, date: -1 });
diaryEntrySchema.index({ worker: 1, date: -1 });
diaryEntrySchema.index({ date: -1 });

// Pre-save middleware to calculate total hours
diaryEntrySchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const diffInMs = this.endTime.getTime() - this.startTime.getTime();
    this.totalHours = diffInMs / (1000 * 60 * 60); // Convert to hours
    this.status = "completed";
  } else {
    this.totalHours = 0;
    this.status = "active";
  }
  next();
});

// Static method to get today's date formatted for consistent storage
diaryEntrySchema.statics.getTodayDate = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Static method to format any date for consistent storage
diaryEntrySchema.statics.formatDate = function (date) {
  const formattedDate = new Date(date);
  formattedDate.setHours(0, 0, 0, 0);
  return formattedDate;
};

// Instance method to check if worker is currently clocked in
diaryEntrySchema.methods.isActive = function () {
  return this.status === "active" && !this.endTime;
};

// Instance method to clock out
diaryEntrySchema.methods.clockOut = function (endTime = new Date()) {
  this.endTime = endTime;
  return this.save();
};

const DiaryEntry =
  mongoose.models?.DiaryEntry ?? mongoose.model("DiaryEntry", diaryEntrySchema);

export default DiaryEntry;
