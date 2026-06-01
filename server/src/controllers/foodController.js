const Food = require("../models/Food");

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAccessQuery = (userId) => ({
  isActive: true,
  $or: [{ isCustom: false }, { createdBy: userId }],
});

const allowedFoodFields = [
  "name",
  "localName",
  "aliases",
  "category",
  "cuisineType",

  "caloriesPer100g",
  "proteinPer100g",
  "carbsPer100g",
  "fatsPer100g",
  "fiberPer100g",
  "sugarPer100g",
  "sodiumPer100g",
  "cholesterolPer100g",

  "servingUnits",
  "defaultServingUnit",
  "defaultServingQuantity",

  "isHighProtein",
  "isLowCalorie",
  "isFatLossFriendly",
  "isBangladeshFriendly",

  "tags",
  "source",
  "notes",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedFoodFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const normalizeArrayFields = (data) => {
  const arrayFields = ["aliases", "tags"];

  arrayFields.forEach((field) => {
    if (typeof data[field] === "string") {
      data[field] = data[field]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  return data;
};

const normalizeServingUnits = (servingUnits = []) => {
  if (!Array.isArray(servingUnits)) return [];

  return servingUnits
    .map((item) => ({
      unit: String(item.unit || "").toLowerCase().trim(),
      gramEquivalent: Number(item.gramEquivalent || 0),
      label: item.label || "",
      isDefault: Boolean(item.isDefault),
    }))
    .filter((item) => item.unit && item.gramEquivalent > 0);
};

/**
 * Backward compatibility:
 * If old frontend sends calories/protein/carbs/fats,
 * map them to caloriesPer100g/proteinPer100g/etc.
 */
const mapOldNutritionFields = (body, data) => {
  if (data.caloriesPer100g === undefined && body.calories !== undefined) {
    data.caloriesPer100g = body.calories;
  }

  if (data.proteinPer100g === undefined && body.protein !== undefined) {
    data.proteinPer100g = body.protein;
  }

  if (data.carbsPer100g === undefined && body.carbs !== undefined) {
    data.carbsPer100g = body.carbs;
  }

  if (data.fatsPer100g === undefined && body.fats !== undefined) {
    data.fatsPer100g = body.fats;
  }

  if (data.fiberPer100g === undefined && body.fiber !== undefined) {
    data.fiberPer100g = body.fiber;
  }

  if (data.sugarPer100g === undefined && body.sugar !== undefined) {
    data.sugarPer100g = body.sugar;
  }

  if (data.sodiumPer100g === undefined && body.sodium !== undefined) {
    data.sodiumPer100g = body.sodium;
  }

  return data;
};

// @desc    Create custom food
// @route   POST /api/foods
// @access  Private
const createFood = async (req, res, next) => {
  try {
    let foodData = filterAllowedFields(req.body);
    foodData = mapOldNutritionFields(req.body, foodData);
    foodData = normalizeArrayFields(foodData);

    if (foodData.servingUnits) {
      foodData.servingUnits = normalizeServingUnits(foodData.servingUnits);
    }

    if (!foodData.name) {
      res.status(400);
      throw new Error("Food name is required");
    }

    if (
      foodData.caloriesPer100g === undefined ||
      foodData.caloriesPer100g === null
    ) {
      res.status(400);
      throw new Error("Calories per 100g are required");
    }

    const escapedName = escapeRegex(foodData.name.trim());

    const existingFood = await Food.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
      isActive: true,
      $or: [{ isCustom: false }, { createdBy: req.user._id }],
    });

    if (existingFood) {
      res.status(400);
      throw new Error("A food with this name already exists");
    }

    const food = await Food.create({
      ...foodData,
      isCustom: true,
      createdBy: req.user._id,
      source: foodData.source || "user",
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available foods
// @route   GET /api/foods
// @access  Private
const getFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      cuisineType,
      isCustom,
      isHighProtein,
      isLowCalorie,
      isFatLossFriendly,
      isBangladeshFriendly,
      tag,
      source,
      page = 1,
      limit = 50,
      sort = "name",
    } = req.query;

    let query = getAccessQuery(req.user._id);

    if (isCustom === "true") {
      query = {
        isActive: true,
        isCustom: true,
        createdBy: req.user._id,
      };
    }

    if (isCustom === "false") {
      query = {
        isActive: true,
        isCustom: false,
      };
    }

    if (search) {
      const safeSearch = escapeRegex(search);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: safeSearch, $options: "i" } },
          { localName: { $regex: safeSearch, $options: "i" } },
          { aliases: { $regex: safeSearch, $options: "i" } },
          { tags: { $regex: safeSearch, $options: "i" } },
        ],
      });
    }

    if (category) {
      query.category = category;
    }

    if (cuisineType) {
      query.cuisineType = cuisineType;
    }

    if (source) {
      query.source = source;
    }

    if (isHighProtein !== undefined) {
      query.isHighProtein = isHighProtein === "true";
    }

    if (isLowCalorie !== undefined) {
      query.isLowCalorie = isLowCalorie === "true";
    }

    if (isFatLossFriendly !== undefined) {
      query.isFatLossFriendly = isFatLossFriendly === "true";
    }

    if (isBangladeshFriendly !== undefined) {
      query.isBangladeshFriendly = isBangladeshFriendly === "true";
    }

    if (tag) {
      query.tags = tag;
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions = {
      name: { isCustom: 1, name: 1 },
      newest: { createdAt: -1 },
      calories_low: { caloriesPer100g: 1 },
      calories_high: { caloriesPer100g: -1 },
      protein_high: { proteinPer100g: -1 },
      carbs_high: { carbsPer100g: -1 },
      fats_high: { fatsPer100g: -1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.name;

    const [foods, total] = await Promise.all([
      Food.find(query).sort(selectedSort).skip(skip).limit(limitNumber),
      Food.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      foods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Private
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      ...getAccessQuery(req.user._id),
    });

    if (!food) {
      res.status(404);
      throw new Error("Food not found");
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate nutrition for a selected quantity/unit
// @route   POST /api/foods/:id/calculate
// @access  Private
const calculateFoodNutrition = async (req, res, next) => {
  try {
    const { quantity, unit = "g" } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      res.status(400);
      throw new Error("Quantity must be greater than 0");
    }

    const food = await Food.findOne({
      _id: req.params.id,
      ...getAccessQuery(req.user._id),
    });

    if (!food) {
      res.status(404);
      throw new Error("Food not found");
    }

    const nutrition = food.calculateNutrition(Number(quantity), unit);

    res.status(200).json({
      success: true,
      message: "Nutrition calculated successfully",
      food: {
        id: food._id,
        name: food.name,
        localName: food.localName,
        category: food.category,
      },
      nutrition,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom food
// @route   PUT /api/foods/:id
// @access  Private
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food || !food.isActive) {
      res.status(404);
      throw new Error("Food not found");
    }

    if (!food.isCustom) {
      res.status(403);
      throw new Error("Default foods cannot be edited");
    }

    if (food.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this food");
    }

    let updateData = filterAllowedFields(req.body);
    updateData = mapOldNutritionFields(req.body, updateData);
    updateData = normalizeArrayFields(updateData);

    if (updateData.servingUnits) {
      updateData.servingUnits = normalizeServingUnits(updateData.servingUnits);
    }

    if (updateData.name) {
      const escapedName = escapeRegex(updateData.name.trim());

      const duplicateFood = await Food.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${escapedName}$`, $options: "i" },
        isActive: true,
        $or: [{ isCustom: false }, { createdBy: req.user._id }],
      });

      if (duplicateFood) {
        res.status(400);
        throw new Error("A food with this name already exists");
      }
    }

    Object.keys(updateData).forEach((key) => {
      food[key] = updateData[key];
    });

    const updatedFood = await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom food
// @route   DELETE /api/foods/:id
// @access  Private
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food || !food.isActive) {
      res.status(404);
      throw new Error("Food not found");
    }

    if (!food.isCustom) {
      res.status(403);
      throw new Error("Default foods cannot be deleted");
    }

    if (food.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this food");
    }

    /**
     * Soft delete is better because old meal records may reference this food.
     */
    food.isActive = false;
    await food.save();

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food filter options
// @route   GET /api/foods/meta/filters
// @access  Private
const getFoodFilters = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      filters: {
        categories: [
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

        cuisineTypes: [
          "bangladeshi",
          "indian",
          "western",
          "chinese",
          "fast_food",
          "homemade",
          "restaurant",
          "other",
        ],

        commonUnits: [
          "g",
          "kg",
          "ml",
          "cup",
          "half_cup",
          "tbsp",
          "tsp",
          "piece",
          "bowl",
          "plate",
          "roti",
          "egg",
          "scoop",
          "slice",
        ],

        sources: ["admin", "user", "database", "estimated", "label", "other"],

        sortOptions: [
          "name",
          "newest",
          "calories_low",
          "calories_high",
          "protein_high",
          "carbs_high",
          "fats_high",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bangladesh-friendly fat-loss foods
// @route   GET /api/foods/recommendations/fat-loss
// @access  Private
const getFatLossFoodRecommendations = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;

    const query = {
      ...getAccessQuery(req.user._id),
      $and: [
        {
          $or: [
            { isFatLossFriendly: true },
            { isHighProtein: true },
            { tags: "fat_loss" },
            { tags: "high_protein" },
            { tags: "bangladesh_friendly" },
          ],
        },
      ],
    };

    const foods = await Food.find(query)
      .sort({
        isHighProtein: -1,
        proteinPer100g: -1,
        caloriesPer100g: 1,
        name: 1,
      })
      .limit(Math.min(Number(limit), 50));

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  calculateFoodNutrition,
  updateFood,
  deleteFood,
  getFoodFilters,
  getFatLossFoodRecommendations,
};