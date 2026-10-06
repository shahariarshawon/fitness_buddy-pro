const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes by verifying JWT Bearer token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized. No token provided");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_jwt_key_fitness_buddy_pro_2026"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized. User no longer exists");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated. Please contact support.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(error);
  }
};

/**
 * Grant access to specific roles (e.g. authorize('admin', 'trainer'))
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized. Authentication required"));
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : "user";
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      res.status(403);
      return next(
        new Error(
          `Access forbidden: role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};