const AppError = require("../utils/AppError");

// Day 2: implement JWT verification and attach req.user
function protect(req, res, next) {
  return next(new AppError("Auth not implemented yet (Day 2)", 501));
}

// Day 2: implement role check using req.user.role
function authorize(...roles) {
  return (req, res, next) => {
    return next(new AppError("RBAC not implemented yet (Day 2)", 501));
  };
}

module.exports = { protect, authorize };
