const { get, detail } = require("../../controller/okupasi.controller.js");
const router = require("express").Router();

router.get("/", get);
router.get("/:id", detail);

module.exports = router;
