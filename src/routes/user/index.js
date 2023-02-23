const router = require("express").Router();

const authRoute = require("./auth.router");
const okupasiUserRoute = require("./okupasiUser.router");
const pengajuanAsuransiRoute = require("./pengajuanAsuransi.router");

router.use("/auth", authRoute);
router.use("/okupasi", okupasiUserRoute);
router.use("/pengajuan-asuransi", pengajuanAsuransiRoute);

module.exports = router;
