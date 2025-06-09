"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import MovieCard from "../components/movie/MovieCard"
import { BookmarkCheck, PlusCircle, Loader2, RefreshCw, Bug } from "lucide-react"

const WatchlistPage: React.FC = () => {
  const { watchlist, isLoggedIn, loading, refreshWatchlist, user, debugWatchlist } = useUser()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)

  // Chargement immédiat et logs détaillés
  useEffect(() => {
    console.log("🎬 WATCHLIST PAGE MOUNTED")
    console.log("🎬 User:", user)
    console.log("🎬 Is logged in:", isLoggedIn)
    console.log("🎬 Loading:", loading)
    console.log("🎬 Watchlist:", watchlist)

    // Délai minimal pour le chargement
    const timer = setTimeout(() => {
      setIsPageLoading(false)
      console.log("🎬 PAGE LOADING COMPLETED")
    }, 100)

    return () => clearTimeout(timer)
  }, [user, isLoggedIn, loading, watchlist])

  // Auto-refresh de la watchlist quand l'utilisateur est connecté
  useEffect(() => {
    if (isLoggedIn && user && !loading) {
      console.log("🔄 AUTO-REFRESHING WATCHLIST ON USER LOGIN")
      const timer = setTimeout(() => {
        refreshWatchlist()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, user, loading, refreshWatchlist])

  // Fonction pour rafraîchir manuellement la watchlist
  const handleRefresh = async () => {
    console.log("🔄 MANUAL REFRESH TRIGGERED")
    setIsRefreshing(true)
    try {
      await refreshWatchlist()
      console.log("✅ MANUAL REFRESH COMPLETED")
    } catch (error) {
      console.error("❌ Error refreshing watchlist:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // CORRECTION: Fonction de debug pour tester l'API
  const handleDebug = async () => {
    console.log("🐛 DEBUG TRIGGERED")
    setIsDebugging(true)
    try {
      await debugWatchlist()
      console.log("✅ DEBUG COMPLETED")
    } catch (error) {
      console.error("❌ Error in debug:", error)
    } finally {
      setIsDebugging(false)
    }
  }

  // Show loading state while user data is being fetched
  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-dark-100 pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-light-200">Chargement de votre liste...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-dark-100 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-dark-200 rounded-lg p-10 text-center">
            <div className="w-20 h-20 bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck size={36} className="text-light-300" />
            </div>
            <h3 className="text-xl font-semibold text-light-100 mb-2">Connectez-vous pour accéder à votre liste</h3>
            <p className="text-light-300 mb-6 max-w-md mx-auto">
              Vous devez être connecté pour voir et gérer votre liste de films.
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  console.log("🎬 RENDERING WATCHLIST PAGE")
  console.log("🎬 Final watchlist count:", watchlist.length)
  console.log(
    "🎬 Final watchlist movies:",
    watchlist.map((m) => ({ id: m.id, title: m.title })),
  )

  return (
    <div className="min-h-screen bg-dark-100 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-light-100 flex items-center">
            <BookmarkCheck size={28} className="mr-3 text-red-600" />
            Ma Liste
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-dark-300 text-light-200 px-3 py-1 rounded-full text-sm">
              {watchlist.length} film{watchlist.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-dark-300 hover:bg-dark-400 text-light-200 px-3 py-2 rounded-md transition disabled:opacity-50"
              title="Rafraîchir la liste"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Actualisation..." : "Actualiser"}
            </button>
            {/* CORRECTION: Bouton de debug */}
            {/* <button
              onClick={handleDebug}
              disabled={isDebugging}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md transition disabled:opacity-50"
              title="Debug API"
            >
              <Bug size={16} className={isDebugging ? "animate-spin" : ""} />
              {isDebugging ? "Debug..." : "Debug API"}
            </button> */}
          </div>
        </div>

        {/* Debug info en mode développement */}
        {/* <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-6">
          <h4 className="text-yellow-200 font-semibold mb-2">Debug Info:</h4>
          <p className="text-yellow-100 text-sm">User ID: {user?.id}</p>
          <p className="text-yellow-100 text-sm">Watchlist Length: {watchlist.length}</p>
          <p className="text-yellow-100 text-sm">Movies: {watchlist.map((m) => m.title).join(", ") || "None"}</p>
          <p className="text-yellow-100 text-sm">API URL: http://localhost:5000/api/users/{user?.id}/watchlist/</p>
          <p className="text-yellow-100 text-sm">
            Cookies: {document.cookie ? "Present" : "None"} ({document.cookie.length} chars)
          </p>
        </div> */}

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map((movie) => (
              <MovieCard key={`watchlist-${movie.id}`} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="bg-dark-200 rounded-lg p-10 text-center">
            <div className="w-20 h-20 bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck size={36} className="text-light-300" />
            </div>
            <h3 className="text-xl font-semibold text-light-100 mb-2">Votre liste est vide</h3>
            <p className="text-light-300 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore ajouté de films à votre liste. Parcourez notre catalogue et ajoutez des films que
              vous souhaitez regarder plus tard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition"
              >
                <PlusCircle size={20} className="mr-2" />
                Parcourir les films
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center bg-dark-300 hover:bg-dark-400 text-light-200 px-6 py-3 rounded-md transition disabled:opacity-50"
              >
                <RefreshCw size={20} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualisation..." : "Actualiser"}
              </button>
              {/* <button
                onClick={handleDebug}
                disabled={isDebugging}
                className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md transition disabled:opacity-50"
              >
                <Bug size={20} className={`mr-2 ${isDebugging ? "animate-spin" : ""}`} />
                {isDebugging ? "Debug API..." : "Debug API"}
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchlistPage
