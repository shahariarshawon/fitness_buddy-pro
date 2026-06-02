const express = require("express");

const {
  getWeeklyReport,
  getMonthlyReport,
  getCustomReport,
  getTransformationReport,
  getOverviewReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/weekly", protect, getWeeklyReport);
router.get("/monthly", protect, getMonthlyReport);
router.get("/custom", protect, getCustomReport);
router.get("/transformation", protect, getTransformationReport);
router.get("/overview", protect, getOverviewReport);

module.exports = router;