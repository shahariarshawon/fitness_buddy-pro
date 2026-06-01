const express = require("express");

const {
  uploadProgressPhoto,
  getProgressPhotos,
  getProgressPhotoById,
  updateProgressPhoto,
  deleteProgressPhoto,
} = require("../controllers/photoController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, upload.single("photo"), uploadProgressPhoto)
  .get(protect, getProgressPhotos);

router
  .route("/:id")
  .get(protect, getProgressPhotoById)
  .put(protect, updateProgressPhoto)
  .delete(protect, deleteProgressPhoto);

module.exports = router;