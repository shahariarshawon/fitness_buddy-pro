const Exercise = require("../models/Exercise");

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAccessQuery = (userId) => ({
  isActive: true,
  $or: [{ isCustom: false }, { createdBy: userId }],
});

const allowedExerciseFields = [
  "name",
  "category",
  "muscleGroup",
  "secondaryMuscleGroups",
  "equipment",
  "difficulty",
  "movementPattern",
  "exerciseType",
  "instructions",
  "formTips",
  "commonMistakes",
  "safetyNotes",
  "avoidIf",
  "replacementExercises",
  "defaultSets",
  "defaultReps",
  "defaultRepsMin",
  "defaultRepsMax",
  "defaultDurationMinutes",
  "defaultRestTime",
  "defaultRpeMin",
  "defaultRpeMax",
  "progressionType",
  "progressionIncrement",
  "calorieMetValue",
  "isLowImpact",
  "isJointFriendly",
  "isRecommendedForObesity",
  "tags",
  "videoUrl",
  "imageUrl",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedExerciseFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const normalizeArrayFields = (data) => {
  const arrayFields = [
    "secondaryMuscleGroups",
    "instructions",
    "formTips",
    "commonMistakes",
    "safetyNotes",
    "avoidIf",
    "tags",
  ];

  arrayFields.forEach((field) => {
    if (typeof data[field] === "string") {
      data[field] = data[field]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  return data;
};

// @desc    Create custom exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res, next) => {
  try {
    let exerciseData = filterAllowedFields(req.body);
    exerciseData = normalizeArrayFields(exerciseData);

    if (!exerciseData.name) {
      res.status(400);
      throw new Error("Exercise name is required");
    }

    const escapedName = escapeRegex(exerciseData.name.trim());

    const existingExercise = await Exercise.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
      isActive: true,
      $or: [{ isCustom: false }, { createdBy: req.user._id }],
    });

    if (existingExercise) {
      res.status(400);
      throw new Error("An exercise with this name already exists");
    }

    const exercise = await Exercise.create({
      ...exerciseData,
      isCustom: true,
      createdBy: req.user._id,
      isActive: true,
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
    const {
      search,
      category,
      muscleGroup,
      equipment,
      difficulty,
      movementPattern,
      exerciseType,
      progressionType,
      isLowImpact,
      isJointFriendly,
      isRecommendedForObesity,
      tag,
      page = 1,
      limit = 50,
      sort = "name",
    } = req.query;

    const query = getAccessQuery(req.user._id);

    if (search) {
      const safeSearch = escapeRegex(search);

      query.$and = [
        {
          $or: [
            { name: { $regex: safeSearch, $options: "i" } },
            { instructions: { $regex: safeSearch, $options: "i" } },
            { formTips: { $regex: safeSearch, $options: "i" } },
            { tags: { $regex: safeSearch, $options: "i" } },
          ],
        },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (muscleGroup) {
      query.$or = query.$or || [{ isCustom: false }, { createdBy: req.user._id }];
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { muscleGroup },
          { secondaryMuscleGroups: muscleGroup },
        ],
      });
    }

    if (equipment) {
      query.equipment = equipment;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (movementPattern) {
      query.movementPattern = movementPattern;
    }

    if (exerciseType) {
      query.exerciseType = exerciseType;
    }

    if (progressionType) {
      query.progressionType = progressionType;
    }

    if (isLowImpact !== undefined) {
      query.isLowImpact = isLowImpact === "true";
    }

    if (isJointFriendly !== undefined) {
      query.isJointFriendly = isJointFriendly === "true";
    }

    if (isRecommendedForObesity !== undefined) {
      query.isRecommendedForObesity = isRecommendedForObesity === "true";
    }

    if (tag) {
      query.tags = tag;
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions = {
      name: { isCustom: 1, name: 1 },
      newest: { createdAt: -1 },
      difficulty: { difficulty: 1, name: 1 },
      muscleGroup: { muscleGroup: 1, name: 1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.name;

    const [exercises, total] = await Promise.all([
      Exercise.find(query)
        .populate("replacementExercises.exercise", "name category muscleGroup equipment")
        .sort(selectedSort)
        .skip(skip)
        .limit(limitNumber),

      Exercise.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
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
      ...getAccessQuery(req.user._id),
    }).populate("replacementExercises.exercise", "name category muscleGroup equipment difficulty");

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
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise || !exercise.isActive) {
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

    let updateData = filterAllowedFields(req.body);
    updateData = normalizeArrayFields(updateData);

    if (updateData.name) {
      const escapedName = escapeRegex(updateData.name.trim());

      const duplicateExercise = await Exercise.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${escapedName}$`, $options: "i" },
        isActive: true,
        $or: [{ isCustom: false }, { createdBy: req.user._id }],
      });

      if (duplicateExercise) {
        res.status(400);
        throw new Error("An exercise with this name already exists");
      }
    }

    Object.keys(updateData).forEach((key) => {
      exercise[key] = updateData[key];
    });

    const updatedExercise = await exercise.save();

    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      exercise: updatedExercise,
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

    if (!exercise || !exercise.isActive) {
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

    /**
     * Soft delete is better than deleteOne()
     * because old workouts may still reference this exercise.
     */
    exercise.isActive = false;
    await exercise.save();

    res.status(200).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exercise filters/options
// @route   GET /api/exercises/meta/filters
// @access  Private
const getExerciseFilters = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      filters: {
        categories: ["strength", "cardio", "bodyweight", "mobility", "stretching", "other"],

        muscleGroups: [
          "chest",
          "back",
          "shoulders",
          "arms",
          "biceps",
          "triceps",
          "legs",
          "quads",
          "hamstrings",
          "glutes",
          "calves",
          "core",
          "full_body",
          "cardio",
          "mobility",
          "other",
        ],

        equipment: [
          "barbell",
          "dumbbell",
          "machine",
          "cable",
          "bodyweight",
          "kettlebell",
          "resistance_band",
          "cardio_machine",
          "smith_machine",
          "leg_press_machine",
          "bench",
          "mat",
          "none",
          "other",
        ],

        difficulties: ["beginner", "intermediate", "advanced"],

        movementPatterns: [
          "push",
          "pull",
          "squat",
          "hinge",
          "lunge",
          "carry",
          "rotation",
          "anti_rotation",
          "core_stability",
          "cardio",
          "mobility",
          "other",
        ],

        exerciseTypes: ["compound", "isolation", "cardio", "core", "mobility", "other"],

        progressionTypes: ["weight", "reps", "duration", "distance", "sets", "none"],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended exercises based on safety and goal
// @route   GET /api/exercises/recommendations
// @access  Private
const getRecommendedExercises = async (req, res, next) => {
  try {
    const {
      goal = "fat_loss",
      muscleGroup,
      lowImpact = "true",
      jointFriendly = "true",
      obesityFriendly,
      difficulty = "beginner",
      limit = 20,
    } = req.query;

    const query = getAccessQuery(req.user._id);

    query.difficulty = difficulty;

    if (muscleGroup) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { muscleGroup },
          { secondaryMuscleGroups: muscleGroup },
        ],
      });
    }

    if (lowImpact === "true") {
      query.isLowImpact = true;
    }

    if (jointFriendly === "true") {
      query.isJointFriendly = true;
    }

    if (obesityFriendly === "true") {
      query.isRecommendedForObesity = true;
    }

    if (goal) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { tags: goal },
          { tags: "fat_loss" },
          { isRecommendedForObesity: true },
          { isJointFriendly: true },
        ],
      });
    }

    const exercises = await Exercise.find(query)
      .sort({
        isRecommendedForObesity: -1,
        isJointFriendly: -1,
        isLowImpact: -1,
        name: 1,
      })
      .limit(Math.min(Number(limit), 50));

    res.status(200).json({
      success: true,
      count: exercises.length,
      exercises,
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
  getExerciseFilters,
  getRecommendedExercises,
};