"use strict";
const _ = require("lodash"),
  util = require("util"),
  path = require("path"),
  utils = require(path.join(__dirname, "..", "..", "utils", "index")),
  router = require("express").Router(),
  UnauthorizedAccessError = require(path.join(
    __dirname,
    "..",
    "..",
    "errors",
    "UnauthorizedAccessError.js"
  )),
  authController = require("../../controller/auth.controller"),
  auth = require("../../middleware/auth.middleware");

const { login, createUser, updateProfile } = authController;

// Route Login
router.post("/login", login);
// LOGOUT
router.get("/logout", function (req, res, next) {
  if (utils.expire(req.headers)) {
    delete req.user;
    return res.status(200).json({
      message: "User has been successfully logged out",
    });
  } else {
    return next(new UnauthorizedAccessError("401"));
  }
});
// Create User
router.get("/create", createUser);
// Use Middleware
router.use(auth);
// Update Profile
router.put("/profile/update", updateProfile);

module.exports = router;

// module.exports = function () {
//   var router = new Router();

//   router.route("/verify").get(function (req, res, next) {
//     return res.status(200).json(undefined);
//   });

//   router.route("/logout").get(function (req, res, next) {
//     if (utils.expire(req.headers)) {
//       delete req.user;
//       return res.status(200).json({
//         message: "User has been successfully logged out",
//       });
//     } else {
//       return next(new UnauthorizedAccessError("401"));
//     }
//   });

//   router.route("/login").post(authController.authenticate);

//   const { unless } = require("express-unless");
//   router.unless = unless;

//   return router;
// };
