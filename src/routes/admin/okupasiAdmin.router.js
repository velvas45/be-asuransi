const okupasiController = require("../../controller/okupasi.controller.js");
const router = require("express").Router();
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/permission.middleware");

router.use(auth, role("ADMIN"));
router.post("/create", okupasiController.create);
router.get("/", okupasiController.get);
router.get("/:id", okupasiController.detail);
router.delete("/:id", okupasiController.delete);
router.put("/:id", okupasiController.update);

module.exports = router;
