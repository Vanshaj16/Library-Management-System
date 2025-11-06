const { Book, User, Transaction, Sequelize } = require("../models")
const { Op } = Sequelize

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total books count
    const totalBooks = await Book.count()

    // Get available books count
    const availableBooks = await Book.count({ where: { status: "available" } })

    // Get borrowed books count
    const borrowedBooks = await Book.count({ where: { status: "borrowed" } })

    // Get total users count
    const totalUsers = await User.count()

    // Get active transactions count
    const activeTransactions = await Transaction.count({
      where: {
        status: {
          [Op.in]: ["active", "overdue"],
        },
      },
    })

    // Get overdue books count
    const overdueBooks = await Transaction.count({
      where: {
        status: "overdue",
      },
    })

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalUsers,
        activeTransactions,
        overdueBooks,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Get recent books
exports.getRecentBooks = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 5

    const books = await Book.findAll({
      order: [["createdAt", "DESC"]],
      limit,
    })

    res.status(200).json({
      success: true,
      data: books,
    })
  } catch (err) {
    next(err)
  }
}

// Get recent transactions
exports.getRecentTransactions = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 5

    const transactions = await Transaction.findAll({
      include: [
        {
          model: Book,
          attributes: ["id", "title"],
        },
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    })

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => {
      const { book, user, ...transactionData } = transaction.toJSON()
      return {
        ...transactionData,
        bookId: book.id,
        bookTitle: book.title,
        userId: user.id,
        userName: user.name,
      }
    })

    res.status(200).json({
      success: true,
      data: formattedTransactions,
    })
  } catch (err) {
    next(err)
  }
}
