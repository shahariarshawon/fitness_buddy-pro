const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Goal must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    type: {
      type: String,
      enum: [
        "weight_loss",
        "muscle_gain",
        "strength",
        "endurance",
        "habit_streak",
        "body_composition",
        "custom",
      ],
      default: "weight_loss",
    },
    startValue: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    targetValue: {
      type: Number,
      required: [true, "Target value is required"],
    },
    unit: {
      type: String,
      default: "kg",
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: [true, "Target deadline date is required"],
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "paused", "abandoned"],
      default: "in_progress",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    milestones: [milestoneSchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for percentage progress
goalSchema.virtual("progressPercentage").get(function () {
  if (this.startValue === this.targetValue) return 100;
  const totalChangeNeeded = Math.abs(this.targetValue - this.startValue);
  if (totalChangeNeeded === 0) return 0;
  const currentChange = Math.abs(this.currentValue - this.startValue);
  const percent = Math.round((currentChange / totalChangeNeeded) * 100);
  return Math.min(Math.max(percent, 0), 100);
});

goalSchema.index({ user: 1, status: 1, targetDate: 1 });

module.exports = mongoose.model("Goal", goalSchema);
