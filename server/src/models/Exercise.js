const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      maxlength: [100, "Exercise name cannot exceed 100 characters"],
    },

    category: {
      type: String,
      enum: ["strength", "cardio", "bodyweight", "mobility", "stretching", "other"],
      default: "strength",
    },

    muscleGroup: {
      type: String,
      enum: [
        "chest",
        "back",
        "shoulders",
        "arms",
        "biceps",
        "triceps",
        "legs",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "core",
        "full_body",
        "cardio",
        "mobility",
        "other",
      ],
      default: "other",
    },

    secondaryMuscleGroups: {
      type: [String],
      enum: [
        "chest",
        "back",
        "shoulders",
        "arms",
        "biceps",
        "triceps",
        "legs",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "core",
        "full_body",
        "cardio",
        "mobility",
        "other",
      ],
      default: [],
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
        "smith_machine",
        "leg_press_machine",
        "bench",
        "mat",
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

    movementPattern: {
      type: String,
      enum: [
        "push",
        "pull",
        "squat",
        "hinge",
        "lunge",
        "carry",
        "rotation",
        "anti_rotation",
        "core_stability",
        "cardio",
        "mobility",
        "other",
      ],
      default: "other",
    },

    exerciseType: {
      type: String,
      enum: ["compound", "isolation", "cardio", "core", "mobility", "other"],
      default: "other",
    },

    instructions: {
      type: [String],
      default: [],
    },

    formTips: {
      type: [String],
      default: [],
    },

    commonMistakes: {
      type: [String],
      default: [],
    },

    safetyNotes: {
      type: [String],
      default: [],
    },

    avoidIf: {
      type: [String],
      default: [],
      // Example: ["knee_pain", "lower_back_pain", "shoulder_pain"]
    },

    replacementExercises: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
        },
        reason: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    defaultSets: {
      type: Number,
      default: 3,
      min: 0,
    },

    defaultRepsMin: {
      type: Number,
      default: 8,
      min: 0,
    },

    defaultRepsMax: {
      type: Number,
      default: 12,
      min: 0,
    },

    defaultReps: {
      type: Number,
      default: 10,
      min: 0,
    },

    defaultDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    defaultRestTime: {
      type: Number,
      default: 60,
      min: 0,
    },

    defaultRpeMin: {
      type: Number,
      default: 6,
      min: 1,
      max: 10,
    },

    defaultRpeMax: {
      type: Number,
      default: 8,
      min: 1,
      max: 10,
    },

    progressionType: {
      type: String,
      enum: ["weight", "reps", "duration", "distance", "sets", "none"],
      default: "weight",
    },

    progressionIncrement: {
      type: Number,
      default: 2.5,
      min: 0,
      // Example: add 2.5kg when user reaches top rep range cleanly
    },

    calorieMetValue: {
      type: Number,
      default: 4.5,
      min: 0,
      // Used for estimated calorie burn if needed
    },

    isLowImpact: {
      type: Boolean,
      default: false,
    },

    isJointFriendly: {
      type: Boolean,
      default: false,
    },

    isRecommendedForObesity: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
      // Example: ["fat_loss", "beginner_friendly", "machine", "safe_restart"]
    },

    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    isCustom: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
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

exerciseSchema.index({
  name: "text",
  muscleGroup: 1,
  category: 1,
  equipment: 1,
  difficulty: 1,
  movementPattern: 1,
  createdBy: 1,
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;