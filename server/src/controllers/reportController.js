const User = require("../models/User");
const Workout = require("../models/Workout");
const Meal = require("../models/Meal");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");
const ProgressPhoto = require("../models/ProgressPhoto");

const safeRequire = (modelPath) => {
  try {
    return require(modelPath);
  } catch (error) {
    return null;
  }
};

const TransformationPlan = safeRequire("../models/TransformationPlan");

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const percentage = (actual, target) => {
  if (!target || Number(target) <= 0) return 0;
  return Math.min(100, Math.round((Number(actual || 0) / Number(target)) * 100));
};

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

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const getDateKey = (dateInput) => {
  return new Date(dateInput).toISOString().split("T")[0];
};

const buildDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push({
      date: new Date(currentDate),
      dateKey: getDateKey(currentDate),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const calculateChange = (latestValue, firstValue) => {
  if (
    latestValue === undefined ||
    firstValue === undefined ||
    latestValue === null ||
    firstValue === null
  ) {
    return 0;
  }

  return round(Number(latestValue) - Number(firstValue));
};

const getUserTargets = (user) => {
  const dailyTargets = user.dailyTargets || {};

  return {
    calories: Number(dailyTargets.calories || user.dailyCalorieTarget || 2000),
    protein: Number(dailyTargets.protein || user.dailyProteinTarget || 120),
    carbs: Number(dailyTargets.carbs || 200),
    fats: Number(dailyTargets.fats || 60),
    fiber: Number(dailyTargets.fiber || 25),
    waterLiters: Number(dailyTargets.waterLiters || user.dailyWaterTarget || 3),
    steps: Number(dailyTargets.steps || 8000),
    sleepHours: Number(dailyTargets.sleepHours || user.sleepTarget || 8),
    workoutDaysPerWeek: Number(dailyTargets.workoutDaysPerWeek || 5),
  };
};

const calculateNutritionTotals = (meals = []) => {
  return meals.reduce(
    (totals, meal) => {
      totals.calories += Number(meal.totalCalories || 0);
      totals.protein += Number(meal.totalProtein || 0);
      totals.carbs += Number(meal.totalCarbs || 0);
      totals.fats += Number(meal.totalFats || 0);
      totals.fiber += Number(meal.totalFiber || 0);
      totals.sugar += Number(meal.totalSugar || 0);
      totals.sodium += Number(meal.totalSodium || 0);
      totals.cholesterol += Number(meal.totalCholesterol || 0);
      totals.mealCount += 1;

      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      mealCount: 0,
    }
  );
};

const finalizeNutritionTotals = (totals) => ({
  calories: round(totals.calories),
  protein: round(totals.protein),
  carbs: round(totals.carbs),
  fats: round(totals.fats),
  fiber: round(totals.fiber),
  sugar: round(totals.sugar),
  sodium: round(totals.sodium),
  cholesterol: round(totals.cholesterol),
  mealCount: totals.mealCount,
});

const calculateWorkoutTotals = (workouts = []) => {
  const totals = workouts.reduce(
    (result, workout) => {
      result.caloriesBurned += Number(workout.caloriesBurned || 0);
      result.duration += Number(workout.duration || 0);
      result.cardioDuration += Number(workout.cardioDuration || 0);
      result.totalSets += Number(workout.totalSets || 0);
      result.totalReps += Number(workout.totalReps || 0);
      result.totalVolume += Number(workout.totalVolume || 0);
      result.workoutCount += 1;

      if (workout.completionPercentage >= 80) {
        result.completedWorkouts += 1;
      }

      if (workout.painReported) {
        result.painSessions += 1;
      }

      if (workout.averageRpe) {
        result.rpeSum += Number(workout.averageRpe);
        result.rpeCount += 1;
      }

      return result;
    },
    {
      caloriesBurned: 0,
      duration: 0,
      cardioDuration: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      workoutCount: 0,
      completedWorkouts: 0,
      painSessions: 0,
      rpeSum: 0,
      rpeCount: 0,
    }
  );

  return {
    caloriesBurned: round(totals.caloriesBurned),
    duration: round(totals.duration),
    cardioDuration: round(totals.cardioDuration),
    totalSets: totals.totalSets,
    totalReps: totals.totalReps,
    totalVolume: round(totals.totalVolume),
    workoutCount: totals.workoutCount,
    completedWorkouts: totals.completedWorkouts,
    painSessions: totals.painSessions,
    averageRpe: totals.rpeCount > 0 ? round(totals.rpeSum / totals.rpeCount) : 0,
  };
};

const calculateHabitStats = (habits = []) => {
  if (!habits.length) {
    return {
      trackedDays: 0,
      averageCompletion: 0,
      bestCompletion: 0,
      lowestCompletion: 0,
      successfulDays: 0,
      proteinTargetDays: 0,
      waterTargetDays: 0,
      sleepTargetDays: 0,
      workoutDays: 0,
      studyDays: 0,
      prayerCompletedDays: 0,
      noLateNightScrollingDays: 0,
      sleepShutdownDays: 0,
      dailyThreeTaskSuccessDays: 0,
      averageSteps: 0,
      averageSleep: 0,
      averageWater: 0,
    };
  }

  const completionValues = habits.map(
    (habit) => Number(habit.completionPercentage || 0)
  );

  const dailyThreeTaskSuccessDays = habits.filter((habit) => {
    if (typeof habit.isDailyThreeTaskSuccess === "function") {
      return habit.isDailyThreeTaskSuccess();
    }

    return Boolean(
      habit.dailyThreeTasks?.workoutOrWalkDone &&
        habit.dailyThreeTasks?.nutritionTracked &&
        habit.dailyThreeTasks?.careerActionDone
    );
  }).length;

  return {
    trackedDays: habits.length,
    averageCompletion: Math.round(
      completionValues.reduce((sum, value) => sum + value, 0) / habits.length
    ),
    bestCompletion: Math.max(...completionValues),
    lowestCompletion: Math.min(...completionValues),
    successfulDays: habits.filter((habit) => habit.completionPercentage >= 70)
      .length,

    proteinTargetDays: habits.filter((habit) => habit.proteinTargetAchieved)
      .length,
    waterTargetDays: habits.filter((habit) => habit.waterCompleted).length,
    sleepTargetDays: habits.filter((habit) => habit.sleepAchieved).length,
    workoutDays: habits.filter(
      (habit) => habit.workoutCompleted || habit.cardioCompleted
    ).length,
    studyDays: habits.filter(
      (habit) => habit.studyCompleted || habit.personalDevelopmentCompleted
    ).length,
    prayerCompletedDays: habits.filter((habit) => habit.prayerCompleted).length,
    noLateNightScrollingDays: habits.filter(
      (habit) => habit.noLateNightScrolling
    ).length,
    sleepShutdownDays: habits.filter((habit) => habit.sleepShutdownCompleted)
      .length,
    dailyThreeTaskSuccessDays,

    averageSteps: round(
      habits.reduce((sum, habit) => sum + Number(habit.stepsCount || 0), 0) /
        habits.length
    ),
    averageSleep: round(
      habits.reduce((sum, habit) => sum + Number(habit.sleepHours || 0), 0) /
        habits.length
    ),
    averageWater: round(
      habits.reduce(
        (sum, habit) => sum + Number(habit.waterIntakeLiters || 0),
        0
      ) / habits.length
    ),
  };
};

const calculateProgressStats = (progressLogs = []) => {
  if (!progressLogs.length) {
    return {
      firstProgress: null,
      latestProgress: null,
      changes: {
        weightChange: 0,
        waistChange: 0,
        chestChange: 0,
        armChange: 0,
        thighChange: 0,
        hipChange: 0,
        neckChange: 0,
        shoulderChange: 0,
        calfChange: 0,
        bodyFatChange: 0,
        bmiChange: 0,
      },
    };
  }

  const sorted = [...progressLogs].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const firstProgress =
    sorted.find((progress) => progress.isStartMeasurement) || sorted[0];

  const latestProgress =
    sorted.find((progress) => progress.isFinalMeasurement) ||
    sorted[sorted.length - 1];

  return {
    firstProgress,
    latestProgress,
    changes: {
      weightChange: calculateChange(latestProgress.weight, firstProgress.weight),
      waistChange: calculateChange(latestProgress.waist, firstProgress.waist),
      chestChange: calculateChange(latestProgress.chest, firstProgress.chest),
      armChange: calculateChange(latestProgress.arm, firstProgress.arm),
      thighChange: calculateChange(latestProgress.thigh, firstProgress.thigh),
      hipChange: calculateChange(latestProgress.hip, firstProgress.hip),
      neckChange: calculateChange(latestProgress.neck, firstProgress.neck),
      shoulderChange: calculateChange(
        latestProgress.shoulder,
        firstProgress.shoulder
      ),
      calfChange: calculateChange(latestProgress.calf, firstProgress.calf),
      bodyFatChange: calculateChange(
        latestProgress.bodyFatPercentage,
        firstProgress.bodyFatPercentage
      ),
      bmiChange: calculateChange(latestProgress.bmi, firstProgress.bmi),
    },
  };
};

const buildDailyBreakdown = ({
  startDate,
  endDate,
  meals,
  workouts,
  habits,
  progressLogs,
}) => {
  const dateRange = buildDateRange(startDate, endDate);

  const mealMap = new Map();
  const workoutMap = new Map();
  const habitMap = new Map();
  const progressMap = new Map();

  meals.forEach((meal) => {
    const key = getDateKey(meal.date);
    const existing = mealMap.get(key) || [];
    existing.push(meal);
    mealMap.set(key, existing);
  });

  workouts.forEach((workout) => {
    const key = getDateKey(workout.date);
    const existing = workoutMap.get(key) || [];
    existing.push(workout);
    workoutMap.set(key, existing);
  });

  habits.forEach((habit) => {
    habitMap.set(getDateKey(habit.date), habit);
  });

  progressLogs.forEach((progress) => {
    progressMap.set(getDateKey(progress.date), progress);
  });

  return dateRange.map(({ dateKey }) => {
    const dayMeals = mealMap.get(dateKey) || [];
    const dayWorkouts = workoutMap.get(dateKey) || [];
    const dayHabit = habitMap.get(dateKey);
    const dayProgress = progressMap.get(dateKey);

    const nutrition = finalizeNutritionTotals(calculateNutritionTotals(dayMeals));
    const workout = calculateWorkoutTotals(dayWorkouts);

    return {
      date: dateKey,
      nutrition,
      workout,
      habit: {
        completionPercentage: dayHabit ? dayHabit.completionPercentage : 0,
        proteinTargetAchieved: dayHabit
          ? dayHabit.proteinTargetAchieved
          : false,
        waterCompleted: dayHabit ? dayHabit.waterCompleted : false,
        sleepAchieved: dayHabit ? dayHabit.sleepAchieved : false,
        stepsCount: dayHabit ? dayHabit.stepsCount : 0,
        waterIntakeLiters: dayHabit ? dayHabit.waterIntakeLiters : 0,
        sleepHours: dayHabit ? dayHabit.sleepHours : 0,
      },
      progress: {
        weight: dayProgress ? dayProgress.weight : null,
        waist: dayProgress ? dayProgress.waist : null,
        bodyFatPercentage: dayProgress
          ? dayProgress.bodyFatPercentage
          : null,
        bmi: dayProgress ? dayProgress.bmi : null,
      },
    };
  });
};

const buildRecommendations = ({
  targets,
  nutritionTotals,
  workoutTotals,
  habitStats,
  progressStats,
}) => {
  const recommendations = [];

  const dailyCount = Math.max(habitStats.trackedDays || 1, 1);

  const averageProtein = nutritionTotals.protein / dailyCount;
  const averageCalories = nutritionTotals.calories / dailyCount;

  if (averageProtein < targets.protein * 0.8) {
    recommendations.push({
      type: "nutrition",
      priority: "high",
      message: "Average protein is low. Increase eggs, chicken, fish, dal, yogurt, or other high-protein foods.",
    });
  }

  if (averageCalories > targets.calories * 1.15) {
    recommendations.push({
      type: "nutrition",
      priority: "medium",
      message: "Average calories are above target. Reduce oil, fried snacks, sugary drinks, and oversized rice portions.",
    });
  }

  if (workoutTotals.workoutCount < targets.workoutDaysPerWeek) {
    recommendations.push({
      type: "workout",
      priority: "medium",
      message: "Workout frequency is below target. Focus on completing planned sessions before increasing intensity.",
    });
  }

  if (workoutTotals.painSessions > 0) {
    recommendations.push({
      type: "safety",
      priority: "high",
      message: "Pain was reported in at least one session. Do not increase load until pain-free form is consistent.",
    });
  }

  if (habitStats.averageSleep > 0 && habitStats.averageSleep < 6) {
    recommendations.push({
      type: "sleep",
      priority: "high",
      message: "Average sleep is low. Protect sleep shutdown and reduce training intensity on poor-sleep days.",
    });
  }

  if (progressStats.changes.weightChange >= 0 && progressStats.changes.waistChange >= 0) {
    recommendations.push({
      type: "progress",
      priority: "medium",
      message: "Weight and waist did not reduce in this period. Check calorie tracking, steps, and late-night snacking.",
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "general",
      priority: "low",
      message: "Progress is stable. Continue the same plan and improve consistency gradually.",
    });
  }

  return recommendations;
};

const buildReport = async ({
  userId,
  startDate,
  endDate,
  reportType,
  planId = null,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const targets = getUserTargets(user);

  const query = {
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (planId) {
    query.plan = planId;
  }

  const [
    activePlan,
    meals,
    workouts,
    habits,
    progressLogs,
    progressPhotos,
  ] = await Promise.all([
    TransformationPlan && planId
      ? TransformationPlan.findOne({ _id: planId, user: userId })
      : TransformationPlan && user.activePlan
        ? TransformationPlan.findOne({ _id: user.activePlan, user: userId })
        : null,

    Meal.find(query).sort({ date: 1 }),

    Workout.find(query).sort({ date: 1 }),

    Habit.find(query).sort({ date: 1 }),

    Progress.find(query)
      .populate("photos.frontPhoto photos.sidePhoto photos.backPhoto")
      .sort({ date: 1 }),

    ProgressPhoto.find({
      user: userId,
      isActive: true,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      ...(planId ? { plan: planId } : {}),
    }).sort({ date: 1 }),
  ]);

  const nutritionTotals = finalizeNutritionTotals(calculateNutritionTotals(meals));
  const workoutTotals = calculateWorkoutTotals(workouts);
  const habitStats = calculateHabitStats(habits);
  const progressStats = calculateProgressStats(progressLogs);

  const calorieBalance =
    Number(nutritionTotals.calories || 0) -
    Number(workoutTotals.caloriesBurned || 0);

  const dailyBreakdown = buildDailyBreakdown({
    startDate,
    endDate,
    meals,
    workouts,
    habits,
    progressLogs,
  });

  const recommendations = buildRecommendations({
    targets,
    nutritionTotals,
    workoutTotals,
    habitStats,
    progressStats,
  });

  const periodDays =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) +
    1;

  return {
    reportType,

    period: {
      startDate,
      endDate,
      days: periodDays,
    },

    user: {
      id: user._id,
      name: user.name,
      goal: user.goal,
      bmi: user.bmi,
      currentWeight: user.currentWeight,
      startingWeight: user.startingWeight,
      targetWeight: user.targetWeight,
    },

    activePlan: activePlan
      ? {
          id: activePlan._id,
          name: activePlan.name,
          goalType: activePlan.goalType,
          startDate: activePlan.startDate,
          endDate: activePlan.endDate,
        }
      : null,

    targets,

    summary: {
      totalCaloriesConsumed: nutritionTotals.calories,
      averageCalories: round(nutritionTotals.calories / periodDays),
      totalProtein: nutritionTotals.protein,
      averageProtein: round(nutritionTotals.protein / periodDays),
      totalCarbs: nutritionTotals.carbs,
      totalFats: nutritionTotals.fats,
      totalFiber: nutritionTotals.fiber,

      totalCaloriesBurned: workoutTotals.caloriesBurned,
      calorieBalance: round(calorieBalance),
      totalWorkoutDuration: workoutTotals.duration,
      totalWorkouts: workoutTotals.workoutCount,
      completedWorkouts: workoutTotals.completedWorkouts,
      totalWorkoutVolume: workoutTotals.totalVolume,
      averageRpe: workoutTotals.averageRpe,
      painSessions: workoutTotals.painSessions,

      habitAverageCompletion: habitStats.averageCompletion,
      habitSuccessfulDays: habitStats.successfulDays,
      dailyThreeTaskSuccessDays: habitStats.dailyThreeTaskSuccessDays,

      weightChange: progressStats.changes.weightChange,
      waistChange: progressStats.changes.waistChange,
      bodyFatChange: progressStats.changes.bodyFatChange,
      bmiChange: progressStats.changes.bmiChange,

      progressPhotoCount: progressPhotos.length,
    },

    targetAchievement: {
      calorieAverage: percentage(
        nutritionTotals.calories / periodDays,
        targets.calories
      ),
      proteinAverage: percentage(
        nutritionTotals.protein / periodDays,
        targets.protein
      ),
      workoutFrequency: percentage(
        workoutTotals.completedWorkouts,
        targets.workoutDaysPerWeek
      ),
      habitConsistency: habitStats.averageCompletion,
      waterDays: percentage(habitStats.waterTargetDays, periodDays),
      sleepDays: percentage(habitStats.sleepTargetDays, periodDays),
    },

    nutrition: nutritionTotals,
    workout: workoutTotals,
    habits: habitStats,
    progress: progressStats,

    photos: {
      count: progressPhotos.length,
      front: progressPhotos.filter((photo) => photo.photoType === "front"),
      side: progressPhotos.filter((photo) => photo.photoType === "side"),
      back: progressPhotos.filter((photo) => photo.photoType === "back"),
      other: progressPhotos.filter((photo) => photo.photoType === "other"),
    },

    charts: {
      dailyBreakdown,
      progressLogs,
    },

    recommendations,
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

    const endDate = getEndOfDay(addDays(startDate, 6));

    const report = await buildReport({
      userId: req.user._id,
      startDate,
      endDate,
      reportType: "weekly",
      planId: req.query.plan || null,
    });

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

    const startDate = getStartOfDay(new Date(year, month - 1, 1));
    const endDate = getEndOfDay(new Date(year, month, 0));

    const report = await buildReport({
      userId: req.user._id,
      startDate,
      endDate,
      reportType: "monthly",
      planId: req.query.plan || null,
    });

    res.status(200).json({
      success: true,
      message: "Monthly report generated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get custom date range report
// @route   GET /api/reports/custom?startDate=2026-06-01&endDate=2026-06-30
// @access  Private
const getCustomReport = async (req, res, next) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      res.status(400);
      throw new Error("Please provide startDate and endDate");
    }

    const startDate = getStartOfDay(req.query.startDate);
    const endDate = getEndOfDay(req.query.endDate);

    if (startDate > endDate) {
      res.status(400);
      throw new Error("startDate cannot be after endDate");
    }

    const report = await buildReport({
      userId: req.user._id,
      startDate,
      endDate,
      reportType: "custom",
      planId: req.query.plan || null,
    });

    res.status(200).json({
      success: true,
      message: "Custom report generated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transformation report
// @route   GET /api/reports/transformation?plan=PLAN_ID
// @access  Private
const getTransformationReport = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let plan = null;

    if (TransformationPlan && (req.query.plan || user.activePlan)) {
      plan = await TransformationPlan.findOne({
        _id: req.query.plan || user.activePlan,
        user: req.user._id,
      });
    }

    let startDate;
    let endDate;

    if (plan) {
      startDate = getStartOfDay(plan.startDate);
      endDate = getEndOfDay(plan.endDate);
    } else {
      startDate = req.query.startDate
        ? getStartOfDay(req.query.startDate)
        : getStartOfDay(addDays(new Date(), -29));

      endDate = req.query.endDate
        ? getEndOfDay(req.query.endDate)
        : getEndOfDay(new Date());
    }

    const report = await buildReport({
      userId: req.user._id,
      startDate,
      endDate,
      reportType: "transformation",
      planId: plan ? plan._id : req.query.plan || null,
    });

    const transformationScore = Math.round(
      (
        report.targetAchievement.proteinAverage +
        report.targetAchievement.workoutFrequency +
        report.targetAchievement.habitConsistency +
        report.targetAchievement.waterDays +
        report.targetAchievement.sleepDays
      ) / 5
    );

    report.transformation = {
      score: transformationScore,
      status:
        transformationScore >= 85
          ? "excellent"
          : transformationScore >= 70
            ? "on_track"
            : transformationScore >= 50
              ? "needs_consistency"
              : "needs_adjustment",

      mainWins: [
        report.summary.weightChange < 0
          ? `Weight changed by ${report.summary.weightChange} kg`
          : null,
        report.summary.waistChange < 0
          ? `Waist changed by ${report.summary.waistChange} cm`
          : null,
        report.summary.completedWorkouts > 0
          ? `${report.summary.completedWorkouts} workouts completed`
          : null,
        report.summary.dailyThreeTaskSuccessDays > 0
          ? `${report.summary.dailyThreeTaskSuccessDays} daily 3-task wins`
          : null,
      ].filter(Boolean),

      nextFocus:
        transformationScore >= 70
          ? "Continue the same system and make small improvements."
          : "Improve protein, sleep, workout completion, and daily habit consistency.",
    };

    res.status(200).json({
      success: true,
      message: "Transformation report generated successfully",
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

    const [
      totalWorkouts,
      totalMeals,
      totalHabits,
      totalProgressLogs,
      totalProgressPhotos,
      latestProgress,
      firstProgress,
      habits,
      workouts,
    ] = await Promise.all([
      Workout.countDocuments({ user: userId }),
      Meal.countDocuments({ user: userId }),
      Habit.countDocuments({ user: userId }),
      Progress.countDocuments({ user: userId }),
      ProgressPhoto.countDocuments({ user: userId, isActive: true }),

      Progress.findOne({ user: userId }).sort({ date: -1 }),
      Progress.findOne({ user: userId }).sort({ date: 1 }),

      Habit.find({ user: userId }),
      Workout.find({ user: userId }),
    ]);

    const habitStats = calculateHabitStats(habits);
    const workoutTotals = calculateWorkoutTotals(workouts);

    const changes = firstProgress && latestProgress
      ? {
          weightChange: calculateChange(latestProgress.weight, firstProgress.weight),
          waistChange: calculateChange(latestProgress.waist, firstProgress.waist),
          bodyFatChange: calculateChange(
            latestProgress.bodyFatPercentage,
            firstProgress.bodyFatPercentage
          ),
          bmiChange: calculateChange(latestProgress.bmi, firstProgress.bmi),
        }
      : {
          weightChange: 0,
          waistChange: 0,
          bodyFatChange: 0,
          bmiChange: 0,
        };

    res.status(200).json({
      success: true,
      message: "Overview report generated successfully",
      overview: {
        totals: {
          totalWorkouts,
          totalMeals,
          totalHabits,
          totalProgressLogs,
          totalProgressPhotos,
        },

        latestProgress,
        firstProgress,
        changes,

        habitStats,
        workoutTotals,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyReport,
  getMonthlyReport,
  getCustomReport,
  getTransformationReport,
  getOverviewReport,
};