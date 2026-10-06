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
const planRoutes = require("./routes/planRoutes");
const goalRoutes = require("./routes/goalRoutes");
const aiRoutes = require("./routes/aiRoutes");
const trainerRoutes = require("./routes/trainerRoutes");

const { getDBStatus } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const {
  generalLimiter,
  authLimiter,
} = require("./middleware/rateLimitMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const allowedOrigins = [
  "https://fitnessbuddypro.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));

// General rate limit
app.use(generalLimiter);

// Health check handler
const handleHealthCheck = (req, res) => {
  const dbStatus = typeof getDBStatus === "function" ? getDBStatus() : "unknown";
  res.status(200).json({
    success: true,
    message: "Fitness Buddy Pro API is healthy",
    service: "fitness-buddy-pro-api",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fitness Buddy Pro API v2 is running successfully",
    documentation: "/api/v1/health",
  });
});

app.get("/api/health", handleHealthCheck);
app.get("/api/v1/health", handleHealthCheck);

// ==========================================
// API Version 1 Routes (Enterprise Standard)
// ==========================================
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/nutrition", mealRoutes);
app.use("/api/v1/meals", mealRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/trainer", trainerRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/photos", photoRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/reminders", reminderRoutes);

// ==========================================
// Backwards Compatibility Aliases (/api/*)
// ==========================================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;