const router = require("express").Router();
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const auth = require("../controllers/authController");

router.post("/register", validate(auth.registerSchema), auth.register);
router.post("/login", validate(auth.loginSchema), auth.login);

router.get("/me", protect, auth.me);
router.get("/admin-test", protect, authorize("ADMIN"), auth.adminOnly);

module.exports = router;
