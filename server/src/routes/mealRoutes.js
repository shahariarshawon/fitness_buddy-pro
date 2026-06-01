const express = require("express");

const {
  createMeal,
  getMeals,
  getTodayMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailyMealSummary,
  getWeeklyMealSummary,
  previewMealNutrition,
} = require("../controllers/mealController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayMeals);

router.get("/summary/daily", protect, getDailyMealSummary);
router.get("/summary/weekly", protect, getWeeklyMealSummary);

router.post("/preview", protect, previewMealNutrition);

router
  .route("/")
  .post(protect, createMeal)
  .get(protect, getMeals);

router
  .route("/:id")
  .get(protect, getMealById)
  .put(protect, updateMeal)
  .delete(protect, deleteMeal);

module.exports = router;