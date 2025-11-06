import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination"
import { Badge } from "../components/ui/badge"
import { Search, Check, AlertTriangle } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const Transactions = () => {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10, status: filter !== "all" ? filter : undefined };
      const response = await api.getTransactions(params);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filter]); // Added dependencies

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchTransactions()
  }

  const handleReturnBook = async (id) => {
    try {
      await api.put(`/transactions/${id}/return`)

      // Update the transaction in the list
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                returnDate: new Date().toISOString(),
                status: "returned",
              }
            : transaction,
        ),
      )

      toast({
        title: "Book returned",
        description: "The book has been successfully marked as returned",
      })
    } catch (error) {
      console.error("Error returning book:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to return the book",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Active
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        )
      case "returned":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="mr-1 h-3 w-3" />
            Returned
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by book title or user name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="w-full sm:w-48">
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Borrow Date</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Link to={`/books/${transaction.bookId}`} className="font-medium hover:underline">
                            {transaction.bookTitle}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/users/${transaction.userId}`} className="hover:underline">
                            {transaction.userName}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(transaction.borrowDate)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(transaction.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-right">
                          {transaction.status !== "returned" ? (
                            <Button size="sm" onClick={() => handleReturnBook(transaction.id)}>
                              Return Book
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Returned on {formatDate(transaction.returnDate)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalTransactions)} of{" "}
                  {totalTransactions} transactions
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Transactions
