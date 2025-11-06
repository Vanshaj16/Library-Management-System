"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { BookOpen } from "lucide-react"

const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary p-3 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">V_LibraryMS</h1>
          <p className="text-gray-600 mt-1">Manage your books efficiently</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg p-6 w-full">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
