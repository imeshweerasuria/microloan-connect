const LoanRequest = require("../models/LoanRequest");

async function createLoan(data) {
  return LoanRequest.create(data);
}

async function findById(id) {
  return LoanRequest.findById(id);
}

async function findMyLoans(borrowerId) {
  return LoanRequest.find({ borrowerId }).sort({ createdAt: -1 });
}

async function updateById(id, updates) {
  return LoanRequest.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteById(id) {
  return LoanRequest.findByIdAndDelete(id);
}

async function browseLoans(filters = {}) {
  return LoanRequest.find(filters).sort({ createdAt: -1 });
}

module.exports = {
  createLoan,
  findById,
  findMyLoans,
  updateById,
  deleteById,
  browseLoans
};