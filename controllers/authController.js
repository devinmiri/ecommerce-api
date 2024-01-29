// console.log("controller");

const User = require("../models/User");
const customError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Checking if the user is already registered
  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new customError.BadRequestError("Email is already in use!");
  }

  // Asigining admin account
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Creating the user
  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new customError.BadRequestError(
      "Please provide an email and password"
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new customError.UnauthenticatedError("Invalid credentials!");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError("Invalid credentials!");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Successfully logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
