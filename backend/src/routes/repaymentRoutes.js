const router = require("express").Router();

router.post("/", (req, res) => res.json({ message: "TODO create repayment" }));
router.get("/loan/:loanId", (req, res) => res.json({ message: "TODO list repayments by loan" }));
router.get("/:id", (req, res) => res.json({ message: "TODO get repayment by id" }));
router.put("/:id", (req, res) => res.json({ message: "TODO update repayment" }));
router.delete("/:id", (req, res) => res.json({ message: "TODO delete repayment" }));
router.post("/:id/pay", (req, res) => res.json({ message: "TODO borrower pay repayment" }));

module.exports = router;
