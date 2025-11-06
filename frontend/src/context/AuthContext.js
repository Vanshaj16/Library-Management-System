"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ui/use-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        api.setAuthToken(token);

        try {
          const response = await api.get("/auth/me"); // Replace with your endpoint
          setUser(response.data.user);
        } catch (err) {
          console.error("Failed to fetch current user:", err);
          logout(); // Log out if the token is invalid
        }
      }

      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password, role });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      api.setAuthToken(token);
      setUser(user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", userData);

      toast({
        title: "Registration successful",
        description: "You can now login with your credentials",
      });

      navigate("/login");
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.response?.data?.message || "Could not create account",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    api.removeAuthToken();
    setUser(null);
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
