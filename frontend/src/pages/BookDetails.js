"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ArrowLeft, Edit, Trash, BookMarked, BookOpen, Calendar, User } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const BookDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [book, setBook] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch book details
    const fetchBookDetails = async () => {
      try {
        setLoading(true)
        const bookResponse = await api.getBook(id)
        setBook(bookResponse.data.data || bookResponse.data)

        if (user?.role === "admin") {
          try {
            const transactionsResponse = await api.get(`/transactions/book/${id}`)
            // Ensure transactions is always an array
            setTransactions(
              Array.isArray(transactionsResponse.data.data)
                ? transactionsResponse.data.data
                : Array.isArray(transactionsResponse.data)
                  ? transactionsResponse.data
                  : [],
            )
          } catch (error) {
            console.error("Error fetching transactions:", error)
            setTransactions([])
          }
        }
      } catch (error) {
        console.error("Error fetching book details:", error)
        // Mock data for demonstration
        setBook({
          id: Number.parseInt(id),
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          category: "Fiction",
          description:
            "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. 'To Kill A Mockingbird' became both an instant bestseller and a critical success when it was first published in 1960. It went on to win the Pulitzer Prize in 1961 and was later made into an Academy Award-winning film, also a classic.",
          publishedYear: 1960,
          publisher: "HarperCollins",
          pages: 336,
          language: "English",
          status: "available",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71FxgtFKcQL.jpg",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-05-10T09:30:00Z",
        })

        setTransactions([
          {
            id: 1,
            userId: 101,
            userName: "John Doe",
            borrowDate: "2023-02-10T10:00:00Z",
            dueDate: "2023-02-24T10:00:00Z",
            returnDate: "2023-02-22T14:30:00Z",
            status: "returned",
          },
          {
            id: 2,
            userId: 102,
            userName: "Jane Smith",
            borrowDate: "2023-03-15T11:20:00Z",
            dueDate: "2023-03-29T11:20:00Z",
            returnDate: "2023-03-28T16:45:00Z",
            status: "returned",
          },
          {
            id: 3,
            userId: 103,
            userName: "Mike Johnson",
            borrowDate: "2023-04-05T09:15:00Z",
            dueDate: "2023-04-19T09:15:00Z",
            returnDate: null,
            status: "active",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [id, user])

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.deleteBook(id)
        toast({
          title: "Book deleted",
          description: "The book has been successfully deleted",
        })
        navigate("/books")
      } catch (error) {
        console.error("Error deleting book:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the book",
        })
      }
    }
  }

  const handleBorrow = async () => {
    try {
      await api.post("/transactions", { bookId: id, userId: user.id })
      toast({
        title: "Book borrowed",
        description: "You have successfully borrowed this book",
      })
      setBook((prev) => ({ ...prev, status: "borrowed" }))
    } catch (error) {
      console.error("Error borrowing book:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to borrow the book",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link to="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/books">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{book.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </div>
              <Badge
                variant={book.status === "available" ? "success" : "warning"}
                className={
                  book.status === "available"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                }
              >
                {book.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {book.coverImage && (
                <div className="w-full md:w-1/3">
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-auto object-cover rounded-md shadow-md"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {book.description || "No description available."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">ISBN</h4>
                    <p>{book.isbn}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                    <p>{book.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Published Year</h4>
                    <p>{book.publishedYear}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Publisher</h4>
                    <p>{book.publisher || "Unknown"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pages</h4>
                    <p>{book.pages || "Unknown"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</h4>
                    <p>{book.language || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Added on {new Date(book.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              {user?.role === "admin" && (
                <>
                  <Button variant="outline" asChild>
                    <Link to={`/books/edit/${book.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              {user?.role === "user" && book.status === "available" && (
                <Button asChild>
                  <Link to={`/books/borrow/${book.id}`}>
                    <BookMarked className="mr-2 h-4 w-4" />
                    Borrow
                  </Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {book.status === "available" ? "Available for borrowing" : "Currently borrowed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-sm text-muted-foreground">{book.publishedYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Author</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Borrowing History</CardTitle>
              </CardHeader>
              <CardContent>
                {!transactions || transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">This book has not been borrowed yet.</p>
                ) : (
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <div className="space-y-4">
                        {Array.isArray(transactions) &&
                          transactions.map((transaction) => (
                            <div key={transaction.id} className="border-b pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{transaction.userName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Due: {new Date(transaction.dueDate).toLocaleDateString()}
                                  </p>
                                  {transaction.returnDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Returned: {new Date(transaction.returnDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={transaction.status === "active" ? "outline" : "secondary"}>
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="active" className="mt-4">
                      <div className="space-y-4">
                        {Array.isArray(transactions) &&
                        transactions.filter((t) => t.status === "active").length === 0 ? (
                          <p className="text-sm text-muted-foreground">No active borrowings.</p>
                        ) : (
                          Array.isArray(transactions) &&
                          transactions
                            .filter((t) => t.status === "active")
                            .map((transaction) => (
                              <div key={transaction.id} className="border-b pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{transaction.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Due: {new Date(transaction.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Mark as Returned
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDetails
