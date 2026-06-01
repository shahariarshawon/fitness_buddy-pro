const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Reminder title is required"],
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    reminderType: {
      type: String,
      enum: ["workout", "water", "meal", "sleep", "habit", "custom"],
      default: "custom",
    },

    time: {
      type: String,
      required: [true, "Reminder time is required"],
      // Format example: "07:30", "18:00"
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },

    daysOfWeek: {
      type: [String],
      enum: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastTriggeredAt: {
      type: Date,
      default: null,
    },

    timezone: {
      type: String,
      default: "Asia/Dhaka",
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ user: 1, isActive: 1, reminderType: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;