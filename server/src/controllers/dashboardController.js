const User = require("../models/User");
const Workout = require("../models/Workout");
const Meal = require("../models/Meal");
const Habit = require("../models/Habit");
const Progress = require("../models/Progress");
const ProgressPhoto = require("../models/ProgressPhoto");

/**
 * Optional models.
 * These will work after you create TransformationPlan.js and PlanDay.js.
 * Until then, dashboard will not crash.
 */
const safeRequire = (modelPath) => {
  try {
    return require(modelPath);
  } catch (error) {
    return null;
  }
};

const TransformationPlan = safeRequire("../models/TransformationPlan");
const PlanDay = safeRequire("../models/PlanDay");

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
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
};

const buildDateRange = (startDate, numberOfDays) => {
  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = addDays(startDate, index);
    return {
      date,
      dateKey: getDateKey(date),
    };
  });
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

const calculateWorkoutTotals = (workouts = []) => {
  return workouts.reduce(
    (totals, workout) => {
      totals.caloriesBurned += Number(workout.caloriesBurned || 0);
      totals.duration += Number(workout.duration || 0);
      totals.cardioDuration += Number(workout.cardioDuration || 0);
      totals.totalSets += Number(workout.totalSets || 0);
      totals.totalReps += Number(workout.totalReps || 0);
      totals.totalVolume += Number(workout.totalVolume || 0);
      totals.workoutCount += 1;

      if (workout.averageRpe) {
        totals.rpeSum += Number(workout.averageRpe);
        totals.rpeCount += 1;
      }

      if (workout.painReported) {
        totals.painSessions += 1;
      }

      if (workout.completionPercentage >= 80) {
        totals.completedSessions += 1;
      }

      return totals;
    },
    {
      caloriesBurned: 0,
      duration: 0,
      cardioDuration: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      workoutCount: 0,
      completedSessions: 0,
      rpeSum: 0,
      rpeCount: 0,
      averageRpe: 0,
      painSessions: 0,
    }
  );
};

const finalizeWorkoutTotals = (totals) => {
  return {
    ...totals,
    caloriesBurned: round(totals.caloriesBurned),
    duration: round(totals.duration),
    cardioDuration: round(totals.cardioDuration),
    totalVolume: round(totals.totalVolume),
    averageRpe:
      totals.rpeCount > 0 ? round(totals.rpeSum / totals.rpeCount) : 0,
  };
};

const calculateAverageHabitCompletion = (habits = []) => {
  if (!habits.length) return 0;

  return Math.round(
    habits.reduce(
      (sum, habit) => sum + Number(habit.completionPercentage || 0),
      0
    ) / habits.length
  );
};

const calculateCurrentStreak = async (userId) => {
  const today = getStartOfDay();
  const startDate = addDays(today, -60);

  const habits = await Habit.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: getEndOfDay(today),
    },
  }).sort({ date: -1 });

  const habitMap = new Map();

  habits.forEach((habit) => {
    habitMap.set(getDateKey(habit.date), habit);
  });

  let streak = 0;

  /**
   * If today is not completed yet, allow streak to start from yesterday.
   * This avoids breaking the streak early in the morning.
   */
  let cursorDate = today;
  const todayHabit = habitMap.get(getDateKey(today));

  if (!todayHabit || Number(todayHabit.completionPercentage || 0) < 70) {
    cursorDate = addDays(today, -1);
  }

  for (let i = 0; i < 60; i += 1) {
    const habit = habitMap.get(getDateKey(cursorDate));

    if (habit && Number(habit.completionPercentage || 0) >= 70) {
      streak += 1;
      cursorDate = addDays(cursorDate, -1);
    } else {
      break;
    }
  }

  return streak;
};

const calculateWeightChange = (latestProgress, previousProgress) => {
  if (!latestProgress || !previousProgress) {
    return {
      weightChange: 0,
      waistChange: 0,
    };
  }

  return {
    weightChange: round(
      Number(latestProgress.weight || 0) - Number(previousProgress.weight || 0)
    ),
    waistChange: round(
      Number(latestProgress.waist || 0) - Number(previousProgress.waist || 0)
    ),
  };
};

const buildDailyChartData = ({ dateRange, meals, workouts, habits, progress }) => {
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

  progress.forEach((entry) => {
    progressMap.set(getDateKey(entry.date), entry);
  });

  return dateRange.map(({ dateKey }) => {
    const dayMeals = mealMap.get(dateKey) || [];
    const dayWorkouts = workoutMap.get(dateKey) || [];
    const dayHabit = habitMap.get(dateKey);
    const dayProgress = progressMap.get(dateKey);

    const nutrition = calculateNutritionTotals(dayMeals);
    const workoutTotals = finalizeWorkoutTotals(calculateWorkoutTotals(dayWorkouts));

    return {
      date: dateKey,
      calories: round(nutrition.calories),
      protein: round(nutrition.protein),
      carbs: round(nutrition.carbs),
      fats: round(nutrition.fats),
      fiber: round(nutrition.fiber),
      workoutDuration: workoutTotals.duration,
      caloriesBurned: workoutTotals.caloriesBurned,
      workoutCount: workoutTotals.workoutCount,
      habitCompletion: dayHabit ? dayHabit.completionPercentage : 0,
      steps: dayHabit ? dayHabit.stepsCount : 0,
      waterLiters: dayHabit ? dayHabit.waterIntakeLiters : 0,
      sleepHours: dayHabit ? dayHabit.sleepHours : 0,
      weight: dayProgress ? dayProgress.weight : null,
      waist: dayProgress ? dayProgress.waist : null,
    };
  });
};

const buildRecommendationMessages = ({
  user,
  targets,
  todayNutrition,
  todayWorkout,
  todayHabit,
  latestProgress,
}) => {
  const messages = [];

  if (!user.profileCompleted) {
    messages.push({
      type: "profile",
      priority: "high",
      message: "Complete your profile to get better calorie, protein, and progress recommendations.",
    });
  }

  if (todayNutrition.protein < targets.protein) {
    messages.push({
      type: "protein",
      priority: "medium",
      message: `Protein is low today. You need about ${round(
        targets.protein - todayNutrition.protein
      )}g more to reach your target.`,
    });
  }

  if (todayNutrition.calories > targets.calories) {
    messages.push({
      type: "calories",
      priority: "medium",
      message: "Calories are above your daily target. Keep dinner/snacks lighter.",
    });
  }

  if (!todayWorkout.workoutCount) {
    messages.push({
      type: "workout",
      priority: "medium",
      message: "No workout logged today. Complete your workout or active recovery task.",
    });
  }

  if (todayHabit && todayHabit.sleepHours && todayHabit.sleepHours < 5) {
    messages.push({
      type: "sleep",
      priority: "high",
      message: "Sleep is below 5 hours. Reduce workout intensity and avoid hard cardio.",
    });
  }

  if (todayHabit && todayHabit.stepsCount < targets.steps) {
    messages.push({
      type: "steps",
      priority: "low",
      message: `You still need about ${
        targets.steps - todayHabit.stepsCount
      } steps today.`,
    });
  }

  if (todayWorkout.painSessions > 0) {
    messages.push({
      type: "safety",
      priority: "high",
      message: "Pain was reported in a workout. Do not increase load next session.",
    });
  }

  if (latestProgress && latestProgress.bmi >= 30) {
    messages.push({
      type: "safety",
      priority: "medium",
      message: "BMI is in the obesity range. Keep training low-impact and progress gradually.",
    });
  }

  return messages;
};

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const targets = getUserTargets(user);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();
    const last7DaysStart = addDays(todayStart, -6);
    const last30DaysStart = addDays(todayStart, -29);

    const [
      activePlan,
      todayPlanDay,
      todayMeals,
      todayWorkouts,
      todayHabit,
      latestProgress,
      recentPhotos,
      last7Meals,
      last7Workouts,
      last7Habits,
      last7Progress,
      last30Progress,
      recentProgressLogs,
    ] = await Promise.all([
      TransformationPlan && user.activePlan
        ? TransformationPlan.findOne({ _id: user.activePlan, user: userId })
        : null,

      PlanDay
        ? PlanDay.findOne({
            user: userId,
            date: {
              $gte: todayStart,
              $lte: todayEnd,
            },
          })
        : null,

      Meal.find({
        user: userId,
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }).sort({ createdAt: 1 }),

      Workout.find({
        user: userId,
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }).sort({ createdAt: 1 }),

      Habit.findOne({
        user: userId,
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }),

      Progress.findOne({
        user: userId,
      }).sort({ date: -1 }),

      ProgressPhoto.find({
        user: userId,
        isActive: true,
      })
        .sort({ date: -1 })
        .limit(6),

      Meal.find({
        user: userId,
        date: {
          $gte: last7DaysStart,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Workout.find({
        user: userId,
        date: {
          $gte: last7DaysStart,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Habit.find({
        user: userId,
        date: {
          $gte: last7DaysStart,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
        date: {
          $gte: last7DaysStart,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
        date: {
          $gte: last30DaysStart,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
      })
        .sort({ date: -1 })
        .limit(7),
    ]);

    const previousProgress = latestProgress
      ? await Progress.findOne({
          user: userId,
          date: {
            $lt: latestProgress.date,
          },
        }).sort({ date: -1 })
      : null;

    const todayNutritionRaw = calculateNutritionTotals(todayMeals);
    const todayNutrition = {
      calories: round(todayNutritionRaw.calories),
      protein: round(todayNutritionRaw.protein),
      carbs: round(todayNutritionRaw.carbs),
      fats: round(todayNutritionRaw.fats),
      fiber: round(todayNutritionRaw.fiber),
      sugar: round(todayNutritionRaw.sugar),
      sodium: round(todayNutritionRaw.sodium),
      cholesterol: round(todayNutritionRaw.cholesterol),
      mealCount: todayNutritionRaw.mealCount,

      progress: {
        calories: percentage(todayNutritionRaw.calories, targets.calories),
        protein: percentage(todayNutritionRaw.protein, targets.protein),
        carbs: percentage(todayNutritionRaw.carbs, targets.carbs),
        fats: percentage(todayNutritionRaw.fats, targets.fats),
        fiber: percentage(todayNutritionRaw.fiber, targets.fiber),
      },

      remaining: {
        calories: round(Math.max(0, targets.calories - todayNutritionRaw.calories)),
        protein: round(Math.max(0, targets.protein - todayNutritionRaw.protein)),
        carbs: round(Math.max(0, targets.carbs - todayNutritionRaw.carbs)),
        fats: round(Math.max(0, targets.fats - todayNutritionRaw.fats)),
        fiber: round(Math.max(0, targets.fiber - todayNutritionRaw.fiber)),
      },
    };

    const todayWorkout = finalizeWorkoutTotals(calculateWorkoutTotals(todayWorkouts));

    const todayHabitSummary = todayHabit
      ? {
          id: todayHabit._id,
          completionPercentage: todayHabit.completionPercentage,
          requiredTaskCompletionPercentage:
            todayHabit.requiredTaskCompletionPercentage,
          workoutCompleted: todayHabit.workoutCompleted,
          cardioCompleted: todayHabit.cardioCompleted,
          dietFollowed: todayHabit.dietFollowed,
          waterCompleted: todayHabit.waterCompleted,
          proteinTargetAchieved: todayHabit.proteinTargetAchieved,
          stepsCompleted: todayHabit.stepsCompleted,
          sleepAchieved: todayHabit.sleepAchieved,
          prayerCompleted: todayHabit.prayerCompleted,
          studyCompleted: todayHabit.studyCompleted,
          personalDevelopmentCompleted:
            todayHabit.personalDevelopmentCompleted,
          noLateNightScrolling: todayHabit.noLateNightScrolling,
          sleepShutdownCompleted: todayHabit.sleepShutdownCompleted,
          waterIntakeLiters: todayHabit.waterIntakeLiters,
          proteinIntakeGrams: todayHabit.proteinIntakeGrams,
          caloriesIntake: todayHabit.caloriesIntake,
          stepsCount: todayHabit.stepsCount,
          sleepHours: todayHabit.sleepHours,
          dailyThreeTasks: todayHabit.dailyThreeTasks,
          mood: todayHabit.mood,
          energyLevel: todayHabit.energyLevel,
          stressLevel: todayHabit.stressLevel,
        }
      : null;

    const weeklyNutritionRaw = calculateNutritionTotals(last7Meals);
    const weeklyWorkoutRaw = finalizeWorkoutTotals(
      calculateWorkoutTotals(last7Workouts)
    );

    const averageHabitCompletion = calculateAverageHabitCompletion(last7Habits);
    const currentStreak = await calculateCurrentStreak(userId);

    const { weightChange, waistChange } = calculateWeightChange(
      latestProgress,
      previousProgress
    );

    const dateRange = buildDateRange(last7DaysStart, 7);

    const dailyChartData = buildDailyChartData({
      dateRange,
      meals: last7Meals,
      workouts: last7Workouts,
      habits: last7Habits,
      progress: last7Progress,
    });

    const recommendations = buildRecommendationMessages({
      user,
      targets,
      todayNutrition: todayNutritionRaw,
      todayWorkout,
      todayHabit,
      latestProgress,
    });

    const dashboard = {
      profile: {
        id: user._id,
        name: user.name,
        goal: user.goal,
        bmi: user.bmi,
        bmr: user.bmr,
        currentWeight: user.currentWeight,
        startingWeight: user.startingWeight,
        targetWeight: user.targetWeight,
        estimatedMaintenanceCalories: user.estimatedMaintenanceCalories,
        profileCompleted: user.profileCompleted,
        onboardingCompleted: user.onboardingCompleted,
      },

      targets,

      activePlan: activePlan
        ? {
            id: activePlan._id,
            name: activePlan.name,
            goalType: activePlan.goalType,
            startDate: activePlan.startDate,
            endDate: activePlan.endDate,
            isActive: activePlan.isActive,
          }
        : null,

      todayPlan: todayPlanDay
        ? {
            id: todayPlanDay._id,
            date: todayPlanDay.date,
            dayNumber: todayPlanDay.dayNumber,
            sessionName: todayPlanDay.sessionName,
            mainFocus: todayPlanDay.mainFocus,
            dayType: todayPlanDay.dayType,
            status: todayPlanDay.status,
            targets: todayPlanDay.targets,
          }
        : null,

      today: {
        date: getDateKey(todayStart),
        nutrition: todayNutrition,
        workout: todayWorkout,
        habit: todayHabitSummary,
      },

      bodyProgress: {
        currentWeight: latestProgress ? latestProgress.weight : null,
        currentWaist: latestProgress ? latestProgress.waist : null,
        currentBmi: latestProgress ? latestProgress.bmi : user.bmi,
        bodyFatPercentage: latestProgress
          ? latestProgress.bodyFatPercentage
          : null,
        latestProgress,
        previousProgress,
        weightChange,
        waistChange,
        recentPhotos,
      },

      weekly: {
        nutrition: {
          calories: round(weeklyNutritionRaw.calories),
          protein: round(weeklyNutritionRaw.protein),
          carbs: round(weeklyNutritionRaw.carbs),
          fats: round(weeklyNutritionRaw.fats),
          fiber: round(weeklyNutritionRaw.fiber),
          mealCount: weeklyNutritionRaw.mealCount,
          averageCalories: round(weeklyNutritionRaw.calories / 7),
          averageProtein: round(weeklyNutritionRaw.protein / 7),
        },

        workout: weeklyWorkoutRaw,

        habits: {
          averageHabitCompletion,
          currentStreak,
          habitDaysLogged: last7Habits.length,
        },

        targetProgress: {
          workoutDays: percentage(
            weeklyWorkoutRaw.completedSessions,
            targets.workoutDaysPerWeek
          ),
          proteinAverage: percentage(
            weeklyNutritionRaw.protein / 7,
            targets.protein
          ),
          calorieAverage: percentage(
            weeklyNutritionRaw.calories / 7,
            targets.calories
          ),
          habitAverage: averageHabitCompletion,
        },
      },

      charts: {
        daily: dailyChartData,
        recentProgressLogs: recentProgressLogs.reverse(),
        last30Progress,
      },

      recommendations,
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

// @desc    Get only today's dashboard
// @route   GET /api/dashboard/today
// @access  Private
const getTodayDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const targets = getUserTargets(user);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const [todayMeals, todayWorkouts, todayHabit, todayProgress, todayPlanDay] =
      await Promise.all([
        Meal.find({
          user: userId,
          date: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }).sort({ createdAt: 1 }),

        Workout.find({
          user: userId,
          date: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }).sort({ createdAt: 1 }),

        Habit.findOne({
          user: userId,
          date: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }),

        Progress.findOne({
          user: userId,
          date: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        }),

        PlanDay
          ? PlanDay.findOne({
              user: userId,
              date: {
                $gte: todayStart,
                $lte: todayEnd,
              },
            })
          : null,
      ]);

    const nutritionRaw = calculateNutritionTotals(todayMeals);
    const workoutRaw = finalizeWorkoutTotals(calculateWorkoutTotals(todayWorkouts));

    res.status(200).json({
      success: true,
      message: "Today's dashboard fetched successfully",
      today: {
        date: getDateKey(todayStart),
        targets,
        planDay: todayPlanDay,
        meals: todayMeals,
        workouts: todayWorkouts,
        habit: todayHabit,
        progress: todayProgress,

        nutrition: {
          ...nutritionRaw,
          calories: round(nutritionRaw.calories),
          protein: round(nutritionRaw.protein),
          carbs: round(nutritionRaw.carbs),
          fats: round(nutritionRaw.fats),
          fiber: round(nutritionRaw.fiber),
          progress: {
            calories: percentage(nutritionRaw.calories, targets.calories),
            protein: percentage(nutritionRaw.protein, targets.protein),
            water: todayHabit
              ? percentage(todayHabit.waterIntakeLiters, targets.waterLiters)
              : 0,
            steps: todayHabit
              ? percentage(todayHabit.stepsCount, targets.steps)
              : 0,
            sleep: todayHabit
              ? percentage(todayHabit.sleepHours, targets.sleepHours)
              : 0,
          },
        },

        workout: workoutRaw,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly dashboard
// @route   GET /api/dashboard/weekly?days=7
// @access  Private
const getWeeklyDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = Math.min(Number(req.query.days) || 7, 30);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();
    const startDate = addDays(todayStart, -(days - 1));

    const [meals, workouts, habits, progress] = await Promise.all([
      Meal.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Workout.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Habit.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),
    ]);

    const dateRange = buildDateRange(startDate, days);
    const daily = buildDailyChartData({
      dateRange,
      meals,
      workouts,
      habits,
      progress,
    });

    const nutrition = calculateNutritionTotals(meals);
    const workout = finalizeWorkoutTotals(calculateWorkoutTotals(workouts));
    const averageHabitCompletion = calculateAverageHabitCompletion(habits);
    const currentStreak = await calculateCurrentStreak(userId);

    res.status(200).json({
      success: true,
      message: "Weekly dashboard fetched successfully",
      weekly: {
        range: {
          startDate,
          endDate: todayEnd,
          days,
        },

        nutrition: {
          calories: round(nutrition.calories),
          protein: round(nutrition.protein),
          carbs: round(nutrition.carbs),
          fats: round(nutrition.fats),
          fiber: round(nutrition.fiber),
          mealCount: nutrition.mealCount,
          averageCalories: round(nutrition.calories / days),
          averageProtein: round(nutrition.protein / days),
        },

        workout,

        habits: {
          averageHabitCompletion,
          currentStreak,
          habitDaysLogged: habits.length,
        },

        progress,

        charts: {
          daily,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard charts only
// @route   GET /api/dashboard/charts?days=30
// @access  Private
const getDashboardCharts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = Math.min(Number(req.query.days) || 30, 90);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();
    const startDate = addDays(todayStart, -(days - 1));

    const [meals, workouts, habits, progress] = await Promise.all([
      Meal.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Workout.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Habit.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),

      Progress.find({
        user: userId,
        date: {
          $gte: startDate,
          $lte: todayEnd,
        },
      }).sort({ date: 1 }),
    ]);

    const dateRange = buildDateRange(startDate, days);

    res.status(200).json({
      success: true,
      message: "Dashboard charts fetched successfully",
      charts: {
        daily: buildDailyChartData({
          dateRange,
          meals,
          workouts,
          habits,
          progress,
        }),
        raw: {
          meals,
          workouts,
          habits,
          progress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getTodayDashboard,
  getWeeklyDashboard,
  getDashboardCharts,
};