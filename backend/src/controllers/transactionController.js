const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/transactionService");

const create = asyncHandler(async (req, res) => {
  const txn = await service.createTransaction(req.user, req.body);
  res.status(201).json(txn);
});

const listAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.loanId) filters.loanId = req.query.loanId;

  const txns = await service.listAll(filters);
  res.json(txns);
});

const mine = asyncHandler(async (req, res) => {
  const txns = await service.listMine(req.user._id);
  res.json(txns);
});

const getById = asyncHandler(async (req, res) => {
  const txn = await service.getTransaction(req.user, req.params.id);
  res.json(txn);
});

const update = asyncHandler(async (req, res) => {
  const txn = await service.updateTransaction(req.params.id, req.body);
  res.json(txn);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await service.deleteTransaction(req.params.id);
  res.json({ message: "Transaction deleted", deletedId: deleted._id });
});

module.exports = { create, listAll, mine, getById, update, remove };
