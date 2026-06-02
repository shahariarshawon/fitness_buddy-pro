const User = require("../models/User");

const allowedProfileFields = [
  "name",
  "avatarUrl",
  "dateOfBirth",
  "age",
  "gender",
  "height",
  "currentWeight",
  "startingWeight",
  "targetWeight",
  "goal",
  "trainingBackground",
  "trainingExperienceMonths",
  "activityLevel",
  "dailyCalorieTarget",
  "dailyProteinTarget",
  "dailyWaterTarget",
  "sleepTarget",
  "dailyTargets",
  "weeklyTargets",
  "unitSystem",
  "weightUnit",
  "measurementUnit",
  "foodMeasurementPreference",
  "schedulePreferences",
  "notificationPreferences",
  "safetyProfile",
  "activePlan",
  "onboardingCompleted",
];

const filterAllowedFields = (body) => {
  const filteredData = {};

  allowedProfileFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

const applyDataToUser = (user, updateData) => {
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      user.set(key, updateData[key]);
    }
  });

  return user;
};

const syncOldTargetsWithNewTargets = (user, body) => {
  if (body.dailyTargets) {
    if (body.dailyTargets.calories !== undefined) {
      user.dailyCalorieTarget = body.dailyTargets.calories;
    }

    if (body.dailyTargets.protein !== undefined) {
      user.dailyProteinTarget = body.dailyTargets.protein;
    }

    if (body.dailyTargets.waterLiters !== undefined) {
      user.dailyWaterTarget = body.dailyTargets.waterLiters;
    }

    if (body.dailyTargets.sleepHours !== undefined) {
      user.sleepTarget = body.dailyTargets.sleepHours;
    }
  }

  if (body.dailyCalorieTarget !== undefined) {
    user.dailyTargets.calories = body.dailyCalorieTarget;
  }

  if (body.dailyProteinTarget !== undefined) {
    user.dailyTargets.protein = body.dailyProteinTarget;
  }

  if (body.dailyWaterTarget !== undefined) {
    user.dailyTargets.waterLiters = body.dailyWaterTarget;
  }

  if (body.sleepTarget !== undefined) {
    user.dailyTargets.sleepHours = body.sleepTarget;
  }

  return user;
};

const getSafeUserResponse = (user) => {
  if (typeof user.getProfileSummary === "function") {
    return user.getProfileSummary();
  }

  return user;
};

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user: getSafeUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const updateData = filterAllowedFields(req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    applyDataToUser(user, updateData);
    syncOldTargetsWithNewTargets(user, req.body);

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete onboarding profile
// @route   PUT /api/users/onboarding
// @access  Private
const completeOnboarding = async (req, res, next) => {
  try {
    const updateData = filterAllowedFields(req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    applyDataToUser(user, updateData);
    syncOldTargetsWithNewTargets(user, req.body);

    user.onboardingCompleted = true;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user daily and weekly targets
// @route   PUT /api/users/targets
// @access  Private
const updateUserTargets = async (req, res, next) => {
  try {
    const {
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyWaterTarget,
      sleepTarget,
      dailyTargets,
      weeklyTargets,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (dailyCalorieTarget !== undefined) {
      user.dailyCalorieTarget = dailyCalorieTarget;
    }

    if (dailyProteinTarget !== undefined) {
      user.dailyProteinTarget = dailyProteinTarget;
    }

    if (dailyWaterTarget !== undefined) {
      user.dailyWaterTarget = dailyWaterTarget;
    }

    if (sleepTarget !== undefined) {
      user.sleepTarget = sleepTarget;
    }

    if (dailyTargets) {
      Object.keys(dailyTargets).forEach((key) => {
        user.dailyTargets[key] = dailyTargets[key];
      });
    }

    if (weeklyTargets) {
      Object.keys(weeklyTargets).forEach((key) => {
        user.weeklyTargets[key] = weeklyTargets[key];
      });
    }

    syncOldTargetsWithNewTargets(user, req.body);

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Targets updated successfully",
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule preferences
// @route   PUT /api/users/schedule-preferences
// @access  Private
const updateSchedulePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    Object.keys(req.body || {}).forEach((key) => {
      user.schedulePreferences[key] = req.body[key];
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Schedule preferences updated successfully",
      schedulePreferences: updatedUser.schedulePreferences,
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/users/notification-preferences
// @access  Private
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    Object.keys(req.body || {}).forEach((key) => {
      user.notificationPreferences[key] = req.body[key];
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      notificationPreferences: updatedUser.notificationPreferences,
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update safety profile
// @route   PUT /api/users/safety-profile
// @access  Private
const updateSafetyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    Object.keys(req.body || {}).forEach((key) => {
      user.safetyProfile[key] = req.body[key];
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Safety profile updated successfully",
      safetyProfile: updatedUser.safetyProfile,
      user: getSafeUserResponse(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user recommendations
// @route   GET /api/users/recommendations
// @access  Private
const getUserRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const recommendedCalories =
      typeof user.getRecommendedCalories === "function"
        ? user.getRecommendedCalories()
        : user.dailyCalorieTarget;

    const recommendedProtein =
      typeof user.getRecommendedProtein === "function"
        ? user.getRecommendedProtein()
        : user.dailyProteinTarget;

    const recommendations = {
      bmi: user.bmi,
      bmr: user.bmr,
      estimatedMaintenanceCalories: user.estimatedMaintenanceCalories,

      calories: {
        current: user.dailyCalorieTarget,
        recommended: recommendedCalories,
      },

      protein: {
        current: user.dailyProteinTarget,
        recommended: recommendedProtein,
      },

      waterLiters: user.dailyWaterTarget,
      sleepHours: user.sleepTarget,
      steps: user.dailyTargets?.steps || 8000,

      safety: {
        medicalClearanceRecommended:
          user.safetyProfile?.medicalClearanceRecommended || false,
        kneePain: user.safetyProfile?.kneePain || false,
        backPain: user.safetyProfile?.backPain || false,
        shoulderPain: user.safetyProfile?.shoulderPain || false,
      },

      message:
        user.safetyProfile?.medicalClearanceRecommended
          ? "Because BMI or health risk may be higher, keep training low-impact and get medical clearance if needed."
          : "Your profile is ready for target-based meal, workout, and transformation tracking.",
    };

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select(
      "+password +refreshTokenVersion"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user account
// @route   PATCH /api/users/deactivate
// @access  Private
const deactivateUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};