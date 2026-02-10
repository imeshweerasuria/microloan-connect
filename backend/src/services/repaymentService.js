const AppError = require("../utils/AppError");
const repo = require("../repositories/repaymentRepository");

async function createRepayment(payload) {
  return repo.createRepayment(payload);
}

async function listByLoan(loanId) {
  return repo.findByLoanId(loanId);
}

async function getById(id) {
  const rep = await repo.findById(id);
  if (!rep) throw new AppError("Repayment not found", 404);
  return rep;
}

async function updateRepayment(id, payload) {
  const updated = await repo.updateById(id, payload);
  if (!updated) throw new AppError("Repayment not found", 404);
  return updated;
}

async function deleteRepayment(id) {
  const deleted = await repo.deleteById(id);
  if (!deleted) throw new AppError("Repayment not found", 404);
  return deleted;
}

async function payRepayment(repaymentId, amount, method) {
  const rep = await repo.findById(repaymentId);
  if (!rep) throw new AppError("Repayment not found", 404);

  // Day 3: verify borrower owns loan etc
  rep.payments.push({ amount, method: method || "CASH" });
  rep.amountPaid += amount;

  if (rep.amountPaid >= rep.amountDue) rep.status = "PAID";
  else rep.status = "PARTIAL";

  await rep.save();
  return rep;
}

module.exports = {
  createRepayment,
  listByLoan,
  getById,
  updateRepayment,
  deleteRepayment,
  payRepayment
};