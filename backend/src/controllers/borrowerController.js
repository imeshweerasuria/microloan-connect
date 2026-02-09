const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/borrowerService");

const createProfile = asyncHandler(async (req, res) => {
  const profile = await service.createBorrowerProfile(req.user._id, req.body);
  res.status(201).json(profile);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await service.getMyProfile(req.user._id);
  res.json(profile);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await service.updateMyProfile(req.user._id, req.body);
  res.json(profile);
});

const deleteMyProfile = asyncHandler(async (req, res) => {
  const deleted = await service.deleteMyProfile(req.user._id);
  res.json({ message: "Profile deleted", deletedId: deleted._id });
});

const getBorrowerProfile = asyncHandler(async (req, res) => {
  const profile = await service.getProfileForLenderOrAdmin(req.params.borrowerId);
  res.json(profile);
});

const verifyBorrower = asyncHandler(async (req, res) => {
  const profile = await service.verifyBorrower(req.params.borrowerId);
  res.json(profile);
});

module.exports = {
  createProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getBorrowerProfile,
  verifyBorrower
};