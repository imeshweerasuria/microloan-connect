const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["FUNDING", "REPAYMENT", "REFUND"], 
      required: true 
    },
    loanId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "LoanRequest", 
      required: true 
    },

    fromUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    toUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    amount: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    currency: { 
      type: String, 
      default: "LKR" 
    },

    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "CANCELLED"], 
      default: "CONFIRMED" 
    },
    note: { 
      type: String, 
      default: "" 
    },

    // ✅ Day 5 FX fields
    fxProvider: { 
      type: String, 
      default: "frankfurter" 
    },
    fxFrom: { 
      type: String 
    },
    fxTo: { 
      type: String 
    },
    fxRate: { 
      type: Number 
    },
    fxDate: { 
      type: String 
    }, // date returned by API (YYYY-MM-DD)
    amountConverted: { 
      type: Number 
    }, // converted amount
    convertedCurrency: { 
      type: String 
    } // e.g., "USD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);