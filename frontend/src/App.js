import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import EditUser from "./pages/EditUser";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import MyBooks from "./pages/MyBooks";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BorrowBook from "./pages/BorrowBook";

// Context
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          {/* Books Routes */}
          <Route
            path="/books"
            element={
              <DashboardLayout>
                <Books />
              </DashboardLayout>
            }
          />
          <Route
            path="/books/:id"
            element={
              <DashboardLayout>
                <BookDetails />
              </DashboardLayout>
            }
          />
          <Route
            path="/books/add"
            element={
              <DashboardLayout>
                <AddBook />
              </DashboardLayout>
            }
          />
          <Route
            path="/books/edit/:id"
            element={
              <DashboardLayout>
                <EditBook />
              </DashboardLayout>
            }
          />
          <Route
            path="/books/borrow/:id"
            element={
              <DashboardLayout>
                <BorrowBook />
              </DashboardLayout>
            }
          />

          {/* Users Routes */}
          <Route
            path="/users"
            element={
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            }
          />
          <Route
            path="/users/:id"
            element={
              <DashboardLayout>
                <UserProfile />
              </DashboardLayout>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <DashboardLayout>
                <EditUser />
              </DashboardLayout>
            }
          />

          {/* Transactions Routes */}
          <Route
            path="/transactions"
            element={
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            }
          />
          <Route
            path="/transactions/add"
            element={
              <DashboardLayout>
                <AddTransaction />
              </DashboardLayout>
            }
          />

          {/* User Specific Routes */}
          <Route
            path="/my-books"
            element={
              <DashboardLayout>
                <MyBooks />
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
