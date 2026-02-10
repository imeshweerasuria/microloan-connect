const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["FUNDING", "REPAYMENT", "REFUND"],
      required: true
    },

    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "LoanRequest", required: true },

    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "LKR" },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED"
    },

    note: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
