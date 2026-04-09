const AppError = require("../utils/AppError");
const repo = require("../repositories/communityRepository");

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeAliases(aliases = []) {
  if (!Array.isArray(aliases)) return [];

  return [...new Set(
    aliases
      .map((item) => cleanText(item))
      .filter(Boolean)
  )];
}

async function createCommunity(payload) {
  const name = cleanText(payload.name);
  if (!name) {
    throw new AppError("Community name is required", 400);
  }

  const existing = await repo.findByName(name);
  if (existing) {
    throw new AppError("Community already exists", 400);
  }

  return repo.createCommunity({
    name,
    aliases: normalizeAliases(payload.aliases),
    district: cleanText(payload.district),
    active: payload.active !== false,
  });
}

async function listCommunities() {
  return repo.findAll();
}

async function updateCommunity(id, payload) {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new AppError("Community not found", 404);
  }

  const updates = {};

  if (payload.name !== undefined) {
    const name = cleanText(payload.name);
    if (!name) {
      throw new AppError("Community name cannot be empty", 400);
    }

    const duplicate = await repo.findByName(name);
    if (duplicate && String(duplicate._id) !== String(id)) {
      throw new AppError("Another community already uses that name", 400);
    }

    updates.name = name;
  }

  if (payload.aliases !== undefined) {
    updates.aliases = normalizeAliases(payload.aliases);
  }

  if (payload.district !== undefined) {
    updates.district = cleanText(payload.district);
  }

  if (payload.active !== undefined) {
    updates.active = Boolean(payload.active);
  }

  return repo.updateById(id, updates);
}

async function deleteCommunity(id) {
  const deleted = await repo.deleteById(id);
  if (!deleted) {
    throw new AppError("Community not found", 404);
  }
  return deleted;
}

module.exports = {
  createCommunity,
  listCommunities,
  updateCommunity,
  deleteCommunity,
};