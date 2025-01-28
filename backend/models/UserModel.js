const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // nazwa
  email: { type: String, required: true, unique: true }, // email: (unikalny)
  password: { type: String, required: true }, // hasło (będzie szyfrowane przed zapisaniem)
  role: { type: String, default: "user" }, // rola: "admin"/"user"
  created_at: { type: Date, default: Date.now }, // data utworzenia
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
