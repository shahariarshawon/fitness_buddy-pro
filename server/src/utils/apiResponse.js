/**
 * Standardized API response utilities for Fitness Buddy Pro
 */

const successResponse = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data: data !== null ? data : {},
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, statusCode = 200, message = "Data retrieved successfully", items = [], total = 0, page = 1, limit = 10) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(statusCode).json({
    success: true,
    message,
    data: items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
