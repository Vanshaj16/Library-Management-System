const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Register a new user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'"),
  ],
  validate,
  authController.register
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'"),
  ],
  validate,
  authController.login
);

// Get current user
router.get("/me", protect, authController.getCurrentUser);

module.exports = router;
