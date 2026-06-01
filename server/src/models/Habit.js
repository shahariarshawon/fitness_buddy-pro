const mongoose = require("mongoose");

const prayerSchema = new mongoose.Schema(
  {
    fajr: {
      type: Boolean,
      default: false,
    },
    dhuhr: {
      type: Boolean,
      default: false,
    },
    asr: {
      type: Boolean,
      default: false,
    },
    maghrib: {
      type: Boolean,
      default: false,
    },
    isha: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const habitTaskSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // example: "workout", "protein", "water", "sleep_shutdown"
    },

    title: {
      type: String,
      required: true,
      trim: true,
      // example: "Workout completed"
    },

    category: {
      type: String,
      enum: [
        "fitness",
        "nutrition",
        "water",
        "sleep",
        "prayer",
        "study",
        "career",
        "mindset",
        "phone_control",
        "recovery",
        "custom",
      ],
      default: "custom",
    },

    targetValue: {
      type: Number,
      default: null,
      // example: 3 for 3L water, 140 for 140g protein
    },

    actualValue: {
      type: Number,
      default: null,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
      // example: "L", "g", "steps", "hours", "minutes"
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    isRequired: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const habitSchema = new mongoose.Schema(
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
      required: true,
      default: Date.now,
      index: true,
    },

    dayType: {
      type: String,
      enum: ["training", "active_recovery", "rest", "custom"],
      default: "training",
    },

    /**
     * Existing fields kept for backward compatibility with your current app.
     */
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

    /**
     * New upgraded transformation habit fields.
     */
    stepsCompleted: {
      type: Boolean,
      default: false,
    },

    personalDevelopmentCompleted: {
      type: Boolean,
      default: false,
    },

    noLateNightScrolling: {
      type: Boolean,
      default: false,
    },

    sleepShutdownCompleted: {
      type: Boolean,
      default: false,
    },

    mobilityCompleted: {
      type: Boolean,
      default: false,
    },

    weeklyCheckInCompleted: {
      type: Boolean,
      default: false,
    },

    /**
     * Numeric daily tracking.
     */
    waterIntakeLiters: {
      type: Number,
      default: 0,
      min: 0,
    },

    waterTargetLiters: {
      type: Number,
      default: 3,
      min: 0,
    },

    proteinIntakeGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    proteinTargetGrams: {
      type: Number,
      default: 140,
      min: 0,
    },

    caloriesIntake: {
      type: Number,
      default: 0,
      min: 0,
    },

    caloriesTargetMin: {
      type: Number,
      default: 1800,
      min: 0,
    },

    caloriesTargetMax: {
      type: Number,
      default: 2100,
      min: 0,
    },

    stepsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    stepsTarget: {
      type: Number,
      default: 8000,
      min: 0,
    },

    sleepHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },

    sleepTargetHours: {
      type: Number,
      default: 6,
      min: 0,
      max: 24,
    },

    studyMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    studyTargetMinutes: {
      type: Number,
      default: 45,
      min: 0,
    },

    personalDevelopmentMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    personalDevelopmentTargetMinutes: {
      type: Number,
      default: 45,
      min: 0,
    },

    /**
     * Prayer detail.
     * prayerCompleted will be auto true if all 5 are true.
     */
    prayers: {
      type: prayerSchema,
      default: () => ({}),
    },

    /**
     * Flexible custom task system.
     * Useful for future plan-based habits.
     */
    tasks: {
      type: [habitTaskSchema],
      default: [],
    },

    /**
     * Daily 3-task rule from the transformation system:
     * 1. Workout/walk
     * 2. Calories/protein
     * 3. Career/personal development
     */
    dailyThreeTasks: {
      workoutOrWalkDone: {
        type: Boolean,
        default: false,
      },
      nutritionTracked: {
        type: Boolean,
        default: false,
      },
      careerActionDone: {
        type: Boolean,
        default: false,
      },
    },

    mood: {
      type: String,
      enum: ["great", "good", "okay", "tired", "stressed", "bad", ""],
      default: "",
    },

    energyLevel: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    hungerLevel: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    stressLevel: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    requiredTaskCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Normalize date to start of day.
 * This makes one habit record per user per day work correctly.
 */
habitSchema.pre("validate", function (next) {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }

  next();
});

/**
 * Auto-calculate completed booleans from numeric values.
 */
habitSchema.pre("save", function (next) {
  this.waterCompleted =
    Number(this.waterIntakeLiters || 0) >= Number(this.waterTargetLiters || 0);

  this.proteinTargetAchieved =
    Number(this.proteinIntakeGrams || 0) >= Number(this.proteinTargetGrams || 0);

  this.stepsCompleted =
    Number(this.stepsCount || 0) >= Number(this.stepsTarget || 0);

  this.sleepAchieved =
    Number(this.sleepHours || 0) >= Number(this.sleepTargetHours || 0);

  this.studyCompleted =
    Number(this.studyMinutes || 0) >= Number(this.studyTargetMinutes || 0);

  this.personalDevelopmentCompleted =
    Number(this.personalDevelopmentMinutes || 0) >=
    Number(this.personalDevelopmentTargetMinutes || 0);

  const prayers = this.prayers || {};
  this.prayerCompleted = Boolean(
    prayers.fajr &&
      prayers.dhuhr &&
      prayers.asr &&
      prayers.maghrib &&
      prayers.isha
  );

  this.dailyThreeTasks.workoutOrWalkDone = Boolean(
    this.workoutCompleted || this.cardioCompleted || this.mobilityCompleted
  );

  this.dailyThreeTasks.nutritionTracked = Boolean(
    this.dietFollowed || this.proteinTargetAchieved
  );

  this.dailyThreeTasks.careerActionDone = Boolean(
    this.studyCompleted || this.personalDevelopmentCompleted
  );

  const fixedTasks = [
    this.workoutCompleted,
    this.cardioCompleted,
    this.dietFollowed,
    this.waterCompleted,
    this.sleepAchieved,
    this.prayerCompleted,
    this.studyCompleted,
    this.proteinTargetAchieved,
    this.stepsCompleted,
    this.personalDevelopmentCompleted,
    this.noLateNightScrolling,
    this.sleepShutdownCompleted,
  ];

  const customTasks = this.tasks || [];

  const allTaskStatuses = [
    ...fixedTasks,
    ...customTasks.map((task) => Boolean(task.isCompleted)),
  ];

  const completedTasks = allTaskStatuses.filter(Boolean).length;
  const totalTasks = allTaskStatuses.length || 1;

  this.completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  const requiredCustomTasks = customTasks.filter((task) => task.isRequired);
  const completedRequiredCustomTasks = requiredCustomTasks.filter(
    (task) => task.isCompleted
  );

  if (requiredCustomTasks.length > 0) {
    this.requiredTaskCompletionPercentage = Math.round(
      (completedRequiredCustomTasks.length / requiredCustomTasks.length) * 100
    );
  } else {
    this.requiredTaskCompletionPercentage = this.completionPercentage;
  }

  next();
});

/**
 * Helper method for controllers.
 */
habitSchema.methods.markTaskComplete = function (taskKey) {
  const task = this.tasks.find((item) => item.key === taskKey);

  if (!task) {
    throw new Error(`Task "${taskKey}" not found`);
  }

  task.isCompleted = true;
  return this;
};

/**
 * Helper method to get daily 3-task success.
 */
habitSchema.methods.isDailyThreeTaskSuccess = function () {
  return Boolean(
    this.dailyThreeTasks.workoutOrWalkDone &&
      this.dailyThreeTasks.nutritionTracked &&
      this.dailyThreeTasks.careerActionDone
  );
};

// One habit record per user per date
habitSchema.index({ user: 1, date: 1 }, { unique: true });

habitSchema.index({
  user: 1,
  plan: 1,
  planDay: 1,
  completionPercentage: 1,
});

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;