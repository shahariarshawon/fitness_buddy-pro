const mongoose = require("mongoose");

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const quietHoursSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    startTime: {
      type: String,
      default: "00:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:mm format"],
    },

    endTime: {
      type: String,
      default: "06:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be in HH:mm format"],
    },
  },
  { _id: false }
);

const reminderActionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: [
        "open_workout",
        "open_meal",
        "open_habit",
        "open_progress",
        "open_photo_upload",
        "open_check_in",
        "open_dashboard",
        "custom",
      ],
      default: "open_dashboard",
    },

    actionLabel: {
      type: String,
      default: "Open",
      trim: true,
    },

    targetUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const triggerHistorySchema = new mongoose.Schema(
  {
    triggeredAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["sent", "failed", "skipped", "snoozed", "completed"],
      default: "sent",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: [true, "Reminder title is required"],
      trim: true,
      maxlength: [120, "Reminder title cannot exceed 120 characters"],
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Reminder message cannot exceed 500 characters"],
    },

    reminderType: {
      type: String,
      enum: [
        "workout",
        "cardio",
        "water",
        "meal",
        "pre_workout_meal",
        "post_workout_meal",
        "sleep",
        "sleep_shutdown",
        "habit",
        "prayer",
        "study",
        "personal_development",
        "weekly_check_in",
        "progress_photo",
        "measurement",
        "no_late_night_scrolling",
        "custom",
      ],
      default: "custom",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    /**
     * Main reminder time.
     * Format: "07:30", "18:00"
     */
    time: {
      type: String,
      required: [true, "Reminder time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"],
    },

    timezone: {
      type: String,
      default: "Asia/Dhaka",
      trim: true,
    },

    frequency: {
      type: String,
      enum: [
        "once",
        "daily",
        "weekly",
        "weekdays",
        "weekends",
        "interval",
        "custom",
      ],
      default: "daily",
    },

    daysOfWeek: {
      type: [String],
      enum: DAY_NAMES,
      default: [],
    },

    /**
     * Useful for water reminders:
     * Example: every 90 minutes between startTime and endTime.
     */
    intervalMinutes: {
      type: Number,
      default: null,
      min: 1,
    },

    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    nextTriggerAt: {
      type: Date,
      default: null,
      index: true,
    },

    lastTriggeredAt: {
      type: Date,
      default: null,
    },

    triggerCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxTriggers: {
      type: Number,
      default: null,
      min: 1,
      // Example: for once-only reminders, maxTriggers can be 1
    },

    /**
     * Snooze support.
     */
    snoozeUntil: {
      type: Date,
      default: null,
    },

    snoozeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    defaultSnoozeMinutes: {
      type: Number,
      default: 10,
      min: 1,
    },

    /**
     * Completion tracking.
     */
    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    /**
     * Notification channels.
     * For now, browser notification is most important for PWA.
     */
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },

      browserPush: {
        type: Boolean,
        default: false,
      },

      email: {
        type: Boolean,
        default: false,
      },
    },

    notificationSound: {
      type: Boolean,
      default: true,
    },

    vibration: {
      type: Boolean,
      default: true,
    },

    quietHours: {
      type: quietHoursSchema,
      default: () => ({}),
    },

    action: {
      type: reminderActionSchema,
      default: () => ({}),
    },

    /**
     * Related records.
     * These help reminders open the right screen.
     */
    relatedWorkout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      default: null,
    },

    relatedMeal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      default: null,
    },

    relatedHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      default: null,
    },

    relatedProgress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
      default: null,
    },

    /**
     * Example:
     * water target 3L, protein target 140g, steps target 8000
     */
    targetValue: {
      type: Number,
      default: null,
      min: 0,
    },

    targetUnit: {
      type: String,
      default: "",
      trim: true,
      // examples: "L", "g", "steps", "minutes", "hours"
    },

    /**
     * Useful for transformation system-generated reminders.
     */
    isSystemGenerated: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      enum: ["user", "plan", "habit", "workout", "meal", "system"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    lastStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped", "snoozed", "completed"],
      default: "pending",
    },

    triggerHistory: {
      type: [triggerHistorySchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
      // example: ["june_2026", "water", "fat_loss", "sleep_shutdown"]
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Auto-set weekly days based on frequency.
 */
reminderSchema.pre("validate", function () {
  if (this.frequency === "weekdays") {
    this.daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  }

  if (this.frequency === "weekends") {
    this.daysOfWeek = ["saturday", "sunday"];
  }

  if (this.frequency === "once") {
    this.maxTriggers = this.maxTriggers || 1;
  }

  if (Array.isArray(this.daysOfWeek)) {
    this.daysOfWeek = this.daysOfWeek
      .filter(Boolean)
      .map((day) => String(day).toLowerCase().trim())
      .filter((day) => DAY_NAMES.includes(day));
  }

  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .filter(Boolean)
      .map((tag) => String(tag).toLowerCase().trim());
  }

  if (this.timezone) {
    this.timezone = String(this.timezone).trim();
  }
});

/**
 * Keep completion fields synced.
 */
reminderSchema.pre("save", function () {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
    this.lastStatus = "completed";
  }

  if (!this.isCompleted) {
    this.completedAt = null;
  }
});

/**
 * Helper: mark reminder as triggered.
 */
reminderSchema.methods.markTriggered = function (status = "sent", note = "") {
  this.lastTriggeredAt = new Date();
  this.triggerCount += 1;
  this.lastStatus = status;

  this.triggerHistory.push({
    triggeredAt: new Date(),
    status,
    note,
  });

  if (this.triggerHistory.length > 30) {
    this.triggerHistory = this.triggerHistory.slice(-30);
  }

  if (this.maxTriggers && this.triggerCount >= this.maxTriggers) {
    this.isActive = false;
  }

  return this;
};

/**
 * Helper: snooze reminder.
 */
reminderSchema.methods.snooze = function (minutes) {
  const snoozeMinutes = Number(minutes || this.defaultSnoozeMinutes || 10);

  this.snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
  this.snoozeCount += 1;
  this.lastStatus = "snoozed";

  this.triggerHistory.push({
    triggeredAt: new Date(),
    status: "snoozed",
    note: `Snoozed for ${snoozeMinutes} minutes`,
  });

  return this;
};

/**
 * Helper: mark reminder complete.
 */
reminderSchema.methods.complete = function () {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.lastStatus = "completed";

  if (this.frequency === "once") {
    this.isActive = false;
  }

  this.triggerHistory.push({
    triggeredAt: new Date(),
    status: "completed",
    note: "Reminder completed",
  });

  return this;
};

/**
 * Indexes for reminder scheduler and user filtering.
 */
reminderSchema.index({ user: 1, isActive: 1, reminderType: 1 });
reminderSchema.index({ user: 1, frequency: 1, isActive: 1 });
reminderSchema.index({ user: 1, plan: 1, planDay: 1 });
reminderSchema.index({ isActive: 1, nextTriggerAt: 1 });
reminderSchema.index({ user: 1, isArchived: 1, createdAt: -1 });

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;