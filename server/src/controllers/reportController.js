const Workout = require("../models/Workout");
const Meal = require("../models/Meal");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");

const getStartOfDay = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getDateKey = (dateInput) => {
  return new Date(dateInput).toISOString().split("T")[0];
};

const calculateNutritionTotals = (meals) => {
  return meals.reduce(
    (totals, meal) => {
      totals.calories += meal.totalCalories || 0;
      totals.protein += meal.totalProtein || 0;
      totals.carbs += meal.totalCarbs || 0;
      totals.fats += meal.totalFats || 0;
      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );
};

const calculateWorkoutTotals = (workouts) => {
  return workouts.reduce(
    (totals, workout) => {
      totals.caloriesBurned += workout.caloriesBurned || 0;
      totals.duration += workout.duration || 0;
      totals.workoutCount += 1;
      return totals;
    },
    {
      caloriesBurned: 0,
      duration: 0,
      workoutCount: 0,
    }
  );
};

const calculateHabitStats = (habits) => {
  if (!habits.length) {
    return {
      trackedDays: 0,
      averageCompletion: 0,
      bestCompletion: 0,
      lowestCompletion: 0,
      successfulDays: 0,
    };
  }

  const totalCompletion = habits.reduce(
    (sum, habit) => sum + (habit.completionPercentage || 0),
    0
  );

  const completionValues = habits.map((habit) => habit.completionPercentage || 0);

  return {
    trackedDays: habits.length,
    averageCompletion: Math.round(totalCompletion / habits.length),
    bestCompletion: Math.max(...completionValues),
    lowestCompletion: Math.min(...completionValues),
    successfulDays: habits.filter((habit) => habit.completionPercentage >= 70)
      .length,
  };
};

const calculateProgressStats = (progressLogs) => {
  if (!progressLogs.length) {
    return {
      firstProgress: null,
      latestProgress: null,
      weightChange: 0,
      waistChange: 0,
      bodyFatChange: 0,
    };
  }

  const sorted = [...progressLogs].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const firstProgress = sorted[0];
  const latestProgress = sorted[sorted.length - 1];

  return {
    firstProgress,
    latestProgress,
    weightChange: Number(
      ((latestProgress.weight || 0) - (firstProgress.weight || 0)).toFixed(2)
    ),
    waistChange: Number(
      ((latestProgress.waist || 0) - (firstProgress.waist || 0)).toFixed(2)
    ),
    bodyFatChange: Number(
      (
        (latestProgress.bodyFatPercentage || 0) -
        (firstProgress.bodyFatPercentage || 0)
      ).toFixed(2)
    ),
  };
};

const buildDailyBreakdown = (startDate, endDate, meals, workouts, habits) => {
  const breakdown = [];

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = getDateKey(currentDate);

    const dayMeals = meals.filter((meal) => getDateKey(meal.date) === dateKey);

    const dayWorkouts = workouts.filter(
      (workout) => getDateKey(workout.date) === dateKey
    );

    const dayHabit = habits.find((habit) => getDateKey(habit.date) === dateKey);

    breakdown.push({
      date: dateKey,
      nutrition: calculateNutritionTotals(dayMeals),
      workout: calculateWorkoutTotals(dayWorkouts),
      habitCompletion: dayHabit ? dayHabit.completionPercentage : 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return breakdown;
};

const buildReport = async (userId, startDate, endDate, reportType) => {
  const meals = await Meal.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  const workouts = await Workout.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  const habits = await Habit.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  const progressLogs = await Progress.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  const nutritionTotals = calculateNutritionTotals(meals);
  const workoutTotals = calculateWorkoutTotals(workouts);
  const habitStats = calculateHabitStats(habits);
  const progressStats = calculateProgressStats(progressLogs);

  const dailyBreakdown = buildDailyBreakdown(
    startDate,
    endDate,
    meals,
    workouts,
    habits
  );

  const calorieBalance =
    nutritionTotals.calories - workoutTotals.caloriesBurned;

  return {
    reportType,
    period: {
      startDate,
      endDate,
    },
    summary: {
      totalCaloriesConsumed: nutritionTotals.calories,
      totalProtein: nutritionTotals.protein,
      totalCarbs: nutritionTotals.carbs,
      totalFats: nutritionTotals.fats,
      totalCaloriesBurned: workoutTotals.caloriesBurned,
      calorieBalance,
      totalWorkoutDuration: workoutTotals.duration,
      totalWorkouts: workoutTotals.workoutCount,
      habitAverageCompletion: habitStats.averageCompletion,
      habitSuccessfulDays: habitStats.successfulDays,
      weightChange: progressStats.weightChange,
      waistChange: progressStats.waistChange,
      bodyFatChange: progressStats.bodyFatChange,
    },
    nutrition: nutritionTotals,
    workout: workoutTotals,
    habits: habitStats,
    progress: progressStats,
    charts: {
      dailyBreakdown,
      progressLogs,
    },
  };
};

// @desc    Get weekly report
// @route   GET /api/reports/weekly?startDate=2026-06-01
// @access  Private
const getWeeklyReport = async (req, res, next) => {
  try {
    let startDate;

    if (req.query.startDate) {
      startDate = getStartOfDay(req.query.startDate);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate = getStartOfDay(startDate);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const report = await buildReport(req.user._id, startDate, endDate, "weekly");

    res.status(200).json({
      success: true,
      message: "Weekly report generated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly report
// @route   GET /api/reports/monthly?year=2026&month=6
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const year = Number(req.query.year) || currentDate.getFullYear();
    const month = Number(req.query.month) || currentDate.getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const report = await buildReport(
      req.user._id,
      startDate,
      endDate,
      "monthly"
    );

    res.status(200).json({
      success: true,
      message: "Monthly report generated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full overview report
// @route   GET /api/reports/overview
// @access  Private
const getOverviewReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const totalMeals = await Meal.countDocuments({ user: userId });
    const totalHabits = await Habit.countDocuments({ user: userId });
    const totalProgressLogs = await Progress.countDocuments({ user: userId });

    const latestProgress = await Progress.findOne({ user: userId }).sort({
      date: -1,
    });

    const firstProgress = await Progress.findOne({ user: userId }).sort({
      date: 1,
    });

    let totalWeightChange = 0;

    if (latestProgress && firstProgress) {
      totalWeightChange = Number(
        ((latestProgress.weight || 0) - (firstProgress.weight || 0)).toFixed(2)
      );
    }

    const habits = await Habit.find({ user: userId });

    const habitStats = calculateHabitStats(habits);

    res.status(200).json({
      success: true,
      message: "Overview report generated successfully",
      overview: {
        totalWorkouts,
        totalMeals,
        totalHabits,
        totalProgressLogs,
        latestProgress,
        firstProgress,
        totalWeightChange,
        habitStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyReport,
  getMonthlyReport,
  getOverviewReport,
};