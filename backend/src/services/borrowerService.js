const axios = require("axios");
const AppError = require("../utils/AppError");
const repo = require("../repositories/borrowerRepository");
const communityRepo = require("../repositories/communityRepository");

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpaces(value) {
  return cleanText(value).replace(/\s+/g, " ");
}

function removeLeadingUnit(value) {
  return normalizeSpaces(value).replace(/^[0-9A-Za-z/-]+\s*,\s*/, "").trim();
}

function simplifyLandmarkWords(value) {
  let text = normalizeSpaces(value);

  text = text.replace(/\bCampus\b/gi, "");
  text = text.replace(/\bUniversity\b/gi, "");
  text = text.replace(/\bCollege\b/gi, "");
  text = text.replace(/\bSchool\b/gi, "");
  text = text.replace(/\bHospital\b/gi, "");
  text = text.replace(/\bMall\b/gi, "");
  text = text.replace(/\bBuilding\b/gi, "");
  text = text.replace(/\bRd\b/gi, "Road");

  return normalizeSpaces(text.replace(/\s*,\s*/g, ", ").replace(/\s{2,}/g, " "));
}

function removePostcode(value) {
  return normalizeSpaces(value).replace(/\b\d{5}\b/g, "").replace(/\s*,\s*/g, ", ").trim();
}

function dedupeQueries(queries) {
  return [...new Set(queries.map((q) => normalizeSpaces(q)).filter(Boolean))];
}

function pickCommunityFromAddressParts(addressInfo = {}) {
  const candidates = [
    { key: "suburb", value: addressInfo.suburb },
    { key: "neighbourhood", value: addressInfo.neighbourhood },
    { key: "residential", value: addressInfo.residential },
    { key: "quarter", value: addressInfo.quarter },
    { key: "city_district", value: addressInfo.city_district },
    { key: "hamlet", value: addressInfo.hamlet },
    { key: "village", value: addressInfo.village },
    { key: "town", value: addressInfo.town },
    { key: "city", value: addressInfo.city },
    { key: "municipality", value: addressInfo.municipality },
    { key: "county", value: addressInfo.county },
    { key: "state_district", value: addressInfo.state_district },
    { key: "state", value: addressInfo.state },
  ];

  for (const item of candidates) {
    const value = cleanText(item.value);
    if (value) {
      return {
        community: value,
        matchedFrom: item.key,
      };
    }
  }

  return {
    community: "",
    matchedFrom: "",
  };
}

function fallbackCommunityFromDisplayName(displayName = "") {
  const parts = String(displayName)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const skipWords = new Set(["Sri Lanka"]);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (!skipWords.has(parts[i])) {
      return parts[i];
    }
  }

  return "";
}

function scoreResult(result) {
  const addressInfo = result?.address || {};
  const { community, matchedFrom } = pickCommunityFromAddressParts(addressInfo);

  let score = 0;

  if (community) score += 100;
  if (matchedFrom === "suburb") score += 25;
  if (matchedFrom === "neighbourhood") score += 24;
  if (matchedFrom === "residential") score += 23;
  if (matchedFrom === "quarter") score += 22;
  if (matchedFrom === "city_district") score += 21;
  if (matchedFrom === "hamlet") score += 20;
  if (matchedFrom === "village") score += 19;
  if (matchedFrom === "town") score += 18;
  if (matchedFrom === "city") score += 17;
  if (matchedFrom === "municipality") score += 16;
  if (matchedFrom === "county") score += 15;
  if (matchedFrom === "state_district") score += 14;
  if (matchedFrom === "state") score += 13;

  if (result?.importance) {
    score += Number(result.importance) * 10;
  }

  return score;
}

function buildAddressQueries(address) {
  const original = normalizeSpaces(address);
  const noUnit = removeLeadingUnit(original);
  const noPostcode = removePostcode(original);
  const simplified = simplifyLandmarkWords(original);
  const simplifiedNoPostcode = removePostcode(simplified);
  const simplifiedNoUnit = removeLeadingUnit(simplifiedNoPostcode);

  const queries = [
    `${original}, Sri Lanka`,
    original,
    `${noPostcode}, Sri Lanka`,
    noPostcode,
    `${simplified}, Sri Lanka`,
    simplified,
    `${simplifiedNoPostcode}, Sri Lanka`,
    simplifiedNoPostcode,
    `${noUnit}, Sri Lanka`,
    noUnit,
    `${simplifiedNoUnit}, Sri Lanka`,
    simplifiedNoUnit,
  ];

  const parts = simplifiedNoUnit
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    queries.push(`${parts.slice(-2).join(", ")}, Sri Lanka`);
    queries.push(parts.slice(-2).join(", "));
  }

  if (parts.length >= 1) {
    queries.push(`${parts[parts.length - 1]}, Sri Lanka`);
    queries.push(parts[parts.length - 1]);
  }

  return dedupeQueries(queries);
}

async function searchNominatim(query, useCountryFilter = true) {
  const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
    params: {
      q: query,
      format: "jsonv2",
      addressdetails: 1,
      limit: 5,
      ...(useCountryFilter ? { countrycodes: "lk" } : {}),
    },
    headers: {
      "User-Agent": "MicroLoanConnect/1.0 (student project)",
      Accept: "application/json",
    },
    timeout: 10000,
  });

  return Array.isArray(response.data) ? response.data : [];
}

function chooseBestResult(results) {
  if (!results.length) return null;

  const sortedResults = results
    .map((result) => ({
      result,
      score: scoreResult(result),
    }))
    .sort((a, b) => b.score - a.score);

  return sortedResults[0]?.result || null;
}

function extractCandidateAreaNames(bestResult) {
  const addressInfo = bestResult?.address || {};
  const displayName = cleanText(bestResult?.display_name);

  const directCandidates = [
    addressInfo.suburb,
    addressInfo.neighbourhood,
    addressInfo.residential,
    addressInfo.quarter,
    addressInfo.city_district,
    addressInfo.hamlet,
    addressInfo.village,
    addressInfo.town,
    addressInfo.city,
    addressInfo.municipality,
    addressInfo.county,
    addressInfo.state_district,
    addressInfo.state,
    addressInfo.road,
  ]
    .map((item) => cleanText(item))
    .filter(Boolean);

  const displayParts = displayName
    .split(",")
    .map((part) => cleanText(part))
    .filter(Boolean);

  return [...new Set([...directCandidates, ...displayParts])];
}

function findSupportedCommunityMatch(candidateValues, supportedCommunities) {
  const normalizedCandidates = candidateValues
    .map((item) => cleanText(item))
    .filter(Boolean)
    .map((item) => ({
      raw: item,
      normalized: normalizeText(item),
    }))
    .filter((item) => item.normalized);

  for (const community of supportedCommunities) {
    const namesToCheck = [
      cleanText(community.name),
      ...(Array.isArray(community.aliases) ? community.aliases.map((a) => cleanText(a)) : []),
    ]
      .filter(Boolean)
      .map((item) => ({
        raw: item,
        normalized: normalizeText(item),
      }))
      .filter((item) => item.normalized);

    for (const candidate of normalizedCandidates) {
      for (const option of namesToCheck) {
        if (
          candidate.normalized === option.normalized ||
          candidate.normalized.includes(option.normalized) ||
          option.normalized.includes(candidate.normalized)
        ) {
          return {
            matched: true,
            matchedCommunity: community,
            matchedCandidate: candidate.raw,
            matchedAgainst: option.raw,
          };
        }
      }
    }
  }

  return {
    matched: false,
    matchedCommunity: null,
    matchedCandidate: "",
    matchedAgainst: "",
  };
}

async function createBorrowerProfile(userId, payload) {
  const existing = await repo.findByUserId(userId);
  if (existing) throw new AppError("Borrower profile already exists", 400);

  return repo.createProfile({ ...payload, userId });
}

async function getMyProfile(userId) {
  const profile = await repo.findByUserId(userId);
  if (!profile) throw new AppError("Borrower profile not found", 404);
  return profile;
}

async function updateMyProfile(userId, payload) {
  const updated = await repo.updateByUserId(userId, payload);
  if (!updated) throw new AppError("Borrower profile not found", 404);
  return updated;
}

async function deleteMyProfile(userId) {
  const deleted = await repo.deleteByUserId(userId);
  if (!deleted) throw new AppError("Borrower profile not found", 404);
  return deleted;
}

async function getProfileForLenderOrAdmin(borrowerId) {
  const profile = await repo.findByBorrowerId(borrowerId);
  if (!profile) throw new AppError("Borrower profile not found", 404);
  return profile;
}

async function verifyBorrower(borrowerId) {
  const updated = await repo.setVerified(borrowerId, true);
  if (!updated) throw new AppError("Borrower profile not found", 404);
  return updated;
}

async function lookupCommunityFromAddress(address) {
  const q = cleanText(address);

  if (q.length < 5) {
    throw new AppError("Please enter a more complete address first", 400);
  }

  try {
    const queries = buildAddressQueries(q);

    let allResults = [];

    for (const query of queries) {
      const results = await searchNominatim(query, true);
      if (results.length) {
        allResults = results;
        break;
      }
    }

    if (!allResults.length) {
      for (const query of queries) {
        const results = await searchNominatim(query, false);
        if (results.length) {
          allResults = results;
          break;
        }
      }
    }

    if (!allResults.length) {
      throw new AppError("Could not detect a community from that address", 404);
    }

    const bestResult = chooseBestResult(allResults);
    const addressInfo = bestResult?.address || {};

    let { community: detectedCommunity, matchedFrom } = pickCommunityFromAddressParts(addressInfo);

    if (!detectedCommunity) {
      detectedCommunity = fallbackCommunityFromDisplayName(bestResult?.display_name || "");
      matchedFrom = detectedCommunity ? "display_name" : "";
    }

    const supportedCommunities = await communityRepo.findActive();
    const candidateValues = extractCandidateAreaNames(bestResult);

    if (detectedCommunity) {
      candidateValues.unshift(detectedCommunity);
    }

    const matchInfo = findSupportedCommunityMatch(candidateValues, supportedCommunities);

    return {
      displayName: bestResult?.display_name || "",
      community: matchInfo.matched ? matchInfo.matchedCommunity.name : detectedCommunity,
      detectedCommunity,
      matched: matchInfo.matched,
      matchedFrom,
      matchedCandidate: matchInfo.matchedCandidate,
      matchedCommunity: matchInfo.matched
        ? {
            id: matchInfo.matchedCommunity._id,
            name: matchInfo.matchedCommunity.name,
            district: matchInfo.matchedCommunity.district || "",
          }
        : null,
      latitude: bestResult?.lat || "",
      longitude: bestResult?.lon || "",
      supportedCommunitiesCount: supportedCommunities.length,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error?.response?.status === 429) {
      throw new AppError("Address lookup service is busy. Please try again in a moment.", 503);
    }

    throw new AppError("Address lookup failed", 503);
  }
}

module.exports = {
  createBorrowerProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getProfileForLenderOrAdmin,
  verifyBorrower,
  lookupCommunityFromAddress,
};