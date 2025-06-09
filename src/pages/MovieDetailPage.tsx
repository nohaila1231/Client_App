"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getMovieDetails, getMovieRecommendations, getImageUrl } from "../services/api"
import type { MovieDetails, Movie } from "../types/movie"
import { Clock, Calendar, Star, Heart, Plus, Check } from "lucide-react"
import { useUser } from "../context/UserContext"
import MovieSection from "../components/movie/MovieSection"
import CommentSection from "../components/movie/CommentSection"
import ShareDropdown from "../components/ShareDropdown"

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareDropdown, setShowShareDropdown] = useState(false)

  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleLike, isLiked, isLoggedIn, recordClick } =
    useUser()

  // Fetch movie data
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [movieData, recommendationsData] = await Promise.all([
          getMovieDetails(Number.parseInt(id)),
          getMovieRecommendations(Number.parseInt(id)),
        ])

        setMovie(movieData)
        setRecommendations(recommendationsData)

        // Record click for analytics
        if (isLoggedIn && recordClick) {
          recordClick(Number.parseInt(id)).catch((err) => console.error("Failed to record click:", err))
        }
      } catch (error) {
        console.error("Error fetching movie data:", error)
        setError("Impossible de charger les détails du film. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchMovieData()
  }, [id, isLoggedIn, recordClick])

  const handleWatchlistClick = useCallback(async () => {
    if (!movie) return

    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate("/signin", { state: { from: `/movie/${id}` } })
      return
    }

    try {
      if (isInWatchlist(movie.id)) {
        await removeFromWatchlist(movie.id)
      } else {
        await addToWatchlist(movie)
      }
    } catch (error) {
      console.error("Error updating watchlist:", error)
    }
  }, [movie, isLoggedIn, navigate, id, isInWatchlist, removeFromWatchlist, addToWatchlist])

  const handleLikeClick = useCallback(async () => {
    if (!movie) return

    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate("/signin", { state: { from: `/movie/${id}` } })
      return
    }

    try {
      await toggleLike(movie.id)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }, [movie, isLoggedIn, navigate, id, toggleLike])

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 pt-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="w-full h-[400px] bg-dark-300 animate-pulse rounded-xl"></div>
          <div className="mt-8 flex flex-col md:flex-row gap-8">
            <div className="w-64 h-96 bg-dark-300 animate-pulse rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-dark-300 animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-dark-300 animate-pulse rounded w-1/2"></div>
              <div className="h-40 bg-dark-300 animate-pulse rounded"></div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-dark-300 animate-pulse rounded"></div>
                <div className="h-10 w-32 bg-dark-300 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-dark-100 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-light-100 mb-4">Film non trouvé</h2>
          <p className="text-light-300 mb-6">
            {error || "Le film que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-light-100 px-6 py-3 rounded-md transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100 pt-16">
      {/* Backdrop Image */}
      <div
        className="w-full h-[50vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${getImageUrl(movie.backdrop_path, "backdrop")})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/70 to-transparent"></div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Poster */}
          <div className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-xl">
            <img
              src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-auto"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-light-100 mb-2">{movie.title}</h1>

            {movie.tagline && <p className="text-light-300 italic mb-4">{movie.tagline}</p>}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="flex items-center text-light-200">
                <Star size={18} className="text-yellow-500 mr-1" />
                {movie.vote_average.toFixed(1)}/10
                <span className="text-light-400 ml-1">({movie.vote_count} votes)</span>
              </span>

              <span className="flex items-center text-light-200">
                <Calendar size={18} className="mr-1" />
                {new Date(movie.release_date).getFullYear()}
              </span>

              {movie.runtime > 0 && (
                <span className="flex items-center text-light-200">
                  <Clock size={18} className="mr-1" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="bg-dark-300 text-light-200 text-sm px-3 py-1 rounded-full">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <h3 className="text-xl font-semibold text-light-100 mb-2">Synopsis</h3>
            <p className="text-light-200 mb-6 leading-relaxed">{movie.overview}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleWatchlistClick}
                className={`flex items-center px-4 py-2 rounded-md transition ${
                  isInWatchlist(movie.id)
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-dark-300 hover:bg-dark-400 text-light-100"
                }`}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Dans ma liste
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Ajouter à ma liste
                  </>
                )}
              </button>

              <button
                onClick={handleLikeClick}
                className={`flex items-center px-4 py-2 rounded-md transition ${
                  isLiked(movie.id)
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-dark-300 hover:bg-dark-400 text-light-100"
                }`}
              >
                <Heart size={18} className="mr-2" fill={isLiked(movie.id) ? "currentColor" : "none"} />
                {isLiked(movie.id) ? "Aimé" : "J'aime"}
              </button>

              {/* Nouveau composant de partage */}
              <ShareDropdown
                movieTitle={movie.title}
                movieId={movie.id}
                isOpen={showShareDropdown}
                onToggle={() => setShowShareDropdown(!showShareDropdown)}
                onClose={() => setShowShareDropdown(false)}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection movieId={movie.id} />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <MovieSection title="Films similaires que vous pourriez aimer" movies={recommendations} />
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetailPage
