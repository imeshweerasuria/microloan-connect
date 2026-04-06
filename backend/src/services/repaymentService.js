const Stripe = require("stripe");
const AppError = require("../utils/AppError");
const repo = require("../repositories/repaymentRepository");

const stripe = process.env.STRIPE_SECRET_KEY
 ? new Stripe(process.env.STRIPE_SECRET_KEY)
 : null;

const FRONTEND_BASE_URL =
 process.env.FRONTEND_BASE_URL || "http://localhost:5173";

function toMinorUnits(amount) {
 return Math.round(Number(amount) * 100);
}

async function createRepayment(payload) {
 return repo.createRepayment(payload);
}

async function listByLoan(user, loanId) {
 const reps = await repo.findByLoanId(loanId);

 if (user.role === "ADMIN") {
   return reps;
 }

 return reps.filter(
   (rep) => String(rep.borrowerId) === String(user._id)
 );
}

async function getById(user, id) {
 const rep = await repo.findById(id);
 if (!rep) throw new AppError("Repayment not found", 404);

 if (user.role !== "ADMIN" && String(rep.borrowerId) !== String(user._id)) {
   throw new AppError("Forbidden: not your repayment", 403);
 }

 return rep;
}

async function updateRepayment(id, payload) {
 const updated = await repo.updateById(id, payload);
 if (!updated) throw new AppError("Repayment not found", 404);
 return updated;
}

async function deleteRepayment(id) {
 const deleted = await repo.deleteById(id);
 if (!deleted) throw new AppError("Repayment not found", 404);
 return deleted;
}

async function payRepayment(user, repaymentId, amount, method) {
 const rep = await repo.findById(repaymentId);
 if (!rep) throw new AppError("Repayment not found", 404);

 if (user.role === "BORROWER" && String(rep.borrowerId) !== String(user._id)) {
   throw new AppError("Forbidden: not your repayment", 403);
 }

 if (!amount || amount <= 0) throw new AppError("amount must be > 0", 400);
 if (rep.status === "PAID") throw new AppError("Repayment already PAID", 400);

 const remaining = rep.amountDue - rep.amountPaid;
 if (amount > remaining) {
   throw new AppError(`Payment exceeds remaining amount (${remaining})`, 400);
 }

 rep.payments.push({ amount, method: method || "CASH" });
 rep.amountPaid += amount;

 if (rep.amountPaid >= rep.amountDue) rep.status = "PAID";
 else rep.status = "PARTIAL";

 await rep.save();
 return rep;
}

async function createStripeCheckoutSession(user, repaymentId, amount) {
  if (!stripe) {
    throw new AppError("Stripe is not configured. Add STRIPE_SECRET_KEY first.", 500);
  }

  const rep = await getById(user, repaymentId);

  if (rep.status === "PAID") {
    throw new AppError("Repayment already PAID", 400);
  }

  const remaining = Number(rep.amountDue) - Number(rep.amountPaid);

  // ✅ VALIDATION
  if (!amount || amount <= 0) {
    throw new AppError("Invalid amount", 400);
  }

  if (amount > remaining) {
    throw new AppError(`Amount exceeds remaining balance (${remaining})`, 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${FRONTEND_BASE_URL}/repayments?stripe_success=1&loan_id=${rep.loanId}&repayment_id=${rep._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_BASE_URL}/repayments?stripe_cancel=1&loan_id=${rep.loanId}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "lkr",
          unit_amount: toMinorUnits(amount), // ✅ FIXED
          product_data: {
            name: `Repayment for loan ${rep.loanId}`
          }
        }
      }
    ],
    metadata: {
      repaymentId: String(rep._id),
      amountMajor: String(amount), // ✅ FIXED
      borrowerId: String(rep.borrowerId)
    }
  });

  return {
    sessionId: session.id,
    url: session.url
  };
}

async function confirmStripeSession(user, repaymentId, sessionId) {
 if (!stripe) {
   throw new AppError("Stripe is not configured. Add STRIPE_SECRET_KEY first.", 500);
 }

 const rep = await getById(user, repaymentId);

 const existingStripePayment = rep.payments.find(
   (p) => p.method === `STRIPE:${sessionId}`
 );
 if (existingStripePayment) {
   return rep;
 }

 const session = await stripe.checkout.sessions.retrieve(sessionId);

 if (session.payment_status !== "paid") {
   throw new AppError("Stripe session is not paid yet", 400);
 }

 if (String(session.metadata?.repaymentId) !== String(rep._id)) {
   throw new AppError("Stripe session does not match this repayment", 400);
 }

 const amountMajor = Number(session.metadata?.amountMajor || 0);
 if (!amountMajor || amountMajor <= 0) {
   throw new AppError("Stripe session amount is invalid", 400);
 }

 return payRepayment(user, repaymentId, amountMajor, `STRIPE:${sessionId}`);
}

module.exports = {
 createRepayment,
 listByLoan,
 getById,
 updateRepayment,
 deleteRepayment,
 payRepayment,
 createStripeCheckoutSession,
 confirmStripeSession
};
