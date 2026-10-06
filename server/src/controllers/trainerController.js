const trainerService = require("../services/trainerService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc    Get all clients assigned to logged-in trainer
// @route   GET /api/v1/trainer/clients
// @access  Private (Trainer/Admin)
const getClients = async (req, res, next) => {
  try {
    const clients = await trainerService.getTrainerClients(req.user._id);
    return successResponse(res, 200, "Trainer clients retrieved successfully", clients);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a client to trainer
// @route   POST /api/v1/trainer/clients/:clientId
// @access  Private (Trainer/Admin)
const assignClient = async (req, res, next) => {
  try {
    const client = await trainerService.assignClientToTrainer(
      req.params.clientId,
      req.user._id
    );
    if (!client) {
      return errorResponse(res, 404, "Client not found");
    }
    return successResponse(res, 200, "Client assigned successfully", {
      clientId: client._id,
      name: client.name,
      assignedTrainer: client.assignedTrainer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove client from trainer roster
// @route   DELETE /api/v1/trainer/clients/:clientId
// @access  Private (Trainer/Admin)
const removeClient = async (req, res, next) => {
  try {
    const client = await trainerService.removeClientFromTrainer(
      req.params.clientId,
      req.user._id
    );
    if (!client) {
      return errorResponse(res, 404, "Client not assigned to this trainer");
    }
    return successResponse(res, 200, "Client unassigned successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Review client progress and workout history
// @route   GET /api/v1/trainer/clients/:clientId/progress
// @access  Private (Trainer/Admin)
const getClientProgress = async (req, res, next) => {
  try {
    const summary = await trainerService.getClientProgressSummary(
      req.params.clientId,
      req.user._id
    );
    if (!summary) {
      return errorResponse(res, 404, "Client not found or not assigned to you");
    }
    return successResponse(
      res,
      200,
      "Client progress summary retrieved successfully",
      summary
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  assignClient,
  removeClient,
  getClientProgress,
};
