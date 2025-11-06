const express = require("express")
const dashboardController = require("../controllers/dashboard.controller")
const { protect } = require("../middleware/auth.middleware")

const router = express.Router()

// Get dashboard statistics
router.get("/stats", protect, dashboardController.getDashboardStats)

// Get recent books
router.get("/recent-books", protect, dashboardController.getRecentBooks)

// Get recent transactions
router.get("/recent-transactions", protect, dashboardController.getRecentTransactions)

module.exports = router
