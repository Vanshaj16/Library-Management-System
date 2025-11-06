const bcrypt = require("bcryptjs")
const { User, Book } = require("../models")

// Function to initialize the database with sample data
exports.initializeDatabase = async () => {
  try {
    console.log("Initializing database with sample data...")

    // Create admin user
    const adminExists = await User.findOne({ where: { email: "admin@example.com" } })
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      })

      console.log("Admin user created")
    }

    // Create regular user
    const userExists = await User.findOne({ where: { email: "user@example.com" } })
    if (!userExists) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("user123", salt)

      await User.create({
        name: "Regular User",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
      })

      console.log("Regular user created")
    }

    // Create sample books
    const booksCount = await Book.count()
    if (booksCount === 0) {
      const sampleBooks = [
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          category: "Fiction",
          description:
            "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
          publishedYear: 1960,
          publisher: "HarperCollins",
          pages: 336,
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71FxgtFKcQL.jpg",
          status: "available",
        },
        {
          title: "1984",
          author: "George Orwell",
          isbn: "9780451524935",
          category: "Science Fiction",
          description: "A dystopian novel set in a totalitarian society.",
          publishedYear: 1949,
          publisher: "Signet Classic",
          pages: 328,
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
          status: "available",
        },
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          isbn: "9780743273565",
          category: "Fiction",
          description: "A portrait of the Jazz Age in all of its decadence and excess.",
          publishedYear: 1925,
          publisher: "Scribner",
          pages: 180,
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg",
          status: "available",
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          isbn: "9780141439518",
          category: "Romance",
          description: "A romantic novel of manners.",
          publishedYear: 1813,
          publisher: "Penguin Classics",
          pages: 480,
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71Q1tPupKjL.jpg",
          status: "available",
        },
        {
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          isbn: "9780316769488",
          category: "Fiction",
          description: "The story of a teenage boy dealing with alienation.",
          publishedYear: 1951,
          publisher: "Little, Brown and Company",
          pages: 277,
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/81OthjkJBuL.jpg",
          status: "available",
        },
      ]

      await Book.bulkCreate(sampleBooks)
      console.log(`${sampleBooks.length} sample books created`)
    }

    console.log("Database initialization completed")
  } catch (error) {
    console.error("Database initialization failed:", error)
  }
}
