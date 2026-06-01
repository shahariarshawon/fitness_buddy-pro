const mongoose = require("mongoose");

const servingUnitSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
      // examples: g, kg, ml, cup, tbsp, tsp, piece, bowl, plate, roti, egg, scoop
    },
    gramEquivalent: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      default: "",
      // example: "1 medium roti", "1 cup cooked rice"
    },
  },
  { _id: false }
);

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "protein",
        "carbohydrate",
        "fat",
        "fruit",
        "vegetable",
        "dairy",
        "drink",
        "snack",
        "meal",
        "supplement",
        "other",
      ],
      default: "other",
    },

    caloriesPer100g: {
      type: Number,
      required: true,
      min: 0,
    },

    proteinPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    carbsPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    fatsPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    fiberPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    sugarPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    sodiumPer100g: {
      type: Number,
      default: 0,
      min: 0,
    },

    servingUnits: {
      type: [servingUnitSchema],
      default: [],
    },

    isCustom: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", category: 1, createdBy: 1 });

module.exports = mongoose.model("Food", foodSchema);