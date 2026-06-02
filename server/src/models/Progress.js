const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm",
    },
  },
  { _id: false }
);

const photoReferenceSchema = new mongoose.Schema(
  {
    frontPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },

    sidePhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },

    backPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
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

    /**
     * Core body progress fields.
     */
    weight: {
      type: Number,
      required: [true, "Body weight is required"],
      min: [0, "Weight cannot be negative"],
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg",
    },

    waist: {
      type: Number,
      default: 0,
      min: 0,
    },

    chest: {
      type: Number,
      default: 0,
      min: 0,
    },

    arm: {
      type: Number,
      default: 0,
      min: 0,
    },

    thigh: {
      type: Number,
      default: 0,
      min: 0,
    },

    hip: {
      type: Number,
      default: 0,
      min: 0,
    },

    neck: {
      type: Number,
      default: 0,
      min: 0,
    },

    shoulder: {
      type: Number,
      default: 0,
      min: 0,
    },

    calf: {
      type: Number,
      default: 0,
      min: 0,
    },

    measurementUnit: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm",
    },

    /**
     * Optional detailed measurement object.
     * Kept separate for future advanced reports.
     */
    measurements: {
      waist: {
        type: measurementSchema,
        default: () => ({}),
      },
      chest: {
        type: measurementSchema,
        default: () => ({}),
      },
      arm: {
        type: measurementSchema,
        default: () => ({}),
      },
      thigh: {
        type: measurementSchema,
        default: () => ({}),
      },
      hip: {
        type: measurementSchema,
        default: () => ({}),
      },
      neck: {
        type: measurementSchema,
        default: () => ({}),
      },
      shoulder: {
        type: measurementSchema,
        default: () => ({}),
      },
      calf: {
        type: measurementSchema,
        default: () => ({}),
      },
    },

    bodyFatPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    bmi: {
      type: Number,
      default: 0,
      min: 0,
    },

    heightCm: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Weekly check-in support.
     */
    weekNumber: {
      type: Number,
      default: null,
      min: 1,
    },

    checkInType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "start", "final", "custom"],
      default: "daily",
    },

    isWeeklyCheckIn: {
      type: Boolean,
      default: false,
    },

    isStartMeasurement: {
      type: Boolean,
      default: false,
    },

    isFinalMeasurement: {
      type: Boolean,
      default: false,
    },

    /**
     * Lifestyle and transformation tracking.
     */
    averageSteps: {
      type: Number,
      default: 0,
      min: 0,
    },

    workoutsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    proteinDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    sleepRating: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    energyRating: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    moodRating: {
      type: Number,
      default: null,
      min: 1,
      max: 10,
    },

    /**
     * Progress photo references.
     * Actual images stay in Photo model / Cloudinary.
     */
    photos: {
      type: photoReferenceSchema,
      default: () => ({}),
    },

    /**
     * Comparison values.
     * These can be calculated by controller/report service.
     */
    changeFromStart: {
      weightChange: {
        type: Number,
        default: 0,
      },

      waistChange: {
        type: Number,
        default: 0,
      },

      chestChange: {
        type: Number,
        default: 0,
      },

      hipChange: {
        type: Number,
        default: 0,
      },

      bodyFatChange: {
        type: Number,
        default: 0,
      },
    },

    progressStatus: {
      type: String,
      enum: [
        "not_started",
        "on_track",
        "slow_progress",
        "plateau",
        "needs_adjustment",
        "excellent",
        "",
      ],
      default: "",
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

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

/**
 * Normalize progress date.
 * This helps create clean daily/weekly records.
 */
progressSchema.pre("validate", function () {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }
});

/**
 * Auto-calculate BMI when height is available.
 */
progressSchema.pre("save", function () {
  if (this.heightCm && this.weight) {
    const heightMeter = Number(this.heightCm) / 100;
    this.bmi = round(Number(this.weight) / (heightMeter * heightMeter));
  }

  if (!this.measurements) {
    this.measurements = {};
  }

  /**
   * Keep old simple fields synced with detailed measurement object.
   */
  if (this.waist > 0) {
    this.measurements.waist = {
      value: this.waist,
      unit: this.measurementUnit,
    };
  }

  if (this.chest > 0) {
    this.measurements.chest = {
      value: this.chest,
      unit: this.measurementUnit,
    };
  }

  if (this.arm > 0) {
    this.measurements.arm = {
      value: this.arm,
      unit: this.measurementUnit,
    };
  }

  if (this.thigh > 0) {
    this.measurements.thigh = {
      value: this.thigh,
      unit: this.measurementUnit,
    };
  }

  if (this.hip > 0) {
    this.measurements.hip = {
      value: this.hip,
      unit: this.measurementUnit,
    };
  }

  if (this.neck > 0) {
    this.measurements.neck = {
      value: this.neck,
      unit: this.measurementUnit,
    };
  }

  if (this.shoulder > 0) {
    this.measurements.shoulder = {
      value: this.shoulder,
      unit: this.measurementUnit,
    };
  }

  if (this.calf > 0) {
    this.measurements.calf = {
      value: this.calf,
      unit: this.measurementUnit,
    };
  }
});

/**
 * Helper for reports.
 */
progressSchema.methods.getMeasurementSummary = function () {
  return {
    weight: this.weight,
    weightUnit: this.weightUnit,
    bmi: this.bmi,
    waist: this.waist,
    chest: this.chest,
    arm: this.arm,
    thigh: this.thigh,
    hip: this.hip,
    neck: this.neck,
    shoulder: this.shoulder,
    calf: this.calf,
    measurementUnit: this.measurementUnit,
    bodyFatPercentage: this.bodyFatPercentage,
  };
};

/**
 * Helper for transformation report.
 */
progressSchema.methods.getCheckInSummary = function () {
  return {
    date: this.date,
    weekNumber: this.weekNumber,
    checkInType: this.checkInType,
    weight: this.weight,
    waist: this.waist,
    averageSteps: this.averageSteps,
    workoutsCompleted: this.workoutsCompleted,
    proteinDays: this.proteinDays,
    sleepRating: this.sleepRating,
    energyRating: this.energyRating,
    progressStatus: this.progressStatus,
    notes: this.notes,
  };
};

progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ user: 1, plan: 1, date: -1 });
progressSchema.index({ user: 1, plan: 1, weekNumber: 1 });
progressSchema.index({ user: 1, isWeeklyCheckIn: 1, date: -1 });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;