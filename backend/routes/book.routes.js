const express = require("express")
const { body } = require("express-validator")
const bookController = require("../controllers/book.controller")
const { validate } = require("../middleware/validate.middleware")
const { protect, authorize } = require("../middleware/auth.middleware")

const router = express.Router()

// Get all books
router.get("/", bookController.getAllBooks)

// Get a single book
router.get("/:id", bookController.getBookById)

// Create a new book - Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("isbn").notEmpty().withMessage("ISBN is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  validate,
  bookController.createBook,
)

// Update a book - Admin only
router.put("/:id", protect, authorize("admin"), bookController.updateBook)

// Delete a book - Admin only
router.delete("/:id", protect, authorize("admin"), bookController.deleteBook)

module.exports = router
