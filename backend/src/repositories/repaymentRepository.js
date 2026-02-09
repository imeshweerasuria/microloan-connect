const Repayment = require("../models/Repayment");

async function createRepayment(data) {
  return Repayment.create(data);
}

async function findById(id) {
  return Repayment.findById(id);
}

async function findByLoanId(loanId) {
  return Repayment.find({ loanId }).sort({ dueDate: 1 });
}

async function updateById(id, updates) {
  return Repayment.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteById(id) {
  return Repayment.findByIdAndDelete(id);
}

module.exports = {
  createRepayment,
  findById,
  findByLoanId,
  updateById,
  deleteById
};