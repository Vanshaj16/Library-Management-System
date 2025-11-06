"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { ArrowLeft, BookMarked } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const AddTransaction = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [selectedBook, setSelectedBook] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch available books
        const booksResponse = await api.getBooks({ status: "available" })
        setBooks(booksResponse.data.books || [])

        // Fetch active users
        const usersResponse = await api.getUsers({ status: "active" })
        setUsers(usersResponse.data.users || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedBook || !selectedUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a book and a user",
      })
      return
    }

    try {
      setSubmitting(true)

      await api.post("/transactions", {
        bookId: selectedBook,
        userId: selectedUser,
      })

      toast({
        title: "Transaction created",
        description: "The book has been successfully borrowed",
      })

      navigate("/transactions")
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create transaction",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/transactions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Transaction</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Borrow a Book</CardTitle>
            <CardDescription>Create a new transaction to lend a book to a user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book">Select Book</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger id="book">
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No available books
                      </SelectItem>
                    ) : (
                      books.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title} by {book.author}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No active users
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Borrowing Terms</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Books are loaned for a period of 14 days.</li>
                  <li>A maximum of 5 books can be borrowed at one time.</li>
                  <li>Late returns may incur a fee.</li>
                  <li>Damaged or lost books must be replaced or paid for.</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link to="/transactions">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedBook || !selectedUser || books.length === 0 || users.length === 0}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <BookMarked className="mr-2 h-4 w-4" />
                  Create Transaction
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AddTransaction
