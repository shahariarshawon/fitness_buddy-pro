const express = require("express");

const {
  createReminder,
  getReminders,
  getActiveReminders,
  getReminderById,
  updateReminder,
  toggleReminder,
  deleteReminder,
} = require("../controllers/reminderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/active", protect, getActiveReminders);

router.route("/").post(protect, createReminder).get(protect, getReminders);

router.patch("/:id/toggle", protect, toggleReminder);

router
  .route("/:id")
  .get(protect, getReminderById)
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

module.exports = router;