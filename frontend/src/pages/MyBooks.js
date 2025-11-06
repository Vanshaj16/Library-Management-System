// import { useState, useEffect } from "react"
// import { Link } from "react-router-dom"
// import { useAuth } from "../context/AuthContext"
// import api from "../services/api"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Button } from "../components/ui/button"
// import { Badge } from "../components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import { AlertTriangle, Check, Clock } from "lucide-react"
// import { useToast } from "../components/ui/use-toast"

// const MyBooks = () => {
//   const { user } = useAuth()
//   const { toast } = useToast()
//   const [borrowedBooks, setBorrowedBooks] = useState([])
//   const [historyBooks, setHistoryBooks] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchMyBooks = async () => {
//       try {
//         setLoading(true);

//         // Fetch currently borrowed books
//         const borrowedResponse = await api.get(`/transactions/user/${user.id}/borrowed`);
//         setBorrowedBooks(Array.isArray(borrowedResponse.data) ? borrowedResponse.data : []);

//         // Fetch transaction history
//         const historyResponse = await api.get(`/transactions/user/${user.id}/history`);
//         setHistoryBooks(Array.isArray(historyResponse.data) ? historyResponse.data : []);
//       } catch (error) {
//         console.error("Error fetching books:", error);

//         // Mock data for demonstration
//         setBorrowedBooks([]);
//         setHistoryBooks([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) {
//       fetchMyBooks();
//     }
//   }, [user]);

//   const handleReturnBook = async (id) => {
//     try {
//       await api.put(`/transactions/${id}/return`)

//       // Update the book lists
//       const returnedBook = borrowedBooks.find((book) => book.id === id)

//       setBorrowedBooks((prev) => prev.filter((book) => book.id !== id))

//       setHistoryBooks((prev) => [
//         {
//           ...returnedBook,
//           returnDate: new Date().toISOString(),
//           status: "returned",
//         },
//         ...prev,
//       ])

//       toast({
//         title: "Book returned",
//         description: "The book has been successfully marked as returned",
//       })
//     } catch (error) {
//       console.error("Error returning book:", error)
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to return the book",
//       })
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     return new Date(dateString).toLocaleDateString()
//   }

//   const getDaysRemaining = (dueDate) => {
//     const today = new Date()
//     const due = new Date(dueDate)
//     const diffTime = due - today
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//     return diffDays
//   }

//   const getStatusBadge = (status, dueDate) => {
//     if (status === "overdue") {
//       return (
//         <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
//           <AlertTriangle className="mr-1 h-3 w-3" />
//           Overdue
//         </Badge>
//       )
//     }

//     if (status === "active") {
//       const daysRemaining = getDaysRemaining(dueDate)

//       if (daysRemaining <= 3) {
//         return (
//           <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
//             <Clock className="mr-1 h-3 w-3" />
//             Due in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
//           </Badge>
//         )
//       }

//       return (
//         <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
//           Due in {daysRemaining} days
//         </Badge>
//       )
//     }

//     if (status === "returned") {
//       return (
//         <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
//           <Check className="mr-1 h-3 w-3" />
//           Returned
//         </Badge>
//       )
//     }

//     return <Badge variant="outline">{status}</Badge>
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold tracking-tight">My Books</h1>
//         <Button asChild>
//           <Link to="/books">Browse Books</Link>
//         </Button>
//       </div>

//       <Tabs defaultValue="borrowed" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="borrowed">Currently Borrowed ({borrowedBooks.length})</TabsTrigger>
//           <TabsTrigger value="history">History ({historyBooks.length})</TabsTrigger>
//         </TabsList>

//         <TabsContent value="borrowed">
//           {borrowedBooks.length === 0 ? (
//             <Card>
//               <CardHeader>
//                 <CardTitle>No Books Borrowed</CardTitle>
//                 <CardDescription>You don't have any books currently borrowed.</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Button asChild>
//                   <Link to="/books">Browse Books</Link>
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {(borrowedBooks || []).map((book) => (
//                 <Card key={book.id} className="overflow-hidden">
//                   {/* Render book details */}
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="history">
//           {historyBooks.length === 0 ? (
//             <Card>
//               <CardHeader>
//                 <CardTitle>No History</CardTitle>
//                 <CardDescription>You don't have any borrowing history yet.</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Button asChild>
//                   <Link to="/books">Browse Books</Link>
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {historyBooks.map((book) => (
//                 <Card key={book.id} className="overflow-hidden">
//                   <div className="aspect-[3/2] relative">
//                     <img
//                       src={book.coverImage || "/placeholder.svg?height=300&width=200"}
//                       alt={book.bookTitle}
//                       className="object-cover w-full h-full"
//                     />
//                     <div className="absolute top-2 right-2">{getStatusBadge(book.status)}</div>
//                   </div>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-lg">
//                       <Link to={`/books/${book.bookId}`} className="hover:underline">
//                         {book.bookTitle}
//                       </Link>
//                     </CardTitle>
//                     <CardDescription>{book.bookAuthor}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Borrowed:</span>
//                         <span>{formatDate(book.borrowDate)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Returned:</span>
//                         <span>{formatDate(book.returnDate)}</span>
//                       </div>
//                       <Button variant="outline" className="w-full mt-4" asChild>
//                         <Link to={`/books/${book.bookId}`}>View Book</Link>
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

// export default MyBooks
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { AlertTriangle, Check, Clock } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const MyBooks = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [historyBooks, setHistoryBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true)

        // Fetch currently borrowed books
        const borrowedResponse = await api.get(`/transactions/user/${user.id}/borrowed`)

        // Check if we have data and ensure it's an array
        let borrowedData = []
        if (borrowedResponse && borrowedResponse.data) {
          borrowedData = borrowedResponse.data.data || borrowedResponse.data
          if (!Array.isArray(borrowedData)) {
            console.warn("Borrowed books data is not an array:", borrowedData)
            borrowedData = []
          }
        }

        setBorrowedBooks(borrowedData)

        // Fetch transaction history
        const historyResponse = await api.get(`/transactions/user/${user.id}/history`)

        // Check if we have data and ensure it's an array
        let historyData = []
        if (historyResponse && historyResponse.data) {
          historyData = historyResponse.data.data || historyResponse.data
          if (!Array.isArray(historyData)) {
            console.warn("History data is not an array:", historyData)
            historyData = []
          }
        }

        setHistoryBooks(historyData)
      } catch (error) {
        console.error("Error fetching books:", error)
        // Initialize with empty arrays on error
        setBorrowedBooks([])
        setHistoryBooks([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMyBooks()
    }
  }, [user])

  const handleReturnBook = async (id) => {
    try {
      await api.put(`/transactions/${id}/return`)

      // Update the book lists
      const returnedBook = borrowedBooks.find((book) => book.id === id)

      setBorrowedBooks((prev) => prev.filter((book) => book.id !== id))

      setHistoryBooks((prev) => [
        {
          ...returnedBook,
          returnDate: new Date().toISOString(),
          status: "returned",
        },
        ...prev,
      ])

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

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status, dueDate) => {
    if (status === "overdue") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      )
    }

    if (status === "active") {
      const daysRemaining = getDaysRemaining(dueDate)

      if (daysRemaining <= 3) {
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Due in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
          </Badge>
        )
      }

      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Due in {daysRemaining} days
        </Badge>
      )
    }

    if (status === "returned") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="mr-1 h-3 w-3" />
          Returned
        </Badge>
      )
    }

    return <Badge variant="outline">{status}</Badge>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Books</h1>
        <Button asChild>
          <Link to="/books">Browse Books</Link>
        </Button>
      </div>

      <Tabs defaultValue="borrowed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="borrowed">Currently Borrowed ({borrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="history">History ({historyBooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed">
          {borrowedBooks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Books Borrowed</CardTitle>
                <CardDescription>You don't have any books currently borrowed.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/books">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {borrowedBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="aspect-[3/2] relative">
                    <img
                      src={book.coverImage || "/placeholder.svg?height=300&width=200"}
                      alt={book.bookTitle}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(book.status, book.dueDate)}</div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      <Link to={`/books/${book.bookId}`} className="hover:underline">
                        {book.bookTitle}
                      </Link>
                    </CardTitle>
                    <CardDescription>{book.bookAuthor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Borrowed:</span>
                        <span>{formatDate(book.borrowDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{formatDate(book.dueDate)}</span>
                      </div>
                      <Button className="w-full mt-4" onClick={() => handleReturnBook(book.id)}>
                        Return Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyBooks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No History</CardTitle>
                <CardDescription>You don't have any borrowing history yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/books">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="aspect-[3/2] relative">
                    <img
                      src={book.coverImage || "/placeholder.svg?height=300&width=200"}
                      alt={book.bookTitle}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(book.status)}</div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      <Link to={`/books/${book.bookId}`} className="hover:underline">
                        {book.bookTitle}
                      </Link>
                    </CardTitle>
                    <CardDescription>{book.bookAuthor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Borrowed:</span>
                        <span>{formatDate(book.borrowDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Returned:</span>
                        <span>{formatDate(book.returnDate)}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4" asChild>
                        <Link to={`/books/${book.bookId}`}>View Book</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MyBooks
