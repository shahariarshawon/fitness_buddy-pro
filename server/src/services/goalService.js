const Goal = require("../models/Goal");

/**
 * Goal Service
 * Handles business logic for user goals, milestone updates, and progress calculations.
 */

const getGoals = async (userId, status = null) => {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return await Goal.find(query).sort({ priority: -1, targetDate: 1 });
};

const getGoalById = async (goalId, userId) => {
  return await Goal.findOne({ _id: goalId, user: userId });
};

const createGoal = async (userId, goalData) => {
  const goal = new Goal({
    ...goalData,
    user: userId,
    currentValue: goalData.startValue || goalData.currentValue || 0,
  });
  return await goal.save();
};

const updateGoal = async (goalId, userId, updateData) => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) return null;

  Object.assign(goal, updateData);

  // Auto-mark completed if target reached
  if (
    goal.currentValue !== undefined &&
    goal.targetValue !== undefined &&
    goal.currentValue >= goal.targetValue &&
    goal.status !== "completed"
  ) {
    goal.status = "completed";
    goal.completedAt = new Date();
  }

  return await goal.save();
};

const deleteGoal = async (goalId, userId) => {
  return await Goal.findOneAndDelete({ _id: goalId, user: userId });
};

const toggleMilestone = async (goalId, milestoneId, userId) => {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) return null;

  const milestone = goal.milestones.id(milestoneId);
  if (!milestone) return null;

  milestone.completed = !milestone.completed;
  milestone.completedAt = milestone.completed ? new Date() : null;

  return await goal.save();
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleMilestone,
};
