const Community = require("../models/Community");

async function createCommunity(data) {
  return Community.create(data);
}

async function findAll() {
  return Community.find().sort({ name: 1 });
}

async function findActive() {
  return Community.find({ active: true }).sort({ name: 1 });
}

async function findById(id) {
  return Community.findById(id);
}

async function findByName(name) {
  return Community.findOne({ name });
}

async function updateById(id, updates) {
  return Community.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

async function deleteById(id) {
  return Community.findByIdAndDelete(id);
}

module.exports = {
  createCommunity,
  findAll,
  findActive,
  findById,
  findByName,
  updateById,
  deleteById,
};