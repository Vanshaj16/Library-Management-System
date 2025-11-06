"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { ArrowLeft, BookMarked } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const BorrowBook = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [book, setBook] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch book details
        const bookResponse = await api.getBook(id)
        setBook(bookResponse.data.data || bookResponse.data)

        // If admin, fetch users for selection
        if (user?.role === "admin") {
          const usersResponse = await api.getUsers({ status: "active" })
          setUsers(usersResponse.data.users || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load book details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user, toast])

  const handleBorrow = async () => {
    try {
      setBorrowing(true)

      // Determine which user is borrowing the book
      const userId = user?.role === "admin" ? selectedUser : user.id

      if (user?.role === "admin" && !selectedUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a user",
        })
        setBorrowing(false)
        return
      }

      await api.post("/transactions", { bookId: id, userId })

      toast({
        title: "Book borrowed",
        description: "The book has been successfully borrowed",
      })

      navigate(`/books/${id}`)
    } catch (error) {
      console.error("Error borrowing book:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to borrow the book",
      })
    } finally {
      setBorrowing(false)
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

  if (book.status !== "available") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to={`/books/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Borrow Book</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{book.title}</CardTitle>
            <CardDescription>by {book.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-amber-500 mb-4">
                  <BookMarked className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Book Not Available</h3>
                <p className="text-muted-foreground">This book is currently borrowed and not available for checkout.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/books/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Book Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/books/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Borrow Book</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{book.title}</CardTitle>
          <CardDescription>by {book.author}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Book Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ISBN</p>
                    <p>{book.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                    <p>{book.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published Year</p>
                    <p>{book.publishedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-green-600">Available</p>
                  </div>
                </div>
              </div>

              {user?.role === "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="user">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Borrowing Terms</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Books are loaned for a period of 14 days.</li>
                  <li>A maximum of 5 books can be borrowed at one time.</li>
                  <li>Late returns may incur a fee.</li>
                  <li>Damaged or lost books must be replaced or paid for.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/books/${id}`}>Cancel</Link>
          </Button>
          <Button onClick={handleBorrow} disabled={borrowing || (user?.role === "admin" && !selectedUser)}>
            {borrowing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <BookMarked className="mr-2 h-4 w-4" />
                Confirm Borrow
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default BorrowBook
