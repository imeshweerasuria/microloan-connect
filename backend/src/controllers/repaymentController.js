const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/repaymentService");

const createRepayment = asyncHandler(async (req, res) => {
  const rep = await service.createRepayment(req.body);
  res.status(201).json(rep);
});

const listByLoan = asyncHandler(async (req, res) => {
  const reps = await service.listByLoan(req.params.loanId);
  res.json(reps);
});

const getRepayment = asyncHandler(async (req, res) => {
  const rep = await service.getById(req.params.id);
  res.json(rep);
});

const updateRepayment = asyncHandler(async (req, res) => {
  const rep = await service.updateRepayment(req.params.id, req.body);
  res.json(rep);
});

const deleteRepayment = asyncHandler(async (req, res) => {
  const deleted = await service.deleteRepayment(req.params.id);
  res.json({ message: "Repayment deleted", deletedId: deleted._id });
});

const pay = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;
  const rep = await service.payRepayment(req.user, req.params.id, Number(amount), method);
  res.json(rep);
});


module.exports = {
  createRepayment,
  listByLoan,
  getRepayment,
  updateRepayment,
  deleteRepayment,
  pay
};