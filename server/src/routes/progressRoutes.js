const express = require("express");

const {
  createOrUpdateProgress,
  getProgressLogs,
  getLatestProgress,
  getProgressSummary,
  getProgressById,
  updateProgress,
  deleteProgress,
} = require("../controllers/progressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/latest", protect, getLatestProgress);
router.get("/summary", protect, getProgressSummary);

router
  .route("/")
  .post(protect, createOrUpdateProgress)
  .get(protect, getProgressLogs);

router
  .route("/:id")
  .get(protect, getProgressById)
  .put(protect, updateProgress)
  .delete(protect, deleteProgress);

module.exports = router;