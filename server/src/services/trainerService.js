const User = require("../models/User");
const Workout = require("../models/Workout");
const Progress = require("../models/Progress");
const TransformationPlan = require("../models/TransformationPlan");

/**
 * Trainer Service
 * Manages trainer-client relationships, plan assignments, and progress monitoring.
 */

const getTrainerClients = async (trainerId) => {
  return await User.find({ assignedTrainer: trainerId })
    .select("name email currentWeight targetWeight goal activityLevel dailyTargets profileCompleted createdAt")
    .sort({ createdAt: -1 });
};

const assignClientToTrainer = async (clientId, trainerId) => {
  const client = await User.findById(clientId);
  if (!client) return null;

  client.assignedTrainer = trainerId;
  return await client.save();
};

const removeClientFromTrainer = async (clientId, trainerId) => {
  const client = await User.findOne({ _id: clientId, assignedTrainer: trainerId });
  if (!client) return null;

  client.assignedTrainer = null;
  return await client.save();
};

const getClientProgressSummary = async (clientId, trainerId) => {
  const client = await User.findOne({ _id: clientId, assignedTrainer: trainerId });
  if (!client) return null;

  const [recentWorkouts, progressLogs, plans] = await Promise.all([
    Workout.find({ user: clientId }).sort({ date: -1 }).limit(10),
    Progress.find({ user: clientId }).sort({ date: -1 }).limit(10),
    TransformationPlan.find({ user: clientId }),
  ]);

  return {
    client: client.getProfileSummary(),
    recentWorkouts,
    progressLogs,
    plans,
    workoutCount: recentWorkouts.length,
    latestWeight: progressLogs[0]?.weight || client.currentWeight,
  };
};

module.exports = {
  getTrainerClients,
  assignClientToTrainer,
  removeClientFromTrainer,
  getClientProgressSummary,
};
