const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const mealRoutes = require("./routes/mealRoutes");
const habitRoutes = require("./routes/habitRoutes");
const progressRoutes = require("./routes/progressRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const foodRoutes = require("./routes/foodRoutes");
const photoRoutes = require("./routes/photoRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const {
  generalLimiter,
  authLimiter,
} = require("./middleware/rateLimitMiddleware");

const app = express();

// Trust proxy for deployment platforms like Render
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Development request logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// General rate limit
app.use(generalLimiter);

// Health routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KynoraFit API is running successfully",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend health check passed",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;