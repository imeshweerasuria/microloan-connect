const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/loanService");

const createLoan = asyncHandler(async (req, res) => {
  const loan = await service.createLoan(req.user._id, req.body);
  res.status(201).json(loan);
});

const listMyLoans = asyncHandler(async (req, res) => {
  const loans = await service.listMyLoans(req.user._id);
  res.json(loans);
});

const updateLoan = asyncHandler(async (req, res) => {
  const loan = await service.updateMyLoan(req.user._id, req.params.loanId, req.body);
  res.json(loan);
});

const deleteLoan = asyncHandler(async (req, res) => {
  const deleted = await service.deleteMyLoan(req.user._id, req.params.loanId);
  res.json({ message: "Loan deleted", deletedId: deleted._id });
});

const browseLoans = asyncHandler(async (req, res) => {
  const loans = await service.browseLoansAsLenderOrAdmin(req.query);
  res.json(loans);
});

const approveLoan = asyncHandler(async (req, res) => {
  const loan = await service.approveLoan(req.params.loanId);
  res.json(loan);
});

const rejectLoan = asyncHandler(async (req, res) => {
  const loan = await service.rejectLoan(req.params.loanId);
  res.json(loan);
});

module.exports = {
  createLoan,
  listMyLoans,
  updateLoan,
  deleteLoan,
  browseLoans,
  approveLoan,
  rejectLoan
};