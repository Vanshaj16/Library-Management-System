"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user", // Default role is user
  });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role } = formData;

    try {
      await login(email, password, role);

      // Redirect based on role
      if (role === "admin") {
        navigate("/dashboard"); // Admin dashboard
      } else {
        navigate("/my-books"); // Regular user interface
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Login to Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Account Type</Label>
          <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="user" id="login-user" />
              <Label htmlFor="login-user" className="cursor-pointer">
                Regular User
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="admin" id="login-admin" />
              <Label htmlFor="login-admin" className="cursor-pointer">
                Administrator
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
