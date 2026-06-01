const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
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

// Error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;