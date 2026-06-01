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
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);
router.get("/recommendations", protect, getRecommendations);

router.put("/profile", protect, updateProfile);
router.put("/targets", protect, updateTargets);
router.put("/change-password", protect, changePassword);

router.patch("/deactivate", protect, deactivateAccount);

module.exports = router;