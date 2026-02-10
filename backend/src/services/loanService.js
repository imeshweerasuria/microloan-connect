const AppError = require("../utils/AppError");
const repo = require("../repositories/loanRepository");

async function createLoan(borrowerId, payload) {
  // Day 3: enforce povertyImpactPlanSnapshot from BorrowerProfile if you want
  return repo.createLoan({ ...payload, borrowerId });
}

async function listMyLoans(borrowerId) {
  return repo.findMyLoans(borrowerId);
}

async function updateMyLoan(borrowerId, loanId, payload) {
  const loan = await repo.findById(loanId);
  if (!loan) throw new AppError("Loan not found", 404);
  if (loan.borrowerId.toString() !== borrowerId.toString()) throw new AppError("Forbidden", 403);

  if (!["DRAFT", "SUBMITTED"].includes(loan.status)) {
    throw new AppError("Cannot update loan after approval", 400);
  }

  return repo.updateById(loanId, payload);
}

async function deleteMyLoan(borrowerId, loanId) {
  const loan = await repo.findById(loanId);
  if (!loan) throw new AppError("Loan not found", 404);
  if (loan.borrowerId.toString() !== borrowerId.toString()) throw new AppError("Forbidden", 403);

  if (loan.status !== "DRAFT") throw new AppError("Only DRAFT loans can be deleted", 400);
  return repo.deleteById(loanId);
}

async function browseLoansAsLenderOrAdmin(query) {
  // Day 3: add real filters
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.businessCategory) filters.businessCategory = query.businessCategory;
  return repo.browseLoans(filters);
}

async function approveLoan(loanId) {
  const loan = await repo.findById(loanId);
  if (!loan) throw new AppError("Loan not found", 404);
  if (loan.status !== "SUBMITTED") throw new AppError("Only SUBMITTED loans can be approved", 400);

  return repo.updateById(loanId, { status: "APPROVED" });
}

async function rejectLoan(loanId) {
  const loan = await repo.findById(loanId);
  if (!loan) throw new AppError("Loan not found", 404);
  if (loan.status !== "SUBMITTED") throw new AppError("Only SUBMITTED loans can be rejected", 400);

  return repo.updateById(loanId, { status: "REJECTED" });
}

module.exports = {
  createLoan,
  listMyLoans,
  updateMyLoan,
  deleteMyLoan,
  browseLoansAsLenderOrAdmin,
  approveLoan,
  rejectLoan
};