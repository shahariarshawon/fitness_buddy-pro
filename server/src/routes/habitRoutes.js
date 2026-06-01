const express = require("express");

const {
  createOrUpdateHabit,
  getHabits,
  getTodayHabit,
  getHabitSummary,
  getHabitById,
  updateHabit,
  deleteHabit,
} = require("../controllers/habitController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayHabit);
router.get("/summary", protect, getHabitSummary);

router.route("/").post(protect, createOrUpdateHabit).get(protect, getHabits);

router
  .route("/:id")
  .get(protect, getHabitById)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

module.exports = router;