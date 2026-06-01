const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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

    weight: {
      type: Number,
      required: [true, "Body weight is required"],
      min: 0,
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

progressSchema.index({ user: 1, date: -1 });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;