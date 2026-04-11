const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/communityService");

const createCommunity = asyncHandler(async (req, res) => {
  const community = await service.createCommunity(req.body);
  res.status(201).json(community);
});

const listCommunities = asyncHandler(async (req, res) => {
  const list = await service.listCommunities();
  res.json(list);
});

const updateCommunity = asyncHandler(async (req, res) => {
  const community = await service.updateCommunity(req.params.id, req.body);
  res.json(community);
});

const deleteCommunity = asyncHandler(async (req, res) => {
  const deleted = await service.deleteCommunity(req.params.id);
  res.json({ message: "Community deleted", deletedId: deleted._id });
});

module.exports = {
  createCommunity,
  listCommunities,
  updateCommunity,
  deleteCommunity,
};