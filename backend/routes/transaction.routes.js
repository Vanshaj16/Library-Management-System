const express = require("express")
const { body } = require("express-validator")
const transactionController = require("../controllers/transaction.controller")
const { validate } = require("../middleware/validate.middleware")
const { protect, authorize } = require("../middleware/auth.middleware")

const router = express.Router()

// Get all transactions - Admin only
router.get("/", protect, authorize("admin"), transactionController.getAllTransactions)

// Get transactions for a specific book
router.get("/book/:bookId", protect, transactionController.getBookTransactions)

// Get borrowed books for a specific user
router.get("/user/:userId/borrowed", protect, transactionController.getUserBorrowedBooks)

// Get transaction history for a specific user
router.get("/user/:userId/history", protect, transactionController.getUserTransactionHistory)

// Create a new transaction (borrow a book)
router.post(
  "/",
  protect,
  [
    body("bookId").notEmpty().withMessage("Book ID is required"),
    body("userId").notEmpty().withMessage("User ID is required"),
  ],
  validate,
  transactionController.createTransaction,
)

// Return a book
router.put("/:id/return", protect, transactionController.returnBook)

// Update transaction status - Admin only
router.put("/:id", protect, authorize("admin"), transactionController.updateTransactionStatus)

module.exports = router
