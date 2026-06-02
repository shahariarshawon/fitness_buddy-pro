const mongoose = require("mongoose");

const planDaySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransformationPlan",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    sessionName: {
      type: String,
      default: "",
      trim: true,
    },

    mainFocus: {
      type: String,
      enum: [
        "full_body",
        "upper_body",
        "lower_body",
        "push",
        "pull",
        "legs",
        "cardio",
        "active_recovery",
        "rest",
        "mobility",
        "custom",
      ],
      default: "full_body",
    },

    dayType: {
      type: String,
      enum: ["training", "cardio", "active_recovery", "rest", "custom"],
      default: "training",
    },

    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "skipped"],
      default: "planned",
    },

    targets: {
      calories: {
        type: Number,
        default: 2000,
        min: 0,
      },
      protein: {
        type: Number,
        default: 140,
        min: 0,
      },
      waterLiters: {
        type: Number,
        default: 3,
        min: 0,
      },
      steps: {
        type: Number,
        default: 8000,
        min: 0,
      },
      sleepHours: {
        type: Number,
        default: 8,
        min: 0,
      },
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

planDaySchema.index({ user: 1, date: 1 });
planDaySchema.index({ plan: 1, date: 1 });

module.exports = mongoose.model("PlanDay", planDaySchema);