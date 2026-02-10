const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth");
const ctrl = require("../controllers/loanController");

// Borrower
router.post("/", protect, authorize("BORROWER"), ctrl.createLoan);
router.get("/me", protect, authorize("BORROWER"), ctrl.listMyLoans);
router.put("/:loanId", protect, authorize("BORROWER"), ctrl.updateLoan);
router.delete("/:loanId", protect, authorize("BORROWER"), ctrl.deleteLoan);

// Lender/Admin
router.get("/", protect, authorize("LENDER", "ADMIN"), ctrl.browseLoans);

// Admin
router.patch("/:loanId/approve", protect, authorize("ADMIN"), ctrl.approveLoan);
router.patch("/:loanId/reject", protect, authorize("ADMIN"), ctrl.rejectLoan);

module.exports = router;
