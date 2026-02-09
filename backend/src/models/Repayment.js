const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, default: Date.now },
    method: { type: String, default: "CASH" }
  },
  { _id: false }
);

const RepaymentSchema = new mongoose.Schema(
  {
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "LoanRequest", required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true, min: 1 },

    amountPaid: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID", "OVERDUE"],
      default: "PENDING"
    },

    payments: { type: [PaymentSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repayment", RepaymentSchema);