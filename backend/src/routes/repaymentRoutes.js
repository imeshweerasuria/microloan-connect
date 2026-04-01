const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const repayment = require("../controllers/repaymentController");

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
 method: Joi.string().min(2).max(50).optional()
});

const confirmStripeSchema = Joi.object({
 sessionId: Joi.string().required()
});

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

router.get(
 "/loan/:loanId",
 protect,
 authorize("ADMIN", "BORROWER"),
 repayment.listByLoan
);

router.post(
 "/:id/pay",
 protect,
 authorize("BORROWER"),
 validate(paySchema),
 repayment.pay
);

router.post(
 "/:id/stripe-checkout-session",
 protect,
 authorize("BORROWER"),
 repayment.createStripeCheckoutSession
);

router.post(
 "/:id/confirm-stripe-session",
 protect,
 authorize("BORROWER"),
 validate(confirmStripeSchema),
 repayment.confirmStripeSession
);

router.get(
 "/:id",
 protect,
 authorize("ADMIN", "BORROWER"),
 repayment.getRepayment
);

module.exports = router;
