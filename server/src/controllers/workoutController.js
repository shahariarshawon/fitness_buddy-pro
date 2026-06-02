const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");
const User = require("../models/User");

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const getDateKey = (dateInput) => {
  return new Date(dateInput).toISOString().split("T")[0];
};

const getExerciseAccessQuery = (userId) => ({
  isActive: true,
  $or: [{ isCustom: false }, { createdBy: userId }],
});

const getMetValue = (category, cardioType, intensity) => {
  if (category === "mobility" || category === "stretching") return 2.5;
  if (category === "bodyweight") return 4;
  if (category === "strength") return 4.5;

  if (category === "cardio") {
    if (cardioType === "incline_walk") return 5.5;
    if (cardioType === "treadmill_walk") return 4;
    if (cardioType === "bike") return intensity === "hard" ? 8 : 6;
    if (cardioType === "elliptical") return intensity === "hard" ? 7 : 5.5;
    if (cardioType === "running") return 9;
    if (cardioType === "stairs") return 8;
    if (cardioType === "rowing") return 7;
    return 6;
  }

  return 4;
};

const estimateCalories = ({ metValue, bodyWeightKg, duration }) => {
  if (!metValue || !bodyWeightKg || !duration) return 0;

  return round((metValue * 3.5 * bodyWeightKg * duration) / 200);
};

const allowedWorkoutFields = [
  "plan",
  "planDay",
  "date",
  "workoutName",
  "workoutType",
  "sessionFocus",
  "source",
  "status",
  "duration",
  "warmupDuration",
  "coolDownDuration",
  "exercises",
  "cardioDuration",
  "cardio",
  "bodyWeightKg",
  "caloriesBurned",
  "safetyCheck",
  "notes",
  "tags",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedWorkoutFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const normalizeArrayFields = (data) => {
  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return data;
};

const getDefaultWorkoutTypeFromExercises = (exercises = []) => {
  const hasStrength = exercises.some((item) =>
    ["strength", "bodyweight"].includes(item.category)
  );

  const hasCardio = exercises.some((item) => item.category === "cardio");

  const hasMobility = exercises.some((item) =>
    ["mobility", "stretching"].includes(item.category)
  );

  if (hasStrength && hasCardio) return "mixed";
  if (hasCardio && !hasStrength) return "cardio";
  if (hasMobility && !hasStrength && !hasCardio) return "mobility";
  if (hasStrength) return "strength";

  return "other";
};

const buildSetLogsFromSimpleInput = (item) => {
  if (Array.isArray(item.setLogs) && item.setLogs.length > 0) {
    return item.setLogs;
  }

  const sets = Number(item.sets || item.targetSets || 0);
  const reps = Number(item.reps || item.targetRepsMax || 0);
  const weight = Number(item.weight || item.targetWeight || 0);

  if (!sets || !reps) return [];

  return Array.from({ length: sets }, (_, index) => ({
    setNumber: index + 1,
    targetRepsMin: Number(item.targetRepsMin || reps || 0),
    targetRepsMax: Number(item.targetRepsMax || reps || 0),
    reps,
    weight,
    weightUnit: item.weightUnit || "kg",
    rpe: item.rpe || null,
    completed: true,
  }));
};

const buildWorkoutExerciseFromInput = async ({ item, userId, bodyWeightKg }) => {
  const exerciseId = item.exercise || item.exerciseId || null;

  let exerciseFromLibrary = null;

  if (exerciseId) {
    exerciseFromLibrary = await Exercise.findOne({
      _id: exerciseId,
      ...getExerciseAccessQuery(userId),
    });

    if (!exerciseFromLibrary) {
      throw new Error(`Exercise not found: ${exerciseId}`);
    }
  }

  const category =
    item.category || exerciseFromLibrary?.category || "strength";

  const name = item.name || exerciseFromLibrary?.name;

  if (!name) {
    throw new Error("Exercise name is required");
  }

  const baseExercise = {
    exercise: exerciseFromLibrary?._id || null,
    name,
    category,
    muscleGroup: item.muscleGroup || exerciseFromLibrary?.muscleGroup || "other",
    equipment: item.equipment || exerciseFromLibrary?.equipment || "none",

    notes: item.notes || "",
    completed: item.completed !== undefined ? Boolean(item.completed) : true,
    skipped: Boolean(item.skipped),
    skipReason: item.skipReason || "",
    painReported: Boolean(item.painReported),
    painArea: item.painArea || "",
    formQuality: item.formQuality || "",
  };

  /**
   * Strength/bodyweight = set, reps, weight.
   */
  if (category === "strength" || category === "bodyweight") {
    const sets = Number(
      item.sets || item.targetSets || exerciseFromLibrary?.defaultSets || 3
    );

    const reps = Number(
      item.reps ||
        item.targetRepsMax ||
        exerciseFromLibrary?.defaultReps ||
        10
    );

    const targetRepsMin = Number(
      item.targetRepsMin || exerciseFromLibrary?.defaultRepsMin || reps
    );

    const targetRepsMax = Number(
      item.targetRepsMax || exerciseFromLibrary?.defaultRepsMax || reps
    );

    return {
      ...baseExercise,

      sets,
      reps,
      weight: Number(item.weight || item.targetWeight || 0),
      weightUnit: item.weightUnit || "kg",
      restTime: Number(
        item.restTime ||
          item.targetRestTime ||
          exerciseFromLibrary?.defaultRestTime ||
          60
      ),

      targetSets: Number(item.targetSets || sets),
      targetRepsMin,
      targetRepsMax,
      targetWeight: Number(item.targetWeight || item.weight || 0),
      targetRestTime: Number(
        item.targetRestTime ||
          item.restTime ||
          exerciseFromLibrary?.defaultRestTime ||
          60
      ),

      setLogs: buildSetLogsFromSimpleInput({
        ...item,
        sets,
        reps,
        targetRepsMin,
        targetRepsMax,
      }),

      duration: Number(item.duration || 0),
      distance: 0,
      distanceUnit: "",
      incline: 0,
      averageSpeed: 0,
      intensity: item.intensity || "",
      metValue: Number(item.metValue || exerciseFromLibrary?.calorieMetValue || 4.5),
      caloriesBurned: Number(item.caloriesBurned || 0),
    };
  }

  /**
   * Cardio = duration, distance, speed, incline, intensity.
   * No set/reps required.
   */
  if (category === "cardio") {
    const duration = Number(
      item.duration ||
        item.cardioDuration ||
        exerciseFromLibrary?.defaultDurationMinutes ||
        0
    );

    const cardioType = item.cardioType || item.name || "other";
    const intensity = item.intensity || "moderate";
    const metValue = Number(
      item.metValue ||
        exerciseFromLibrary?.calorieMetValue ||
        getMetValue("cardio", cardioType, intensity)
    );

    const caloriesBurned =
      Number(item.caloriesBurned || 0) ||
      estimateCalories({
        metValue,
        bodyWeightKg,
        duration,
      });

    return {
      ...baseExercise,

      sets: 0,
      reps: 0,
      weight: 0,
      restTime: 0,

      targetSets: 0,
      targetRepsMin: 0,
      targetRepsMax: 0,
      targetWeight: 0,
      targetRestTime: 0,
      setLogs: [],

      duration,
      distance: Number(item.distance || 0),
      distanceUnit: item.distanceUnit || "km",
      incline: Number(item.incline || 0),
      averageSpeed: Number(item.averageSpeed || 0),
      intensity,
      metValue,
      caloriesBurned,
    };
  }

  /**
   * Mobility/stretching = duration, rounds, hold time.
   * No weight required.
   */
  if (category === "mobility" || category === "stretching") {
    const duration = Number(
      item.duration || exerciseFromLibrary?.defaultDurationMinutes || 0
    );

    return {
      ...baseExercise,

      sets: Number(item.sets || item.rounds || 1),
      reps: Number(item.reps || 0),
      weight: 0,
      restTime: Number(item.restTime || 0),

      targetSets: Number(item.targetSets || item.sets || item.rounds || 1),
      targetRepsMin: 0,
      targetRepsMax: 0,
      targetWeight: 0,
      targetRestTime: 0,
      setLogs: [],

      duration,
      distance: 0,
      distanceUnit: "",
      incline: 0,
      averageSpeed: 0,
      intensity: item.intensity || "easy",
      metValue: Number(item.metValue || 2.5),
      caloriesBurned:
        Number(item.caloriesBurned || 0) ||
        estimateCalories({
          metValue: Number(item.metValue || 2.5),
          bodyWeightKg,
          duration,
        }),
    };
  }

  /**
   * Fallback.
   */
  return {
    ...baseExercise,
    sets: Number(item.sets || 0),
    reps: Number(item.reps || 0),
    weight: Number(item.weight || 0),
    restTime: Number(item.restTime || 0),
    targetSets: Number(item.targetSets || item.sets || 0),
    targetRepsMin: Number(item.targetRepsMin || 0),
    targetRepsMax: Number(item.targetRepsMax || item.reps || 0),
    targetWeight: Number(item.targetWeight || item.weight || 0),
    targetRestTime: Number(item.targetRestTime || item.restTime || 0),
    setLogs: buildSetLogsFromSimpleInput(item),
    duration: Number(item.duration || 0),
    distance: Number(item.distance || 0),
    distanceUnit: item.distanceUnit || "",
    incline: Number(item.incline || 0),
    averageSpeed: Number(item.averageSpeed || 0),
    intensity: item.intensity || "",
    metValue: Number(item.metValue || 3.5),
    caloriesBurned: Number(item.caloriesBurned || 0),
  };
};

const buildWorkoutExercises = async ({ exercises = [], userId, bodyWeightKg }) => {
  if (!Array.isArray(exercises)) return [];

  const builtExercises = [];

  for (const item of exercises) {
    const builtExercise = await buildWorkoutExerciseFromInput({
      item,
      userId,
      bodyWeightKg,
    });

    builtExercises.push(builtExercise);
  }

  return builtExercises;
};

const buildCardioSummary = (exercises = [], topLevelCardio = {}) => {
  const cardioExercises = exercises.filter((item) => item.category === "cardio");

  const cardioDurationFromExercises = cardioExercises.reduce(
    (sum, item) => sum + Number(item.duration || 0),
    0
  );

  const caloriesFromExercises = cardioExercises.reduce(
    (sum, item) => sum + Number(item.caloriesBurned || 0),
    0
  );

  if (topLevelCardio && Number(topLevelCardio.duration || 0) > 0) {
    return {
      ...topLevelCardio,
      duration: Number(topLevelCardio.duration || 0),
      caloriesBurned: Number(topLevelCardio.caloriesBurned || 0),
      completed: topLevelCardio.completed !== false,
    };
  }

  if (!cardioExercises.length) {
    return topLevelCardio || {};
  }

  return {
    cardioType:
      cardioExercises.length === 1
        ? cardioExercises[0].name
        : "mixed_cardio",
    duration: cardioDurationFromExercises,
    caloriesBurned: caloriesFromExercises,
    completed: cardioDurationFromExercises > 0,
    notes: "Auto-generated from cardio exercises",
  };
};

const calculateTotalDuration = ({ duration, warmupDuration, coolDownDuration, exercises, cardio }) => {
  if (duration && Number(duration) > 0) return Number(duration);

  const exerciseDuration = exercises.reduce(
    (sum, item) => sum + Number(item.duration || 0),
    0
  );

  const cardioDuration = Number(cardio?.duration || 0);

  return (
    Number(warmupDuration || 0) +
    Number(coolDownDuration || 0) +
    Math.max(exerciseDuration, cardioDuration)
  );
};

const applyDataToWorkout = (workout, workoutData) => {
  Object.keys(workoutData).forEach((key) => {
    if (workoutData[key] !== undefined) {
      workout.set(key, workoutData[key]);
    }
  });

  return workout;
};

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    if (!req.body.workoutName) {
      res.status(400);
      throw new Error("Workout name is required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let workoutData = normalizeArrayFields(filterAllowedFields(req.body));

    const bodyWeightKg =
      Number(workoutData.bodyWeightKg || user.currentWeight || user.startingWeight || 0);

    const builtExercises = await buildWorkoutExercises({
      exercises: workoutData.exercises || [],
      userId: req.user._id,
      bodyWeightKg,
    });

    const cardio = buildCardioSummary(builtExercises, workoutData.cardio || {});

    const workoutType =
      workoutData.workoutType || getDefaultWorkoutTypeFromExercises(builtExercises);

    const duration = calculateTotalDuration({
      duration: workoutData.duration,
      warmupDuration: workoutData.warmupDuration,
      coolDownDuration: workoutData.coolDownDuration,
      exercises: builtExercises,
      cardio,
    });

    const workout = new Workout({
      user: req.user._id,
      ...workoutData,
      workoutType,
      duration,
      exercises: builtExercises,
      cardio,
      cardioDuration: Number(cardio.duration || workoutData.cardioDuration || 0),
      bodyWeightKg,
      caloriesBurned: workoutData.caloriesBurned || 0,
    });

    await workout.save();

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
    const {
      date,
      startDate,
      endDate,
      workoutType,
      sessionFocus,
      status,
      plan,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    if (date) {
      const { start, end } = getStartAndEndOfDate(date);

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (startDate || endDate) {
      const { start } = getStartAndEndOfDate(startDate || new Date("1970-01-01"));
      const { end } = getStartAndEndOfDate(endDate || new Date());

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (workoutType) {
      query.workoutType = workoutType;
    }

    if (sessionFocus) {
      query.sessionFocus = sessionFocus;
    }

    if (status) {
      query.status = status;
    }

    if (plan) {
      query.plan = plan;
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [workouts, total] = await Promise.all([
      Workout.find(query)
        .populate("exercises.exercise", "name category muscleGroup equipment")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Workout.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's workouts
// @route   GET /api/workouts/today
// @access  Private
const getTodayWorkouts = async (req, res, next) => {
  try {
    const { start, end } = getStartAndEndOfDate();

    const workouts = await Workout.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("exercises.exercise", "name category muscleGroup equipment")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      date: getDateKey(start),
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Preview workout calculation before saving
// @route   POST /api/workouts/preview
// @access  Private
const previewWorkout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const bodyWeightKg = Number(
      req.body.bodyWeightKg || user.currentWeight || user.startingWeight || 0
    );

    const builtExercises = await buildWorkoutExercises({
      exercises: req.body.exercises || [],
      userId: req.user._id,
      bodyWeightKg,
    });

    const cardio = buildCardioSummary(builtExercises, req.body.cardio || {});

    const workout = new Workout({
      user: req.user._id,
      workoutName: req.body.workoutName || "Workout Preview",
      workoutType:
        req.body.workoutType || getDefaultWorkoutTypeFromExercises(builtExercises),
      duration: calculateTotalDuration({
        duration: req.body.duration,
        warmupDuration: req.body.warmupDuration,
        coolDownDuration: req.body.coolDownDuration,
        exercises: builtExercises,
        cardio,
      }),
      exercises: builtExercises,
      cardio,
      cardioDuration: Number(cardio.duration || 0),
      bodyWeightKg,
      caloriesBurned: req.body.caloriesBurned || 0,
    });

    await workout.validate();

    res.status(200).json({
      success: true,
      message: "Workout preview calculated successfully",
      preview: workout.getWorkoutSummary
        ? workout.getWorkoutSummary()
        : workout,
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic input fields based on exercise category
// @route   GET /api/workouts/fields?category=cardio
// @access  Private
const getWorkoutInputFields = async (req, res, next) => {
  try {
    const { category = "strength" } = req.query;

    const fieldsByCategory = {
      strength: {
        required: ["name", "sets", "reps"],
        optional: [
          "weight",
          "restTime",
          "targetRepsMin",
          "targetRepsMax",
          "rpe",
          "setLogs",
          "painReported",
          "formQuality",
          "notes",
        ],
        hidden: ["duration", "distance", "averageSpeed", "incline"],
      },

      bodyweight: {
        required: ["name", "sets", "reps"],
        optional: [
          "restTime",
          "targetRepsMin",
          "targetRepsMax",
          "rpe",
          "setLogs",
          "painReported",
          "formQuality",
          "notes",
        ],
        hidden: ["weight", "distance", "averageSpeed", "incline"],
      },

      cardio: {
        required: ["name", "duration"],
        optional: [
          "distance",
          "distanceUnit",
          "averageSpeed",
          "incline",
          "intensity",
          "metValue",
          "caloriesBurned",
          "painReported",
          "notes",
        ],
        hidden: ["sets", "reps", "weight", "restTime", "setLogs"],
      },

      mobility: {
        required: ["name", "duration"],
        optional: ["sets", "intensity", "painReported", "notes"],
        hidden: ["reps", "weight", "distance", "averageSpeed", "incline"],
      },

      stretching: {
        required: ["name", "duration"],
        optional: ["sets", "intensity", "painReported", "notes"],
        hidden: ["reps", "weight", "distance", "averageSpeed", "incline"],
      },

      other: {
        required: ["name"],
        optional: [
          "sets",
          "reps",
          "weight",
          "duration",
          "distance",
          "intensity",
          "notes",
        ],
        hidden: [],
      },
    };

    res.status(200).json({
      success: true,
      category,
      fields: fieldsByCategory[category] || fieldsByCategory.other,
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
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("exercises.exercise", "name category muscleGroup equipment difficulty");

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
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
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let workoutData = normalizeArrayFields(filterAllowedFields(req.body));

    if (req.body.exercises) {
      const bodyWeightKg = Number(
        workoutData.bodyWeightKg ||
          workout.bodyWeightKg ||
          user.currentWeight ||
          user.startingWeight ||
          0
      );

      const builtExercises = await buildWorkoutExercises({
        exercises: req.body.exercises || [],
        userId: req.user._id,
        bodyWeightKg,
      });

      const cardio = buildCardioSummary(builtExercises, workoutData.cardio || workout.cardio || {});

      workoutData.exercises = builtExercises;
      workoutData.cardio = cardio;
      workoutData.cardioDuration = Number(cardio.duration || 0);
      workoutData.bodyWeightKg = bodyWeightKg;

      workoutData.workoutType =
        workoutData.workoutType || getDefaultWorkoutTypeFromExercises(builtExercises);

      workoutData.duration = calculateTotalDuration({
        duration: workoutData.duration,
        warmupDuration: workoutData.warmupDuration || workout.warmupDuration,
        coolDownDuration: workoutData.coolDownDuration || workout.coolDownDuration,
        exercises: builtExercises,
        cardio,
      });
    }

    applyDataToWorkout(workout, workoutData);

    await workout.save();

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
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      res.status(404);
      throw new Error("Workout not found");
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

// @desc    Get daily workout summary
// @route   GET /api/workouts/summary/daily?date=2026-06-01
// @access  Private
const getDailyWorkoutSummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const { start, end } = getStartAndEndOfDate(date);

    const workouts = await Workout.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ createdAt: 1 });

    const summary = workouts.reduce(
      (total, workout) => {
        total.workoutCount += 1;
        total.duration += Number(workout.duration || 0);
        total.cardioDuration += Number(workout.cardioDuration || 0);
        total.caloriesBurned += Number(workout.caloriesBurned || 0);
        total.totalSets += Number(workout.totalSets || 0);
        total.totalReps += Number(workout.totalReps || 0);
        total.totalVolume += Number(workout.totalVolume || 0);

        if (workout.painReported) {
          total.painSessions += 1;
        }

        if (workout.completionPercentage >= 80) {
          total.completedWorkouts += 1;
        }

        return total;
      },
      {
        workoutCount: 0,
        completedWorkouts: 0,
        duration: 0,
        cardioDuration: 0,
        caloriesBurned: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        painSessions: 0,
      }
    );

    res.status(200).json({
      success: true,
      date: getDateKey(start),
      summary: {
        ...summary,
        duration: round(summary.duration),
        cardioDuration: round(summary.cardioDuration),
        caloriesBurned: round(summary.caloriesBurned),
        totalVolume: round(summary.totalVolume),
      },
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly workout summary
// @route   GET /api/workouts/summary/weekly?days=7
// @access  Private
const getWeeklyWorkoutSummary = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 30);

    const today = new Date();
    const { start: todayStart, end: todayEnd } = getStartAndEndOfDate(today);
    const startDate = addDays(todayStart, -(days - 1));

    const workouts = await Workout.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: todayEnd,
      },
    }).sort({ date: 1 });

    const daily = [];

    for (let i = 0; i < days; i += 1) {
      const day = addDays(startDate, i);
      const { start, end } = getStartAndEndOfDate(day);

      const dayWorkouts = workouts.filter(
        (workout) => workout.date >= start && workout.date <= end
      );

      const summary = dayWorkouts.reduce(
        (total, workout) => {
          total.workoutCount += 1;
          total.duration += Number(workout.duration || 0);
          total.cardioDuration += Number(workout.cardioDuration || 0);
          total.caloriesBurned += Number(workout.caloriesBurned || 0);
          total.totalVolume += Number(workout.totalVolume || 0);
          return total;
        },
        {
          workoutCount: 0,
          duration: 0,
          cardioDuration: 0,
          caloriesBurned: 0,
          totalVolume: 0,
        }
      );

      daily.push({
        date: getDateKey(day),
        ...summary,
        duration: round(summary.duration),
        cardioDuration: round(summary.cardioDuration),
        caloriesBurned: round(summary.caloriesBurned),
        totalVolume: round(summary.totalVolume),
      });
    }

    const summary = daily.reduce(
      (total, day) => {
        total.workoutCount += day.workoutCount;
        total.duration += day.duration;
        total.cardioDuration += day.cardioDuration;
        total.caloriesBurned += day.caloriesBurned;
        total.totalVolume += day.totalVolume;
        return total;
      },
      {
        workoutCount: 0,
        duration: 0,
        cardioDuration: 0,
        caloriesBurned: 0,
        totalVolume: 0,
      }
    );

    res.status(200).json({
      success: true,
      range: {
        startDate,
        endDate: todayEnd,
        days,
      },
      summary: {
        ...summary,
        duration: round(summary.duration),
        cardioDuration: round(summary.cardioDuration),
        caloriesBurned: round(summary.caloriesBurned),
        totalVolume: round(summary.totalVolume),
      },
      daily,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getTodayWorkouts,
  previewWorkout,
  getWorkoutInputFields,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getDailyWorkoutSummary,
  getWeeklyWorkoutSummary,
};