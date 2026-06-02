const express = require("express");

const {
  createPlan,
  getPlans,
  getActivePlan,
  getPlanById,
  activatePlan,
  deletePlan,
} = require("../controllers/planController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/active", protect, getActivePlan);

router
  .route("/")
  .post(protect, createPlan)
  .get(protect, getPlans);

router.patch("/:id/activate", protect, activatePlan);

router
  .route("/:id")
  .get(protect, getPlanById)
  .delete(protect, deletePlan);

module.exports = router;