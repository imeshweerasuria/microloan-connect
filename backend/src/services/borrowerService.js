const axios = require("axios");
const AppError = require("../utils/AppError");
const repo = require("../repositories/borrowerRepository");

const NOMINATIM_BASE_URL =
 process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

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
 const q = String(address || "").trim();
 if (q.length < 5) {
   throw new AppError("Please enter a more complete address first", 400);
 }

 try {
   const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
     params: {
       q,
       format: "jsonv2",
       addressdetails: 1,
       limit: 1
     },
     headers: {
       "User-Agent": "MicroLoanConnect/1.0 (student project)"
     },
     timeout: 10000
   });

   const result = response.data?.[0];
   if (!result) {
     throw new AppError("Could not detect a community from that address", 404);
   }

   const addressInfo = result.address || {};
   const community =
     addressInfo.suburb ||
     addressInfo.city_district ||
     addressInfo.neighbourhood ||
     addressInfo.village ||
     addressInfo.town ||
     addressInfo.city ||
     addressInfo.county ||
     "";

   return {
     displayName: result.display_name || "",
     community,
     latitude: result.lat || "",
     longitude: result.lon || ""
   };
 } catch (error) {
   if (error instanceof AppError) throw error;
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
 lookupCommunityFromAddress
};
