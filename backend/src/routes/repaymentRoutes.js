const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const repayment = require("../controllers/repaymentController");

// ✅ Validation schemas
const createRepaymentSchema = Joi.object({
  loanId: Joi.string().required(),
  borrowerId: Joi.string().required(),
  dueDate: Joi.date().required(),
  amountDue: Joi.number().min(1).required()
});

const updateRepaymentSchema = Joi.object({
  dueDate: Joi.date().optional(),
  amountDue: Joi.number().min(1).optional(),
  status: Joi.string().valid("PENDING", "PARTIAL", "PAID", "OVERDUE").optional()
}).min(1);

const paySchema = Joi.object({
  amount: Joi.number().min(1).required(),
  method: Joi.string().min(2).max(20).optional()
});

// ✅ ADMIN CRUD
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  validate(createRepaymentSchema),
  repayment.createRepayment
);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  validate(updateRepaymentSchema),
  repayment.updateRepayment
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  repayment.deleteRepayment
);

// ✅ View repayments (ADMIN or BORROWER)
router.get(
  "/loan/:loanId",
  protect,
  authorize("ADMIN", "BORROWER"),
  repayment.listByLoan
);

router.get(
  "/:id",
  protect,
  authorize("ADMIN", "BORROWER"),
  repayment.getRepayment
);

// ✅ BORROWER action: pay
router.post(
  "/:id/pay",
  protect,
  authorize("BORROWER"),
  validate(paySchema),
  repayment.pay
);

module.exports = router;
