const router = require("express").Router();
const okupasiAdminRouter = require("./okupasiAdmin.router.js");
const pengajuanAdminRouter = require("./pengajuanAsuransi.router");

router.use("/okupasi", okupasiAdminRouter);
router.use("/pengajuan-asuransi", pengajuanAdminRouter);

module.exports = router;
