const mongoose = require("mongoose");

const progressPhotoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    photoType: {
      type: String,
      enum: ["front", "side", "back", "other"],
      default: "front",
    },

    imageUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    weight: {
      type: Number,
      default: null,
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

progressPhotoSchema.index({ user: 1, date: -1 });

const ProgressPhoto = mongoose.model("ProgressPhoto", progressPhotoSchema);

module.exports = ProgressPhoto;