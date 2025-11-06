const app = require("./app")
const { sequelize } = require("./models")
require("dotenv").config()

const PORT = process.env.PORT || 5000

// Sync database models
sequelize
  .sync({ alter: process.env.NODE_ENV === "development" })
  .then(() => {
    console.log("Database connected and synced")

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to sync database:", err)
  })
