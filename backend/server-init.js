const app = require("./app")
const { sequelize } = require("./models")
const { initializeDatabase } = require("./utils/db-init")
require("dotenv").config()

const PORT = process.env.PORT || 5000

// Sync database models and initialize with sample data
sequelize
  .sync({ alter: process.env.NODE_ENV === "development" })
  .then(async () => {
    console.log("Database connected and synced")

    // Initialize database with sample data
    await initializeDatabase()

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to sync database:", err)
  })
