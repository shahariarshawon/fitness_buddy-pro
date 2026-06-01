const express = require("express");

const {
  getDashboardSummary,
  getTodayDashboard,
  getWeeklyDashboard,
  getDashboardCharts,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDashboardSummary);
router.get("/summary", protect, getDashboardSummary);
router.get("/today", protect, getTodayDashboard);
router.get("/weekly", protect, getWeeklyDashboard);
router.get("/charts", protect, getDashboardCharts);

module.exports = router;