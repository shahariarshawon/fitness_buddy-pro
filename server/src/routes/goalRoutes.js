const express = require("express");
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleMilestone,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getGoals).post(createGoal);

router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);

router.patch("/:id/milestones/:milestoneId", toggleMilestone);

module.exports = router;
