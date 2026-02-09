const router = require("express").Router();

router.post("/", (req, res) => res.json({ message: "TODO create loan request" }));
router.get("/me", (req, res) => res.json({ message: "TODO list my loans" }));
router.put("/:loanId", (req, res) => res.json({ message: "TODO update my loan" }));
router.delete("/:loanId", (req, res) => res.json({ message: "TODO delete my loan" }));
router.get("/", (req, res) => res.json({ message: "TODO browse loans (lender/admin)" }));
router.patch("/:loanId/approve", (req, res) => res.json({ message: "TODO admin approve" }));
router.patch("/:loanId/reject", (req, res) => res.json({ message: "TODO admin reject" }));

module.exports = router;
