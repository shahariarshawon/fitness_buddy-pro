const express = require("express");

const {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  getExerciseFilters,
  getRecommendedExercises,
} = require("../controllers/exerciseController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/meta/filters", protect, getExerciseFilters);
router.get("/recommendations", protect, getRecommendedExercises);

router
  .route("/")
  .post(protect, createExercise)
  .get(protect, getExercises);

router
  .route("/:id")
  .get(protect, getExerciseById)
  .put(protect, updateExercise)
  .delete(protect, deleteExercise);

module.exports = router;