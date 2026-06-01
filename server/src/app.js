const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const mealRoutes = require("./routes/mealRoutes");
const habitRoutes = require("./routes/habitRoutes");
const progressRoutes = require("./routes/progressRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const foodRoutes = require("./routes/foodRoutes");
const photoRoutes = require("./routes/photoRoutes");
const reportRoutes = require("./routes/reportRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fitness Buddy Pro API is running successfully",
  });
});

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend health check passed",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);
// workout routes
app.use("/api/workouts", workoutRoutes);
// meal routes
app.use("/api/meals", mealRoutes);
// habit routes
app.use("/api/habits", habitRoutes);
// progres routes
app.use("/api/progress", progressRoutes);
// dashboard routes
app.use("/api/dashboard", dashboardRoutes);
// user routes
app.use("/api/users", userRoutes);
// exercise routes
app.use("/api/exercises", exerciseRoutes);
// food routes
app.use("/api/foods", foodRoutes);
// photo routes
app.use("/api/photos", photoRoutes);
// report routes
app.use("/api/reports", reportRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;