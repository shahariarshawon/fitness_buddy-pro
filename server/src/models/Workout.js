const mongoose = require("mongoose");

const setLogSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    targetRepsMin: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetRepsMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    reps: {
      type: Number,
      default: 0,
      min: 0,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg",
    },

    rpe: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const cardioSchema = new mongoose.Schema(
  {
    cardioType: {
      type: String,
      enum: [
        "treadmill_walk",
        "incline_walk",
        "bike",
        "elliptical",
        "running",
        "stairs",
        "rowing",
        "other",
      ],
      default: "other",
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    distance: {
      type: Number,
      default: 0,
      min: 0,
    },

    distanceUnit: {
      type: String,
      enum: ["km", "mile"],
      default: "km",
    },

    incline: {
      type: Number,
      default: 0,
      min: 0,
      // percentage
    },

    averageSpeed: {
      type: Number,
      default: 0,
      min: 0,
    },

    intensity: {
      type: String,
      enum: ["easy", "moderate", "hard", "interval", ""],
      default: "",
    },

    metValue: {
      type: Number,
      default: 5,
      min: 0,
    },

    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const workoutExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      default: null,
    },

    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
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

    /**
     * Old fields kept for current app compatibility.
     */
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
      default: 0,
      min: 0,
      // seconds
    },

 duration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    distance: {
      type: Number,
      default: 0,
      min: 0,
    },

    distanceUnit: {
      type: String,
      enum: ["km", "mile", "meter", ""],
      default: "km",
    },

    incline: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageSpeed: {
      type: Number,
      default: 0,
      min: 0,
    },

    intensity: {
      type: String,
      enum: ["low", "easy", "moderate", "high", "hard", "max", "interval", ""],
      default: "",
    },

    metValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * New planned target fields.
     */
    targetSets: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetRepsMin: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetRepsMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetWeight: {
      type: Number,
      default: 0,
      min: 0,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg",
    },

    targetRestTime: {
      type: Number,
      default: 0,
      min: 0,
      // seconds
    },

    /**
     * Actual detailed set logs.
     */
    setLogs: {
      type: [setLogSchema],
      default: [],
    },

    actualSets: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualReps: {
      type: Number,
      default: 0,
      min: 0,
    },

    bestSetWeight: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRpe: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    volume: {
      type: Number,
      default: 0,
      min: 0,
      // sets × reps × weight
    },

    completed: {
      type: Boolean,
      default: false,
    },

    skipped: {
      type: Boolean,
      default: false,
    },

    skipReason: {
      type: String,
      default: "",
      trim: true,
    },

    painReported: {
      type: Boolean,
      default: false,
    },

    painArea: {
      type: String,
      enum: [
        "knee",
        "hip",
        "lower_back",
        "shoulder",
        "elbow",
        "wrist",
        "ankle",
        "chest",
        "other",
        "",
      ],
      default: "",
    },

    formQuality: {
      type: String,
      enum: ["excellent", "good", "average", "poor", ""],
      default: "",
    },

    progressionEligible: {
      type: Boolean,
      default: false,
    },

    progressionSuggestion: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransformationPlan",
      default: null,
      index: true,
    },

    planDay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanDay",
      default: null,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    workoutName: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
      maxlength: [120, "Workout name cannot exceed 120 characters"],
    },

    workoutType: {
      type: String,
      enum: ["strength", "cardio", "mixed", "bodyweight", "mobility", "other"],
      default: "strength",
    },

    sessionFocus: {
      type: String,
      enum: [
        "push",
        "pull",
        "legs",
        "upper",
        "lower",
        "full_body",
        "cardio",
        "recovery",
        "core",
        "custom",
        "",
      ],
      default: "",
    },

    source: {
      type: String,
      enum: ["manual", "template", "plan", "system"],
      default: "manual",
    },

    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "partially_completed", "skipped"],
      default: "completed",
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    warmupDuration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    coolDownDuration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    exercises: {
      type: [workoutExerciseSchema],
      default: [],
    },

    /**
     * Old cardioDuration kept for compatibility.
     */
    cardioDuration: {
      type: Number,
      default: 0,
      min: 0,
      // minutes
    },

    cardio: {
      type: cardioSchema,
      default: () => ({}),
    },

    /**
     * User body weight can be passed from controller for calorie estimation.
     */
    bodyWeightKg: {
      type: Number,
      default: 0,
      min: 0,
    },

    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalExercises: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedExercises: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSets: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReps: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalVolume: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRpe: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    painReported: {
      type: Boolean,
      default: false,
    },

    safetyCheck: {
      sleepHours: {
        type: Number,
        default: null,
        min: 0,
        max: 24,
      },

      energyLevel: {
        type: Number,
        default: null,
        min: 1,
        max: 10,
      },

      hasJointPainBeforeWorkout: {
        type: Boolean,
        default: false,
      },

      hasChestPainOrBreathlessness: {
        type: Boolean,
        default: false,
      },

      feltSick: {
        type: Boolean,
        default: false,
      },

      reducedIntensity: {
        type: Boolean,
        default: false,
      },

      safetyRecommendation: {
        type: String,
        default: "",
        trim: true,
      },
    },

    progressionSummary: {
      type: String,
      default: "",
      trim: true,
    },

    nextWorkoutSuggestion: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
      // example: ["push_day", "week_1", "fat_loss", "low_impact"]
    },
  },
  {
    timestamps: true,
  }
);

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const estimateCalories = ({ metValue, bodyWeightKg, duration }) => {
  if (!metValue || !bodyWeightKg || !duration) return 0;

  // Standard MET formula:
  // kcal = MET × 3.5 × bodyWeightKg / 200 × minutes
  return round((metValue * 3.5 * bodyWeightKg * duration) / 200);
};

const getIntensityMultiplier = (intensity = "") => {
  const value = String(intensity || "").toLowerCase();

  if (["low", "easy"].includes(value)) return 0.85;
  if (["moderate", ""].includes(value)) return 1;
  if (["high", "hard"].includes(value)) return 1.2;
  if (["max", "interval"].includes(value)) return 1.35;

  return 1;
};

const getExerciseMetValue = (exercise = {}, workoutType = "strength") => {
  const category = exercise.category || workoutType;
  const name = String(exercise.name || "").toLowerCase();

  if (exercise.metValue && Number(exercise.metValue) > 0) {
    return Number(exercise.metValue);
  }

  if (category === "cardio") {
    if (name.includes("incline")) return 5.5;
    if (name.includes("walk") || name.includes("treadmill")) return 4.5;
    if (name.includes("bike")) return 6;
    if (name.includes("elliptical")) return 5.5;
    if (name.includes("run")) return 8;
    if (name.includes("stairs")) return 8;
    if (name.includes("row")) return 7;

    return 6;
  }

  if (category === "mobility" || category === "stretching") return 2.5;
  if (category === "bodyweight") return 4;
  if (category === "strength") return 4.5;
  if (workoutType === "mixed") return 5;

  return 3.5;
};

const estimateStrengthExerciseMinutes = (exercise = {}) => {
  const sets = Number(exercise.actualSets || exercise.sets || 0);
  const reps = Number(exercise.reps || 0);
  const restTime = Number(exercise.restTime || exercise.targetRestTime || 60);

  if (!sets || !reps) return 0;

  // Practical estimate:
  // each rep around 3 seconds + rest between sets
  const workSeconds = sets * reps * 3;
  const restSeconds = Math.max(sets - 1, 0) * restTime;

  return round((workSeconds + restSeconds) / 60);
};

const estimateExerciseCalories = ({ exercise, bodyWeightKg, workoutType }) => {
  if (!exercise || !bodyWeightKg) return 0;

  const isTimedExercise =
    exercise.category === "cardio" ||
    exercise.category === "mobility" ||
    exercise.category === "stretching";

  const metValue =
    getExerciseMetValue(exercise, workoutType) *
    getIntensityMultiplier(exercise.intensity);

  const duration = isTimedExercise
    ? Number(exercise.duration || 0)
    : estimateStrengthExerciseMinutes(exercise);

  return estimateCalories({
    metValue,
    bodyWeightKg,
    duration,
  });
};

/**
 * Normalize date and auto-calculate workout totals before validation/save.
 * This also makes the preview endpoint work because preview uses validate().
 */
workoutSchema.pre("validate", function () {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }

  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let completedExercises = 0;
  let rpeSum = 0;
  let rpeCount = 0;
  let painReported = false;
  let progressionEligibleCount = 0;

  let totalExerciseCalories = 0;
  let exerciseCardioDuration = 0;
  let estimatedStrengthDuration = 0;

  const bodyWeightKg = Number(this.bodyWeightKg || 0);

  this.exercises.forEach((exercise) => {
    const setLogs = exercise.setLogs || [];

    const isTimedExercise =
      exercise.category === "cardio" ||
      exercise.category === "mobility" ||
      exercise.category === "stretching";

    if (setLogs.length > 0) {
      const completedSets = setLogs.filter((set) => set.completed);

      const exerciseReps = completedSets.reduce(
        (sum, set) => sum + Number(set.reps || 0),
        0
      );

      const exerciseVolume = completedSets.reduce(
        (sum, set) => sum + Number(set.reps || 0) * Number(set.weight || 0),
        0
      );

      const bestWeight = completedSets.reduce(
        (max, set) => Math.max(max, Number(set.weight || 0)),
        0
      );

      const exerciseRpeValues = completedSets
        .map((set) => Number(set.rpe || 0))
        .filter((rpe) => rpe > 0);

      exercise.actualSets = completedSets.length;
      exercise.actualReps = exerciseReps;
      exercise.volume = round(exerciseVolume);
      exercise.bestSetWeight = bestWeight;

      if (exerciseRpeValues.length > 0) {
        const exerciseRpeAverage =
          exerciseRpeValues.reduce((sum, rpe) => sum + rpe, 0) /
          exerciseRpeValues.length;

        exercise.averageRpe = round(exerciseRpeAverage);

        rpeSum += exerciseRpeValues.reduce((sum, rpe) => sum + rpe, 0);
        rpeCount += exerciseRpeValues.length;
      }

      exercise.completed =
        completedSets.length >= Number(exercise.targetSets || exercise.sets || 0) ||
        completedSets.length >= Number(exercise.sets || 0);
    } else if (isTimedExercise) {
      /**
       * Cardio/mobility/stretching does not need sets/reps.
       */
      exercise.actualSets = Number(exercise.duration || 0) > 0 ? 1 : 0;
      exercise.actualReps = 0;
      exercise.volume = 0;
      exercise.bestSetWeight = 0;
      exercise.completed = !exercise.skipped && Number(exercise.duration || 0) > 0;
    } else {
      /**
       * Fallback for old simple strength input:
       * sets × reps × weight
       */
      exercise.actualSets = Number(exercise.sets || 0);
      exercise.actualReps =
        Number(exercise.sets || 0) * Number(exercise.reps || 0);

      exercise.volume =
        Number(exercise.sets || 0) *
        Number(exercise.reps || 0) *
        Number(exercise.weight || 0);

      exercise.bestSetWeight = Number(exercise.weight || 0);
      exercise.completed = !exercise.skipped && Number(exercise.sets || 0) > 0;
    }

    if (exercise.completed) {
      completedExercises += 1;
    }

    if (exercise.painReported) {
      painReported = true;
      exercise.progressionEligible = false;
      exercise.progressionSuggestion =
        "Do not increase weight next time. Repeat safely or use a replacement exercise.";
    } else if (!isTimedExercise) {
      const topRepTarget = Number(exercise.targetRepsMax || exercise.reps || 0);
      const targetSets = Number(exercise.targetSets || exercise.sets || 0);

      const reachedTopRange =
        exercise.actualSets >= targetSets &&
        topRepTarget > 0 &&
        exercise.actualReps >= targetSets * topRepTarget;

      const rpeOkay = !exercise.averageRpe || Number(exercise.averageRpe) <= 8;

      if (exercise.completed && reachedTopRange && rpeOkay) {
        exercise.progressionEligible = true;
        progressionEligibleCount += 1;
        exercise.progressionSuggestion =
          "Increase weight slightly next time if form stays clean.";
      } else if (exercise.completed) {
        exercise.progressionEligible = false;
        exercise.progressionSuggestion =
          "Repeat the same weight and try to improve reps or form next time.";
      }
    }

    /**
     * Duration and calorie calculation by exercise.
     */
    if (isTimedExercise) {
      exerciseCardioDuration += Number(exercise.duration || 0);
    } else {
      estimatedStrengthDuration += estimateStrengthExerciseMinutes(exercise);
    }

    if (!exercise.caloriesBurned || Number(exercise.caloriesBurned) <= 0) {
      exercise.caloriesBurned = estimateExerciseCalories({
        exercise,
        bodyWeightKg,
        workoutType: this.workoutType,
      });
    }

    totalExerciseCalories += Number(exercise.caloriesBurned || 0);

    totalSets += Number(exercise.actualSets || 0);
    totalReps += Number(exercise.actualReps || 0);
    totalVolume += Number(exercise.volume || 0);
  });

  this.totalExercises = this.exercises.length;
  this.completedExercises = completedExercises;
  this.totalSets = totalSets;
  this.totalReps = totalReps;
  this.totalVolume = round(totalVolume);
  this.painReported = painReported;

  if (rpeCount > 0) {
    this.averageRpe = round(rpeSum / rpeCount);
  }

  if (this.totalExercises > 0) {
    this.completionPercentage = Math.round(
      (completedExercises / this.totalExercises) * 100
    );
  }

  if (this.completionPercentage >= 100) {
    this.status = "completed";
  } else if (this.completionPercentage > 0) {
    this.status = "partially_completed";
  }

  /**
   * Cardio duration can come from:
   * 1. cardioDuration field
   * 2. cardio object
   * 3. exercise-level cardio duration
   */
  const mainCardioDuration = Number(this.cardioDuration || 0);
  const cardioObjectDuration = Number(this.cardio?.duration || 0);

  this.cardioDuration = Math.max(
    mainCardioDuration,
    cardioObjectDuration,
    exerciseCardioDuration
  );

  if (this.cardio && cardioObjectDuration > 0) {
    if (!this.cardio.caloriesBurned && bodyWeightKg) {
      this.cardio.caloriesBurned = estimateCalories({
        metValue: this.cardio.metValue || 5,
        bodyWeightKg,
        duration: cardioObjectDuration,
      });
    }
  }

  /**
   * If total duration is not given, estimate it from:
   * warmup + strength exercise time + cardio time + cooldown.
   */
  if (!this.duration || Number(this.duration) <= 0) {
    this.duration = round(
      Number(this.warmupDuration || 0) +
        Number(estimatedStrengthDuration || 0) +
        Number(this.cardioDuration || 0) +
        Number(this.coolDownDuration || 0)
    );
  }

  /**
   * Auto-calculate total calories if not manually provided.
   */
  if (!this.caloriesBurned || Number(this.caloriesBurned) <= 0) {
    const cardioObjectCalories = Number(this.cardio?.caloriesBurned || 0);

    this.caloriesBurned = round(
      Number(totalExerciseCalories || 0) + cardioObjectCalories
    );
  }

  /**
   * Safety recommendation.
   */
  if (this.safetyCheck?.hasChestPainOrBreathlessness) {
    this.safetyCheck.safetyRecommendation =
      "Stop exercise and seek medical help if chest pain or unusual breathlessness occurs.";
  } else if (this.safetyCheck?.feltSick) {
    this.safetyCheck.safetyRecommendation =
      "Take a rest day. Do not train hard while sick.";
  } else if (
    this.safetyCheck?.sleepHours !== null &&
    this.safetyCheck?.sleepHours < 5
  ) {
    this.safetyCheck.reducedIntensity = true;
    this.safetyCheck.safetyRecommendation =
      "Sleep was low. Reduce weights by 10-15% and keep cardio easy.";
  } else if (this.safetyCheck?.hasJointPainBeforeWorkout || painReported) {
    this.safetyCheck.reducedIntensity = true;
    this.safetyCheck.safetyRecommendation =
      "Joint pain reported. Avoid painful movements and use safer alternatives.";
  }

  /**
   * Overall progression summary.
   */
  if (painReported) {
    this.progressionSummary =
      "Pain was reported. Do not increase load next session.";
    this.nextWorkoutSuggestion =
      "Repeat safely, reduce load, or replace painful exercises.";
  } else if (progressionEligibleCount > 0) {
    this.progressionSummary = `${progressionEligibleCount} exercise(s) may be ready for small progression.`;
    this.nextWorkoutSuggestion =
      "Increase weight slightly only on exercises completed with clean form and controlled RPE.";
  } else if (this.completionPercentage >= 80) {
    this.progressionSummary =
      "Good session. Repeat similar load and improve reps or form next time.";
    this.nextWorkoutSuggestion =
      "Do not rush progression. Build consistency first.";
  } else {
    this.progressionSummary =
      "Session was incomplete. Focus on completion before increasing intensity.";
    this.nextWorkoutSuggestion =
      "Repeat this workout with manageable load next time.";
  }
});

workoutSchema.methods.getWorkoutSummary = function () {
  return {
    id: this._id,
    date: this.date,
    workoutName: this.workoutName,
    workoutType: this.workoutType,
    sessionFocus: this.sessionFocus,
    duration: this.duration,
    cardioDuration: this.cardioDuration,
    caloriesBurned: this.caloriesBurned,
    totalExercises: this.totalExercises,
    completedExercises: this.completedExercises,
    totalSets: this.totalSets,
    totalReps: this.totalReps,
    totalVolume: this.totalVolume,
    averageRpe: this.averageRpe,
    completionPercentage: this.completionPercentage,
    painReported: this.painReported,
    progressionSummary: this.progressionSummary,
    nextWorkoutSuggestion: this.nextWorkoutSuggestion,
  };
};

workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, workoutType: 1, date: -1 });
workoutSchema.index({ user: 1, plan: 1, planDay: 1 });
workoutSchema.index({ user: 1, status: 1, date: -1 });

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;