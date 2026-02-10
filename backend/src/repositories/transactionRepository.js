const Transaction = require("../models/Transaction");

async function createTxn(data) {
  return Transaction.create(data);
}

async function findById(id) {
  return Transaction.findById(id);
}

async function findAll(filters) {
  return Transaction.find(filters).sort({ createdAt: -1 });
}

async function findMine(userId) {
  return Transaction.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }]
  }).sort({ createdAt: -1 });
}

async function updateById(id, updates) {
  return Transaction.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteById(id) {
  return Transaction.findByIdAndDelete(id);
}

module.exports = {
  createTxn,
  findById,
  findAll,
  findMine,
  updateById,
  deleteById
};
