const express = require("express");

const {
  createOrUpdateHabit,
  getHabits,
  getTodayHabit,
  getHabitByDate,
  syncTodayHabit,
  getHabitSummary,
  getHabitById,
  updateHabit,
  toggleHabitField,
  markHabitTaskComplete,
  deleteHabit,
} = require("../controllers/habitController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayHabit);
router.get("/summary", protect, getHabitSummary);
router.get("/date/:date", protect, getHabitByDate);
router.patch("/sync-today", protect, syncTodayHabit);

router
  .route("/")
  .post(protect, createOrUpdateHabit)
  .get(protect, getHabits);

router.patch("/:id/toggle", protect, toggleHabitField);
router.patch("/:id/tasks/:taskKey/complete", protect, markHabitTaskComplete);

router
  .route("/:id")
  .get(protect, getHabitById)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

module.exports = router;