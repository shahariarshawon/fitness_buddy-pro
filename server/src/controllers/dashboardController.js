const Workout = require("../models/Workout");
const Meal = require("../models/Meal");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");

const getStartOfDay = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};

const getPreviousDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const calculateCurrentStreak = async (userId) => {
  const habits = await Habit.find({ user: userId }).sort({ date: -1 });

  let streak = 0;

  for (const habit of habits) {
    if (habit.completionPercentage >= 70) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const last7DaysStart = getPreviousDate(6);

    // Today's meals
    const todayMeals = await Meal.find({
      user: userId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const todayNutrition = todayMeals.reduce(
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

    // Today's workouts
    const todayWorkouts = await Workout.find({
      user: userId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const todayWorkoutSummary = todayWorkouts.reduce(
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

    // Today's habit
    const todayHabit = await Habit.findOne({
      user: userId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    // Latest progress
    const latestProgress = await Progress.findOne({
      user: userId,
    }).sort({ date: -1 });

    // Previous progress for weight change
    const previousProgress = await Progress.findOne({
      user: userId,
      date: {
        $lt: latestProgress ? latestProgress.date : new Date(),
      },
    }).sort({ date: -1 });

    let weightChange = 0;

    if (latestProgress && previousProgress) {
      weightChange = Number(
        (latestProgress.weight - previousProgress.weight).toFixed(2)
      );
    }

    // Last 7 days meals
    const last7Meals = await Meal.find({
      user: userId,
      date: {
        $gte: last7DaysStart,
        $lte: todayEnd,
      },
    }).sort({ date: 1 });

    // Last 7 days workouts
    const last7Workouts = await Workout.find({
      user: userId,
      date: {
        $gte: last7DaysStart,
        $lte: todayEnd,
      },
    }).sort({ date: 1 });

    // Last 7 days habits
    const last7Habits = await Habit.find({
      user: userId,
      date: {
        $gte: last7DaysStart,
        $lte: todayEnd,
      },
    }).sort({ date: 1 });

    // Last 7 progress logs
    const recentProgressLogs = await Progress.find({
      user: userId,
    })
      .sort({ date: -1 })
      .limit(7);

    const currentStreak = await calculateCurrentStreak(userId);

    const weeklyNutritionTotals = last7Meals.reduce(
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

    const weeklyWorkoutTotals = last7Workouts.reduce(
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

    const averageHabitCompletion =
      last7Habits.length > 0
        ? Math.round(
            last7Habits.reduce(
              (sum, habit) => sum + habit.completionPercentage,
              0
            ) / last7Habits.length
          )
        : 0;

    const dashboard = {
      today: {
        nutrition: todayNutrition,
        workout: todayWorkoutSummary,
        habitCompletion: todayHabit ? todayHabit.completionPercentage : 0,
        habit: todayHabit,
      },

      bodyProgress: {
        currentWeight: latestProgress ? latestProgress.weight : null,
        latestProgress,
        previousProgress,
        weightChange,
      },

      weekly: {
        nutrition: weeklyNutritionTotals,
        workout: weeklyWorkoutTotals,
        averageHabitCompletion,
        currentStreak,
      },

      charts: {
        last7Meals,
        last7Workouts,
        last7Habits,
        recentProgressLogs: recentProgressLogs.reverse(),
      },
    };

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};