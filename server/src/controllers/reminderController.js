const Reminder = require("../models/Reminder");

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
  try {
    const {
      title,
      message,
      reminderType,
      time,
      frequency,
      daysOfWeek,
      isActive,
      timezone,
    } = req.body;

    if (!title) {
      res.status(400);
      throw new Error("Reminder title is required");
    }

    if (!time) {
      res.status(400);
      throw new Error("Reminder time is required");
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      title,
      message,
      reminderType,
      time,
      frequency,
      daysOfWeek,
      isActive,
      timezone,
    });

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
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
    const { reminderType, isActive } = req.query;

    const query = {
      user: req.user._id,
    };

    if (reminderType) {
      query.reminderType = reminderType;
    }

    if (isActive === "true") {
      query.isActive = true;
    }

    if (isActive === "false") {
      query.isActive = false;
    }

    const reminders = await Reminder.find(query).sort({
      time: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
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
    const reminders = await Reminder.find({
      user: req.user._id,
      isActive: true,
    }).sort({ time: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
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
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error("Reminder not found");
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this reminder");
    }

    res.status(200).json({
      success: true,
      reminder,
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
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error("Reminder not found");
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this reminder");
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
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
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error("Reminder not found");
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this reminder");
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: reminder.isActive
        ? "Reminder activated successfully"
        : "Reminder deactivated successfully",
      reminder,
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
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error("Reminder not found");
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this reminder");
    }

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
  getReminderById,
  updateReminder,
  toggleReminder,
  deleteReminder,
};