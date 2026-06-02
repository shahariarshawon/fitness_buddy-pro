const express = require("express");

const {
  createReminder,
  getReminders,
  getActiveReminders,
  getReminderStats,
  getTodayReminders,
  getReminderById,
  updateReminder,
  toggleReminder,
  markReminderTriggered,
  deleteReminder,
} = require("../controllers/reminderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/active", protect, getActiveReminders);
router.get("/stats", protect, getReminderStats);
router.get("/today", protect, getTodayReminders);

router
  .route("/")
  .post(protect, createReminder)
  .get(protect, getReminders);

router.patch("/:id/toggle", protect, toggleReminder);
router.patch("/:id/triggered", protect, markReminderTriggered);

router
  .route("/:id")
  .get(protect, getReminderById)
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

module.exports = router;