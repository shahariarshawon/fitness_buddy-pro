const express = require("express");
const {
  getRecommendations,
  chatWithAssistant,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/recommendations", getRecommendations);
router.post("/chat", chatWithAssistant);

module.exports = router;
