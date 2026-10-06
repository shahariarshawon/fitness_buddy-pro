const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitnessBuddyPro";
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    console.warn(
      "[Database Hint] Ensure MongoDB is running locally (mongodb://127.0.0.1:27017) or your IP is whitelisted on MongoDB Atlas."
    );

    if (isProduction) {
      process.exit(1);
    }
    return null;
  }
};

const getDBStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
};

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;