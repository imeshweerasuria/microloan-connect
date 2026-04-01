const AppError = require("../utils/AppError");
const repo = require("../repositories/repaymentRepository");

async function createRepayment(payload) {
 return repo.createRepayment(payload);
}

async function listByLoan(user, loanId) {
 const reps = await repo.findByLoanId(loanId);

 if (user.role === "ADMIN") {
   return reps;
 }

 return reps.filter(
   (rep) => String(rep.borrowerId) === String(user._id)
 );
}

async function getById(user, id) {
 const rep = await repo.findById(id);
 if (!rep) throw new AppError("Repayment not found", 404);

 if (user.role !== "ADMIN" && String(rep.borrowerId) !== String(user._id)) {
   throw new AppError("Forbidden: not your repayment", 403);
 }

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

async function payRepayment(user, repaymentId, amount, method) {
 const rep = await repo.findById(repaymentId);
 if (!rep) throw new AppError("Repayment not found", 404);

 if (user.role === "BORROWER" && String(rep.borrowerId) !== String(user._id)) {
   throw new AppError("Forbidden: not your repayment", 403);
 }

 if (!amount || amount <= 0) throw new AppError("amount must be > 0", 400);
 if (rep.status === "PAID") throw new AppError("Repayment already PAID", 400);

 const remaining = rep.amountDue - rep.amountPaid;
 if (amount > remaining) {
   throw new AppError(`Payment exceeds remaining amount (${remaining})`, 400);
 }

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
