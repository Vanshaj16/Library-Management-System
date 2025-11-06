const { Sequelize } = require("sequelize")
const dbConfig = require("../config/db.config")

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
})

// Initialize models
const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Import models
db.User = require("./user.model")(sequelize, Sequelize)
db.Book = require("./book.model")(sequelize, Sequelize)
db.Transaction = require("./transaction.model")(sequelize, Sequelize)

// Define associations
db.User.hasMany(db.Transaction, { foreignKey: "userId" })
db.Transaction.belongsTo(db.User, { foreignKey: "userId" })

db.Book.hasMany(db.Transaction, { foreignKey: "bookId" })
db.Transaction.belongsTo(db.Book, { foreignKey: "bookId" })

module.exports = db
