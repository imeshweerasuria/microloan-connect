const AppError = require("../utils/AppError");

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Server error"
  });
}

module.exports = { notFound, errorHandler };
