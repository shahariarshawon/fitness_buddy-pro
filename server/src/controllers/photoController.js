const cloudinary = require("../config/cloudinary");
const ProgressPhoto = require("../models/ProgressPhoto");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "kynorafit/progress-photos",
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload progress photo
// @route   POST /api/photos
// @access  Private
const uploadProgressPhoto = async (req, res, next) => {
  try {
    const { date, photoType, weight, notes } = req.body;

    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image");
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const photo = await ProgressPhoto.create({
      user: req.user._id,
      date: date || new Date(),
      photoType: photoType || "front",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      weight: weight || null,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Progress photo uploaded successfully",
      photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all progress photos
// @route   GET /api/photos
// @access  Private
const getProgressPhotos = async (req, res, next) => {
  try {
    const { photoType } = req.query;

    const query = {
      user: req.user._id,
    };

    if (photoType) {
      query.photoType = photoType;
    }

    const photos = await ProgressPhoto.find(query).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      count: photos.length,
      photos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single progress photo
// @route   GET /api/photos/:id
// @access  Private
const getProgressPhotoById = async (req, res, next) => {
  try {
    const photo = await ProgressPhoto.findById(req.params.id);

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    if (photo.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this photo");
    }

    res.status(200).json({
      success: true,
      photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress photo info
// @route   PUT /api/photos/:id
// @access  Private
const updateProgressPhoto = async (req, res, next) => {
  try {
    let photo = await ProgressPhoto.findById(req.params.id);

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    if (photo.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this photo");
    }

    const allowedFields = ["date", "photoType", "weight", "notes"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    photo = await ProgressPhoto.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Progress photo updated successfully",
      photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete progress photo
// @route   DELETE /api/photos/:id
// @access  Private
const deleteProgressPhoto = async (req, res, next) => {
  try {
    const photo = await ProgressPhoto.findById(req.params.id);

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    if (photo.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this photo");
    }

    await cloudinary.uploader.destroy(photo.publicId);

    await photo.deleteOne();

    res.status(200).json({
      success: true,
      message: "Progress photo deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadProgressPhoto,
  getProgressPhotos,
  getProgressPhotoById,
  updateProgressPhoto,
  deleteProgressPhoto,
};