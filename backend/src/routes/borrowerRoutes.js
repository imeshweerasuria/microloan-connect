const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const borrower = require("../controllers/borrowerController");

// ✅ Validation schemas
const createProfileSchema = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  address: Joi.string().min(3).max(200).required(),
  community: Joi.string().min(2).max(100).required(),
  businessCategory: Joi.string().min(2).max(50).required(),
  monthlyIncomeRange: Joi.string().min(2).max(50).required(),
  householdSize: Joi.number().integer().min(1).max(50).required(),
  povertyImpactPlan: Joi.string().min(10).max(2000).required()
});

const updateProfileSchema = Joi.object({
  phone: Joi.string().min(7).max(20).optional(),
  address: Joi.string().min(3).max(200).optional(),
  community: Joi.string().min(2).max(100).optional(),
  businessCategory: Joi.string().min(2).max(50).optional(),
  monthlyIncomeRange: Joi.string().min(2).max(50).optional(),
  householdSize: Joi.number().integer().min(1).max(50).optional(),
  povertyImpactPlan: Joi.string().min(10).max(2000).optional()
}).min(1);

// ✅ BORROWER endpoints
router.post(
  "/profile",
  protect,
  authorize("BORROWER"),
  validate(createProfileSchema),
  borrower.createProfile
);

router.get(
  "/profile/me",
  protect,
  authorize("BORROWER"),
  borrower.getMyProfile
);

router.put(
  "/profile/me",
  protect,
  authorize("BORROWER"),
  validate(updateProfileSchema),
  borrower.updateMyProfile
);

router.delete(
  "/profile/me",
  protect,
  authorize("BORROWER"),
  borrower.deleteMyProfile
);

// ✅ LENDER/ADMIN view borrower profile (social proof later)
router.get(
  "/:borrowerId/profile",
  protect,
  authorize("LENDER", "ADMIN"),
  borrower.getBorrowerProfile
);

// ✅ ADMIN verify borrower
router.patch(
  "/:borrowerId/verify",
  protect,
  authorize("ADMIN"),
  borrower.verifyBorrower
);

module.exports = router;
