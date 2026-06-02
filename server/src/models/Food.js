const mongoose = require("mongoose");

const servingUnitSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: [true, "Serving unit is required"],
      trim: true,
      lowercase: true,
      // examples: g, kg, ml, cup, half_cup, tbsp, tsp, piece, bowl, plate, roti, egg, scoop
    },

    gramEquivalent: {
      type: Number,
      required: [true, "Gram equivalent is required"],
      min: [0, "Gram equivalent cannot be negative"],
    },

    label: {
      type: String,
      default: "",
      trim: true,
      // example: "1 cup cooked rice", "1 medium roti", "1 boiled egg"
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      maxlength: [120, "Food name cannot exceed 120 characters"],
    },

    localName: {
      type: String,
      default: "",
      trim: true,
      // example: "Bhat", "Dal", "Ruti", "Tok doi"
    },

    aliases: {
      type: [String],
      default: [],
      // example: ["rice", "bhat", "cooked rice"]
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
        "mixed_food",
        "other",
      ],
      default: "other",
    },

    cuisineType: {
      type: String,
      enum: [
        "bangladeshi",
        "indian",
        "western",
        "chinese",
        "fast_food",
        "homemade",
        "restaurant",
        "other",
      ],
      default: "bangladeshi",
    },

    // Base nutrition values should always be stored per 100g.
    caloriesPer100g: {
      type: Number,
      required: [true, "Calories per 100g is required"],
      min: [0, "Calories cannot be negative"],
    },

    proteinPer100g: {
      type: Number,
      default: 0,
      min: [0, "Protein cannot be negative"],
    },

    carbsPer100g: {
      type: Number,
      default: 0,
      min: [0, "Carbs cannot be negative"],
    },

    fatsPer100g: {
      type: Number,
      default: 0,
      min: [0, "Fats cannot be negative"],
    },

    fiberPer100g: {
      type: Number,
      default: 0,
      min: [0, "Fiber cannot be negative"],
    },

    sugarPer100g: {
      type: Number,
      default: 0,
      min: [0, "Sugar cannot be negative"],
    },

    sodiumPer100g: {
      type: Number,
      default: 0,
      min: [0, "Sodium cannot be negative"],
    },

    cholesterolPer100g: {
      type: Number,
      default: 0,
      min: [0, "Cholesterol cannot be negative"],
    },

    servingUnits: {
      type: [servingUnitSchema],
      default: [
        {
          unit: "g",
          gramEquivalent: 1,
          label: "1 gram",
          isDefault: true,
        },
      ],
    },

    defaultServingUnit: {
      type: String,
      default: "g",
      trim: true,
      lowercase: true,
    },

    defaultServingQuantity: {
      type: Number,
      default: 100,
      min: [0, "Default serving quantity cannot be negative"],
    },

    isHighProtein: {
      type: Boolean,
      default: false,
    },

    isLowCalorie: {
      type: Boolean,
      default: false,
    },

    isFatLossFriendly: {
      type: Boolean,
      default: false,
    },

    isBangladeshFriendly: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
      // example: ["fat_loss", "cheap", "high_protein", "home_cooked"]
    },

    source: {
      type: String,
      enum: ["admin", "user", "database", "estimated", "label", "other"],
      default: "estimated",
    },

    isCustom: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
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

/**
 * Make sure every food has gram unit.
 * This helps the meal calculator work safely.
 */
foodSchema.pre("validate", function () {
  if (!Array.isArray(this.servingUnits)) {
    this.servingUnits = [];
  }

  this.servingUnits = this.servingUnits
    .filter((item) => item && item.unit && item.gramEquivalent !== undefined)
    .map((item) => ({
      unit: String(item.unit || "").toLowerCase().trim(),
      gramEquivalent: Number(item.gramEquivalent || 0),
      label: item.label ? String(item.label).trim() : "",
      isDefault: Boolean(item.isDefault),
    }));

  const hasGramUnit = this.servingUnits.some((item) => item.unit === "g");

  if (!hasGramUnit) {
    this.servingUnits.unshift({
      unit: "g",
      gramEquivalent: 1,
      label: "1 gram",
      isDefault: true,
    });
  }

  if (!this.defaultServingUnit) {
    this.defaultServingUnit = "g";
  }

  this.defaultServingUnit = String(this.defaultServingUnit)
    .toLowerCase()
    .trim();

  this.defaultServingQuantity = Number(this.defaultServingQuantity || 100);

  this.caloriesPer100g = Number(this.caloriesPer100g || 0);
  this.proteinPer100g = Number(this.proteinPer100g || 0);
  this.carbsPer100g = Number(this.carbsPer100g || 0);
  this.fatsPer100g = Number(this.fatsPer100g || 0);
  this.fiberPer100g = Number(this.fiberPer100g || 0);
  this.sugarPer100g = Number(this.sugarPer100g || 0);
  this.sodiumPer100g = Number(this.sodiumPer100g || 0);
  this.cholesterolPer100g = Number(this.cholesterolPer100g || 0);

  if (this.name) {
    this.name = this.name.trim();
  }

  if (this.localName) {
    this.localName = this.localName.trim();
  }

  if (Array.isArray(this.aliases)) {
    this.aliases = this.aliases
      .filter(Boolean)
      .map((item) => String(item).toLowerCase().trim());
  }

  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .filter(Boolean)
      .map((item) => String(item).toLowerCase().trim());
  }
});

/**
 * Get gram equivalent for selected unit.
 */
foodSchema.methods.getGramEquivalent = function (unit) {
  const normalizedUnit = String(unit || "g").toLowerCase().trim();

  if (normalizedUnit === "g") return 1;

  const selectedUnit = this.servingUnits.find(
    (item) => item.unit === normalizedUnit
  );

  if (!selectedUnit) {
    throw new Error(`Unit "${unit}" is not available for ${this.name}`);
  }

  return selectedUnit.gramEquivalent;
};

/**
 * Calculate nutrition for a given quantity and unit.
 * Example:
 * food.calculateNutrition(1.5, "cup")
 */
foodSchema.methods.calculateNutrition = function (quantity, unit = "g") {
  const amount = Number(quantity);

  if (!amount || amount <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const gramEquivalent = this.getGramEquivalent(unit);
  const gramAmount = amount * gramEquivalent;
  const multiplier = gramAmount / 100;

  const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

  return {
    food: this._id,
    name: this.name,
    quantity: amount,
    unit,
    gramAmount: round(gramAmount),

    calories: round(this.caloriesPer100g * multiplier),
    protein: round(this.proteinPer100g * multiplier),
    carbs: round(this.carbsPer100g * multiplier),
    fats: round(this.fatsPer100g * multiplier),
    fiber: round(this.fiberPer100g * multiplier),
    sugar: round(this.sugarPer100g * multiplier),
    sodium: round(this.sodiumPer100g * multiplier),
    cholesterol: round(this.cholesterolPer100g * multiplier),
  };
};

foodSchema.index({
  name: "text",
  localName: "text",
  aliases: "text",
  category: 1,
  createdBy: 1,
  isActive: 1,
});

module.exports = mongoose.model("Food", foodSchema);