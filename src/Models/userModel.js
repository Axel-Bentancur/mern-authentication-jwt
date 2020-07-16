const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, requiren: true, minlength: 5 },
  displayName: { type: String },
});

//Settings
userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async (password) => {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("userSchem", userSchema);
