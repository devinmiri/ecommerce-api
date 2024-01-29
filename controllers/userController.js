const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const customError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermission,
} = require("../utils");


const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({count:users.length,users});
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new customError.NotFoundError(
      `No user found with id ${req.params.id}`
    );
  }

  

  checkPermission(req.user, user._id)
 

  res.status(StatusCodes.OK).json(user);
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new customError.BadRequestError(
      "Please enter your old and new password "
    );
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({ msg: "Password updated successfully" });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new customError.BadRequestError("Please enter your name and email");
  }
  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { name, email },
  //   { new: true, runValidators: true }
  // );

  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(200).json({ msg: "User updated successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
