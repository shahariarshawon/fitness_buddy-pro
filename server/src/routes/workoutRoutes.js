const express = require("express");

const {
  createWorkout,
  getWorkouts,
  getTodayWorkouts,
  previewWorkout,
  getWorkoutInputFields,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getDailyWorkoutSummary,
  getWeeklyWorkoutSummary,
} = require("../controllers/workoutController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayWorkouts);
router.get("/fields", protect, getWorkoutInputFields);

router.get("/summary/daily", protect, getDailyWorkoutSummary);
router.get("/summary/weekly", protect, getWeeklyWorkoutSummary);

router.post("/preview", protect, previewWorkout);

router
  .route("/")
  .post(protect, createWorkout)
  .get(protect, getWorkouts);

router
  .route("/:id")
  .get(protect, getWorkoutById)
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

module.exports = router;