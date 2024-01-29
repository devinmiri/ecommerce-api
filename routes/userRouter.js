const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  showCurrentUser,
  updateUserPassword,
  updateUser,
  getSingleUser,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllUsers);
router.route("/currentUser").get(authenticateUser, showCurrentUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
