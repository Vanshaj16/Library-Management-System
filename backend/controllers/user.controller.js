const bcrypt = require("bcryptjs")
const { User, Transaction, Book, Sequelize } = require("../models")
const { Op } = Sequelize

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Build filter conditions
    const whereConditions = {}

    if (req.query.role) {
      whereConditions.role = req.query.role
    }

    if (req.query.status) {
      whereConditions.status = req.query.status
    }

    if (req.query.search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ]
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    // Get borrowed books count for each user
    const usersWithBorrowedBooks = await Promise.all(
      users.map(async (user) => {
        const borrowedCount = await Transaction.count({
          where: {
            userId: user.id,
            status: {
              [Op.in]: ["active", "overdue"],
            },
          },
        })

        return {
          ...user.toJSON(),
          borrowedBooks: borrowedCount,
        }
      }),
    )

    // Calculate total pages
    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      success: true,
      totalUsers: count,
      totalPages,
      currentPage: page,
      users: usersWithBorrowedBooks,
    })
  } catch (err) {
    next(err)
  }
}

// Get a single user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get borrowed books count
    const borrowedCount = await Transaction.count({
      where: {
        userId: user.id,
        status: {
          [Op.in]: ["active", "overdue"],
        },
      },
    })

    const userData = {
      ...user.toJSON(),
      borrowedBooks: borrowedCount,
    }

    res.status(200).json({
      success: true,
      data: userData,
    })
  } catch (err) {
    next(err)
  }
}

// Update a user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: req.body.email } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        })
      }
    }

    // Hash password if it's being updated
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10)
      req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    await user.update(req.body)

    // Remove password from response
    const userResponse = { ...user.toJSON() }
    delete userResponse.password

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userResponse,
    })
  } catch (err) {
    next(err)
  }
}

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if user has active transactions
    const activeTransactions = await Transaction.count({
      where: {
        userId: req.params.id,
        status: {
          [Op.in]: ["active", "overdue"],
        },
      },
    })

    if (activeTransactions > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a user with active borrows. Please return all books first.",
      })
    }

    await user.destroy()

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (err) {
    next(err)
  }
}
