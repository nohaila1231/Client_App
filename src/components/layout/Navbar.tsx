"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Film,
  User,
  LogOut,
  Settings,
  Star,
  Bookmark,
  Home,
  Bell,
} from "lucide-react"
import LogoutConfirmDialog from "./LougoutConfirmDialog"
import NotificationDropdown from "./NotificationDropDown"
import { useUser } from "../../context/UserContext"
import { useNotifications } from "../../hooks/useNotifications"
import { getUserAvatarUrl } from "../../utils/image-utils"

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const [showGenres, setShowGenres] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Get user context and notifications
  const { user, isLoggedIn, logout, refreshUserData } = useUser()
  const { unreadCount } = useNotifications()

  // References for dropdown elements
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const genresDropdownRef = useRef<HTMLDivElement>(null)

  // Refresh user data on load
  useEffect(() => {
    if (isLoggedIn) {
      refreshUserData()
    }
  }, [isLoggedIn, refreshUserData])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserDropdown &&
        userDropdownRef.current &&
        userButtonRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false)
      }

      if (
        showGenres &&
        genresDropdownRef.current &&
        !genresDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGenres(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserDropdown, showGenres])

  // Toggle functions
  const toggleUserDropdown = useCallback(() => {
    setShowUserDropdown(!showUserDropdown)
    if (showNotifications) setShowNotifications(false)
  }, [showUserDropdown, showNotifications])

  const toggleNotifications = useCallback(() => {
    setShowNotifications(!showNotifications)
    if (showUserDropdown) setShowUserDropdown(false)
  }, [showNotifications, showUserDropdown])

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true)
  }, [])

  const confirmLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error)
    } finally {
      setShowLogoutConfirm(false)
      setShowUserDropdown(false)
    }
  }, [logout])

  // Handle search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery("")
        setIsMobileMenuOpen(false)
      }
    },
    [searchQuery, navigate],
  )

  // Movie genres
  const genres = [
    "Action",
    "Aventure", 
    "Animation",
    "Comédie",
    "Crime",
    "Documentaire",
    "Drame",
    "Fantastique",
    "Horreur",
    "Romance",
    "Science-Fiction",
    "Thriller",
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-black/5 backdrop-blur-lg shadow-lg border-b border-gray-800/50" 
          : "bg-black/5 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg shadow-lg">
                <Film size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">
                Ciné<span className="text-red-500">Soul</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors drop-shadow-sm ${
                  location.pathname === "/" 
                    ? "text-red-500 border-b-2 border-red-500 pb-1" 
                    : "text-white hover:text-red-400"
                }`}
              >
                Accueil
              </Link>

              {/* Genres Dropdown */}
              <div className="relative" ref={genresDropdownRef}>
                <button
                  className="flex items-center space-x-1 text-sm font-medium text-white hover:text-red-400 transition-colors drop-shadow-sm"
                  onClick={() => setShowGenres(!showGenres)}
                >
                  <span>Genres</span>
                  <ChevronDown size={16} className={`transition-transform ${showGenres ? "rotate-180" : ""}`} />
                </button>

                {showGenres && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/50 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <h3 className="text-sm font-semibold text-white">Catégories</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {genres.map((genre) => (
                        <Link
                          key={genre}
                          to={`/genre/${genre.toLowerCase()}`}
                          className="text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800/60 py-2 px-3 rounded-md transition-colors"
                          onClick={() => setShowGenres(false)}
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/watchlist"
                className={`text-sm font-medium transition-colors drop-shadow-sm ${
                  location.pathname === "/watchlist" 
                    ? "text-red-500 border-b-2 border-red-500 pb-1" 
                    : "text-white hover:text-red-400"
                }`}
              >
                Ma Liste
              </Link>

              <Link
                to="/TopRatedMoviesPage"
                className={`text-sm font-medium transition-colors drop-shadow-sm ${
                  location.pathname === "/TopRatedMoviesPage" 
                    ? "text-red-500 border-b-2 border-red-500 pb-1" 
                    : "text-white hover:text-red-400"
                }`}
              >
                Top Films
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 px-4 py-2 pl-10 text-sm bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>

              {/* Authentication Section */}
              {isLoggedIn ? (
                <div className="hidden md:flex items-center space-x-4">
                  {/* Notifications */}
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onToggle={toggleNotifications}
                    onClose={() => setShowNotifications(false)}
                  />

                  {/* User Profile */}
                  <div className="relative">
                    <button
                      ref={userButtonRef}
                      onClick={toggleUserDropdown}
                      className="flex items-center space-x-2 text-white hover:text-red-400 drop-shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 hover:border-red-500 transition-colors shadow-lg">
                        {getUserAvatarUrl(user) ? (
                          <img
                            src={getUserAvatarUrl(user) || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-red-600 flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="hidden lg:inline text-sm font-medium">{user?.fullname}</span>
                      <ChevronDown size={16} className={`transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showUserDropdown && (
                      <div
                        ref={userDropdownRef}
                        className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/50 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                              {getUserAvatarUrl(user) ? (
                                <img
                                  src={getUserAvatarUrl(user) || "/placeholder.svg"}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-red-600 flex items-center justify-center">
                                  <User size={20} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user?.fullname}</p>
                              <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/ProfilePage"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <User size={16} className="mr-3 text-gray-400" />
                            Mon Profil
                          </Link>

                          <Link
                            to="/notifications"
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="flex items-center">
                              <Bell size={16} className="mr-3 text-gray-400" />
                              Notifications
                            </div>
                            {unreadCount > 0 && (
                              <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                                {unreadCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/watchlist"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <Bookmark size={16} className="mr-3 text-gray-400" />
                            Ma Liste
                          </Link>

                          <Link
                            to="/SettingsPage"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <Settings size={16} className="mr-3 text-gray-400" />
                            Paramètres
                          </Link>

                          <div className="border-t border-gray-700/50 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-800/60 w-full text-left"
                            >
                              <LogOut size={16} className="mr-3" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-white hover:text-red-400 drop-shadow-sm"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-white hover:text-red-400 drop-shadow-sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === "/" 
                      ? "bg-red-600/20 text-red-500" 
                      : "text-white hover:bg-gray-800/60 hover:text-red-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={18} className="mr-3" />
                  Accueil
                </Link>

                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800/60 hover:text-red-400"
                  onClick={() => setShowGenres(!showGenres)}
                >
                  <div className="flex items-center">
                    <Star size={18} className="mr-3" />
                    Genres
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${showGenres ? "rotate-180" : ""}`} />
                </button>

                {showGenres && (
                  <div className="ml-6 space-y-1 bg-gray-800/60 backdrop-blur-sm rounded-lg p-2">
                    {genres.map((genre) => (
                      <Link
                        key={genre}
                        to={`/genre/${genre.toLowerCase()}`}
                        className="block px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-gray-700/60 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to="/watchlist"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === "/watchlist" 
                      ? "bg-red-600/20 text-red-500" 
                      : "text-white hover:bg-gray-800/60 hover:text-red-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bookmark size={18} className="mr-3" />
                  Ma Liste
                </Link>

                <Link
                  to="/TopRatedMoviesPage"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === "/TopRatedMoviesPage" 
                      ? "bg-red-600/20 text-red-500" 
                      : "text-white hover:bg-gray-800/60 hover:text-red-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Star size={18} className="mr-3" />
                  Top Films
                </Link>

                {/* Mobile Notifications */}
                {isLoggedIn && (
                  <Link
                    to="/notifications"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === "/notifications" 
                        ? "bg-red-600/20 text-red-500" 
                        : "text-white hover:bg-gray-800/60 hover:text-red-400"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Bell size={18} className="mr-3" />
                      Notifications
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* Mobile Authentication */}
              {isLoggedIn ? (
                <div className="border-t border-gray-700/50 pt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                      {getUserAvatarUrl(user) ? (
                        <img
                          src={getUserAvatarUrl(user) || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-red-600 flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.fullname}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/ProfilePage"
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800/60 hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={18} className="mr-3" />
                      Mon Profil
                    </Link>

                    <Link
                      to="/SettingsPage"
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-gray-800/60 hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={18} className="mr-3" />
                      Paramètres
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-gray-800/60 w-full text-left"
                    >
                      <LogOut size={18} className="mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-700/50 pt-4 space-y-3">
                  <Link
                    to="/signin"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gray-800/60 rounded-lg hover:bg-gray-700/60"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </>
  )
}

export default Navbar