const router = require("express").Router();

router.post("/", (req, res) => res.json({ message: "TODO create transaction" }));
router.get("/", (req, res) => res.json({ message: "TODO list all transactions (admin)" }));
router.get("/me", (req, res) => res.json({ message: "TODO my transactions" }));
router.get("/:id", (req, res) => res.json({ message: "TODO get transaction by id" }));
router.put("/:id", (req, res) => res.json({ message: "TODO update transaction" }));
router.delete("/:id", (req, res) => res.json({ message: "TODO delete transaction" }));

module.exports = router;
