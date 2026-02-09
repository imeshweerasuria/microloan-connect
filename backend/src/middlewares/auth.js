const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("Not authorized (missing Bearer token)", 401);
  }

  const token = auth.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new AppError("Not authorized (invalid token)", 401);
  }

  const user = await User.findById(decoded.id).select("-passwordHash");
  if (!user) throw new AppError("User not found", 401);

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Not authorized", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient role", 403));
    }
    next();
  };
}

module.exports = { protect, authorize };
