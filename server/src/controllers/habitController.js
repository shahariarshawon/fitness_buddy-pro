const Habit = require("../models/Habit");
const User = require("../models/User");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const allowedHabitFields = [
  "plan",
  "planDay",
  "date",
  "dayType",

  "workoutCompleted",
  "cardioCompleted",
  "dietFollowed",
  "waterCompleted",
  "sleepAchieved",
  "prayerCompleted",
  "studyCompleted",
  "proteinTargetAchieved",

  "stepsCompleted",
  "personalDevelopmentCompleted",
  "noLateNightScrolling",
  "sleepShutdownCompleted",
  "mobilityCompleted",
  "weeklyCheckInCompleted",

  "waterIntakeLiters",
  "waterTargetLiters",

  "proteinIntakeGrams",
  "proteinTargetGrams",

  "caloriesIntake",
  "caloriesTargetMin",
  "caloriesTargetMax",

  "stepsCount",
  "stepsTarget",

  "sleepHours",
  "sleepTargetHours",

  "studyMinutes",
  "studyTargetMinutes",

  "personalDevelopmentMinutes",
  "personalDevelopmentTargetMinutes",

  "prayers",
  "tasks",

  "mood",
  "energyLevel",
  "hungerLevel",
  "stressLevel",

  "notes",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedHabitFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const getUserTargets = (user) => {
  const dailyTargets = user.dailyTargets || {};

  const calorieTarget = Number(
    dailyTargets.calories || user.dailyCalorieTarget || 2000
  );

  return {
    caloriesTargetMin: Math.max(0, calorieTarget - 150),
    caloriesTargetMax: calorieTarget + 150,
    proteinTargetGrams: Number(
      dailyTargets.protein || user.dailyProteinTarget || 120
    ),
    waterTargetLiters: Number(
      dailyTargets.waterLiters || user.dailyWaterTarget || 3
    ),
    stepsTarget: Number(dailyTargets.steps || 8000),
    sleepTargetHours: Number(
      dailyTargets.sleepHours || user.sleepTarget || 8
    ),
  };
};

const applyDefaultTargets = (habitData, user) => {
  const targets = getUserTargets(user);

  return {
    ...targets,
    studyTargetMinutes: 45,
    personalDevelopmentTargetMinutes: 45,
    ...habitData,
  };
};

const applyDataToHabit = (habit, habitData) => {
  Object.keys(habitData).forEach((key) => {
    if (habitData[key] !== undefined) {
      habit.set(key, habitData[key]);
    }
  });

  return habit;
};

const findHabitByDate = async (userId, dateInput) => {
  const { start, end } = getStartAndEndOfDate(dateInput);

  const habit = await Habit.findOne({
    user: userId,
    date: {
      $gte: start,
      $lte: end,
    },
  });

  return { habit, start, end };
};

const syncHabitWithDailyData = async (habit, userId, start, end) => {
  const [meals, workouts] = await Promise.all([
    Meal.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }),

    Workout.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }),
  ]);

  const nutrition = meals.reduce(
    (total, meal) => {
      total.calories += Number(meal.totalCalories || 0);
      total.protein += Number(meal.totalProtein || 0);
      total.carbs += Number(meal.totalCarbs || 0);
      total.fats += Number(meal.totalFats || 0);
      return total;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );

  const workoutCompleted = workouts.some(
    (workout) =>
      workout.status === "completed" ||
      workout.status === "partially_completed" ||
      Number(workout.completionPercentage || 0) >= 70
  );

  const cardioCompleted = workouts.some((workout) => {
    const exerciseCardioDuration = (workout.exercises || []).reduce(
      (sum, exercise) => sum + Number(exercise.duration || 0),
      0
    );

    return (
      workout.workoutType === "cardio" ||
      Number(workout.cardioDuration || 0) > 0 ||
      Number(workout.cardio?.duration || 0) > 0 ||
      exerciseCardioDuration > 0
    );
  });

  habit.caloriesIntake = round(nutrition.calories);
  habit.proteinIntakeGrams = round(nutrition.protein);

  if (meals.length > 0) {
    habit.dietFollowed = true;
  }

  if (workouts.length > 0) {
    habit.workoutCompleted = workoutCompleted;
    habit.cardioCompleted = cardioCompleted;
  }

  return habit;
};

const habitCompletionFields = [
  "workoutCompleted",
  "cardioCompleted",
  "dietFollowed",
  "waterCompleted",
  "sleepAchieved",
  "prayerCompleted",
  "studyCompleted",
  "proteinTargetAchieved",
  "stepsCompleted",
  "personalDevelopmentCompleted",
  "noLateNightScrolling",
  "sleepShutdownCompleted",
  "mobilityCompleted",
  "weeklyCheckInCompleted",
];

const calculateHabitCompletion = (habitData = {}) => {
  const completed = habitCompletionFields.filter((field) =>
    Boolean(habitData[field])
  ).length;

  return Math.round((completed / habitCompletionFields.length) * 100);
};

const buildSyncedHabitData = async (habit, userId, start, end) => {
  const [meals, workouts] = await Promise.all([
    Meal.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }),

    Workout.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }),
  ]);

  const nutrition = meals.reduce(
    (total, meal) => {
      total.calories += Number(meal.totalCalories || 0);
      total.protein += Number(meal.totalProtein || 0);
      total.carbs += Number(meal.totalCarbs || 0);
      total.fats += Number(meal.totalFats || 0);
      return total;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );

  const cardioDurationFromExercises = workouts.reduce((total, workout) => {
    const exerciseCardioDuration = (workout.exercises || []).reduce(
      (sum, exercise) => sum + Number(exercise.duration || 0),
      0
    );

    return total + exerciseCardioDuration;
  }, 0);

  const hasWorkout = workouts.some((workout) =>
    ["strength", "mixed", "bodyweight", "other"].includes(workout.workoutType)
  );

  const hasCardio =
    cardioDurationFromExercises > 0 ||
    workouts.some(
      (workout) =>
        workout.workoutType === "cardio" ||
        Number(workout.cardioDuration || 0) > 0
    );

  const baseHabit = habit ? habit.toObject ? habit.toObject() : habit : {};

  const syncedData = {
    caloriesIntake: round(nutrition.calories),
    proteinIntakeGrams: round(nutrition.protein),

    dietFollowed: baseHabit.dietFollowed || meals.length > 0,
    workoutCompleted: baseHabit.workoutCompleted || hasWorkout,
    cardioCompleted: baseHabit.cardioCompleted || hasCardio,

    proteinTargetAchieved:
      baseHabit.proteinTargetAchieved ||
      Number(nutrition.protein || 0) >=
      Number(baseHabit.proteinTargetGrams || 0),

    waterCompleted:
      Number(baseHabit.waterIntakeLiters || 0) >=
      Number(baseHabit.waterTargetLiters || 0),

    stepsCompleted:
      Number(baseHabit.stepsCount || 0) >= Number(baseHabit.stepsTarget || 0),

    sleepAchieved:
      Number(baseHabit.sleepHours || 0) >=
      Number(baseHabit.sleepTargetHours || 0),
  };

  const dailyThreeTasks = {
    workoutOrWalkDone:
      syncedData.workoutCompleted ||
      syncedData.cardioCompleted ||
      Boolean(baseHabit.mobilityCompleted),

    nutritionTracked:
      syncedData.dietFollowed ||
      syncedData.proteinTargetAchieved ||
      meals.length > 0,

    careerActionDone:
      Boolean(baseHabit.studyCompleted) ||
      Boolean(baseHabit.personalDevelopmentCompleted),
  };

  dailyThreeTasks.success =
    dailyThreeTasks.workoutOrWalkDone &&
    dailyThreeTasks.nutritionTracked &&
    dailyThreeTasks.careerActionDone;

  const finalData = {
    ...syncedData,
    dailyThreeTasks,
  };

  finalData.completionPercentage = calculateHabitCompletion({
    ...baseHabit,
    ...finalData,
  });

  finalData.requiredTaskCompletionPercentage = Math.round(
    ([
      dailyThreeTasks.workoutOrWalkDone,
      dailyThreeTasks.nutritionTracked,
      dailyThreeTasks.careerActionDone,
    ].filter(Boolean).length /
      3) *
    100
  );

  return finalData;
};

// @desc    Create or update habit for a date
// @route   POST /api/habits
// @access  Private
const createOrUpdateHabit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const autoSync = req.body.autoSync === true || req.query.sync === "true";
    const habitData = applyDefaultTargets(filterAllowedFields(req.body), user);

    const { habit: existingHabit, start, end } = await findHabitByDate(
      req.user._id,
      habitData.date || new Date()
    );

    let habit;

    if (existingHabit) {
      habit = applyDataToHabit(existingHabit, habitData);
    } else {
      habit = new Habit({
        user: req.user._id,
        date: start,
        ...habitData,
      });
    }

    if (autoSync) {
      habit = await syncHabitWithDailyData(habit, req.user._id, start, end);
    }

    await habit.save();

    res.status(existingHabit ? 200 : 201).json({
      success: true,
      message: existingHabit
        ? "Habit updated successfully"
        : "Habit created successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      plan,
      dayType,
      minCompletion,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    if (startDate || endDate) {
      const { start } = getStartAndEndOfDate(startDate || new Date("1970-01-01"));
      const { end } = getStartAndEndOfDate(endDate || new Date());

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (plan) {
      query.plan = plan;
    }

    if (dayType) {
      query.dayType = dayType;
    }

    if (minCompletion !== undefined) {
      query.completionPercentage = {
        $gte: Number(minCompletion),
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [habits, total] = await Promise.all([
      Habit.find(query).sort({ date: -1 }).skip(skip).limit(limitNumber),
      Habit.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: habits.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      habits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's habit
// @route   GET /api/habits/today
// @access  Private
const getTodayHabit = async (req, res, next) => {
  try {
    const createIfMissing = req.query.create === "true";
    const autoSync = req.query.sync === "true";

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { start, end } = getStartAndEndOfDate(new Date());

    let habit = await Habit.findOne({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (!habit && !createIfMissing) {
      return res.status(200).json({
        success: true,
        habit: null,
      });
    }

    const defaultData = applyDefaultTargets(
      {
        user: req.user._id,
        date: start,
      },
      user
    );

    let updateData = {};

    if (autoSync) {
      updateData = await buildSyncedHabitData(habit, req.user._id, start, end);
    }

    habit = await Habit.findOneAndUpdate(
      {
        user: req.user._id,
        date: {
          $gte: start,
          $lte: end,
        },
      },
      {
        $setOnInsert: defaultData,
        $set: updateData,
      },
      {
        new: true,
        upsert: createIfMissing,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit by date
// @route   GET /api/habits/date/:date
// @access  Private
const getHabitByDate = async (req, res, next) => {
  try {
    const { habit } = await findHabitByDate(req.user._id, req.params.date);

    res.status(200).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync today's habit with meals and workouts
// @route   PATCH /api/habits/sync-today
// @access  Private
const syncTodayHabit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { habit: existingHabit, start, end } = await findHabitByDate(
      req.user._id,
      new Date()
    );

    const defaultData = applyDefaultTargets(
      {
        user: req.user._id,
        date: start,
      },
      user
    );

    const syncedData = await buildSyncedHabitData(
      existingHabit,
      req.user._id,
      start,
      end
    );

    const habit = await Habit.findOneAndUpdate(
      {
        user: req.user._id,
        date: {
          $gte: start,
          $lte: end,
        },
      },
      {
        $setOnInsert: defaultData,
        $set: syncedData,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Today's habit synced successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit summary
// @route   GET /api/habits/summary
// @access  Private
const getHabitSummary = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);

    const todayStart = getStartAndEndOfDate().start;
    const startDate = addDays(todayStart, -(days - 1));

    const habits = await Habit.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: getStartAndEndOfDate().end,
      },
    }).sort({ date: 1 });

    if (habits.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalDaysTracked: 0,
          averageCompletion: 0,
          currentStreak: 0,
          bestStreak: 0,
          dailyThreeTaskSuccessDays: 0,
          proteinTargetDays: 0,
          waterTargetDays: 0,
          sleepTargetDays: 0,
          workoutDays: 0,
          noLateNightScrollingDays: 0,
        },
        charts: {
          daily: [],
        },
      });
    }

    const totalCompletion = habits.reduce(
      (sum, habit) => sum + Number(habit.completionPercentage || 0),
      0
    );

    const averageCompletion = Math.round(totalCompletion / habits.length);

    const habitMap = new Map();

    habits.forEach((habit) => {
      habitMap.set(getDateKey(habit.date), habit);
    });

    let bestStreak = 0;
    let temporaryStreak = 0;

    for (let i = 0; i < days; i += 1) {
      const date = addDays(startDate, i);
      const habit = habitMap.get(getDateKey(date));

      if (habit && Number(habit.completionPercentage || 0) >= 70) {
        temporaryStreak += 1;
        bestStreak = Math.max(bestStreak, temporaryStreak);
      } else {
        temporaryStreak = 0;
      }
    }

    let currentStreak = 0;
    let cursorDate = todayStart;

    const todayHabit = habitMap.get(getDateKey(todayStart));

    if (!todayHabit || Number(todayHabit.completionPercentage || 0) < 70) {
      cursorDate = addDays(todayStart, -1);
    }

    for (let i = 0; i < days; i += 1) {
      const habit = habitMap.get(getDateKey(cursorDate));

      if (habit && Number(habit.completionPercentage || 0) >= 70) {
        currentStreak += 1;
        cursorDate = addDays(cursorDate, -1);
      } else {
        break;
      }
    }

    const dailyThreeTaskSuccessDays = habits.filter((habit) =>
      typeof habit.isDailyThreeTaskSuccess === "function"
        ? habit.isDailyThreeTaskSuccess()
        : habit.dailyThreeTasks?.workoutOrWalkDone &&
        habit.dailyThreeTasks?.nutritionTracked &&
        habit.dailyThreeTasks?.careerActionDone
    ).length;

    const summary = {
      totalDaysTracked: habits.length,
      averageCompletion,
      currentStreak,
      bestStreak,

      dailyThreeTaskSuccessDays,
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
      prayerCompletedDays: habits.filter((habit) => habit.prayerCompleted)
        .length,
      noLateNightScrollingDays: habits.filter(
        (habit) => habit.noLateNightScrolling
      ).length,
      sleepShutdownDays: habits.filter((habit) => habit.sleepShutdownCompleted)
        .length,
    };

    const daily = habits.map((habit) => ({
      date: getDateKey(habit.date),
      completionPercentage: habit.completionPercentage,
      requiredTaskCompletionPercentage: habit.requiredTaskCompletionPercentage,
      caloriesIntake: habit.caloriesIntake,
      proteinIntakeGrams: habit.proteinIntakeGrams,
      waterIntakeLiters: habit.waterIntakeLiters,
      stepsCount: habit.stepsCount,
      sleepHours: habit.sleepHours,
      workoutCompleted: habit.workoutCompleted,
      cardioCompleted: habit.cardioCompleted,
      dietFollowed: habit.dietFollowed,
      proteinTargetAchieved: habit.proteinTargetAchieved,
      waterCompleted: habit.waterCompleted,
      sleepAchieved: habit.sleepAchieved,
      noLateNightScrolling: habit.noLateNightScrolling,
      sleepShutdownCompleted: habit.sleepShutdownCompleted,
      dailyThreeTasks: habit.dailyThreeTasks,
    }));

    res.status(200).json({
      success: true,
      summary,
      charts: {
        daily,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this habit");
    }

    res.status(200).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this habit");
    }

    const habitData = filterAllowedFields(req.body);

    applyDataToHabit(habit, habitData);

    if (req.query.sync === "true" || req.body.autoSync === true) {
      const { start, end } = getStartAndEndOfDate(habit.date);
      await syncHabitWithDailyData(habit, req.user._id, start, end);
    }

    await habit.save();

    res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle one fixed habit field
// @route   PATCH /api/habits/:id/toggle
// @access  Private
const toggleHabitField = async (req, res, next) => {
  try {
    const { field, value } = req.body;

    const allowedToggleFields = [
      "workoutCompleted",
      "cardioCompleted",
      "dietFollowed",
      "waterCompleted",
      "sleepAchieved",
      "prayerCompleted",
      "studyCompleted",
      "proteinTargetAchieved",
      "stepsCompleted",
      "personalDevelopmentCompleted",
      "noLateNightScrolling",
      "sleepShutdownCompleted",
      "mobilityCompleted",
      "weeklyCheckInCompleted",
    ];

    if (!allowedToggleFields.includes(field)) {
      res.status(400);
      throw new Error("Invalid habit field");
    }

    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this habit");
    }

    habit[field] = value !== undefined ? Boolean(value) : !habit[field];

    await habit.save();

    res.status(200).json({
      success: true,
      message: "Habit field updated successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark custom task complete
// @route   PATCH /api/habits/:id/tasks/:taskKey/complete
// @access  Private
const markHabitTaskComplete = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this habit");
    }

    habit.markTaskComplete(req.params.taskKey);

    await habit.save();

    res.status(200).json({
      success: true,
      message: "Habit task completed successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this habit");
    }

    await habit.deleteOne();

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateHabit,
  getHabits,
  getTodayHabit,
  getHabitByDate,
  syncTodayHabit,
  getHabitSummary,
  getHabitById,
  updateHabit,
  toggleHabitField,
  markHabitTaskComplete,
  deleteHabit,
};