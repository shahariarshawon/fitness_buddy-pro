const Progress = require("../models/Progress");
const User = require("../models/User");
const ProgressPhoto = require("../models/ProgressPhoto");

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
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
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

const allowedProgressFields = [
  "plan",
  "planDay",
  "date",

  "weight",
  "weightUnit",

  "waist",
  "chest",
  "arm",
  "thigh",
  "hip",
  "neck",
  "shoulder",
  "calf",
  "measurementUnit",
  "measurements",

  "bodyFatPercentage",
  "heightCm",
  "bmi",

  "weekNumber",
  "checkInType",
  "isWeeklyCheckIn",
  "isStartMeasurement",
  "isFinalMeasurement",

  "averageSteps",
  "workoutsCompleted",
  "proteinDays",
  "sleepRating",
  "energyRating",
  "moodRating",

  "photos",
  "progressStatus",
  "notes",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedProgressFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const applyDataToProgress = (progress, progressData) => {
  Object.keys(progressData).forEach((key) => {
    if (progressData[key] !== undefined) {
      progress.set(key, progressData[key]);
    }
  });

  return progress;
};

const findProgressByDate = async (userId, dateInput) => {
  const { start, end } = getStartAndEndOfDate(dateInput);

  const progress = await Progress.findOne({
    user: userId,
    date: {
      $gte: start,
      $lte: end,
    },
  });

  return { progress, start, end };
};

const updateUserBodyData = async (userId, progress) => {
  const user = await User.findById(userId);

  if (!user) return;

  if (progress.weight) {
    user.currentWeight = progress.weight;
  }

  if (!user.startingWeight && progress.weight) {
    user.startingWeight = progress.weight;
  }

  if (progress.heightCm && !user.height) {
    user.height = progress.heightCm;
  }

  await user.save();
};

const calculateProgressStatus = ({ latestProgress, firstProgress }) => {
  if (!latestProgress || !firstProgress) return "";

  const weightChange = calculateChange(
    latestProgress.weight,
    firstProgress.weight
  );

  const waistChange = calculateChange(latestProgress.waist, firstProgress.waist);

  if (weightChange <= -2 || waistChange <= -2) {
    return "excellent";
  }

  if (weightChange < 0 || waistChange < 0) {
    return "on_track";
  }

  if (weightChange === 0 && waistChange === 0) {
    return "plateau";
  }

  return "needs_adjustment";
};

const buildProgressChanges = (latestProgress, firstProgress) => {
  return {
    weightChange: calculateChange(latestProgress?.weight, firstProgress?.weight),
    waistChange: calculateChange(latestProgress?.waist, firstProgress?.waist),
    chestChange: calculateChange(latestProgress?.chest, firstProgress?.chest),
    armChange: calculateChange(latestProgress?.arm, firstProgress?.arm),
    thighChange: calculateChange(latestProgress?.thigh, firstProgress?.thigh),
    hipChange: calculateChange(latestProgress?.hip, firstProgress?.hip),
    neckChange: calculateChange(latestProgress?.neck, firstProgress?.neck),
    shoulderChange: calculateChange(
      latestProgress?.shoulder,
      firstProgress?.shoulder
    ),
    calfChange: calculateChange(latestProgress?.calf, firstProgress?.calf),
    bodyFatChange: calculateChange(
      latestProgress?.bodyFatPercentage,
      firstProgress?.bodyFatPercentage
    ),
    bmiChange: calculateChange(latestProgress?.bmi, firstProgress?.bmi),
  };
};

const attachPhotosToProgress = async ({ progress, userId, photoIds = {} }) => {
  const photoFields = [
    { key: "frontPhoto", type: "front" },
    { key: "sidePhoto", type: "side" },
    { key: "backPhoto", type: "back" },
  ];

  for (const field of photoFields) {
    const photoId = photoIds[field.key];

    if (!photoId) continue;

    const photo = await ProgressPhoto.findOne({
      _id: photoId,
      user: userId,
      isActive: true,
    });

    if (!photo) continue;

    photo.progress = progress._id;
    photo.photoType = field.type;

    if (progress.plan) {
      photo.plan = progress.plan;
    }

    if (progress.planDay) {
      photo.planDay = progress.planDay;
    }

    if (progress.weekNumber) {
      photo.weekNumber = progress.weekNumber;
    }

    photo.checkInType = progress.checkInType;

    await photo.save();

    progress.photos[field.key] = photo._id;
  }

  return progress;
};

// @desc    Create or update progress for a date
// @route   POST /api/progress
// @access  Private
const createOrUpdateProgress = async (req, res, next) => {
  try {
    const progressData = filterAllowedFields(req.body);

    if (!progressData.weight) {
      res.status(400);
      throw new Error("Body weight is required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!progressData.heightCm && user.height) {
      progressData.heightCm = user.height;
    }

    const { progress: existingProgress, start } = await findProgressByDate(
      req.user._id,
      progressData.date || new Date()
    );

    let progress;

    if (existingProgress) {
      progress = applyDataToProgress(existingProgress, progressData);
    } else {
      progress = new Progress({
        user: req.user._id,
        date: start,
        ...progressData,
      });
    }

    if (req.body.photoIds) {
      progress = await attachPhotosToProgress({
        progress,
        userId: req.user._id,
        photoIds: req.body.photoIds,
      });
    }

    await progress.save();

    await updateUserBodyData(req.user._id, progress);

    res.status(existingProgress ? 200 : 201).json({
      success: true,
      message: existingProgress
        ? "Progress updated successfully"
        : "Progress created successfully",
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all progress logs
// @route   GET /api/progress
// @access  Private
const getProgressLogs = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      plan,
      checkInType,
      isWeeklyCheckIn,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    if (startDate || endDate) {
      const { start } = getStartAndEndOfDate(
        startDate || new Date("1970-01-01")
      );
      const { end } = getStartAndEndOfDate(endDate || new Date());

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (plan) {
      query.plan = plan;
    }

    if (checkInType) {
      query.checkInType = checkInType;
    }

    if (isWeeklyCheckIn !== undefined) {
      query.isWeeklyCheckIn = isWeeklyCheckIn === "true";
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [progressLogs, total] = await Promise.all([
      Progress.find(query)
        .populate("photos.frontPhoto photos.sidePhoto photos.backPhoto")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNumber),

      Progress.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: progressLogs.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      progressLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest progress
// @route   GET /api/progress/latest
// @access  Private
const getLatestProgress = async (req, res, next) => {
  try {
    const latestProgress = await Progress.findOne({
      user: req.user._id,
    })
      .populate("photos.frontPhoto photos.sidePhoto photos.backPhoto")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      progress: latestProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress by date
// @route   GET /api/progress/date/:date
// @access  Private
const getProgressByDate = async (req, res, next) => {
  try {
    const { progress } = await findProgressByDate(
      req.user._id,
      req.params.date
    );

    if (progress) {
      await progress.populate("photos.frontPhoto photos.sidePhoto photos.backPhoto");
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress summary
// @route   GET /api/progress/summary
// @access  Private
const getProgressSummary = async (req, res, next) => {
  try {
    const { plan, days } = req.query;

    const query = {
      user: req.user._id,
    };

    if (plan) {
      query.plan = plan;
    }

    if (days) {
      const today = new Date();
      const { start } = getStartAndEndOfDate(
        addDays(today, -(Number(days) - 1))
      );
      const { end } = getStartAndEndOfDate(today);

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    const progressLogs = await Progress.find(query)
      .populate("photos.frontPhoto photos.sidePhoto photos.backPhoto")
      .sort({ date: 1 });

    if (progressLogs.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalLogs: 0,
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
          progressStatus: "",
        },
        charts: {
          progress: [],
        },
      });
    }

    const firstProgress =
      progressLogs.find((item) => item.isStartMeasurement) || progressLogs[0];

    const latestProgress =
      progressLogs.find((item) => item.isFinalMeasurement) ||
      progressLogs[progressLogs.length - 1];

    const changes = buildProgressChanges(latestProgress, firstProgress);

    const progressStatus = calculateProgressStatus({
      latestProgress,
      firstProgress,
    });

    const charts = progressLogs.map((item) => ({
      date: getDateKey(item.date),
      weight: item.weight,
      waist: item.waist,
      chest: item.chest,
      arm: item.arm,
      thigh: item.thigh,
      hip: item.hip,
      neck: item.neck,
      shoulder: item.shoulder,
      calf: item.calf,
      bodyFatPercentage: item.bodyFatPercentage,
      bmi: item.bmi,
      checkInType: item.checkInType,
      weekNumber: item.weekNumber,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalLogs: progressLogs.length,
        firstProgress,
        latestProgress,
        changes,
        progressStatus,
      },
      charts: {
        progress: charts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly check-ins
// @route   GET /api/progress/checkins/weekly
// @access  Private
const getWeeklyCheckIns = async (req, res, next) => {
  try {
    const { plan } = req.query;

    const query = {
      user: req.user._id,
      $or: [{ isWeeklyCheckIn: true }, { checkInType: "weekly" }],
    };

    if (plan) {
      query.plan = plan;
    }

    const checkIns = await Progress.find(query)
      .populate("photos.frontPhoto photos.sidePhoto photos.backPhoto")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: checkIns.length,
      checkIns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create weekly check-in
// @route   POST /api/progress/checkins/weekly
// @access  Private
const createWeeklyCheckIn = async (req, res, next) => {
  try {
    const checkInData = {
      ...filterAllowedFields(req.body),
      isWeeklyCheckIn: true,
      checkInType: "weekly",
    };

    if (!checkInData.weight) {
      res.status(400);
      throw new Error("Body weight is required for weekly check-in");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!checkInData.heightCm && user.height) {
      checkInData.heightCm = user.height;
    }

    const { progress: existingProgress, start } = await findProgressByDate(
      req.user._id,
      checkInData.date || new Date()
    );

    let progress;

    if (existingProgress) {
      progress = applyDataToProgress(existingProgress, checkInData);
    } else {
      progress = new Progress({
        user: req.user._id,
        date: start,
        ...checkInData,
      });
    }

    if (req.body.photoIds) {
      progress = await attachPhotosToProgress({
        progress,
        userId: req.user._id,
        photoIds: req.body.photoIds,
      });
    }

    await progress.save();

    await updateUserBodyData(req.user._id, progress);

    res.status(existingProgress ? 200 : 201).json({
      success: true,
      message: existingProgress
        ? "Weekly check-in updated successfully"
        : "Weekly check-in created successfully",
      checkIn: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single progress log
// @route   GET /api/progress/:id
// @access  Private
const getProgressById = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("photos.frontPhoto photos.sidePhoto photos.backPhoto");

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress log
// @route   PUT /api/progress/:id
// @access  Private
const updateProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    const updateData = filterAllowedFields(req.body);

    applyDataToProgress(progress, updateData);

    if (req.body.photoIds) {
      await attachPhotosToProgress({
        progress,
        userId: req.user._id,
        photoIds: req.body.photoIds,
      });
    }

    await progress.save();

    await updateUserBodyData(req.user._id, progress);

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete progress log
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    await ProgressPhoto.updateMany(
      {
        user: req.user._id,
        progress: progress._id,
      },
      {
        $set: {
          progress: null,
        },
      }
    );

    await progress.deleteOne();

    res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateProgress,
  getProgressLogs,
  getLatestProgress,
  getProgressByDate,
  getProgressSummary,
  getWeeklyCheckIns,
  createWeeklyCheckIn,
  getProgressById,
  updateProgress,
  deleteProgress,
};