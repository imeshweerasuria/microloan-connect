const mongoose = require("mongoose");

const LoanRequestSchema = new mongoose.Schema(
  {
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "LKR" },
    tenureMonths: { type: Number, required: true, min: 1 },

    purpose: { type: String, required: true },
    businessCategory: { type: String, required: true },

    povertyImpactPlanSnapshot: { type: String, required: true },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "FUNDED", "ACTIVE", "CLOSED"],
      default: "DRAFT"
    },

    fundedAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanRequest", LoanRequestSchema);