const router = require("express").Router();
const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../Helpers/auth");

router.get("/test", (req, res) => {
  res.send("hello");
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, checkpass, displayName } = req.body;

    //Validate
    if (!email || !password || !checkpass)
      return res.status(400).json({ msg: "not all fields have been entered" });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "password needs to be at least 5 characters" });
    if (password !== checkpass)
      return res.status(400).json({ msg: "passwords do not match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "the mail is already taken" });

    if (!displayName) displayName = email;

    const newUser = new User({
      email,
      password,
      displayName,
    });
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    res.json({ msg: "user Created", newUser });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validate
    if (!email || !password)
      return res.status(400).json({ msg: "not all fields have been entered" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "this email has not registred" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.user);
    res.json(deleteUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id,
  });
});
module.exports = router;
