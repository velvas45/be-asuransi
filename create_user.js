require("dotenv").config();

const path = require("path"),
  User = require(path.join(__dirname, "src", "models", "user.js")),
  mongoose_uri = process.env.DATABASE_URL || "";

const args = process.argv.slice(2);

const email = args[0];
const password = args[1];
const nama = args[2];

if (args.length < 3) {
  console.log(
    "usage: node %s %s %s",
    path.basename(process.argv[1]),
    "email",
    "password",
    "nama"
  );
  process.exit();
}

console.log("email: %s", email);
console.log("Password: %s", password);
console.log("Nama: %s", nama);

console.log("Creating a new user in Mongo");

const mongoose = require("mongoose");
mongoose.set("debug", true);
mongoose.connect(mongoose_uri);
mongoose.connection.on("error", function () {
  console.log("Mongoose connection error", arguments);
});
mongoose.connection.once("open", function callback() {
  const user = new User();

  user.email = email;
  user.password = password;
  user.nama = nama;
  user.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(user);
    }
    process.exit();
  });
});
