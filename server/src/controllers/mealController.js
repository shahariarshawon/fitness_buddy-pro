const Meal = require("../models/Meal");

const calculateMealTotals = (foods = []) => {
  return foods.reduce(
    (totals, food) => {
      totals.totalCalories += Number(food.calories || 0);
      totals.totalProtein += Number(food.protein || 0);
      totals.totalCarbs += Number(food.carbs || 0);
      totals.totalFats += Number(food.fats || 0);
      return totals;
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    }
  );
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { date, mealType, foods, notes } = req.body;

    if (!mealType) {
      res.status(400);
      throw new Error("Meal type is required");
    }

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      res.status(400);
      throw new Error("At least one food item is required");
    }

    const totals = calculateMealTotals(foods);

    const meal = await Meal.create({
      user: req.user._id,
      date,
      mealType,
      foods,
      notes,
      ...totals,
    });

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
    const { date } = req.query;

    const query = { user: req.user._id };

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      query.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: meals.length,
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
    const meal = await Meal.findById(req.params.id);

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
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this meal");
    }

    const updateData = { ...req.body };

    if (req.body.foods) {
      const totals = calculateMealTotals(req.body.foods);
      Object.assign(updateData, totals);
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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

    const selectedDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const meals = await Meal.find({
      user: req.user._id,
      date: {
        $gte: selectedDate,
        $lt: nextDate,
      },
    });

    const summary = meals.reduce(
      (totals, meal) => {
        totals.totalCalories += meal.totalCalories || 0;
        totals.totalProtein += meal.totalProtein || 0;
        totals.totalCarbs += meal.totalCarbs || 0;
        totals.totalFats += meal.totalFats || 0;
        totals.mealCount += 1;
        return totals;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        mealCount: 0,
      }
    );

    res.status(200).json({
      success: true,
      date,
      summary,
      meals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailyMealSummary,
};