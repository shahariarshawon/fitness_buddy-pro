const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const targetSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      default: 2000,
      min: 0,
    },

    protein: {
      type: Number,
      default: 120,
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

    fiber: {
      type: Number,
      default: 25,
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
      max: 24,
    },

    workoutDaysPerWeek: {
      type: Number,
      default: 5,
      min: 0,
      max: 7,
    },
  },
  { _id: false }
);

const schedulePreferenceSchema = new mongoose.Schema(
  {
    timezone: {
      type: String,
      default: "Asia/Dhaka",
      trim: true,
    },

    preferredWorkoutTime: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night", "flexible", ""],
      default: "flexible",
    },

    remoteJobStartTime: {
      type: String,
      default: "",
      trim: true,
      // example: "19:00"
    },

    remoteJobEndTime: {
      type: String,
      default: "",
      trim: true,
      // example: "00:00"
    },

    hasUniversityClass: {
      type: Boolean,
      default: false,
    },

    hasRemoteNightWork: {
      type: Boolean,
      default: false,
    },

    prayerTrackingEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const notificationPreferenceSchema = new mongoose.Schema(
  {
    workoutReminder: {
      type: Boolean,
      default: true,
    },

    mealReminder: {
      type: Boolean,
      default: true,
    },

    waterReminder: {
      type: Boolean,
      default: true,
    },

    sleepReminder: {
      type: Boolean,
      default: true,
    },

    weeklyCheckInReminder: {
      type: Boolean,
      default: true,
    },

    progressPhotoReminder: {
      type: Boolean,
      default: true,
    },

    browserPushEnabled: {
      type: Boolean,
      default: false,
    },

    emailNotificationEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const safetyProfileSchema = new mongoose.Schema(
  {
    hasMedicalCondition: {
      type: Boolean,
      default: false,
    },

    medicalNotes: {
      type: String,
      default: "",
      trim: true,
      select: false,
    },

    kneePain: {
      type: Boolean,
      default: false,
    },

    backPain: {
      type: Boolean,
      default: false,
    },

    shoulderPain: {
      type: Boolean,
      default: false,
    },

    asthmaOrBreathingIssue: {
      type: Boolean,
      default: false,
    },

    highBloodPressure: {
      type: Boolean,
      default: false,
    },

    diabetes: {
      type: Boolean,
      default: false,
    },

    medicalClearanceRecommended: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    age: {
      type: Number,
      default: null,
      min: 0,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    height: {
      type: Number,
      default: null,
      min: 0,
      // cm
    },

    currentWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    startingWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    targetWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    bmi: {
      type: Number,
      default: null,
      min: 0,
    },

    goal: {
      type: String,
      enum: [
        "fat_loss",
        "muscle_gain",
        "maintenance",
        "recomposition",
        "general_fitness",
      ],
      default: "fat_loss",
    },

    trainingBackground: {
      type: String,
      enum: [
        "complete_beginner",
        "former_trainee",
        "currently_training",
        "athlete",
        "",
      ],
      default: "",
    },

    trainingExperienceMonths: {
      type: Number,
      default: 0,
      min: 0,
    },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },

    bmr: {
      type: Number,
      default: null,
      min: 0,
    },

    estimatedMaintenanceCalories: {
      type: Number,
      default: null,
      min: 0,
    },

    /**
     * Old target fields kept for current frontend compatibility.
     */
    dailyCalorieTarget: {
      type: Number,
      default: 2000,
      min: 0,
    },

    dailyProteinTarget: {
      type: Number,
      default: 120,
      min: 0,
    },

    dailyWaterTarget: {
      type: Number,
      default: 3,
      min: 0,
      // litres
    },

    sleepTarget: {
      type: Number,
      default: 8,
      min: 0,
      max: 24,
      // hours
    },

    /**
     * New complete target system.
     */
    dailyTargets: {
      type: targetSchema,
      default: () => ({}),
    },

    weeklyTargets: {
      cardioMinutes: {
        type: Number,
        default: 150,
        min: 0,
      },

      strengthSessions: {
        type: Number,
        default: 3,
        min: 0,
      },

      checkInDay: {
        type: String,
        enum: [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        default: "friday",
      },
    },

    unitSystem: {
      type: String,
      enum: ["metric", "imperial"],
      default: "metric",
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg",
    },

    measurementUnit: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm",
    },

    foodMeasurementPreference: {
      type: String,
      enum: ["grams", "regular_scales", "both"],
      default: "both",
      // regular_scales means cup, piece, plate, bowl, roti, spoon, etc.
    },

    schedulePreferences: {
      type: schedulePreferenceSchema,
      default: () => ({}),
    },

    notificationPreferences: {
      type: notificationPreferenceSchema,
      default: () => ({}),
    },

    safetyProfile: {
      type: safetyProfileSchema,
      default: () => ({}),
    },

    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransformationPlan",
      default: null,
      index: true,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },

    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
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

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return multipliers[activityLevel] || 1.55;
};

/**
 * Auto-calculate age, BMI, BMR, maintenance calories, and target sync.
 */
userSchema.pre("validate", function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);

    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      calculatedAge -= 1;
    }

    this.age = calculatedAge;
  }

  const weightForCalculation = this.currentWeight || this.startingWeight;

  if (this.height && weightForCalculation) {
    const heightMeter = Number(this.height) / 100;
    this.bmi = round(Number(weightForCalculation) / (heightMeter * heightMeter));
  }

  if (this.height && weightForCalculation && this.age) {
    let genderValue = -78;

    if (this.gender === "male") {
      genderValue = 5;
    }

    if (this.gender === "female") {
      genderValue = -161;
    }

    // Mifflin-St Jeor estimate
    this.bmr = round(
      10 * Number(weightForCalculation) +
        6.25 * Number(this.height) -
        5 * Number(this.age) +
        genderValue
    );

    this.estimatedMaintenanceCalories = round(
      this.bmr * getActivityMultiplier(this.activityLevel)
    );
  }

  /**
   * Safety flag for higher BMI users.
   * This does not block app use; it only helps show a warning in UI.
   */
  if (this.bmi && this.bmi >= 30) {
    this.safetyProfile.medicalClearanceRecommended = true;
  }

  /**
   * Sync old target fields with new target object.
   */
  this.dailyTargets.calories = this.dailyCalorieTarget;
  this.dailyTargets.protein = this.dailyProteinTarget;
  this.dailyTargets.waterLiters = this.dailyWaterTarget;
  this.dailyTargets.sleepHours = this.sleepTarget;

  /**
   * Basic profile completion check.
   */
  this.profileCompleted = Boolean(
    this.name &&
      this.email &&
      this.age &&
      this.height &&
      weightForCalculation &&
      this.goal
  );

  next();
});

/**
 * Hash password before saving user.
 */
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
      this.refreshTokenVersion += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with hashed password.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Calculate recommended calories based on goal.
 */
userSchema.methods.getRecommendedCalories = function () {
  if (!this.estimatedMaintenanceCalories) {
    return this.dailyCalorieTarget;
  }

  const maintenance = Number(this.estimatedMaintenanceCalories);

  if (this.goal === "fat_loss") {
    return Math.max(1200, Math.round(maintenance - 500));
  }

  if (this.goal === "muscle_gain") {
    return Math.round(maintenance + 250);
  }

  if (this.goal === "recomposition") {
    return Math.round(maintenance - 200);
  }

  return Math.round(maintenance);
};

/**
 * Calculate protein target using body weight.
 */
userSchema.methods.getRecommendedProtein = function () {
  const weight = this.currentWeight || this.startingWeight;

  if (!weight) {
    return this.dailyProteinTarget;
  }

  if (this.goal === "fat_loss" || this.goal === "recomposition") {
    return Math.round(Number(weight) * 1.6);
  }

  if (this.goal === "muscle_gain") {
    return Math.round(Number(weight) * 1.8);
  }

  return Math.round(Number(weight) * 1.4);
};

/**
 * Return useful profile summary for frontend.
 */
userSchema.methods.getProfileSummary = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    age: this.age,
    gender: this.gender,
    height: this.height,
    currentWeight: this.currentWeight,
    startingWeight: this.startingWeight,
    targetWeight: this.targetWeight,
    bmi: this.bmi,
    goal: this.goal,
    activityLevel: this.activityLevel,
    bmr: this.bmr,
    estimatedMaintenanceCalories: this.estimatedMaintenanceCalories,
    dailyTargets: this.dailyTargets,
    weeklyTargets: this.weeklyTargets,
    unitSystem: this.unitSystem,
    profileCompleted: this.profileCompleted,
    onboardingCompleted: this.onboardingCompleted,
    activePlan: this.activePlan,
  };
};

/**
 * Create password reset token.
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/**
 * Create email verification token.
 */
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ goal: 1, activityLevel: 1 });
userSchema.index({ activePlan: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;