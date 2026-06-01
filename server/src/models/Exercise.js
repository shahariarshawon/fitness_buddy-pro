const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["strength", "cardio", "bodyweight", "mobility", "other"],
      default: "strength",
    },

    muscleGroup: {
      type: String,
      enum: [
        "chest",
        "back",
        "shoulders",
        "arms",
        "legs",
        "core",
        "full_body",
        "cardio",
        "other",
      ],
      default: "other",
    },

    equipment: {
      type: String,
      enum: [
        "barbell",
        "dumbbell",
        "machine",
        "cable",
        "bodyweight",
        "kettlebell",
        "resistance_band",
        "cardio_machine",
        "none",
        "other",
      ],
      default: "none",
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    instructions: {
      type: [String],
      default: [],
    },

    defaultSets: {
      type: Number,
      default: 3,
      min: 0,
    },

    defaultReps: {
      type: Number,
      default: 10,
      min: 0,
    },

    defaultRestTime: {
      type: Number,
      default: 60, // seconds
      min: 0,
    },

    isCustom: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

exerciseSchema.index({ name: "text", muscleGroup: 1, category: 1 });

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;