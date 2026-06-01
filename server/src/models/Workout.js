const mongoose = require("mongoose");

const workoutExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
    },

    sets: {
      type: Number,
      required: true,
      min: 0,
    },

    reps: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    restTime: {
      type: Number,
      default: 0, // seconds
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    workoutName: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
    },

    workoutType: {
      type: String,
      enum: ["strength", "cardio", "mixed", "bodyweight", "other"],
      default: "strength",
    },

    duration: {
      type: Number,
      default: 0, // minutes
    },

    exercises: {
      type: [workoutExerciseSchema],
      default: [],
    },

    cardioDuration: {
      type: Number,
      default: 0, // minutes
    },

    caloriesBurned: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

workoutSchema.index({ user: 1, date: -1 });

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;