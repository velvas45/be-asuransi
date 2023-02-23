require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mongoString = process.env.DATABASE_URL;
const app = express();
const router = require("./src/routes/index");
const apiVersion = process.env.VERSION_API;
const NotFoundError = require(path.join(
  __dirname,
  "src",
  "errors",
  "NotFoundError.js"
));

mongoose.connect(mongoString, (err) => {
  if (err) console.log(err);
  console.log("Connected to MongoDB");
});

app.use(express.json());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// handle CORS
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (request.method === "OPTIONS") {
    response.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    return response.status(200).json({});
  }
  next();
});

// ROUTER
app.use(`/api/${apiVersion}`, router);

// all other requests redirect to 404
app.all("*", function (req, res, next) {
  next(new NotFoundError("404", "Not Found Routes"));
});

// error handler for all the applications
app.use(function (err, req, res, next) {
  var errorType = typeof err,
    code = 500,
    msg = { message: "Internal Server Error" };

  switch (err.name) {
    case "UnauthorizedError":
      code = err.status;
      msg = undefined;
      break;
    case "BadRequestError":
    case "UnauthorizedAccessError":
    case "NotFoundError":
      code = err.status;
      msg = err.inner;
      break;
    default:
      break;
  }

  return res.status(code).json(msg);
});

app.listen(process.env.PORT || 4000, (err) => {
  if (err) console.log(err);
  console.log(`Server Started at ${process.env.PORT || 4000}`);
});
