const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },

    quantity: {
      type: String,
      default: "",
      trim: true,
    },

    calories: {
      type: Number,
      required: true,
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
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    mealType: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snacks",
        "pre_workout",
        "post_workout",
      ],
      required: [true, "Meal type is required"],
    },

    foods: {
      type: [foodItemSchema],
      required: true,
      default: [],
    },

    totalCalories: {
      type: Number,
      default: 0,
    },

    totalProtein: {
      type: Number,
      default: 0,
    },

    totalCarbs: {
      type: Number,
      default: 0,
    },

    totalFats: {
      type: Number,
      default: 0,
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

mealSchema.index({ user: 1, date: -1 });

const Meal = mongoose.model("Meal", mealSchema);

module.exports = Meal;