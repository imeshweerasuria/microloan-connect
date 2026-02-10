const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const loan = require("../controllers/loanController");

// ✅ Validation schemas
const createLoanSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(3000).required(),

  amount: Joi.number().min(1).required(),
  currency: Joi.string().min(3).max(5).default("LKR"),
  tenureMonths: Joi.number().integer().min(1).max(60).required(),

  purpose: Joi.string().min(3).max(200).required(),
  businessCategory: Joi.string().min(2).max(50).required(),

  // SDG proof: snapshot tied to loan request
  povertyImpactPlanSnapshot: Joi.string().min(10).max(2000).required()
});

const updateLoanSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(3000).optional(),
  amount: Joi.number().min(1).optional(),
  currency: Joi.string().min(3).max(5).optional(),
  tenureMonths: Joi.number().integer().min(1).max(60).optional(),
  purpose: Joi.string().min(3).max(200).optional(),
  businessCategory: Joi.string().min(2).max(50).optional(),
  povertyImpactPlanSnapshot: Joi.string().min(10).max(2000).optional(),

  // borrower can submit (optional)
  status: Joi.string().valid("DRAFT", "SUBMITTED").optional()
}).min(1);

// ✅ BORROWER CRUD
router.post(
  "/",
  protect,
  authorize("BORROWER"),
  validate(createLoanSchema),
  loan.createLoan
);

router.get(
  "/me",
  protect,
  authorize("BORROWER"),
  loan.listMyLoans
);

router.put(
  "/:loanId",
  protect,
  authorize("BORROWER"),
  validate(updateLoanSchema),
  loan.updateLoan
);

router.delete(
  "/:loanId",
  protect,
  authorize("BORROWER"),
  loan.deleteLoan
);

// ✅ LENDER/ADMIN browse (filters via query params)
router.get(
  "/",
  protect,
  authorize("LENDER", "ADMIN"),
  loan.browseLoans
);

// ✅ ADMIN approve / reject
router.patch(
  "/:loanId/approve",
  protect,
  authorize("ADMIN"),
  loan.approveLoan
);

router.patch(
  "/:loanId/reject",
  protect,
  authorize("ADMIN"),
  loan.rejectLoan
);

module.exports = router;
