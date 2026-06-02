const express = require("express");

const {
  uploadProgressPhoto,
  getProgressPhotos,
  getTodayProgressPhotos,
  getProgressPhotoById,
  updateProgressPhoto,
  toggleFavoritePhoto,
  getPhotoComparison,
  deleteProgressPhoto,
} = require("../controllers/photoController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayProgressPhotos);
router.get("/comparison", protect, getPhotoComparison);

router
  .route("/")
  .post(protect, upload.single("image"), uploadProgressPhoto)
  .get(protect, getProgressPhotos);

router.patch("/:id/favorite", protect, toggleFavoritePhoto);

router
  .route("/:id")
  .get(protect, getProgressPhotoById)
  .put(protect, updateProgressPhoto)
  .delete(protect, deleteProgressPhoto);

module.exports = router;