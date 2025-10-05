import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
      match: /^#[0-9A-F]{6}$/i, // Validate hex color format
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Simple index for searching
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

// Static method to find active roles
roleSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Instance method to get role badge style
roleSchema.methods.getBadgeStyle = function () {
  return {
    backgroundColor: this.color,
    color: "#ffffff",
    border: `1px solid ${this.color}`,
  };
};

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
