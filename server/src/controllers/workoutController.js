const Workout = require("../models/Workout");

// Simple beginner calorie estimation
const estimateCaloriesBurned = (duration, workoutType, cardioDuration) => {
  let caloriesPerMinute = 5;

  if (workoutType === "strength") caloriesPerMinute = 6;
  if (workoutType === "cardio") caloriesPerMinute = 8;
  if (workoutType === "mixed") caloriesPerMinute = 7;
  if (workoutType === "bodyweight") caloriesPerMinute = 5;

  const workoutCalories = Number(duration || 0) * caloriesPerMinute;
  const cardioCalories = Number(cardioDuration || 0) * 8;

  return Math.round(workoutCalories + cardioCalories);
};

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const {
      date,
      workoutName,
      workoutType,
      duration,
      exercises,
      cardioDuration,
      caloriesBurned,
      notes,
    } = req.body;

    if (!workoutName) {
      res.status(400);
      throw new Error("Workout name is required");
    }

    const finalCalories =
      caloriesBurned ||
      estimateCaloriesBurned(duration, workoutType, cardioDuration);

    const workout = await Workout.create({
      user: req.user._id,
      date,
      workoutName,
      workoutType,
      duration,
      exercises,
      cardioDuration,
      caloriesBurned: finalCalories,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workouts of logged-in user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this workout");
    }

    res.status(200).json({
      success: true,
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this workout");
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this workout");
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};