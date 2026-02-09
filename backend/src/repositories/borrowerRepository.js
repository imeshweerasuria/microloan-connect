const BorrowerProfile = require("../models/BorrowerProfile");

async function createProfile(data) {
  return BorrowerProfile.create(data);
}

async function findByUserId(userId) {
  return BorrowerProfile.findOne({ userId });
}

async function findByBorrowerId(borrowerId) {
  return BorrowerProfile.findOne({ userId: borrowerId });
}

async function updateByUserId(userId, updates) {
  return BorrowerProfile.findOneAndUpdate({ userId }, updates, { new: true });
}

async function deleteByUserId(userId) {
  return BorrowerProfile.findOneAndDelete({ userId });
}

async function setVerified(borrowerId, verified) {
  return BorrowerProfile.findOneAndUpdate(
    { userId: borrowerId },
    { verified },
    { new: true }
  );
}

module.exports = {
  createProfile,
  findByUserId,
  findByBorrowerId,
  updateByUserId,
  deleteByUserId,
  setVerified
};