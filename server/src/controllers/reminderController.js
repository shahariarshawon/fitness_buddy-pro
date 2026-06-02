const Reminder = require("../models/Reminder");

const VALID_REMINDER_TYPES = [
  "workout",
  "water",
  "meal",
  "sleep",
  "habit",
  "custom",
];

const VALID_FREQUENCIES = ["daily", "weekly", "custom"];

const VALID_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "message",
  "reminderType",
  "time",
  "frequency",
  "daysOfWeek",
  "isActive",
  "timezone",
];

const cleanString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(time || ""));
};

const normalizeDaysOfWeek = (daysOfWeek = []) => {
  if (!Array.isArray(daysOfWeek)) return [];

  return [...new Set(daysOfWeek.map((day) => String(day).toLowerCase()))].filter(
    (day) => VALID_DAYS.includes(day)
  );
};

const getTodayName = () => {
  return VALID_DAYS[new Date().getDay()];
};

const buildReminderPayload = (body) => {
  const frequency = body.frequency || "daily";

  let daysOfWeek = normalizeDaysOfWeek(body.daysOfWeek);

  if (frequency === "daily") {
    daysOfWeek = [];
  }

  return {
    title: cleanString(body.title),
    message: cleanString(body.message),
    reminderType: body.reminderType || "custom",
    time: body.time,
    frequency,
    daysOfWeek,
    isActive:
      body.isActive === undefined || body.isActive === null
        ? true
        : Boolean(body.isActive),
    timezone: cleanString(body.timezone) || "Asia/Dhaka",
  };
};

const validateReminderPayload = (payload, isUpdate = false) => {
  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title) {
      const error = new Error("Reminder title is required");
      error.statusCode = 400;
      throw error;
    }

    if (payload.title.length > 80) {
      const error = new Error("Reminder title cannot exceed 80 characters");
      error.statusCode = 400;
      throw error;
    }
  }

  if (payload.message && payload.message.length > 300) {
    const error = new Error("Reminder message cannot exceed 300 characters");
    error.statusCode = 400;
    throw error;
  }

  if (!isUpdate || payload.time !== undefined) {
    if (!payload.time) {
      const error = new Error("Reminder time is required");
      error.statusCode = 400;
      throw error;
    }

    if (!isValidTime(payload.time)) {
      const error = new Error("Reminder time must be in HH:mm format");
      error.statusCode = 400;
      throw error;
    }
  }

  if (
    payload.reminderType !== undefined &&
    !VALID_REMINDER_TYPES.includes(payload.reminderType)
  ) {
    const error = new Error("Invalid reminder type");
    error.statusCode = 400;
    throw error;
  }

  if (
    payload.frequency !== undefined &&
    !VALID_FREQUENCIES.includes(payload.frequency)
  ) {
    const error = new Error("Invalid reminder frequency");
    error.statusCode = 400;
    throw error;
  }

  if (
    ["weekly", "custom"].includes(payload.frequency) &&
    payload.daysOfWeek !== undefined &&
    payload.daysOfWeek.length === 0
  ) {
    const error = new Error(
      "Please select at least one day for weekly/custom reminders"
    );
    error.statusCode = 400;
    throw error;
  }
};

const filterAllowedUpdateFields = (body) => {
  const updateData = {};

  ALLOWED_UPDATE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  });

  if (updateData.title !== undefined) {
    updateData.title = cleanString(updateData.title);
  }

  if (updateData.message !== undefined) {
    updateData.message = cleanString(updateData.message);
  }

  if (updateData.timezone !== undefined) {
    updateData.timezone = cleanString(updateData.timezone) || "Asia/Dhaka";
  }

  if (updateData.daysOfWeek !== undefined) {
    updateData.daysOfWeek = normalizeDaysOfWeek(updateData.daysOfWeek);
  }

  if (updateData.frequency === "daily") {
    updateData.daysOfWeek = [];
  }

  return updateData;
};

const getReminderOrFail = async (reminderId, userId) => {
  const reminder = await Reminder.findOne({
    _id: reminderId,
    user: userId,
  });

  if (!reminder) {
    const error = new Error("Reminder not found");
    error.statusCode = 404;
    throw error;
  }

  return reminder;
};

const getNextTriggerText = (reminder) => {
  if (!reminder.isActive) return "Inactive";

  if (reminder.frequency === "daily") {
    return `Daily at ${reminder.time}`;
  }

  if (["weekly", "custom"].includes(reminder.frequency)) {
    const days = reminder.daysOfWeek?.length
      ? reminder.daysOfWeek.map((day) => day.slice(0, 3)).join(", ")
      : "No days selected";

    return `${days} at ${reminder.time}`;
  }

  return reminder.time;
};

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
  try {
    const payload = buildReminderPayload(req.body);

    validateReminderPayload(payload);

    const duplicateReminder = await Reminder.findOne({
      user: req.user._id,
      title: { $regex: `^${payload.title}$`, $options: "i" },
      time: payload.time,
      reminderType: payload.reminderType,
    });

    if (duplicateReminder) {
      res.status(400);
      throw new Error("A similar reminder already exists at this time");
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      ...payload,
    });

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder: {
        ...reminder.toObject(),
        nextTriggerText: getNextTriggerText(reminder),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const {
      reminderType,
      isActive,
      frequency,
      search,
      todayOnly,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    if (reminderType && reminderType !== "all") {
      query.reminderType = reminderType;
    }

    if (frequency && frequency !== "all") {
      query.frequency = frequency;
    }

    if (isActive === "true") {
      query.isActive = true;
    }

    if (isActive === "false") {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (todayOnly === "true") {
      const today = getTodayName();

      query.$or = [
        ...(query.$or || []),
        { frequency: "daily" },
        { daysOfWeek: today },
      ];
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [reminders, total] = await Promise.all([
      Reminder.find(query)
        .sort({
          isActive: -1,
          time: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Reminder.countDocuments(query),
    ]);

    const formattedReminders = reminders.map((reminder) => ({
      ...reminder.toObject(),
      nextTriggerText: getNextTriggerText(reminder),
    }));

    res.status(200).json({
      success: true,
      count: formattedReminders.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      reminders: formattedReminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active reminders only
// @route   GET /api/reminders/active
// @access  Private
const getActiveReminders = async (req, res, next) => {
  try {
    const { reminderType, todayOnly } = req.query;

    const query = {
      user: req.user._id,
      isActive: true,
    };

    if (reminderType && reminderType !== "all") {
      query.reminderType = reminderType;
    }

    if (todayOnly === "true") {
      const today = getTodayName();

      query.$or = [{ frequency: "daily" }, { daysOfWeek: today }];
    }

    const reminders = await Reminder.find(query).sort({
      time: 1,
      createdAt: -1,
    });

    const formattedReminders = reminders.map((reminder) => ({
      ...reminder.toObject(),
      nextTriggerText: getNextTriggerText(reminder),
    }));

    res.status(200).json({
      success: true,
      count: formattedReminders.length,
      reminders: formattedReminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reminder stats
// @route   GET /api/reminders/stats
// @access  Private
const getReminderStats = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id,
    });

    const today = getTodayName();

    const stats = reminders.reduce(
      (total, reminder) => {
        total.total += 1;

        if (reminder.isActive) total.active += 1;
        if (!reminder.isActive) total.inactive += 1;

        total.byType[reminder.reminderType] =
          (total.byType[reminder.reminderType] || 0) + 1;

        total.byFrequency[reminder.frequency] =
          (total.byFrequency[reminder.frequency] || 0) + 1;

        const isForToday =
          reminder.frequency === "daily" ||
          reminder.daysOfWeek?.includes(today);

        if (reminder.isActive && isForToday) {
          total.activeToday += 1;
        }

        return total;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        activeToday: 0,
        byType: {},
        byFrequency: {},
      }
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reminders due today
// @route   GET /api/reminders/today
// @access  Private
const getTodayReminders = async (req, res, next) => {
  try {
    const today = getTodayName();

    const reminders = await Reminder.find({
      user: req.user._id,
      isActive: true,
      $or: [{ frequency: "daily" }, { daysOfWeek: today }],
    }).sort({ time: 1 });

    const formattedReminders = reminders.map((reminder) => ({
      ...reminder.toObject(),
      nextTriggerText: getNextTriggerText(reminder),
    }));

    res.status(200).json({
      success: true,
      day: today,
      count: formattedReminders.length,
      reminders: formattedReminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminderById = async (req, res, next) => {
  try {
    const reminder = await getReminderOrFail(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      reminder: {
        ...reminder.toObject(),
        nextTriggerText: getNextTriggerText(reminder),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res, next) => {
  try {
    const reminder = await getReminderOrFail(req.params.id, req.user._id);

    const updateData = filterAllowedUpdateFields(req.body);

    const finalData = {
      title: updateData.title !== undefined ? updateData.title : reminder.title,
      message:
        updateData.message !== undefined ? updateData.message : reminder.message,
      reminderType:
        updateData.reminderType !== undefined
          ? updateData.reminderType
          : reminder.reminderType,
      time: updateData.time !== undefined ? updateData.time : reminder.time,
      frequency:
        updateData.frequency !== undefined
          ? updateData.frequency
          : reminder.frequency,
      daysOfWeek:
        updateData.daysOfWeek !== undefined
          ? updateData.daysOfWeek
          : reminder.daysOfWeek,
      isActive:
        updateData.isActive !== undefined ? updateData.isActive : reminder.isActive,
      timezone:
        updateData.timezone !== undefined ? updateData.timezone : reminder.timezone,
    };

    if (finalData.frequency === "daily") {
      finalData.daysOfWeek = [];
    }

    validateReminderPayload(finalData, true);

    Object.keys(finalData).forEach((field) => {
      reminder[field] = finalData[field];
    });

    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder: {
        ...reminder.toObject(),
        nextTriggerText: getNextTriggerText(reminder),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reminder active/inactive
// @route   PATCH /api/reminders/:id/toggle
// @access  Private
const toggleReminder = async (req, res, next) => {
  try {
    const reminder = await getReminderOrFail(req.params.id, req.user._id);

    if (req.body.isActive !== undefined) {
      reminder.isActive = Boolean(req.body.isActive);
    } else {
      reminder.isActive = !reminder.isActive;
    }

    await reminder.save();

    res.status(200).json({
      success: true,
      message: reminder.isActive
        ? "Reminder activated successfully"
        : "Reminder deactivated successfully",
      reminder: {
        ...reminder.toObject(),
        nextTriggerText: getNextTriggerText(reminder),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reminder as triggered
// @route   PATCH /api/reminders/:id/triggered
// @access  Private
const markReminderTriggered = async (req, res, next) => {
  try {
    const reminder = await getReminderOrFail(req.params.id, req.user._id);

    reminder.lastTriggeredAt = new Date();
    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Reminder trigger time updated",
      reminder: {
        ...reminder.toObject(),
        nextTriggerText: getNextTriggerText(reminder),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await getReminderOrFail(req.params.id, req.user._id);

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  getActiveReminders,
  getReminderStats,
  getTodayReminders,
  getReminderById,
  updateReminder,
  toggleReminder,
  markReminderTriggered,
  deleteReminder,
};