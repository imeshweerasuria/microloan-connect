const AppError = require("../utils/AppError");
const repo = require("../repositories/transactionRepository");
const LoanRequest = require("../models/LoanRequest");

async function createTransaction(actorUser, payload) {
  // RBAC rules for creating transactions
  if (actorUser.role === "LENDER" && payload.type !== "FUNDING") {
    throw new AppError("LENDER can only create FUNDING transactions", 403);
  }
  if (actorUser.role === "BORROWER" && payload.type !== "REPAYMENT") {
    throw new AppError("BORROWER can only create REPAYMENT transactions", 403);
  }

  // ensure loan exists
  const loan = await LoanRequest.findById(payload.loanId);
  if (!loan) throw new AppError("Loan not found", 404);

  const txn = await repo.createTxn(payload);

  // funding updates loan fundedAmount (peer-to-peer proof)
  if (txn.type === "FUNDING" && txn.status === "CONFIRMED") {
    loan.fundedAmount += txn.amount;
    await loan.save();
  }

  return txn;
}

async function listAll(filters) {
  return repo.findAll(filters);
}

async function listMine(userId) {
  return repo.findMine(userId);
}

async function getTransaction(actorUser, id) {
  const txn = await repo.findById(id);
  if (!txn) throw new AppError("Transaction not found", 404);

  // Admin can view all; others only own
  if (
    actorUser.role !== "ADMIN" &&
    txn.fromUserId.toString() !== actorUser._id.toString() &&
    txn.toUserId.toString() !== actorUser._id.toString()
  ) {
    throw new AppError("Forbidden", 403);
  }

  return txn;
}

async function updateTransaction(id, updates) {
  const updated = await repo.updateById(id, updates);
  if (!updated) throw new AppError("Transaction not found", 404);
  return updated;
}

async function deleteTransaction(id) {
  const deleted = await repo.deleteById(id);
  if (!deleted) throw new AppError("Transaction not found", 404);
  return deleted;
}

module.exports = {
  createTransaction,
  listAll,
  listMine,
  getTransaction,
  updateTransaction,
  deleteTransaction
};
