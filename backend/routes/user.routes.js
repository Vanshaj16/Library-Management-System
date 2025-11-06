const express = require("express")
const { body } = require("express-validator")
const userController = require("../controllers/user.controller")
const { validate } = require("../middleware/validate.middleware")
const { protect, authorize } = require("../middleware/auth.middleware")

const router = express.Router()

// Get all users - Admin only
router.get("/", protect, authorize("admin"), userController.getAllUsers)

// Get a single user
router.get("/:id", protect, userController.getUserById)

// Update a user
router.put(
  "/:id",
  protect,
  [
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  userController.updateUser,
)

// Delete a user - Admin only
router.delete("/:id", protect, authorize("admin"), userController.deleteUser)

module.exports = router
