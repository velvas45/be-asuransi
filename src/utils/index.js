"use strict";

const path = require("path"),
  util = require("util"),
  _ = require("lodash"),
  jsonwebtoken = require("jsonwebtoken"),
  TOKEN_EXPIRATION = 60,
  TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60,
  UnauthorizedAccessError = require(path.join(
    __dirname,
    "..",
    "errors",
    "UnauthorizedAccessError.js"
  ));

/**
 * Find the authorization headers from the headers in the request
 *
 * @param headers
 * @returns {*}
 */
module.exports.fetch = function (headers) {
  if (headers && headers.authorization) {
    const authorization = headers.authorization;
    const part = authorization.split(" ");
    if (part.length === 2) {
      const token = part[1];
      return part[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

/**
 * Creates a new token for the user that has been logged in
 *
 * @param user
 * @param req
 * @param res
 * @param next
 *
 * @returns {*}
 */
module.exports.create = function (user, req, res, next) {
  if (_.isEmpty(user)) {
    return next(new Error("User data cannot be empty."));
  }

  const data = {
    _id: user._id,
    email: user.email,
    access: user.roleId,
    nama: user.nama,
    email: user.email,
    role: user.roleId,
    token: jsonwebtoken.sign(
      { _id: user._id, email: user.email, role: user.roleId },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "1y",
      }
    ),
  };

  const decoded = jsonwebtoken.decode(data.token);

  data.token_exp = decoded.exp;
  data.token_iat = decoded.iat;

  return data;
};

/**
 * Fetch the token from redis for the given key
 *
 * @param id
 * @param done
 * @returns {*}
 */
// module.exports.retrieve = function (id, done) {

//     if (_.isNull(id)) {
//         return done(new Error("token_invalid"), {
//             "message": "Invalid token"
//         });
//     }

//     client.get(id, function (err, reply) {
//         if (err) {
//             return done(err, {
//                 "message": err
//             });
//         }

//         if (_.isNull(reply)) {
//             return done(new Error("token_invalid"), {
//                 "message": "Token doesn't exists, are you sure it hasn't expired or been revoked?"
//             });
//         } else {
//             const data = JSON.parse(reply);

//             if (_.isEqual(data.token, id)) {
//                 return done(null, data);
//             } else {
//                 return done(new Error("token_doesnt_exist"), {
//                     "message": "Token doesn't exists, login into the system so it can generate new token."
//                 });
//             }

//         }

//     });

// };

/**
 * Verifies that the token supplied in the request is valid, by checking the redis store to see if it's stored there.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.verify = function (req, res, next) {
  const token = exports.fetch(req.headers);

  jsonwebtoken.verify(token, process.env.SECRET_TOKEN, function (err, user) {
    if (err) {
      req.user = undefined;
      return next(
        new UnauthorizedAccessError("invalid_token", {
          message: err,
        })
      );
    }

    req.user = user;
    next();

    // exports.retrieve(token, function (err, data) {

    //     if (err) {
    //         req.user = undefined;
    //         return next(new UnauthorizedAccessError("invalid_token", data));
    //     }

    //     req.user = data;
    //     next();

    // });
  });
};

/**
 * Expires the token, so the user can no longer gain access to the system, without logging in again or requesting new token
 *
 * @param headers
 * @returns {boolean}
 */
module.exports.expire = function (headers) {
  const token = exports.fetch(headers);

  // if (token !== null) {
  //     client.expire(token, 0);
  // }

  return token !== null;
};

/**
 * Middleware for getting the token into the user
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.middleware = function () {
  const func = function (req, res, next) {
    const token = exports.fetch(req.headers);
    jsonwebtoken.verify(token, process.env.SECRET_TOKEN, function (err, user) {
      if (err) {
        req.user = undefined;
        return next(
          new UnauthorizedAccessError("invalid_token", {
            message: err,
          })
        );
      }

      req.user = user;
      next();
    });

    // exports.retrieve(token, function (err, data) {

    //     if (err) {
    //         req.user = undefined;
    //         return next(new UnauthorizedAccessError("invalid_token", data));
    //     } else {
    //         req.user = _.merge(req.user, data);
    //         next();
    //     }

    // });
  };

  const { unless } = require("express-unless");

  func.unless = unless;

  return func;
};

module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;
