const cloudinary = require("../config/cloudinary");
const ProgressPhoto = require("../models/ProgressPhoto");
const Progress = require("../models/Progress");

const getStartAndEndOfDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
};

const allowedPhotoFields = [
  "plan",
  "planDay",
  "progress",
  "date",
  "photoType",
  "checkInType",
  "weekNumber",
  "weight",
  "weightUnit",
  "bodySnapshot",
  "comparisonGroup",
  "isStartPhoto",
  "isFinalPhoto",
  "isWeeklyCheckInPhoto",
  "source",
  "visibility",
  "isFavorite",
  "tags",
  "notes",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedPhotoFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const normalizeArrayFields = (data) => {
  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return data;
};

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "FitnessBuddyPro/progress-photos",
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

const buildCloudinaryVariantUrl = (publicId, transformation = {}) => {
  if (!publicId) return "";

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "image",
    fetch_format: "auto",
    quality: "auto",
    ...transformation,
  });
};

const buildImageVariants = (result) => {
  const thumbnailUrl = buildCloudinaryVariantUrl(result.public_id, {
    width: 300,
    height: 300,
    crop: "fill",
    gravity: "auto",
  });

  const mediumUrl = buildCloudinaryVariantUrl(result.public_id, {
    width: 800,
    height: 800,
    crop: "limit",
  });

  return {
    thumbnail: {
      url: thumbnailUrl,
      publicId: result.public_id,
      width: 300,
      height: 300,
    },

    medium: {
      url: mediumUrl,
      publicId: result.public_id,
      width: Math.min(result.width || 800, 800),
      height: Math.min(result.height || 800, 800),
    },

    original: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width || 0,
      height: result.height || 0,
    },
  };
};

const attachPhotoToProgress = async ({ photo, userId }) => {
  if (!photo.progress) return;

  const progress = await Progress.findOne({
    _id: photo.progress,
    user: userId,
  });

  if (!progress) return;

  if (photo.photoType === "front") {
    progress.photos.frontPhoto = photo._id;
  }

  if (photo.photoType === "side") {
    progress.photos.sidePhoto = photo._id;
  }

  if (photo.photoType === "back") {
    progress.photos.backPhoto = photo._id;
  }

  await progress.save();
};

const detachPhotoFromProgress = async ({ photo, userId }) => {
  if (!photo.progress) return;

  const progress = await Progress.findOne({
    _id: photo.progress,
    user: userId,
  });

  if (!progress) return;

  if (
    progress.photos.frontPhoto &&
    progress.photos.frontPhoto.toString() === photo._id.toString()
  ) {
    progress.photos.frontPhoto = null;
  }

  if (
    progress.photos.sidePhoto &&
    progress.photos.sidePhoto.toString() === photo._id.toString()
  ) {
    progress.photos.sidePhoto = null;
  }

  if (
    progress.photos.backPhoto &&
    progress.photos.backPhoto.toString() === photo._id.toString()
  ) {
    progress.photos.backPhoto = null;
  }

  await progress.save();
};

// @desc    Upload progress photo
// @route   POST /api/photos
// @access  Private
const uploadProgressPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image");
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400);
      throw new Error("Only JPG, PNG, and WEBP images are allowed");
    }

    const photoData = normalizeArrayFields(filterAllowedFields(req.body));

    const result = await uploadToCloudinary(req.file.buffer);

    const variants = buildImageVariants(result);

    const photo = new ProgressPhoto({
      user: req.user._id,

      ...photoData,

      date: photoData.date || new Date(),
      photoType: photoData.photoType || "front",

      imageUrl: result.secure_url,
      publicId: result.public_id,

      thumbnail: variants.thumbnail,
      medium: variants.medium,
      original: variants.original,

      fileSize: req.file.size || result.bytes || 0,
      mimeType: req.file.mimetype,
      width: result.width || 0,
      height: result.height || 0,

      weight: photoData.weight || null,
      notes: photoData.notes || "",
      source: photoData.source || "upload",
      visibility: photoData.visibility || "private",
      isActive: true,
    });

    await photo.save();

    await attachPhotoToProgress({
      photo,
      userId: req.user._id,
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
    const {
      photoType,
      checkInType,
      plan,
      progress,
      weekNumber,
      comparisonGroup,
      isStartPhoto,
      isFinalPhoto,
      isFavorite,
      startDate,
      endDate,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {
      user: req.user._id,
      isActive: true,
    };

    if (photoType) {
      query.photoType = photoType;
    }

    if (checkInType) {
      query.checkInType = checkInType;
    }

    if (plan) {
      query.plan = plan;
    }

    if (progress) {
      query.progress = progress;
    }

    if (weekNumber) {
      query.weekNumber = Number(weekNumber);
    }

    if (comparisonGroup) {
      query.comparisonGroup = comparisonGroup;
    }

    if (isStartPhoto !== undefined) {
      query.isStartPhoto = isStartPhoto === "true";
    }

    if (isFinalPhoto !== undefined) {
      query.isFinalPhoto = isFinalPhoto === "true";
    }

    if (isFavorite !== undefined) {
      query.isFavorite = isFavorite === "true";
    }

    if (startDate || endDate) {
      const { start } = getStartAndEndOfDate(startDate || new Date("1970-01-01"));
      const { end } = getStartAndEndOfDate(endDate || new Date());

      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [photos, total] = await Promise.all([
      ProgressPhoto.find(query)
        .populate("progress", "date weight waist checkInType weekNumber")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      ProgressPhoto.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: photos.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      photos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's progress photos
// @route   GET /api/photos/today
// @access  Private
const getTodayProgressPhotos = async (req, res, next) => {
  try {
    const { start, end } = getStartAndEndOfDate();

    const photos = await ProgressPhoto.find({
      user: req.user._id,
      isActive: true,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ photoType: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      date: getDateKey(start),
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
    const photo = await ProgressPhoto.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    }).populate("progress", "date weight waist chest hip bodyFatPercentage checkInType weekNumber");

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
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
    const photo = await ProgressPhoto.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    const oldProgressId = photo.progress ? photo.progress.toString() : null;

    let updateData = normalizeArrayFields(filterAllowedFields(req.body));

    Object.keys(updateData).forEach((key) => {
      photo.set(key, updateData[key]);
    });

    await photo.save();

    const newProgressId = photo.progress ? photo.progress.toString() : null;

    if (oldProgressId && oldProgressId !== newProgressId) {
      await detachPhotoFromProgress({
        photo: {
          ...photo.toObject(),
          progress: oldProgressId,
        },
        userId: req.user._id,
      });
    }

    await attachPhotoToProgress({
      photo,
      userId: req.user._id,
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

// @desc    Toggle favorite progress photo
// @route   PATCH /api/photos/:id/favorite
// @access  Private
const toggleFavoritePhoto = async (req, res, next) => {
  try {
    const photo = await ProgressPhoto.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    photo.isFavorite =
      req.body.isFavorite !== undefined
        ? Boolean(req.body.isFavorite)
        : !photo.isFavorite;

    await photo.save();

    res.status(200).json({
      success: true,
      message: "Photo favorite status updated successfully",
      photo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get photo comparison group
// @route   GET /api/photos/comparison
// @access  Private
const getPhotoComparison = async (req, res, next) => {
  try {
    const { plan, comparisonGroup, photoType } = req.query;

    const query = {
      user: req.user._id,
      isActive: true,
    };

    if (plan) {
      query.plan = plan;
    }

    if (comparisonGroup) {
      query.comparisonGroup = comparisonGroup;
    }

    if (photoType) {
      query.photoType = photoType;
    }

    const photos = await ProgressPhoto.find(query).sort({
      photoType: 1,
      date: 1,
    });

    const grouped = {
      front: photos.filter((photo) => photo.photoType === "front"),
      side: photos.filter((photo) => photo.photoType === "side"),
      back: photos.filter((photo) => photo.photoType === "back"),
      other: photos.filter((photo) => photo.photoType === "other"),
    };

    res.status(200).json({
      success: true,
      count: photos.length,
      grouped,
      photos,
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
    const photo = await ProgressPhoto.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!photo) {
      res.status(404);
      throw new Error("Progress photo not found");
    }

    await detachPhotoFromProgress({
      photo,
      userId: req.user._id,
    });

    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    /**
     * Soft delete.
     * This keeps old reports stable and prevents broken references.
     */
    photo.isActive = false;
    await photo.save();

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
  getTodayProgressPhotos,
  getProgressPhotoById,
  updateProgressPhoto,
  toggleFavoritePhoto,
  getPhotoComparison,
  deleteProgressPhoto,
};