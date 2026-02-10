const AppError = require("../utils/AppError");

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.statusCode || 500;

  // handle duplicate key (email unique)
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate field value (email already exists)" });
  }

  // handle mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  res.status(status).json({
    message: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
