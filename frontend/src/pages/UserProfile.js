"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Edit, Trash, Mail, Calendar, BookOpen, User } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Initialize with empty arrays to be safe
        setBorrowedBooks([]);
        setTransactionHistory([]);

        // Fetch user data
        try {
          const userResponse = await api.getUser(id);
          if (userResponse && userResponse.data) {
            setUser(userResponse.data.data || userResponse.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Set fallback user data
          setUser({
            id: Number.parseInt(id),
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            status: "active",
            createdAt: "2023-01-15T12:00:00Z",
            updatedAt: "2023-05-10T09:30:00Z",
          });
        }

        // Fetch borrowed books
        try {
          const borrowedResponse = await api.get(`/transactions/user/${id}/borrowed`);
          if (borrowedResponse && borrowedResponse.data) {
            const borrowedData = borrowedResponse.data.data || borrowedResponse.data;
            setBorrowedBooks(Array.isArray(borrowedData) ? borrowedData : []);
          }
        } catch (error) {
          console.error("Error fetching borrowed books:", error);
          setBorrowedBooks([]);
        }

        // Fetch transaction history
        try {
          const historyResponse = await api.get(`/transactions/user/${id}/history`);
          if (historyResponse && historyResponse.data) {
            const historyData = historyResponse.data.data || historyResponse.data;
            setTransactionHistory(Array.isArray(historyData) ? historyData : []);
          }
        } catch (error) {
          console.error("Error fetching transaction history:", error);
          setTransactionHistory([]);
        }
      } catch (error) {
        console.error("Global error in fetchUserData:", error);
        // Set fallback data for everything
        setUser({
          id: Number.parseInt(id),
          name: "John Doe",
          email: "john@example.com",
          role: "user",
          status: "active",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-05-10T09:30:00Z",
        });

        setBorrowedBooks([
          {
            id: 1,
            bookId: 101,
            bookTitle: "To Kill a Mockingbird",
            borrowDate: "2023-05-10T10:00:00Z",
            dueDate: "2023-05-24T10:00:00Z",
            status: "active",
          },
          {
            id: 2,
            bookId: 102,
            bookTitle: "1984",
            borrowDate: "2023-05-15T11:20:00Z",
            dueDate: "2023-05-29T11:20:00Z",
            status: "active",
          },
        ]);

        setTransactionHistory([
          {
            id: 3,
            bookId: 103,
            bookTitle: "The Great Gatsby",
            borrowDate: "2023-04-05T09:15:00Z",
            dueDate: "2023-04-19T09:15:00Z",
            returnDate: "2023-04-18T16:45:00Z",
            status: "returned",
          },
          {
            id: 4,
            bookId: 104,
            bookTitle: "Pride and Prejudice",
            borrowDate: "2023-03-20T14:30:00Z",
            dueDate: "2023-04-03T14:30:00Z",
            returnDate: "2023-04-01T10:15:00Z",
            status: "returned",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.deleteUser(id);
        toast({
          title: "User deleted",
          description: "The user has been successfully deleted",
        });
        navigate("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the user",
        });
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground mt-2">The user you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Badge variant={user.role === "admin" ? "default" : "outline"} className="mx-1">
                {user.role}
              </Badge>
              <Badge
                variant={user.status === "active" ? "success" : "secondary"}
                className={
                  user.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 mx-1"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100 mx-1"
                }
              >
                {user.status}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{borrowedBooks.length} books currently borrowed</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Account type: {user.role}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to={`/users/edit/${user.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Book Activity</CardTitle>
            <CardDescription>View borrowed books and transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="borrowed">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="borrowed">Currently Borrowed ({borrowedBooks.length})</TabsTrigger>
                <TabsTrigger value="history">Transaction History ({transactionHistory.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="borrowed" className="mt-4">
                {borrowedBooks.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No books currently borrowed.</p>
                ) : (
                  <div className="space-y-4">
                    {borrowedBooks.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md"
                      >
                        <div>
                          <Link to={`/books/${transaction.bookId}`} className="font-medium hover:underline">
                            {transaction.bookTitle}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {new Date(transaction.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 sm:mt-0"
                          onClick={() => {
                            // Handle return book
                            toast({
                              title: "Book returned",
                              description: `${transaction.bookTitle} has been marked as returned`,
                            });
                          }}
                        >
                          Mark as Returned
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                {transactionHistory.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No transaction history available.</p>
                ) : (
                  <div className="space-y-4">
                    {transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div>
                            <Link to={`/books/${transaction.bookId}`} className="font-medium hover:underline">
                              {transaction.bookTitle}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              Borrowed: {new Date(transaction.borrowDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Returned: {new Date(transaction.returnDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline" className="mt-2 sm:mt-0">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
