const Meal = require("../models/Meal");
const Food = require("../models/Food");
const User = require("../models/User");

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
};

const getFoodAccessQuery = (userId) => ({
  isActive: true,
  $or: [{ isCustom: false }, { createdBy: userId }],
});

const allowedMealFields = [
  "plan",
  "planDay",
  "date",
  "mealType",
  "mealTiming",
  "foods",
  "calorieTargetMin",
  "calorieTargetMax",
  "proteinTarget",
  "carbsTarget",
  "fatsTarget",
  "isPlannedMeal",
  "templateName",
  "mealQuality",
  "tags",
  "notes",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedMealFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const getUserMealTargets = (user) => {
  const dailyTargets = user.dailyTargets || {};

  return {
    calorieTargetMin: Number(user.dailyCalorieTarget || dailyTargets.calories || 2000) - 150,
    calorieTargetMax: Number(user.dailyCalorieTarget || dailyTargets.calories || 2000) + 150,
    proteinTarget: Number(user.dailyProteinTarget || dailyTargets.protein || 120),
    carbsTarget: Number(dailyTargets.carbs || 200),
    fatsTarget: Number(dailyTargets.fats || 60),
  };
};

const parseQuantityValue = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const getServingLabel = (food, unit) => {
  const selectedUnit = food.servingUnits?.find((item) => item.unit === unit);
  return selectedUnit?.label || "";
};

const buildManualFoodItem = (item) => {
  if (!item.name) {
    throw new Error("Food name is required for manual food entry");
  }

  if (item.calories === undefined || item.calories === null) {
    throw new Error(`Calories are required for ${item.name}`);
  }

  const quantityValue = parseQuantityValue(item.quantityValue || item.amount || 0);
  const unit = String(item.unit || "g").toLowerCase().trim();

  return {
    food: null,
    name: item.name,
    quantity: item.quantity || `${quantityValue || ""} ${unit}`.trim(),
    quantityValue,
    unit,
    gramAmount: Number(item.gramAmount || 0),
    servingLabel: item.servingLabel || "",

    nutritionPer100g: item.nutritionPer100g || {},

    calories: round(item.calories),
    protein: round(item.protein || 0),
    carbs: round(item.carbs || 0),
    fats: round(item.fats || 0),
    fiber: round(item.fiber || 0),
    sugar: round(item.sugar || 0),
    sodium: round(item.sodium || 0),
    cholesterol: round(item.cholesterol || 0),

    isManualEntry: true,
    notes: item.notes || "",
  };
};

const buildFoodItemFromLibrary = async (item, userId) => {
  const foodId = item.food || item.foodId;

  if (!foodId) {
    return buildManualFoodItem(item);
  }

  const food = await Food.findOne({
    _id: foodId,
    ...getFoodAccessQuery(userId),
  });

  if (!food) {
    throw new Error(`Food not found: ${foodId}`);
  }

  const quantityValue = parseQuantityValue(
    item.quantityValue || item.amount || item.quantity || food.defaultServingQuantity || 100
  );

  if (!quantityValue || quantityValue <= 0) {
    throw new Error(`Quantity must be greater than 0 for ${food.name}`);
  }

  const unit = String(item.unit || food.defaultServingUnit || "g")
    .toLowerCase()
    .trim();

  const calculated = food.calculateNutrition(quantityValue, unit);

  return {
    food: food._id,
    name: food.name,
    quantity: `${quantityValue} ${unit}`,
    quantityValue,
    unit,
    gramAmount: calculated.gramAmount,
    servingLabel: getServingLabel(food, unit),

    nutritionPer100g: {
      calories: food.caloriesPer100g,
      protein: food.proteinPer100g,
      carbs: food.carbsPer100g,
      fats: food.fatsPer100g,
      fiber: food.fiberPer100g,
      sugar: food.sugarPer100g,
      sodium: food.sodiumPer100g,
      cholesterol: food.cholesterolPer100g,
    },

    calories: calculated.calories,
    protein: calculated.protein,
    carbs: calculated.carbs,
    fats: calculated.fats,
    fiber: calculated.fiber,
    sugar: calculated.sugar,
    sodium: calculated.sodium,
    cholesterol: calculated.cholesterol,

    isManualEntry: false,
    notes: item.notes || "",
  };
};

const buildFoodItems = async (foods = [], userId) => {
  if (!Array.isArray(foods) || foods.length === 0) {
    throw new Error("At least one food item is required");
  }

  const builtFoods = [];

  for (const item of foods) {
    const builtItem = await buildFoodItemFromLibrary(item, userId);
    builtFoods.push(builtItem);
  }

  return builtFoods;
};

const calculateMealTotals = (foods = []) => {
  return foods.reduce(
    (totals, food) => {
      totals.totalCalories += Number(food.calories || 0);
      totals.totalProtein += Number(food.protein || 0);
      totals.totalCarbs += Number(food.carbs || 0);
      totals.totalFats += Number(food.fats || 0);
      totals.totalFiber += Number(food.fiber || 0);
      totals.totalSugar += Number(food.sugar || 0);
      totals.totalSodium += Number(food.sodium || 0);
      totals.totalCholesterol += Number(food.cholesterol || 0);
      return totals;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalFiber: 0,
      totalSugar: 0,
      totalSodium: 0,
      totalCholesterol: 0,
    }
  );
};

const roundTotals = (totals) => ({
  totalCalories: round(totals.totalCalories),
  totalProtein: round(totals.totalProtein),
  totalCarbs: round(totals.totalCarbs),
  totalFats: round(totals.totalFats),
  totalFiber: round(totals.totalFiber),
  totalSugar: round(totals.totalSugar),
  totalSodium: round(totals.totalSodium),
  totalCholesterol: round(totals.totalCholesterol),
});

const applyDataToMeal = (meal, mealData) => {
  Object.keys(mealData).forEach((key) => {
    if (mealData[key] !== undefined) {
      meal.set(key, mealData[key]);
    }
  });

  return meal;
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { mealType, foods } = req.body;

    if (!mealType) {
      res.status(400);
      throw new Error("Meal type is required");
    }

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      res.status(400);
      throw new Error("At least one food item is required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const mealData = filterAllowedFields(req.body);
    const targets = getUserMealTargets(user);

    const builtFoods = await buildFoodItems(foods, req.user._id);
    const totals = roundTotals(calculateMealTotals(builtFoods));

    const meal = new Meal({
      user: req.user._id,
      ...targets,
      ...mealData,
      foods: builtFoods,
      ...totals,
    });

    await meal.save();

    res.status(201).json({
      success: true,
      message: "Meal created successfully",
      meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meals of logged-in user
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res, next) => {
  try {
    const {
      date,
      startDate,
      endDate,
      mealType,
      plan,
      isPlannedMeal,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    if (date) {
      const { start, end } = getStartAndEndOfDate(date);
      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (startDate || endDate) {
      const { start } = getStartAndEndOfDate(startDate || new Date("1970-01-01"));
      const { end } = getStartAndEndOfDate(endDate || new Date());

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (mealType) {
      query.mealType = mealType;
    }

    if (plan) {
      query.plan = plan;
    }

    if (isPlannedMeal !== undefined) {
      query.isPlannedMeal = isPlannedMeal === "true";
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [meals, total] = await Promise.all([
      Meal.find(query)
        .populate("foods.food", "name localName category servingUnits")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Meal.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: meals.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      meals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's meals
// @route   GET /api/meals/today
// @access  Private
const getTodayMeals = async (req, res, next) => {
  try {
    const { start, end } = getStartAndEndOfDate();

    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("foods.food", "name localName category servingUnits")
      .sort({ createdAt: 1 });

    const summary = roundTotals(calculateMealTotals(meals.flatMap((meal) => meal.foods)));

    res.status(200).json({
      success: true,
      date: getDateKey(start),
      summary: {
        ...summary,
        mealCount: meals.length,
      },
      meals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate(
      "foods.food",
      "name localName category servingUnits"
    );

    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this meal");
    }

    res.status(200).json({
      success: true,
      meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this meal");
    }

    const updateData = filterAllowedFields(req.body);

    if (req.body.foods) {
      const builtFoods = await buildFoodItems(req.body.foods, req.user._id);
      const totals = roundTotals(calculateMealTotals(builtFoods));

      updateData.foods = builtFoods;
      Object.assign(updateData, totals);
    }

    applyDataToMeal(meal, updateData);

    await meal.save();

    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this meal");
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily meal summary
// @route   GET /api/meals/summary/daily?date=2026-06-01
// @access  Private
const getDailyMealSummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const { start, end } = getStartAndEndOfDate(date);

    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ createdAt: 1 });

    const summary = roundTotals(
      calculateMealTotals(meals.flatMap((meal) => meal.foods))
    );

    res.status(200).json({
      success: true,
      date: getDateKey(start),
      summary: {
        ...summary,
        mealCount: meals.length,
      },
      meals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly meal summary
// @route   GET /api/meals/summary/weekly?days=7
// @access  Private
const getWeeklyMealSummary = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 30);

    const today = new Date();
    const { start: todayStart, end: todayEnd } = getStartAndEndOfDate(today);
    const startDate = addDays(todayStart, -(days - 1));

    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: todayEnd,
      },
    }).sort({ date: 1 });

    const dailyMap = new Map();

    for (let i = 0; i < days; i += 1) {
      const day = addDays(startDate, i);
      dailyMap.set(getDateKey(day), {
        date: getDateKey(day),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0,
        mealCount: 0,
      });
    }

    meals.forEach((meal) => {
      const key = getDateKey(meal.date);
      const day = dailyMap.get(key);

      if (!day) return;

      day.totalCalories = round(day.totalCalories + Number(meal.totalCalories || 0));
      day.totalProtein = round(day.totalProtein + Number(meal.totalProtein || 0));
      day.totalCarbs = round(day.totalCarbs + Number(meal.totalCarbs || 0));
      day.totalFats = round(day.totalFats + Number(meal.totalFats || 0));
      day.totalFiber = round(day.totalFiber + Number(meal.totalFiber || 0));
      day.mealCount += 1;
    });

    const daily = Array.from(dailyMap.values());

    const summary = daily.reduce(
      (totals, day) => {
        totals.totalCalories += Number(day.totalCalories || 0);
        totals.totalProtein += Number(day.totalProtein || 0);
        totals.totalCarbs += Number(day.totalCarbs || 0);
        totals.totalFats += Number(day.totalFats || 0);
        totals.totalFiber += Number(day.totalFiber || 0);
        totals.mealCount += Number(day.mealCount || 0);
        return totals;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0,
        mealCount: 0,
      }
    );

    res.status(200).json({
      success: true,
      range: {
        startDate,
        endDate: todayEnd,
        days,
      },
      summary: {
        totalCalories: round(summary.totalCalories),
        totalProtein: round(summary.totalProtein),
        totalCarbs: round(summary.totalCarbs),
        totalFats: round(summary.totalFats),
        totalFiber: round(summary.totalFiber),
        mealCount: summary.mealCount,
        averageCalories: round(summary.totalCalories / days),
        averageProtein: round(summary.totalProtein / days),
      },
      daily,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Preview meal nutrition before saving
// @route   POST /api/meals/preview
// @access  Private
const previewMealNutrition = async (req, res, next) => {
  try {
    const { foods } = req.body;

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      res.status(400);
      throw new Error("At least one food item is required");
    }

    const builtFoods = await buildFoodItems(foods, req.user._id);
    const totals = roundTotals(calculateMealTotals(builtFoods));

    res.status(200).json({
      success: true,
      message: "Meal nutrition preview calculated successfully",
      foods: builtFoods,
      summary: totals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeal,
  getMeals,
  getTodayMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailyMealSummary,
  getWeeklyMealSummary,
  previewMealNutrition,
};