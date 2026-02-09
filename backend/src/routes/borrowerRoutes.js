const router = require("express").Router();

router.post("/profile", (req, res) => res.json({ message: "TODO create borrower profile" }));
router.get("/profile/me", (req, res) => res.json({ message: "TODO get my borrower profile" }));
router.put("/profile/me", (req, res) => res.json({ message: "TODO update my borrower profile" }));
router.delete("/profile/me", (req, res) => res.json({ message: "TODO delete my borrower profile" }));
router.get("/:borrowerId/profile", (req, res) => res.json({ message: "TODO lender/admin view profile" }));
router.patch("/:borrowerId/verify", (req, res) => res.json({ message: "TODO admin verify borrower" }));

module.exports = router;
