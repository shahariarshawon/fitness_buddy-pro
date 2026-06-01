const Progress = require("../models/Progress");

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
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

  return Number((latestValue - firstValue).toFixed(2));
};

// @desc    Create or update progress for a date
// @route   POST /api/progress
// @access  Private
const createOrUpdateProgress = async (req, res, next) => {
  try {
    const {
      date,
      weight,
      waist,
      chest,
      arm,
      thigh,
      hip,
      bodyFatPercentage,
      notes,
    } = req.body;

    if (!weight) {
      res.status(400);
      throw new Error("Body weight is required");
    }

    const { start, end } = getStartAndEndOfDate(date);

    const progressData = {
      weight,
      waist,
      chest,
      arm,
      thigh,
      hip,
      bodyFatPercentage,
      notes,
    };

    let progress = await Progress.findOne({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (progress) {
      progress = await Progress.findByIdAndUpdate(progress._id, progressData, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: "Progress updated successfully",
        progress,
      });
    }

    progress = await Progress.create({
      user: req.user._id,
      date: start,
      ...progressData,
    });

    res.status(201).json({
      success: true,
      message: "Progress created successfully",
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
    const progressLogs = await Progress.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      count: progressLogs.length,
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
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      progress: latestProgress,
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
    const progressLogs = await Progress.find({ user: req.user._id }).sort({
      date: 1,
    });

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
            bodyFatChange: 0,
          },
        },
      });
    }

    const firstProgress = progressLogs[0];
    const latestProgress = progressLogs[progressLogs.length - 1];

    const summary = {
      totalLogs: progressLogs.length,
      firstProgress,
      latestProgress,
      changes: {
        weightChange: calculateChange(
          latestProgress.weight,
          firstProgress.weight
        ),
        waistChange: calculateChange(latestProgress.waist, firstProgress.waist),
        chestChange: calculateChange(latestProgress.chest, firstProgress.chest),
        armChange: calculateChange(latestProgress.arm, firstProgress.arm),
        thighChange: calculateChange(latestProgress.thigh, firstProgress.thigh),
        hipChange: calculateChange(latestProgress.hip, firstProgress.hip),
        bodyFatChange: calculateChange(
          latestProgress.bodyFatPercentage,
          firstProgress.bodyFatPercentage
        ),
      },
    };

    res.status(200).json({
      success: true,
      summary,
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
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    if (progress.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this progress log");
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
    let progress = await Progress.findById(req.params.id);

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    if (progress.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this progress log");
    }

    progress = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      res.status(404);
      throw new Error("Progress log not found");
    }

    if (progress.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this progress log");
    }

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
  getProgressSummary,
  getProgressById,
  updateProgress,
  deleteProgress,
};