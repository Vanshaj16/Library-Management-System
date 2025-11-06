const { Book, Transaction, User, Sequelize } = require("../models")
const { Op } = Sequelize

// Get all books with pagination and filtering
exports.getAllBooks = async (req, res, next) => {
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
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { author: { [Op.like]: `%${req.query.search}%` } },
        { isbn: { [Op.like]: `%${req.query.search}%` } },
      ]
    }

    if (req.query.category) {
      whereConditions.category = req.query.category
    }

    // Get books with pagination
    const { count, rows: books } = await Book.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: req.query.sort ? [req.query.sort.split(":")] : [["createdAt", "DESC"]],
    })

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      success: true,
      totalBooks: count,
      totalPages,
      currentPage: page,
      books,
    })
  } catch (err) {
    next(err)
  }
}

// Get a single book by ID
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    res.status(200).json({
      success: true,
      data: book,
    })
  } catch (err) {
    next(err)
  }
}

// Create a new book
exports.createBook = async (req, res, next) => {
  try {
    // Check if ISBN already exists
    const existingBook = await Book.findOne({ where: { isbn: req.body.isbn } })
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists",
      })
    }

    const book = await Book.create(req.body)

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    })
  } catch (err) {
    next(err)
  }
}

// Update a book
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Check if ISBN is being changed and if it already exists
    if (req.body.isbn && req.body.isbn !== book.isbn) {
      const existingBook = await Book.findOne({ where: { isbn: req.body.isbn } })
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists",
        })
      }
    }

    await book.update(req.body)

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    })
  } catch (err) {
    next(err)
  }
}

// Delete a book
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      })
    }

    // Check if book is currently borrowed
    const activeTransaction = await Transaction.findOne({
      where: {
        bookId: req.params.id,
        status: {
          [Op.in]: ["active", "overdue"],
        },
      },
    })

    if (activeTransaction) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a book that is currently borrowed",
      })
    }

    await book.destroy()

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    })
  } catch (err) {
    next(err)
  }
}
