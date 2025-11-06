module.exports = (sequelize, Sequelize) => {
  const Book = sequelize.define(
    "book",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isbn: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      publishedYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      publisher: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pages: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: "English",
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("available", "borrowed"),
        defaultValue: "available",
      },
    },
    {
      timestamps: true,
      tableName: "books",
    },
  )

  return Book
}
