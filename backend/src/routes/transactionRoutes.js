const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const txn = require("../controllers/transactionController");

const createTxnSchema = Joi.object({
  type: Joi.string().valid("FUNDING", "REPAYMENT", "REFUND").required(),
  loanId: Joi.string().required(),
  fromUserId: Joi.string().required(),
  toUserId: Joi.string().required(),
  amount: Joi.number().min(1).required(),
  currency: Joi.string().min(3).max(5).optional(),
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED").optional(),
  note: Joi.string().max(500).optional()
});

const updateTxnSchema = Joi.object({
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED").optional(),
  note: Joi.string().max(500).optional()
}).min(1);

// ✅ Create: ADMIN/LENDER/BORROWER (service enforces type rules)
router.post("/", protect, authorize("ADMIN", "LENDER", "BORROWER"), validate(createTxnSchema), txn.create);

// ✅ Admin list all
router.get("/", protect, authorize("ADMIN"), txn.listAll);

// ✅ My transactions
router.get("/me", protect, authorize("ADMIN", "LENDER", "BORROWER"), txn.mine);

// ✅ View single (admin or owner enforced in service)
router.get("/:id", protect, authorize("ADMIN", "LENDER", "BORROWER"), txn.getById);

// ✅ Admin update/delete
router.put("/:id", protect, authorize("ADMIN"), validate(updateTxnSchema), txn.update);
router.delete("/:id", protect, authorize("ADMIN"), txn.remove);

module.exports = router;
