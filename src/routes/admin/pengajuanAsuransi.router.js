const router = require("express").Router();

const pengajuanController = require("../../controller/pengajuanAsuransi.controller");
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/permission.middleware");

router.use(auth, role("ADMIN"));
router.get("/", pengajuanController.list);
router.get("/:id", pengajuanController.detail);
router.post("/approval", pengajuanController.approval);

module.exports = router;
