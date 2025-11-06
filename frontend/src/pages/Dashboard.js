"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { BookOpen, Users, FileText, AlertTriangle, BookMarked } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalUsers: 0,
    activeTransactions: 0,
    overdueBooks: 0,
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch statistics
        const statsResponse = await api.getDashboardStats()
        if (statsResponse && statsResponse.data) {
          // Extract data properly, handling both response structures
          setStats(statsResponse.data.data || statsResponse.data)
        }

        // Fetch recent books
        const booksResponse = await api.getRecentBooks({ limit: 5 })
        if (booksResponse && booksResponse.data) {
          // Extract books data properly, handling both response structures
          const booksData = booksResponse.data.data || booksResponse.data || []
          setRecentBooks(Array.isArray(booksData) ? booksData : [])
        }

        // Fetch recent transactions
        const transactionsResponse = await api.getRecentTransactions({ limit: 5 })
        if (transactionsResponse && transactionsResponse.data) {
          // Extract transactions data properly, handling both response structures
          const transactionsData = transactionsResponse.data.data || transactionsResponse.data || []
          setRecentTransactions(Array.isArray(transactionsData) ? transactionsData : [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)

        // Instead of using mock data, try alternative API endpoints
        try {
          // Try getting books directly from the books endpoint
          const booksResponse = await api.getBooks({ limit: 5, sort: "createdAt:desc" })
          if (booksResponse && booksResponse.data) {
            const booksData = booksResponse.data.books || booksResponse.data.data || booksResponse.data || []
            setRecentBooks(Array.isArray(booksData) ? booksData : [])
          }

          // Try getting transactions directly from the transactions endpoint
          const transactionsResponse = await api.getTransactions({ limit: 5, sort: "createdAt:desc" })
          if (transactionsResponse && transactionsResponse.data) {
            const transactionsData =
              transactionsResponse.data.transactions ||
              transactionsResponse.data.data ||
              transactionsResponse.data ||
              []
            setRecentTransactions(Array.isArray(transactionsData) ? transactionsData : [])
          }

          // For stats, we'll use what we have or initialize with zeros
          if (!stats.totalBooks) {
            setStats({
              totalBooks: 0,
              availableBooks: 0,
              borrowedBooks: 0,
              totalUsers: 0,
              activeTransactions: 0,
              overdueBooks: 0,
            })
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback data:", fallbackError)
          // Initialize with empty arrays instead of mock data
          setRecentBooks([])
          setRecentTransactions([])
          setStats({
            totalBooks: 0,
            availableBooks: 0,
            borrowedBooks: 0,
            totalUsers: 0,
            activeTransactions: 0,
            overdueBooks: 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <Button asChild>
              <Link to="/books/add">Add New Book</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableBooks} available, {stats.borrowedBooks} borrowed
            </p>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active library members</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTransactions}</div>
            <p className="text-xs text-muted-foreground">{stats.overdueBooks} overdue books</p>
          </CardContent>
        </Card>

        {user?.role === "user" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Books</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 due in 3 days</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs for Recent Activity */}
      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">Recent Books</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          {stats.overdueBooks > 0 && (
            <TabsTrigger value="overdue" className="relative">
              Overdue Books
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {stats.overdueBooks}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Books</CardTitle>
              <CardDescription>The latest books added to the library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link to={`/books/${book.id}`} className="font-medium hover:underline">
                        {book.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        book.status === "available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {book.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/books">View All Books</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest book borrowing and returning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.bookTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Borrowed by {transaction.userName} on {new Date(transaction.borrowDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : transaction.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {transaction.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/transactions">View All Transactions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {stats.overdueBooks > 0 && (
          <TabsContent value="overdue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Overdue Books
                </CardTitle>
                <CardDescription>Books that are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions
                    .filter((t) => t.status === "overdue")
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{transaction.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Borrowed by {transaction.userName}, due on{" "}
                            {new Date(transaction.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          Send Reminder
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default Dashboard
