const express = require("express");

const {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailyMealSummary,
} = require("../controllers/mealController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary/daily", protect, getDailyMealSummary);

router.route("/").post(protect, createMeal).get(protect, getMeals);

router
  .route("/:id")
  .get(protect, getMealById)
  .put(protect, updateMeal)
  .delete(protect, deleteMeal);

module.exports = router;