const router = require("express").Router();
const Joi = require("joi");

const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const community = require("../controllers/communityController");

const createCommunitySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  aliases: Joi.array().items(Joi.string().min(1).max(100)).default([]),
  district: Joi.string().allow("").max(100).default(""),
  active: Joi.boolean().default(true),
});

const updateCommunitySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  aliases: Joi.array().items(Joi.string().min(1).max(100)).optional(),
  district: Joi.string().allow("").max(100).optional(),
  active: Joi.boolean().optional(),
}).min(1);

router.get("/", protect, authorize("ADMIN"), community.listCommunities);

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  validate(createCommunitySchema),
  community.createCommunity
);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  validate(updateCommunitySchema),
  community.updateCommunity
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  community.deleteCommunity
);

module.exports = router;