const { isTokenValid } = require("../utils/jwt");
const customError = require("../errors");

const authenticateUser = (req, res, next) => {
  //   console.log(req.signedCookies.token);
  const token = req.signedCookies.token;
  if (!token) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }

  try {
    const { name, userId, role } = isTokenValid({ token });

    req.user = { name, userId, role };

    next();
  } catch (error) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new customError.UnAuthorizedError(
        "You are not authorized to perform this action"
      );
    }

    console.log("admin route");
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
