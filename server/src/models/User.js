const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    age: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null, // cm
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    goal: {
      type: String,
      enum: ["fat_loss", "muscle_gain", "maintenance", "general_fitness"],
      default: "fat_loss",
    },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },

    startingWeight: {
      type: Number,
      default: null,
    },

    targetWeight: {
      type: Number,
      default: null,
    },

    dailyCalorieTarget: {
      type: Number,
      default: 2000,
    },

    dailyProteinTarget: {
      type: Number,
      default: 120,
    },

    dailyWaterTarget: {
      type: Number,
      default: 3, // litres
    },

    sleepTarget: {
      type: Number,
      default: 8, // hours
    },

    unitSystem: {
      type: String,
      enum: ["metric", "imperial"],
      default: "metric",
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;