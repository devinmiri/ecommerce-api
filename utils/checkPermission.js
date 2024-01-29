const customError = require("../errors");

const checkPermission = (requestUser, resourceId) => {
 
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceId.toString()) return;
  throw new customError.UnAuthorizedError(
    "You are not authorized to access this resource"
  );
};

module.exports = checkPermission;
