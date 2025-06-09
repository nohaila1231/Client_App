"use client"

import React from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { Heart, Star, Plus, Check, Loader } from "lucide-react"
import type { MovieCardProps } from "../../types/movie"
import { getImageUrl } from "../../services/api"
import { useUser } from "../../context/UserContext"

const MovieCard: React.FC<MovieCardProps> = ({ movie, priority = false }) => {
  const navigate = useNavigate()
  const {
    recordClick,
    toggleLike,
    isLiked,
    isLikeLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isWatchlistLoading,
    isLoggedIn,
    user,
  } = useUser()

  // Afficher l'état d'authentification pour debugging
  React.useEffect(() => {
    console.log(`MovieCard [${movie.id}] - Auth status:`, isLoggedIn ? "Logged in" : "Not logged in")
    console.log(`MovieCard [${movie.id}] - User:`, user)
    console.log(`MovieCard [${movie.id}] - Movie data:`, movie)
  }, [movie, isLoggedIn, user])

  // Record click when user views a movie
  const handleMovieClick = () => {
    if (recordClick) {
      console.log(`Recording click for movie ${movie.id}`)
      recordClick(movie.id).catch((err) => console.error("Failed to record click:", err))
    }
  }

  // Handle like button click
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log(`Like button clicked for movie ${movie.id}, isLoggedIn:`, isLoggedIn)

    if (!isLoggedIn) {
      console.log("Not logged in, redirecting to signin")
      navigate("/signin", { state: { from: `/movie/${movie.id}` } })
      return
    }

    try {
      console.log(`Toggling like for movie ${movie.id}`)
      await toggleLike(movie.id)
      console.log("Like toggled successfully")
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  // Handle watchlist button click
  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log(`Watchlist button clicked for movie ${movie.id}, isLoggedIn:`, isLoggedIn)

    if (!isLoggedIn) {
      console.log("Not logged in, redirecting to signin")
      navigate("/signin", { state: { from: `/movie/${movie.id}` } })
      return
    }

    try {
      if (isInWatchlist(movie.id)) {
        console.log(`Removing movie ${movie.id} from watchlist`)
        await removeFromWatchlist(movie.id)
        console.log("Removed from watchlist")
      } else {
        console.log(`Adding movie ${movie.id} to watchlist`)
        await addToWatchlist(movie)
        console.log("Added to watchlist")
      }
    } catch (error) {
      console.error("Error updating watchlist:", error)
    }
  }

  // Vérifier le statut d'un film dans la watchlist pour le debugging
  React.useEffect(() => {
    console.log(`Movie ${movie.id} in watchlist:`, isInWatchlist(movie.id))
    console.log(`Movie ${movie.id} liked:`, isLiked(movie.id))
  }, [movie.id, isInWatchlist, isLiked])

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg bg-dark-200 h-full transition-transform duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: priority ? 0 : 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/movie/${movie.id}`} onClick={handleMovieClick}>
        <div className="aspect-[2/3] w-full relative">
          <img
            src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading={priority ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-100 to-transparent">
          <h3 className="text-light-100 font-semibold truncate">{movie.title}</h3>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500 mr-1" />
              <span className="text-light-200 text-sm">
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLikeClick}
                className="text-light-300 hover:text-primary focus:outline-none transition-colors"
                aria-label={isLiked(movie.id) ? "Unlike movie" : "Like movie"}
                disabled={isLikeLoading(movie.id)}
              >
                {isLikeLoading(movie.id) ? (
                  <Loader size={18} className="animate-spin text-red-600" />
                ) : (
                  <Heart
                    size={18}
                    fill={isLiked(movie.id) ? "#E50914" : "none"}
                    className={isLiked(movie.id) ? "text-red-600" : ""}
                  />
                )}
              </button>

              <button
                onClick={handleWatchlistClick}
                className="text-light-300 hover:text-primary focus:outline-none transition-colors"
                aria-label={isInWatchlist(movie.id) ? "Remove from watchlist" : "Add to watchlist"}
                disabled={isWatchlistLoading(movie.id)}
              >
                {isWatchlistLoading(movie.id) ? (
                  <Loader size={18} className="animate-spin text-green-500" />
                ) : isInWatchlist(movie.id) ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Plus size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default MovieCard
