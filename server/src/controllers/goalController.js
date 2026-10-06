const goalService = require("../services/goalService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc    Get all user goals
// @route   GET /api/v1/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const goals = await goalService.getGoals(req.user._id, status);
    return successResponse(res, 200, "Goals retrieved successfully", goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal by ID
// @route   GET /api/v1/goals/:id
// @access  Private
const getGoalById = async (req, res, next) => {
  try {
    const goal = await goalService.getGoalById(req.params.id, req.user._id);
    if (!goal) {
      return errorResponse(res, 404, "Goal not found");
    }
    return successResponse(res, 200, "Goal retrieved successfully", goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, type, startValue, currentValue, targetValue, unit, targetDate, priority, notes, milestones } =
      req.body;

    if (!title || targetValue === undefined || !targetDate) {
      return errorResponse(res, 400, "Please provide title, target value, and target date");
    }

    const goal = await goalService.createGoal(req.user._id, {
      title,
      type,
      startValue,
      currentValue,
      targetValue,
      unit,
      targetDate,
      priority,
      notes,
      milestones,
    });

    return successResponse(res, 201, "Goal created successfully", goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/v1/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.params.id, req.user._id, req.body);
    if (!goal) {
      return errorResponse(res, 404, "Goal not found");
    }
    return successResponse(res, 200, "Goal updated successfully", goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await goalService.deleteGoal(req.params.id, req.user._id);
    if (!goal) {
      return errorResponse(res, 404, "Goal not found");
    }
    return successResponse(res, 200, "Goal deleted successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle milestone completion
// @route   PATCH /api/v1/goals/:id/milestones/:milestoneId
// @access  Private
const toggleMilestone = async (req, res, next) => {
  try {
    const goal = await goalService.toggleMilestone(
      req.params.id,
      req.params.milestoneId,
      req.user._id
    );
    if (!goal) {
      return errorResponse(res, 404, "Goal or milestone not found");
    }
    return successResponse(res, 200, "Milestone updated successfully", goal);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleMilestone,
};
