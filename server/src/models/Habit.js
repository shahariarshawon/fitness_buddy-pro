const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    workoutCompleted: {
      type: Boolean,
      default: false,
    },

    cardioCompleted: {
      type: Boolean,
      default: false,
    },

    dietFollowed: {
      type: Boolean,
      default: false,
    },

    waterCompleted: {
      type: Boolean,
      default: false,
    },

    sleepAchieved: {
      type: Boolean,
      default: false,
    },

    prayerCompleted: {
      type: Boolean,
      default: false,
    },

    studyCompleted: {
      type: Boolean,
      default: false,
    },

    proteinTargetAchieved: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    completionPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One habit record per user per date
habitSchema.index({ user: 1, date: 1 });

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;