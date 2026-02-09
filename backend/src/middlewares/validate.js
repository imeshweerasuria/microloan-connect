const AppError = require("../utils/AppError");

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const msg = error.details.map(d => d.message).join(", ");
      return next(new AppError(msg, 400));
    }

    next();
  };
}

module.exports = validate;
