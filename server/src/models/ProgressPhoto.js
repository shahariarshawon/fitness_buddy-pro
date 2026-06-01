const mongoose = require("mongoose");

const imageVariantSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    width: {
      type: Number,
      default: 0,
      min: 0,
    },

    height: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const bodySnapshotSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      default: null,
      min: 0,
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

    bodyFatPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    measurementUnit: {
      type: String,
      enum: ["cm", "inch"],
      default: "cm",
    },
  },
  { _id: false }
);

const progressPhotoSchema = new mongoose.Schema(
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

    progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
      default: null,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    photoType: {
      type: String,
      enum: ["front", "side", "back", "other"],
      default: "front",
      required: [true, "Photo type is required"],
    },

    checkInType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "start", "final", "custom"],
      default: "daily",
    },

    weekNumber: {
      type: Number,
      default: null,
      min: 1,
    },

    /**
     * Main Cloudinary image.
     * Kept same as your old model so existing controller does not break.
     */
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true,
    },

    /**
     * Optional optimized image versions.
     * Useful for dashboard thumbnails and comparison slider.
     */
    thumbnail: {
      type: imageVariantSchema,
      default: () => ({}),
    },

    medium: {
      type: imageVariantSchema,
      default: () => ({}),
    },

    original: {
      type: imageVariantSchema,
      default: () => ({}),
    },

    /**
     * Body data snapshot at the time of photo.
     * This keeps the photo useful even if progress records are edited later.
     */
    bodySnapshot: {
      type: bodySnapshotSchema,
      default: () => ({}),
    },

    /**
     * Kept for backward compatibility.
     */
    weight: {
      type: Number,
      default: null,
      min: 0,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
      default: "kg",
    },

    /**
     * Photo comparison support.
     */
    comparisonGroup: {
      type: String,
      default: "",
      trim: true,
      // example: "june_2026_start", "week_1", "final_comparison"
    },

    isStartPhoto: {
      type: Boolean,
      default: false,
    },

    isFinalPhoto: {
      type: Boolean,
      default: false,
    },

    isWeeklyCheckInPhoto: {
      type: Boolean,
      default: false,
    },

    /**
     * Upload metadata.
     */
    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    mimeType: {
      type: String,
      default: "",
      trim: true,
    },

    width: {
      type: Number,
      default: 0,
      min: 0,
    },

    height: {
      type: Number,
      default: 0,
      min: 0,
    },

    source: {
      type: String,
      enum: ["camera", "gallery", "upload", "other"],
      default: "upload",
    },

    /**
     * Privacy and status.
     */
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
      // example: ["front", "week_1", "june_2026", "fat_loss"]
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

/**
 * Normalize date to start of day.
 * This makes weekly photo grouping cleaner.
 */
progressPhotoSchema.pre("validate", function (next) {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }

  next();
});

/**
 * Sync old weight field with bodySnapshot.
 */
progressPhotoSchema.pre("save", function (next) {
  if (this.weight !== null && this.weight !== undefined) {
    this.bodySnapshot.weight = this.weight;
    this.bodySnapshot.weightUnit = this.weightUnit;
  }

  if (!this.original.url) {
    this.original.url = this.imageUrl;
  }

  if (!this.original.publicId) {
    this.original.publicId = this.publicId;
  }

  if (this.isStartPhoto) {
    this.checkInType = "start";
  }

  if (this.isFinalPhoto) {
    this.checkInType = "final";
  }

  if (this.isWeeklyCheckInPhoto) {
    this.checkInType = "weekly";
  }

  next();
});

/**
 * Helper for frontend comparison cards.
 */
progressPhotoSchema.methods.getPhotoSummary = function () {
  return {
    id: this._id,
    date: this.date,
    photoType: this.photoType,
    checkInType: this.checkInType,
    weekNumber: this.weekNumber,
    imageUrl: this.imageUrl,
    thumbnailUrl: this.thumbnail?.url || this.imageUrl,
    weight: this.weight,
    weightUnit: this.weightUnit,
    bodySnapshot: this.bodySnapshot,
    isStartPhoto: this.isStartPhoto,
    isFinalPhoto: this.isFinalPhoto,
    notes: this.notes,
  };
};

progressPhotoSchema.index({ user: 1, date: -1 });
progressPhotoSchema.index({ user: 1, photoType: 1, date: -1 });
progressPhotoSchema.index({ user: 1, plan: 1, date: -1 });
progressPhotoSchema.index({ user: 1, plan: 1, weekNumber: 1 });
progressPhotoSchema.index({ user: 1, comparisonGroup: 1 });
progressPhotoSchema.index({ user: 1, isStartPhoto: 1, isFinalPhoto: 1 });
progressPhotoSchema.index({ publicId: 1 });

const ProgressPhoto = mongoose.model("ProgressPhoto", progressPhotoSchema);

module.exports = ProgressPhoto;