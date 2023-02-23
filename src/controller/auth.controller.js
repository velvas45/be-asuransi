const User = require("../models/user"),
  _ = require("lodash"),
  UnauthorizedAccessError = require("../errors/UnauthorizedAccessError"),
  utils = require("../utils/index");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CONTROLLER LOGIN
exports.login = (req, res, next) => {
  const email = req.body.email,
    password = req.body.password;

  if (_.isEmpty(email) || _.isEmpty(password)) {
    return next(
      new UnauthorizedAccessError("401", {
        message: "Invalid username or password",
      })
    );
  }

  process.nextTick(function () {
    User.findOne(
      {
        email: email,
      },
      function (err, user) {
        if (err || !user) {
          return next(
            new UnauthorizedAccessError("401", {
              message: "Invalid username or password",
            })
          );
        }

        user.comparePassword(password, function (err, isMatch) {
          if (isMatch && !err) {
            const userTransformer = utils.create(user, req, res, next);
            return res.status(200).json(userTransformer);
          } else {
            return next(
              new UnauthorizedAccessError("401", {
                message: "Invalid username or password",
              })
            );
          }
        });
      }
    );
  });
};

// CONTROLLER UPDATE DATA
exports.updateProfile = async (req, res) => {
  try {
    const id = req.user._id;

    const users = await User.findById(id);
    const nama = req.body.nama ?? users.nama;
    const email = req.body.email ?? users.email;

    const updateData = {
      nama: nama,
      email: email,
    };

    await User.updateOne(
      { _id: Object(id) },
      {
        $set: updateData,
      }
    );

    return res.status(200).json({
      status: true,
      message: "success update profile",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// CONTROLLER CREATE USER
exports.createUser = async (req, res) => {
  try {
    const passwordCus = "user1234";
    const passwordAdm = "admin1234";

    const data = [
      {
        email: "user@gmail.com",
        password: passwordCus,
        nama: "user",
        roleId: "USER",
      },
      {
        email: "admin@gmail.com",
        password: passwordAdm,
        nama: "admin",
        roleId: "ADMIN",
      },
    ];
    await User.create(data);
    res.status(200).json({
      status: true,
      message: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
