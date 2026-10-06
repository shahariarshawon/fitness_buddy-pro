const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "super_secret_jwt_key_fitness_buddy_pro_2026";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "super_secret_refresh_token_key_fitness_buddy_pro_2026";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: "refresh" }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = generateToken;
module.exports.generateToken = generateToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.verifyRefreshToken = verifyRefreshToken;