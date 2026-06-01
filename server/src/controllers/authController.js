const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Send consistent auth response.
 */
const sendAuthResponse = (res, statusCode, message, user) => {
  const userData =
    typeof user.getProfileSummary === "function"
      ? user.getProfileSummary()
      : {
          id: user._id,
          name: user.name,
          email: user.email,
          goal: user.goal,
        };

  res.status(statusCode).json({
    success: true,
    message,
    token: generateToken(user._id),
    user: userData,
  });
};

/**
 * Remove fields that users should not directly control.
 */
const filterAllowedProfileFields = (body) => {
  const allowedFields = [
    "name",
    "dateOfBirth",
    "age",
    "height",
    "gender",
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
    "unitSystem",
    "weightUnit",
    "measurementUnit",
    "foodMeasurementPreference",
    "schedulePreferences",
    "notificationPreferences",
    "safetyProfile",
  ];

  const filteredData = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      filteredData[field] = body[field];
    }
  });

  return filteredData;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,

      // optional onboarding fields
      dateOfBirth,
      age,
      height,
      gender,
      currentWeight,
      startingWeight,
      targetWeight,
      goal,
      trainingBackground,
      trainingExperienceMonths,
      activityLevel,
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyWaterTarget,
      sleepTarget,
      unitSystem,
      weightUnit,
      measurementUnit,
      foodMeasurementPreference,
      schedulePreferences,
      notificationPreferences,
      safetyProfile,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,

      dateOfBirth,
      age,
      height,
      gender,
      currentWeight,
      startingWeight,
      targetWeight,
      goal,
      trainingBackground,
      trainingExperienceMonths,
      activityLevel,
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyWaterTarget,
      sleepTarget,
      unitSystem,
      weightUnit,
      measurementUnit,
      foodMeasurementPreference,
      schedulePreferences,
      notificationPreferences,
      safetyProfile,
    });

    sendAuthResponse(res, 201, "User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("This account is inactive. Please contact support.");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendAuthResponse(res, 200, "Login successful", user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user:
        typeof user.getProfileSummary === "function"
          ? user.getProfileSummary()
          : user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const updateData = filterAllowedProfileFields(req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key];
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user:
        typeof updatedUser.getProfileSummary === "function"
          ? updatedUser.getProfileSummary()
          : updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily targets
// @route   PUT /api/auth/targets
// @access  Private
const updateTargets = async (req, res, next) => {
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
      user.dailyTargets = {
        ...user.dailyTargets.toObject?.(),
        ...dailyTargets,
      };
    }

    if (weeklyTargets) {
      user.weeklyTargets = {
        ...user.weeklyTargets.toObject?.(),
        ...weeklyTargets,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Targets updated successfully",
      user:
        typeof updatedUser.getProfileSummary === "function"
          ? updatedUser.getProfileSummary()
          : updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change logged-in user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Please provide current password and new password");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");

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

    sendAuthResponse(res, 200, "Password changed successfully", user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended calories and protein based on user profile
// @route   GET /api/auth/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      recommendations: {
        bmi: user.bmi,
        bmr: user.bmr,
        estimatedMaintenanceCalories: user.estimatedMaintenanceCalories,
        recommendedCalories,
        recommendedProtein,
        waterLiters: user.dailyWaterTarget,
        sleepHours: user.sleepTarget,
        steps: user.dailyTargets?.steps || 8000,
        medicalClearanceRecommended:
          user.safetyProfile?.medicalClearanceRecommended || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate logged-in user account
// @route   PATCH /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
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
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateTargets,
  changePassword,
  getRecommendations,
  deactivateAccount,
};