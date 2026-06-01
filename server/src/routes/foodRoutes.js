const express = require("express");

const {
  createFood,
  getFoods,
  getFoodById,
  calculateFoodNutrition,
  updateFood,
  deleteFood,
  getFoodFilters,
  getFatLossFoodRecommendations,
} = require("../controllers/foodController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/meta/filters", protect, getFoodFilters);
router.get("/recommendations/fat-loss", protect, getFatLossFoodRecommendations);

router
  .route("/")
  .post(protect, createFood)
  .get(protect, getFoods);

router.post("/:id/calculate", protect, calculateFoodNutrition);

router
  .route("/:id")
  .get(protect, getFoodById)
  .put(protect, updateFood)
  .delete(protect, deleteFood);

module.exports = router;