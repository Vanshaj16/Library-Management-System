const { Transaction, Book, User, Sequelize } = require("../models")
const { Op } = Sequelize

// Get all transactions with pagination and filtering
exports.getAllTransactions = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Build filter conditions
    const whereConditions = {}

    if (req.query.status) {
      whereConditions.status = req.query.status
    }

    if (req.query.search) {
      // We'll need to join with books and users to search by title or user name
      // This is a bit complex with Sequelize, so we'll handle it differently
    }

    // Get transactions with pagination
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "isbn"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
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

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      success: true,
      totalTransactions: count,
      totalPages,
      currentPage: page,
      transactions: formattedTransactions,
    })
  } catch (err) {
    next(err)
  }
}

// Get transactions for a specific book
exports.getBookTransactions = async (req, res, next) => {
  try {
    const bookId = req.params.bookId

    // Check if book exists
    const book = await Book.findByPk(bookId)
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Get transactions for this book
    const transactions = await Transaction.findAll({
      where: { bookId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => {
      const { user, ...transactionData } = transaction.toJSON()
      return {
        ...transactionData,
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

// Get borrowed books for a specific user
exports.getUserBorrowedBooks = async (req, res, next) => {
  try {
    const userId = req.params.userId

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get active transactions for this user
    const transactions = await Transaction.findAll({
      where: {
        userId,
        status: {
          [Op.in]: ["active", "overdue"],
        },
      },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "isbn", "category", "coverImage"],
        },
      ],
      order: [["borrowDate", "DESC"]],
    })

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => {
      const { book, ...transactionData } = transaction.toJSON()
      return {
        ...transactionData,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCategory: book.category,
        coverImage: book.coverImage,
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

// Get transaction history for a specific user
exports.getUserTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.params.userId

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get transaction history for this user
    const transactions = await Transaction.findAll({
      where: {
        userId,
        status: "returned",
      },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "isbn", "category", "coverImage"],
        },
      ],
      order: [["returnDate", "DESC"]],
    })

    // Format transactions for response
    const formattedTransactions = transactions.map((transaction) => {
      const { book, ...transactionData } = transaction.toJSON()
      return {
        ...transactionData,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCategory: book.category,
        coverImage: book.coverImage,
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

// Create a new transaction (borrow a book)
exports.createTransaction = async (req, res, next) => {
  try {
    const { bookId, userId } = req.body

    // Check if book exists
    const book = await Book.findByPk(bookId)
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if book is available
    if (book.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      })
    }

    // Calculate due date (14 days from now)
    const borrowDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    // Create transaction
    const transaction = await Transaction.create({
      bookId,
      userId,
      borrowDate,
      dueDate,
      status: "active",
    })

    // Update book status
    await book.update({ status: "borrowed" })

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: transaction,
    })
  } catch (err) {
    next(err)
  }
}

// Return a book
exports.returnBook = async (req, res, next) => {
  try {
    const transactionId = req.params.id

    // Find the transaction
    const transaction = await Transaction.findByPk(transactionId, {
      include: [{ model: Book }],
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Check if book is already returned
    if (transaction.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "Book is already returned",
      })
    }

    // Update transaction
    const returnDate = new Date()
    await transaction.update({
      returnDate,
      status: "returned",
    })

    // Update book status
    await transaction.book.update({ status: "available" })

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: transaction,
    })
  } catch (err) {
    next(err)
  }
}

// Update transaction status (for system tasks like marking overdue)
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const transactionId = req.params.id
    const { status } = req.body

    // Find the transaction
    const transaction = await Transaction.findByPk(transactionId)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Update transaction status
    await transaction.update({ status })

    res.status(200).json({
      success: true,
      message: "Transaction status updated successfully",
      data: transaction,
    })
  } catch (err) {
    next(err)
  }
}
