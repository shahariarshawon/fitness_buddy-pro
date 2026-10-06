const aiFitnessService = require("../services/aiFitnessService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc    Get AI personalized recommendations & workouts
// @route   GET /api/v1/ai/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const { goal } = req.query;
    const recommendations = await aiFitnessService.generateRecommendations({
      user: req.user,
      targetGoal: goal,
    });
    return successResponse(
      res,
      200,
      "AI Fitness recommendations generated successfully",
      recommendations
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI Fitness Assistant
// @route   POST /api/v1/ai/chat
// @access  Private
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return errorResponse(res, 400, "Please provide a message");
    }

    const response = await aiFitnessService.chatAssistant({
      message,
      user: req.user,
    });

    return successResponse(
      res,
      200,
      "AI Assistant response generated",
      response
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  chatWithAssistant,
};
