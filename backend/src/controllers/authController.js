const bcrypt = require("bcrypt");
const Joi = require("joi");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const User = require("../models/User");

// Joi schemas (used by validate middleware)
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid("ADMIN", "LENDER", "BORROWER").required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 400);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, passwordHash, role });

  const token = signToken({ id: user._id });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signToken({ id: user._id });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// Admin-only test endpoint (to prove RBAC in viva)
const adminOnly = asyncHandler(async (req, res) => {
  res.json({ message: "✅ Admin access granted", user: req.user });
});

module.exports = {
  registerSchema,
  loginSchema,
  register,
  login,
  me,
  adminOnly
};
