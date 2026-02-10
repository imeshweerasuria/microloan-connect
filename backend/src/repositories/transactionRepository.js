const Transaction = require("../models/Transaction");

exports.create = (data) => Transaction.create(data);
exports.listAll = () => Transaction.find().sort({ createdAt: -1 });
exports.listMine = (userId) =>
  Transaction.find({ $or: [{ fromUserId: userId }, { toUserId: userId }] }).sort({ createdAt: -1 });

exports.findById = (id) => Transaction.findById(id);
exports.updateById = (id, updates) => Transaction.findByIdAndUpdate(id, updates, { new: true });
exports.deleteById = (id) => Transaction.findByIdAndDelete(id);
