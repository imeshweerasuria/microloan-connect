const AppError = require("../utils/AppError");
const txRepo = require("../repositories/transactionRepository");
const loanRepo = require("../repositories/loanRepository");
const Transaction = require("../models/Transaction");
const fx = require("./fxService");

function ensureObjectIdLike(id, name) {
 if (!id || typeof id !== "string" || id.length !== 24) {
   throw new AppError(`Invalid ID format for ${name}`, 400);
 }

 const hexRegex = /^[0-9a-fA-F]{24}$/;
 if (!hexRegex.test(id)) {
   throw new AppError(`Invalid ID format for ${name}`, 400);
 }
}

exports.createFundingTransaction = async (user, payload) => {
 const { type, loanId, fromUserId, toUserId, amount, currency, note } = payload;

 if (type !== "FUNDING") {
   throw new AppError("Only FUNDING supported for now", 400);
 }

 ensureObjectIdLike(loanId, "loanId");
 ensureObjectIdLike(fromUserId, "fromUserId");
 ensureObjectIdLike(toUserId, "toUserId");

 if (String(user._id) !== String(fromUserId) && user.role !== "ADMIN") {
   throw new AppError("Forbidden: fromUserId must be your user id", 403);
 }

 if (String(fromUserId) === String(toUserId)) {
   throw new AppError("fromUserId and toUserId cannot be the same", 400);
 }

 const numericAmount = Number(amount);
 if (!numericAmount || numericAmount <= 0) {
   throw new AppError("amount must be > 0", 400);
 }

 const loan = await loanRepo.findById(loanId);
 if (!loan) throw new AppError("Loan not found", 404);

 if (!["APPROVED", "FUNDED"].includes(loan.status)) {
   throw new AppError("Only APPROVED/FUNDED loans can receive funding", 400);
 }

 const currentFunded = Number(loan.fundedAmount || 0);
 if (currentFunded >= Number(loan.amount)) {
   throw new AppError("Loan is already fully funded", 400);
 }

 const newFunded = currentFunded + numericAmount;
 if (newFunded > Number(loan.amount)) {
   throw new AppError(
     `Funding amount (${numericAmount}) would exceed loan amount (${loan.amount})`,
     400
   );
 }

 const fromCur = String(currency || loan.currency || "LKR").toUpperCase();
 const toCur = "USD";

 const { rate, date } = await fx.getRate(fromCur, toCur);
 const converted = fx.convertAmount(numericAmount, rate);

 const tx = await txRepo.create({
   type,
   loanId,
   fromUserId,
   toUserId,
   amount: numericAmount,
   currency: fromCur,
   status: "CONFIRMED",
   note: note || "",
   fxProvider: "currencyapi",
   fxFrom: fromCur,
   fxTo: toCur,
   fxRate: rate,
   fxDate: date,
   amountConverted: converted,
   convertedCurrency: toCur
 });

 const updateData = {
   fundedAmount: newFunded
 };

 if (newFunded >= Number(loan.amount)) {
   updateData.status = "FUNDED";
 }

 await loanRepo.updateById(loanId, updateData);

 return tx;
};

exports.listAll = async () => txRepo.listAll();
exports.listMine = async (userId) => txRepo.listMine(userId);

exports.getById = async (user, id) => {
 ensureObjectIdLike(id, "transactionId");

 const tx = await txRepo.findById(id);
 if (!tx) throw new AppError("Transaction not found", 404);

 const isOwner =
   String(tx.fromUserId) === String(user._id) ||
   String(tx.toUserId) === String(user._id);

 if (!isOwner && user.role !== "ADMIN") {
   throw new AppError("Forbidden", 403);
 }

 return tx;
};

exports.updateById = async (id, payload) => {
 ensureObjectIdLike(id, "transactionId");

 const updated = await txRepo.updateById(id, payload);
 if (!updated) throw new AppError("Transaction not found", 404);
 return updated;
};

exports.deleteById = async (id) => {
 ensureObjectIdLike(id, "transactionId");

 const deleted = await txRepo.deleteById(id);
 if (!deleted) throw new AppError("Transaction not found", 404);
 return deleted;
};

exports.getAnalyticsSummary = async () => {
 const grouped = await Transaction.aggregate([
   {
     $match: {
       status: "CONFIRMED"
     }
   },
   {
     $group: {
       _id: "$type",
       totalAmount: { $sum: "$amount" },
       count: { $sum: 1 }
     }
   }
 ]);

 const totalTransactions = await Transaction.countDocuments();

 let totalFunding = 0;
 let totalRepayment = 0;

 for (const row of grouped) {
   if (row._id === "FUNDING") totalFunding = row.totalAmount;
   if (row._id === "REPAYMENT") totalRepayment = row.totalAmount;
 }

 return {
   totalFunding,
   totalRepayment,
   totalTransactions
 };
};
