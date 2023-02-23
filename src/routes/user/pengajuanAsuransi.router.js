const router = require("express").Router();

const pengajuanController = require("../../controller/pengajuanAsuransi.controller");
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/permission.middleware");

router.use(auth, role("USER"));
router.post("/", pengajuanController.create);
router.get("/", pengajuanController.get);
router.get("/invoice/:id", pengajuanController.invoice);
router.get("/purchase/:id", pengajuanController.bayar);

module.exports = router;
