const router = require("express").Router();
const userRoute = require("./user/index");
const adminRoute = require("./admin/index");

router.use("/user", userRoute);
router.use("/admin", adminRoute);

module.exports = router;
