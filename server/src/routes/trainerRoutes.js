const express = require("express");
const {
  getClients,
  assignClient,
  removeClient,
  getClientProgress,
} = require("../controllers/trainerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Enforce authentication & role permission
router.use(protect);
router.use(authorize("trainer", "admin"));

router.get("/clients", getClients);
router.post("/clients/:clientId", assignClient);
router.delete("/clients/:clientId", removeClient);
router.get("/clients/:clientId/progress", getClientProgress);

module.exports = router;
