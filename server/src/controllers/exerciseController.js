const Exercise = require("../models/Exercise");

// @desc    Create custom exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res, next) => {
  try {
    const {
      name,
      category,
      muscleGroup,
      equipment,
      difficulty,
      instructions,
      defaultSets,
      defaultReps,
      defaultRestTime,
    } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Exercise name is required");
    }

    const existingExercise = await Exercise.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      createdBy: req.user._id,
    });

    if (existingExercise) {
      res.status(400);
      throw new Error("You already created an exercise with this name");
    }

    const exercise = await Exercise.create({
      name,
      category,
      muscleGroup,
      equipment,
      difficulty,
      instructions,
      defaultSets,
      defaultReps,
      defaultRestTime,
      isCustom: true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res, next) => {
  try {
    const { search, category, muscleGroup, equipment, difficulty } = req.query;

    const query = {
      $or: [
        { isCustom: false },
        { createdBy: req.user._id },
      ],
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (muscleGroup) {
      query.muscleGroup = muscleGroup;
    }

    if (equipment) {
      query.equipment = equipment;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const exercises = await Exercise.find(query).sort({
      isCustom: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: exercises.length,
      exercises,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.id,
      $or: [
        { isCustom: false },
        { createdBy: req.user._id },
      ],
    });

    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found");
    }

    res.status(200).json({
      success: true,
      exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = async (req, res, next) => {
  try {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found");
    }

    if (!exercise.isCustom) {
      res.status(403);
      throw new Error("Default exercises cannot be edited");
    }

    if (exercise.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this exercise");
    }

    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found");
    }

    if (!exercise.isCustom) {
      res.status(403);
      throw new Error("Default exercises cannot be deleted");
    }

    if (exercise.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this exercise");
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
};