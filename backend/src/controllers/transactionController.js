const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/transactionService");

exports.createTransaction = asyncHandler(async (req, res) => {
  const tx = await service.createFundingTransaction(req.user, req.body);
  res.status(201).json(tx);
});

exports.listAllTransactions = asyncHandler(async (req, res) => {
  const list = await service.listAll(req.query);
  res.json(list);
});

exports.myTransactions = asyncHandler(async (req, res) => {
  const list = await service.listMine(req.user._id);
  res.json(list);
});

exports.getTransactionById = asyncHandler(async (req, res) => {
  const tx = await service.getById(req.user, req.params.id);
  res.json(tx);
});

exports.updateTransaction = asyncHandler(async (req, res) => {
  const tx = await service.updateById(req.params.id, req.body);
  res.json(tx);
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  const deleted = await service.deleteById(req.params.id);
  res.json({ message: "Transaction deleted", deletedId: deleted._id });
});
