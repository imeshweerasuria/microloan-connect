const AppError = require("../utils/AppError");
const repo = require("../repositories/loanRepository");
const BorrowerProfile = require("../models/BorrowerProfile");
const { sendSms } = require("./notifyService");

async function notifyBorrowerLoanDecision(loan, actionLabel) {
 try {
   const profile = await BorrowerProfile.findOne({ userId: loan.borrowerId });
   if (!profile?.phone) return;

   const message =
     actionLabel === "APPROVED"
       ? `Your loan "${loan.title}" has been approved in Micro-Loan Connect. You can now wait for lender funding.`
       : `Your loan "${loan.title}" has been rejected in Micro-Loan Connect. Please review and resubmit if needed.`;

   await sendSms({
     to: profile.phone,
     message,
   });
 } catch (error) {
   console.error("Borrower SMS notification failed:", error.message);
 }
}

async function createLoan(borrowerId, payload) {
 return repo.createLoan({ ...payload, borrowerId });
}

async function listMyLoans(borrowerId) {
 return repo.findMyLoans(borrowerId);
}

async function updateMyLoan(borrowerId, loanId, payload) {
 const loan = await repo.findById(loanId);
 if (!loan) throw new AppError("Loan not found", 404);
 if (loan.borrowerId.toString() !== borrowerId.toString()) {
   throw new AppError("Forbidden", 403);
 }

 if (!["DRAFT", "SUBMITTED"].includes(loan.status)) {
   throw new AppError("Cannot update loan after approval", 400);
 }

 return repo.updateById(loanId, payload);
}

async function deleteMyLoan(borrowerId, loanId) {
 const loan = await repo.findById(loanId);
 if (!loan) throw new AppError("Loan not found", 404);
 if (loan.borrowerId.toString() !== borrowerId.toString()) {
   throw new AppError("Forbidden", 403);
 }

 if (loan.status !== "DRAFT") {
   throw new AppError("Only DRAFT loans can be deleted", 400);
 }

 return repo.deleteById(loanId);
}

async function browseLoansAsLenderOrAdmin(query) {
 const filters = {};
 if (query.status) filters.status = query.status;
 if (query.businessCategory) filters.businessCategory = query.businessCategory;
 return repo.browseLoans(filters);
}

async function approveLoan(loanId) {
 const loan = await repo.findById(loanId);
 if (!loan) throw new AppError("Loan not found", 404);
 if (loan.status !== "SUBMITTED") {
   throw new AppError("Only SUBMITTED loans can be approved", 400);
 }

 const updatedLoan = await repo.updateById(loanId, { status: "APPROVED" });
 await notifyBorrowerLoanDecision(updatedLoan, "APPROVED");
 return updatedLoan;
}

async function rejectLoan(loanId) {
 const loan = await repo.findById(loanId);
 if (!loan) throw new AppError("Loan not found", 404);
 if (loan.status !== "SUBMITTED") {
   throw new AppError("Only SUBMITTED loans can be rejected", 400);
 }

 const updatedLoan = await repo.updateById(loanId, { status: "REJECTED" });
 await notifyBorrowerLoanDecision(updatedLoan, "REJECTED");
 return updatedLoan;
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
