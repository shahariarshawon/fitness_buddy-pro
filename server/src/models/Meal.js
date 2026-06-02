const mongoose = require("mongoose");

const nutritionPer100gSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      default: 0,
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

    cholesterol: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const foodItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
    },

    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },

    /**
     * Kept for backward compatibility and display.
     * Example: "1.5 cup", "150 g", "2 pieces"
     */
    quantity: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * New structured quantity fields.
     */
    quantityValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "g",
      trim: true,
      lowercase: true,
      // examples: g, cup, half_cup, tbsp, tsp, piece, bowl, plate, roti, egg, scoop
    },

    gramAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    servingLabel: {
      type: String,
      default: "",
      trim: true,
      // example: "1 cup cooked rice", "1 boiled egg"
    },

    /**
     * Stores base values used for calculation.
     * Useful because food nutrition can change later, but old meal record should remain stable.
     */
    nutritionPer100g: {
      type: nutritionPer100gSchema,
      default: () => ({}),
    },

    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: 0,
      default: 0,
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

    cholesterol: {
      type: Number,
      default: 0,
      min: 0,
    },

    isManualEntry: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
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
      default: Date.now,
      index: true,
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
        "job_snack",
        "before_sleep",
        "other",
      ],
      required: [true, "Meal type is required"],
    },

    mealTiming: {
      type: String,
      enum: [
        "morning",
        "midday",
        "afternoon",
        "evening",
        "night",
        "late_night",
        "other",
      ],
      default: "other",
    },

    foods: {
      type: [foodItemSchema],
      required: true,
      default: [],
      validate: {
        validator: function (foods) {
          return Array.isArray(foods) && foods.length > 0;
        },
        message: "At least one food item is required",
      },
    },

    totalCalories: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalProtein: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCarbs: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalFats: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalFiber: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSugar: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSodium: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCholesterol: {
      type: Number,
      default: 0,
      min: 0,
    },

    calorieTargetMin: {
      type: Number,
      default: 0,
      min: 0,
    },

    calorieTargetMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    proteinTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    carbsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    fatsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    isWithinCalorieTarget: {
      type: Boolean,
      default: false,
    },

    isProteinTargetAchieved: {
      type: Boolean,
      default: false,
    },

    isPlannedMeal: {
      type: Boolean,
      default: false,
    },

    templateName: {
      type: String,
      default: "",
      trim: true,
      // example: "Morning gym breakfast", "Friday recovery lunch"
    },

    mealQuality: {
      type: String,
      enum: ["excellent", "good", "average", "poor", ""],
      default: "",
    },

    tags: {
      type: [String],
      default: [],
      // example: ["high_protein", "fat_loss", "bangladesh_friendly", "post_workout"]
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
 * Normalize date to start of day.
 */
mealSchema.pre("validate", function () {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }
});

/**
 * Auto-calculate individual food macros when nutritionPer100g + gramAmount are available.
 * This allows:
 * rice 1.5 cup -> gramAmount -> calculated calories/protein/carbs/fats
 */
foodItemSchema.pre("validate", function () {
  if (
    this.gramAmount > 0 &&
    this.nutritionPer100g &&
    !this.isManualEntry
  ) {
    const multiplier = Number(this.gramAmount || 0) / 100;

    this.calories = round(this.nutritionPer100g.calories * multiplier);
    this.protein = round(this.nutritionPer100g.protein * multiplier);
    this.carbs = round(this.nutritionPer100g.carbs * multiplier);
    this.fats = round(this.nutritionPer100g.fats * multiplier);
    this.fiber = round(this.nutritionPer100g.fiber * multiplier);
    this.sugar = round(this.nutritionPer100g.sugar * multiplier);
    this.sodium = round(this.nutritionPer100g.sodium * multiplier);
    this.cholesterol = round(this.nutritionPer100g.cholesterol * multiplier);
  }

  if (!this.quantity && this.quantityValue && this.unit) {
    this.quantity = `${this.quantityValue} ${this.unit}`;
  }
});

/**
 * Auto-calculate meal totals.
 */
mealSchema.pre("save", function () {
  const foods = this.foods || [];

  this.totalCalories = round(
    foods.reduce((sum, item) => sum + Number(item.calories || 0), 0)
  );

  this.totalProtein = round(
    foods.reduce((sum, item) => sum + Number(item.protein || 0), 0)
  );

  this.totalCarbs = round(
    foods.reduce((sum, item) => sum + Number(item.carbs || 0), 0)
  );

  this.totalFats = round(
    foods.reduce((sum, item) => sum + Number(item.fats || 0), 0)
  );

  this.totalFiber = round(
    foods.reduce((sum, item) => sum + Number(item.fiber || 0), 0)
  );

  this.totalSugar = round(
    foods.reduce((sum, item) => sum + Number(item.sugar || 0), 0)
  );

  this.totalSodium = round(
    foods.reduce((sum, item) => sum + Number(item.sodium || 0), 0)
  );

  this.totalCholesterol = round(
    foods.reduce((sum, item) => sum + Number(item.cholesterol || 0), 0)
  );

  if (this.calorieTargetMin > 0 && this.calorieTargetMax > 0) {
    this.isWithinCalorieTarget =
      this.totalCalories >= this.calorieTargetMin &&
      this.totalCalories <= this.calorieTargetMax;
  }

  if (this.proteinTarget > 0) {
    this.isProteinTargetAchieved = this.totalProtein >= this.proteinTarget;
  }
});

/**
 * Useful helper for controllers/reports.
 */
mealSchema.methods.getMacroSummary = function () {
  return {
    calories: this.totalCalories,
    protein: this.totalProtein,
    carbs: this.totalCarbs,
    fats: this.totalFats,
    fiber: this.totalFiber,
    sugar: this.totalSugar,
    sodium: this.totalSodium,
    cholesterol: this.totalCholesterol,
  };
};

mealSchema.index({ user: 1, date: -1 });
mealSchema.index({ user: 1, mealType: 1, date: -1 });
mealSchema.index({ user: 1, plan: 1, planDay: 1 });
mealSchema.index({ user: 1, isPlannedMeal: 1 });

const Meal = mongoose.model("Meal", mealSchema);

module.exports = Meal;