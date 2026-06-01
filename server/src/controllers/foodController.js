const Food = require("../models/Food");

// @desc    Create custom food
// @route   POST /api/foods
// @access  Private
const createFood = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      servingSize,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      sugar,
      sodium,
      notes,
    } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Food name is required");
    }

    if (calories === undefined || calories === null) {
      res.status(400);
      throw new Error("Calories are required");
    }

    const existingFood = await Food.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      createdBy: req.user._id,
    });

    if (existingFood) {
      res.status(400);
      throw new Error("You already created a food with this name");
    }

    const food = await Food.create({
      name,
      brand,
      category,
      servingSize,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      sugar,
      sodium,
      notes,
      isCustom: true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available foods
// @route   GET /api/foods
// @access  Private
const getFoods = async (req, res, next) => {
  try {
    const { search, category, isCustom } = req.query;

    const query = {
      $or: [{ isCustom: false }, { createdBy: req.user._id }],
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (isCustom === "true") {
      query.isCustom = true;
      query.createdBy = req.user._id;
      delete query.$or;
    }

    if (isCustom === "false") {
      query.isCustom = false;
      delete query.$or;
    }

    const foods = await Food.find(query).sort({
      isCustom: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Private
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      $or: [{ isCustom: false }, { createdBy: req.user._id }],
    });

    if (!food) {
      res.status(404);
      throw new Error("Food not found");
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom food
// @route   PUT /api/foods/:id
// @access  Private
const updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      res.status(404);
      throw new Error("Food not found");
    }

    if (!food.isCustom) {
      res.status(403);
      throw new Error("Default foods cannot be edited");
    }

    if (food.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this food");
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom food
// @route   DELETE /api/foods/:id
// @access  Private
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      res.status(404);
      throw new Error("Food not found");
    }

    if (!food.isCustom) {
      res.status(403);
      throw new Error("Default foods cannot be deleted");
    }

    if (food.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this food");
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
};