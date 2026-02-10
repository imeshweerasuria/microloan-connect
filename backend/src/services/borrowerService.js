const AppError = require("../utils/AppError");
const repo = require("../repositories/borrowerRepository");

async function createBorrowerProfile(userId, payload) {
  const existing = await repo.findByUserId(userId);
  if (existing) throw new AppError("Borrower profile already exists", 400);

  return repo.createProfile({ ...payload, userId });
}

async function getMyProfile(userId) {
  const profile = await repo.findByUserId(userId);
  if (!profile) throw new AppError("Borrower profile not found", 404);
  return profile;
}

async function updateMyProfile(userId, payload) {
  const updated = await repo.updateByUserId(userId, payload);
  if (!updated) throw new AppError("Borrower profile not found", 404);
  return updated;
}

async function deleteMyProfile(userId) {
  const deleted = await repo.deleteByUserId(userId);
  if (!deleted) throw new AppError("Borrower profile not found", 404);
  return deleted;
}

async function getProfileForLenderOrAdmin(borrowerId) {
  const profile = await repo.findByBorrowerId(borrowerId);
  if (!profile) throw new AppError("Borrower profile not found", 404);
  return profile;
}

async function verifyBorrower(borrowerId) {
  const updated = await repo.setVerified(borrowerId, true);
  if (!updated) throw new AppError("Borrower profile not found", 404);
  return updated;
}

module.exports = {
  createBorrowerProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getProfileForLenderOrAdmin,
  verifyBorrower
};