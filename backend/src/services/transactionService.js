const AppError = require("../utils/AppError");
const txRepo = require("../repositories/transactionRepository");
const loanRepo = require("../repositories/loanRepository");

function ensureObjectIdLike(id, name) {
  if (!id || typeof id !== "string" || id.length !== 24) {
    throw new AppError(`Invalid ID format for ${name}`, 400);
  }
}

exports.createFundingTransaction = async (user, payload) => {
  // user is req.user (lender/admin)
  const { type, loanId, fromUserId, toUserId, amount, currency, note } = payload;

  if (type !== "FUNDING") throw new AppError("Only FUNDING supported for now", 400);

  ensureObjectIdLike(loanId, "loanId");
  ensureObjectIdLike(fromUserId, "fromUserId");
  ensureObjectIdLike(toUserId, "toUserId");

  if (String(user._id) !== String(fromUserId) && user.role !== "ADMIN") {
    throw new AppError("Forbidden: fromUserId must be your user id", 403);
  }

  if (!amount || amount <= 0) throw new AppError("amount must be > 0", 400);

  const loan = await loanRepo.findById(loanId);
  if (!loan) throw new AppError("Loan not found", 404);

  // Create transaction
  const tx = await txRepo.create({
    type,
    loanId,
    fromUserId,
    toUserId,
    amount,
    currency: currency || "LKR",
    status: "CONFIRMED",
    note: note || ""
  });

  // Update loan fundedAmount
  const newFunded = (loan.fundedAmount || 0) + amount;
  await loanRepo.updateById(loanId, { fundedAmount: newFunded });

  return tx;
};

exports.listAll = async () => txRepo.listAll();
exports.listMine = async (userId) => txRepo.listMine(userId);

exports.getById = async (user, id) => {
  const tx = await txRepo.findById(id);
  if (!tx) throw new AppError("Transaction not found", 404);

  const isOwner = String(tx.fromUserId) === String(user._id) || String(tx.toUserId) === String(user._id);
  if (!isOwner && user.role !== "ADMIN") throw new AppError("Forbidden", 403);

  return tx;
};

exports.updateById = async (id, payload) => {
  const updated = await txRepo.updateById(id, payload);
  if (!updated) throw new AppError("Transaction not found", 404);
  return updated;
};

exports.deleteById = async (id) => {
  const deleted = await txRepo.deleteById(id);
  if (!deleted) throw new AppError("Transaction not found", 404);
  return deleted;
};
