const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateTargets,
  changePassword,
  getRecommendations,
  deactivateAccount,
  refreshTokenHandler,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public auth endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokenHandler);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected user endpoints
router.get("/me", protect, getMe);
router.get("/recommendations", protect, getRecommendations);
router.put("/profile", protect, updateProfile);
router.put("/targets", protect, updateTargets);
router.put("/change-password", protect, changePassword);
router.patch("/deactivate", protect, deactivateAccount);

module.exports = router;