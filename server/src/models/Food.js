const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },

    brand: {
      type: String,
      default: "",
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

    servingSize: {
      type: String,
      default: "100g",
      trim: true,
    },

    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: 0,
    },

    protein: {
      type: Number,
      default: 0,
      min: 0,
    },

    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },

    fats: {
      type: Number,
      default: 0,
      min: 0,
    },

    fiber: {
      type: Number,
      default: 0,
      min: 0,
    },

    sugar: {
      type: Number,
      default: 0,
      min: 0,
    },

    sodium: {
      type: Number,
      default: 0,
      min: 0,
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
  {
    timestamps: true,
  }
);

foodSchema.index({ name: "text", category: 1, createdBy: 1 });

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;