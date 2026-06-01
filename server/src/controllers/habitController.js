const Habit = require("../models/Habit");

const habitFields = [
  "workoutCompleted",
  "cardioCompleted",
  "dietFollowed",
  "waterCompleted",
  "sleepAchieved",
  "prayerCompleted",
  "studyCompleted",
  "proteinTargetAchieved",
];

const calculateCompletionPercentage = (habitData) => {
  const completedCount = habitFields.filter((field) => habitData[field]).length;
  return Math.round((completedCount / habitFields.length) * 100);
};

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// @desc    Create or update habit for a date
// @route   POST /api/habits
// @access  Private
const createOrUpdateHabit = async (req, res, next) => {
  try {
    const {
      date,
      workoutCompleted,
      cardioCompleted,
      dietFollowed,
      waterCompleted,
      sleepAchieved,
      prayerCompleted,
      studyCompleted,
      proteinTargetAchieved,
      notes,
    } = req.body;

    const { start, end } = getStartAndEndOfDate(date);

    const habitData = {
      workoutCompleted: Boolean(workoutCompleted),
      cardioCompleted: Boolean(cardioCompleted),
      dietFollowed: Boolean(dietFollowed),
      waterCompleted: Boolean(waterCompleted),
      sleepAchieved: Boolean(sleepAchieved),
      prayerCompleted: Boolean(prayerCompleted),
      studyCompleted: Boolean(studyCompleted),
      proteinTargetAchieved: Boolean(proteinTargetAchieved),
      notes: notes || "",
    };

    habitData.completionPercentage = calculateCompletionPercentage(habitData);

    let habit = await Habit.findOne({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (habit) {
      habit = await Habit.findByIdAndUpdate(habit._id, habitData, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: "Habit updated successfully",
        habit,
      });
    }

    habit = await Habit.create({
      user: req.user._id,
      date: start,
      ...habitData,
    });

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
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
    const habits = await Habit.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      count: habits.length,
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
    const { start, end } = getStartAndEndOfDate();

    const habit = await Habit.findOne({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      success: true,
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
    const habits = await Habit.find({ user: req.user._id }).sort({
      date: -1,
    });

    if (habits.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalDaysTracked: 0,
          averageCompletion: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      });
    }

    const totalCompletion = habits.reduce(
      (sum, habit) => sum + habit.completionPercentage,
      0
    );

    const averageCompletion = Math.round(totalCompletion / habits.length);

    const sortedOldestFirst = [...habits].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let bestStreak = 0;
    let temporaryStreak = 0;

    sortedOldestFirst.forEach((habit) => {
      if (habit.completionPercentage >= 70) {
        temporaryStreak += 1;
        bestStreak = Math.max(bestStreak, temporaryStreak);
      } else {
        temporaryStreak = 0;
      }
    });

    const sortedNewestFirst = [...habits].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    let currentStreak = 0;

    for (const habit of sortedNewestFirst) {
      if (habit.completionPercentage >= 70) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        totalDaysTracked: habits.length,
        averageCompletion,
        currentStreak,
        bestStreak,
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
    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error("Habit not found");
    }

    if (habit.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this habit");
    }

    const updateData = {
      ...req.body,
    };

    updateData.completionPercentage =
      calculateCompletionPercentage(updateData);

    habit = await Habit.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Habit updated successfully",
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
  getHabitSummary,
  getHabitById,
  updateHabit,
  deleteHabit,
};