const TransformationPlan = require("../models/TransformationPlan");
const PlanDay = require("../models/PlanDay");
const User = require("../models/User");

const getStartOfDay = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndDateFromDuration = (startDate, durationWeeks) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(durationWeeks) * 7 - 1);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const getFocusForTrainingDay = (trainingDayIndex) => {
  const pattern = [
    {
      sessionName: "Full Body Strength",
      mainFocus: "full_body",
      dayType: "training",
    },
    {
      sessionName: "Cardio + Core",
      mainFocus: "cardio",
      dayType: "cardio",
    },
    {
      sessionName: "Upper Body",
      mainFocus: "upper_body",
      dayType: "training",
    },
    {
      sessionName: "Lower Body",
      mainFocus: "lower_body",
      dayType: "training",
    },
    {
      sessionName: "Active Recovery",
      mainFocus: "active_recovery",
      dayType: "active_recovery",
    },
  ];

  return pattern[trainingDayIndex % pattern.length];
};

const generatePlanDays = async (plan) => {
  await PlanDay.deleteMany({
    user: plan.user,
    plan: plan._id,
  });

  const totalDays = Number(plan.durationWeeks) * 7;
  const planDays = [];

  let trainingCounter = 0;

  for (let index = 0; index < totalDays; index += 1) {
    const date = addDays(getStartOfDay(plan.startDate), index);
    const dayNumber = index + 1;
    const weekNumber = Math.ceil(dayNumber / 7);
    const dayInWeek = index % 7;

    const isWorkoutDay = dayInWeek < Number(plan.weeklyWorkoutDays || 0);

    const dayInfo = isWorkoutDay
      ? getFocusForTrainingDay(trainingCounter)
      : {
          sessionName: "Rest Day",
          mainFocus: "rest",
          dayType: "rest",
        };

    if (isWorkoutDay) {
      trainingCounter += 1;
    }

    planDays.push({
      user: plan.user,
      plan: plan._id,
      date,
      dayNumber,
      weekNumber,
      sessionName: dayInfo.sessionName,
      mainFocus: dayInfo.mainFocus,
      dayType: dayInfo.dayType,
      status: "planned",
      targets: {
        calories: plan.targets?.calories || 2000,
        protein: plan.targets?.protein || 140,
        waterLiters: plan.targets?.waterLiters || 3,
        steps: plan.targets?.steps || 8000,
        sleepHours: plan.targets?.sleepHours || 8,
      },
    });
  }

  if (planDays.length > 0) {
    await PlanDay.insertMany(planDays);
  }
};

const buildPlanPayload = (body) => {
  const startDate = getStartOfDay(body.startDate || new Date());
  const durationWeeks = Number(body.durationWeeks || 12);
  const endDate = body.endDate
    ? getStartOfDay(body.endDate)
    : getEndDateFromDuration(startDate, durationWeeks);

  return {
    name: body.name,
    goalType: body.goalType || "fat_loss",
    durationWeeks,
    startDate,
    endDate,
    weeklyWorkoutDays: Number(body.weeklyWorkoutDays || 5),

    targets: {
      calories:
        body.targets?.calories ||
        body.dailyCalorieTarget ||
        body.calories ||
        2000,
      protein:
        body.targets?.protein ||
        body.dailyProteinTarget ||
        body.protein ||
        140,
      carbs: body.targets?.carbs || 200,
      fats: body.targets?.fats || 60,
      waterLiters:
        body.targets?.waterLiters ||
        body.dailyWaterTarget ||
        body.waterLiters ||
        3,
      steps:
        body.targets?.steps ||
        body.dailyStepsTarget ||
        body.steps ||
        8000,
      sleepHours:
        body.targets?.sleepHours ||
        body.dailySleepTarget ||
        body.sleepHours ||
        8,
    },

    preferences: {
      trainingLocation: body.preferences?.trainingLocation || "gym",
      cardioPreference: body.preferences?.cardioPreference || "incline_walk",
      foodPreference: body.preferences?.foodPreference || "regular_scales",
    },

    notes: body.notes || "",
  };
};

// @desc    Create transformation plan
// @route   POST /api/plans
// @access  Private
const createPlan = async (req, res, next) => {
  try {
    const payload = buildPlanPayload(req.body);

    if (!payload.name) {
      res.status(400);
      throw new Error("Plan name is required");
    }

    const plan = await TransformationPlan.create({
      user: req.user._id,
      ...payload,
      status: "draft",
      isActive: false,
    });

    await generatePlanDays(plan);

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private
const getPlans = async (req, res, next) => {
  try {
    const plans = await TransformationPlan.find({
      user: req.user._id,
      status: { $ne: "archived" },
    }).sort({ isActive: -1, startDate: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active plan
// @route   GET /api/plans/active
// @access  Private
const getActivePlan = async (req, res, next) => {
  try {
    const plan = await TransformationPlan.findOne({
      user: req.user._id,
      isActive: true,
      status: "active",
    });

    res.status(200).json({
      success: true,
      plan,
      activePlan: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan with days
// @route   GET /api/plans/:id
// @access  Private
const getPlanById = async (req, res, next) => {
  try {
    const plan = await TransformationPlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    const days = await PlanDay.find({
      plan: plan._id,
      user: req.user._id,
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      plan,
      days,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate plan
// @route   PATCH /api/plans/:id/activate
// @access  Private
const activatePlan = async (req, res, next) => {
  try {
    const plan = await TransformationPlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    await TransformationPlan.updateMany(
      {
        user: req.user._id,
      },
      {
        $set: {
          isActive: false,
          status: "draft",
        },
      }
    );

    plan.isActive = true;
    plan.status = "active";
    await plan.save();

    const user = await User.findById(req.user._id);

    if (user) {
      user.activePlan = plan._id;

      if (plan.targets?.calories) {
        user.dailyCalorieTarget = plan.targets.calories;
      }

      if (plan.targets?.protein) {
        user.dailyProteinTarget = plan.targets.protein;
      }

      if (plan.targets?.waterLiters) {
        user.dailyWaterTarget = plan.targets.waterLiters;
      }

      if (plan.targets?.sleepHours) {
        user.sleepTarget = plan.targets.sleepHours;
      }

      if (user.dailyTargets) {
        user.dailyTargets.calories = plan.targets?.calories || user.dailyCalorieTarget;
        user.dailyTargets.protein = plan.targets?.protein || user.dailyProteinTarget;
        user.dailyTargets.waterLiters = plan.targets?.waterLiters || user.dailyWaterTarget;
        user.dailyTargets.steps = plan.targets?.steps || user.dailyTargets.steps;
        user.dailyTargets.sleepHours = plan.targets?.sleepHours || user.sleepTarget;
        user.dailyTargets.workoutDaysPerWeek = plan.weeklyWorkoutDays;
      }

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Plan activated successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/archive plan
// @route   DELETE /api/plans/:id
// @access  Private
const deletePlan = async (req, res, next) => {
  try {
    const plan = await TransformationPlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    if (plan.isActive) {
      const user = await User.findById(req.user._id);

      if (user && user.activePlan?.toString() === plan._id.toString()) {
        user.activePlan = null;
        await user.save({ validateBeforeSave: false });
      }
    }

    plan.isActive = false;
    plan.status = "archived";
    await plan.save();

    await PlanDay.deleteMany({
      plan: plan._id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getPlans,
  getActivePlan,
  getPlanById,
  activatePlan,
  deletePlan,
};