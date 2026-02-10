const router = require("express").Router();
const { protect } = require("../middlewares/auth");
const fx = require("../services/fxService");

router.get("/convert", protect, async (req, res, next) => {
  try {
    const { amount, from, to } = req.query;
    const { rate, date } = await fx.getRate(from, to);
    const converted = fx.convertAmount(Number(amount), rate);

    res.json({
      amount: Number(amount),
      from: String(from).toUpperCase(),
      to: String(to).toUpperCase(),
      rate,
      date,
      converted
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
