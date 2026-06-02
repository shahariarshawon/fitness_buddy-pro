const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  completeOnboarding,
  updateUserTargets,
  updateSchedulePreferences,
  updateNotificationPreferences,
  updateSafetyProfile,
  getUserRecommendations,
  changePassword,
  deactivateUserAccount,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put("/onboarding", protect, completeOnboarding);
router.put("/targets", protect, updateUserTargets);
router.put("/schedule-preferences", protect, updateSchedulePreferences);
router.put("/notification-preferences", protect, updateNotificationPreferences);
router.put("/safety-profile", protect, updateSafetyProfile);

router.get("/recommendations", protect, getUserRecommendations);

router.put("/change-password", protect, changePassword);
router.patch("/deactivate", protect, deactivateUserAccount);

module.exports = router;