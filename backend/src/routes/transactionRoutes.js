const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth");
const ctrl = require("../controllers/transactionController");

router.post("/", protect, authorize("LENDER", "ADMIN"), ctrl.createTransaction);
router.get("/", protect, authorize("ADMIN"), ctrl.listAllTransactions);
router.get("/me", protect, ctrl.myTransactions);
router.get("/:id", protect, ctrl.getTransactionById);
router.put("/:id", protect, authorize("ADMIN"), ctrl.updateTransaction);
router.delete("/:id", protect, authorize("ADMIN"), ctrl.deleteTransaction);

module.exports = router;
