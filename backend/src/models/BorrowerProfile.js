const mongoose = require("mongoose");

const BorrowerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    phone: { type: String, required: true },
    address: { type: String, required: true },
    community: { type: String, required: true },

    businessCategory: { type: String, required: true }, // farming, tailoring, grocery, etc.
    monthlyIncomeRange: { type: String, required: true }, // e.g. "LKR 30,000 - 50,000"
    householdSize: { type: Number, required: true },

    povertyImpactPlan: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BorrowerProfile", BorrowerProfileSchema);