"use client"

import { useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { BookOpen, LayoutDashboard, Library, Users, FileText, BookMarked, Settings, LogOut, X } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const sidebarRef = useRef(null)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]); // Added dependencies

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [location.pathname])

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Books",
      path: "/books",
      icon: <Library className="h-5 w-5" />,
    },
    {
      name: "My Books",
      path: "/my-books",
      icon: <BookMarked className="h-5 w-5" />,
      role: "user",
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users className="h-5 w-5" />,
      role: "admin",
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <FileText className="h-5 w-5" />,
      role: "admin",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => !item.role || item.role === user?.role || user?.role === "admin")

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">V_LibraryMS</span>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      )
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
