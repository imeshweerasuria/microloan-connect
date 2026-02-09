const router = require("express").Router();

// Day 7: implement actual third-party call + caching
router.get("/", (req, res) => {
  const { base, target, amount } = req.query;
  res.json({
    message: "TODO exchange-rate (Day 7)",
    base, target, amount
  });
});

module.exports = router;
