import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import { Search, Plus, MoreHorizontal, Edit, Trash, Eye, BookMarked } from "lucide-react"

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await api.getBooks()
      setBooks(response.data.books)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return (
    <div>
      <h1>Books</h1>
      {loading ? <p>Loading...</p> : <ul>{books.map((book) => <li key={book.id}>{book.title}</li>)}</ul>}
    </div>
  )
}

export default Books
