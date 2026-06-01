const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
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
        default: null,
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
    targetWeight: {
        type: Number,
        default: null,
    }
},
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;