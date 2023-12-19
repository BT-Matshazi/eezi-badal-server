const User = require("../models/userModel.js");
const { hashPassword, comparePasswords } = require("../helper/auth.js");
const jwt = require("jsonwebtoken");
const { match } = require("assert");

const test = (req, res) => {
  res.json("Server is running");
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    //checks data from client
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json("Please enter all fields");
    }

    //checks password length
    if (password.length < 8) {
      return res.json({ error: "Password must be at least 8 characters" });
    }

    //checks if email is valid
    if (!email.includes("@")) {
      return res.json({ error: "Please enter a valid email address" });
    }

    //checks if email is already in database
    const exists = await User.exists({ email: email });
    if (exists) {
      return res.json({ error: "Email already exists" });
    }

    //hash password
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      hashedPassword,
    });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Server error");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //checks data from client
    if (!email || !password) {
      return res.status(400).json("Please enter all fields");
    }

    //checks if email is valid
    if (!email.includes("@")) {
      return res.json({ error: "Please enter a valid email address" });
    }

    //checks if email is already in database
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ error: "Invalid credentials" });
    }

    //compare passwords
    const isMatch = await comparePasswords(password, user.hashedPassword);
    if (!isMatch) {
      return res.json({ error: "Invalid credentials" });
    }

    //create token
    if (match) {

      jwt.sign(
        {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(user);
        }
      );
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Server error");
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
};
