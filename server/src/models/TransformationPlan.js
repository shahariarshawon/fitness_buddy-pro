const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
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
    carbs: {
      type: Number,
      default: 200,
      min: 0,
    },
    fats: {
      type: Number,
      default: 60,
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
  { _id: false }
);

const preferenceSchema = new mongoose.Schema(
  {
    trainingLocation: {
      type: String,
      enum: ["gym", "home", "outdoor", "mixed"],
      default: "gym",
    },
    cardioPreference: {
      type: String,
      enum: [
        "incline_walk",
        "treadmill_walk",
        "bike",
        "elliptical",
        "running",
        "mixed",
        "none",
      ],
      default: "incline_walk",
    },
    foodPreference: {
      type: String,
      enum: ["regular_scales", "grams", "both"],
      default: "regular_scales",
    },
  },
  { _id: false }
);

const transformationPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },

    goalType: {
      type: String,
      enum: [
        "fat_loss",
        "muscle_gain",
        "recomposition",
        "maintenance",
        "general_fitness",
      ],
      default: "fat_loss",
    },

    durationWeeks: {
      type: Number,
      default: 12,
      min: 1,
      max: 52,
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    weeklyWorkoutDays: {
      type: Number,
      default: 5,
      min: 0,
      max: 7,
    },

    targets: {
      type: targetSchema,
      default: () => ({}),
    },

    preferences: {
      type: preferenceSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "archived"],
      default: "draft",
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
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

transformationPlanSchema.index({ user: 1, isActive: 1 });
transformationPlanSchema.index({ user: 1, startDate: -1 });

transformationPlanSchema.pre("validate", function () {
  if (!this.endDate && this.startDate && this.durationWeeks) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + Number(this.durationWeeks) * 7 - 1);
    this.endDate = end;
  }
});

module.exports = mongoose.model("TransformationPlan", transformationPlanSchema);