"use client"

import type React from "react"
import { useState, useEffect } from "react"
import HeroSection from "../components/movie/HeroSection"
import MovieSection from "../components/movie/MovieSection"
import LoadingScreen from "../components/layout/IntroAnimation"
import ChatbotWidget from "../components/chat/ChatWidget"
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getUpcomingMovies } from "../services/api"
import type { Movie } from "../types/movie"
import { useUser } from "../context/UserContext"
import { filterValidMovies } from "../utils/movieFilter"

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  const { getRecommendedMovies, isLoggedIn, user } = useUser()

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true)
      try {
        // Fetch all data en parallèle
        const [trending, popular, topRated, upcoming] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getUpcomingMovies(),
        ])

        setTrendingMovies(trending)
        setPopularMovies(popular)
        setTopRatedMovies(topRated)
        setUpcomingMovies(upcoming)
      } catch (error) {
        console.error("Error fetching movie data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieData()
  }, [])

  // CORRECTION: Effet amélioré pour charger les recommandations
  useEffect(() => {
    const fetchRecommendations = async () => {
      console.log("=== FETCHING RECOMMENDATIONS ===")
      console.log("Is logged in:", isLoggedIn)
      console.log("User:", user)
      console.log("Popular movies loaded:", popularMovies.length > 0)

      if (isLoggedIn && user?.id) {
        try {
          console.log("🎯 Fetching personalized recommendations for user:", user.id)
          const rawRecommendations = await getRecommendedMovies(15) // Récupérer plus pour compenser le filtrage

          // NOUVEAU: Filtrer les films valides
          const validRecommendations = filterValidMovies(rawRecommendations).slice(0, 10)

          console.log("📊 Raw recommendations:", rawRecommendations.length)
          console.log("📊 Valid recommendations after filtering:", validRecommendations.length)
          console.log(
            "📊 Valid recommendation titles:",
            validRecommendations.map((m) => m.title),
          )

          if (validRecommendations && validRecommendations.length > 0) {
            setRecommendedMovies(validRecommendations)
            console.log("✅ Set filtered personalized recommendations")
          } else {
            console.log("⚠️ No valid personalized recommendations, using filtered popular movies fallback")
            const validPopularMovies = filterValidMovies(popularMovies).slice(8, 18)
            setRecommendedMovies(validPopularMovies)
          }
        } catch (error) {
          console.error("❌ Error fetching personalized recommendations:", error)
          // En cas d'erreur, utiliser les films populaires filtrés comme fallback
          console.log("🔄 Using filtered popular movies as fallback")
          const validPopularMovies = filterValidMovies(popularMovies).slice(8, 18)
          setRecommendedMovies(validPopularMovies)
        }
      } else {
        // Si l'utilisateur n'est pas connecté, utiliser les films populaires filtrés
        console.log("👤 User not logged in, using filtered popular movies")
        const validPopularMovies = filterValidMovies(popularMovies).slice(8, 18)
        setRecommendedMovies(validPopularMovies)
      }
    }

    // Attendre que les films populaires soient chargés avant de charger les recommandations
    if (popularMovies.length > 0) {
      // CORRECTION: Ajouter un délai pour éviter les appels trop rapides
      const timeoutId = setTimeout(() => {
        fetchRecommendations()
      }, 2000) // Attendre 2 secondes

      return () => clearTimeout(timeoutId)
    }
  }, [isLoggedIn, user?.id, popularMovies, getRecommendedMovies])

  if (loading) {
    return <LoadingScreen />
  }

  // CORRECTION: Améliorer la logique d'affichage des recommandations
  const getRecommendationTitle = () => {
    if (isLoggedIn && user?.id) {
      return "Recommandés pour vous"
    }
    return "Films Populaires - Recommandés"
  }

  const getRecommendationMovies = () => {
    if (recommendedMovies.length > 0) {
      return recommendedMovies
    }
    // Fallback vers les films populaires
    return popularMovies.slice(8, 18)
  }

  return (
    <div className="bg-dark-100 text-light-100 min-h-screen">
      <HeroSection movies={trendingMovies.slice(12, 18)} />
      <div className="bg-dark-100 mt-6">
        <MovieSection title={getRecommendationTitle()} movies={getRecommendationMovies()} />
        <MovieSection title="Films Tendance" movies={trendingMovies} viewAllLink="/TrendingMoviesPage" />
        <MovieSection title="Films Populaires" movies={popularMovies} viewAllLink="/PopularMoviesPage" />
        <MovieSection title="Les Mieux Notés" movies={topRatedMovies} viewAllLink="/TopRatedMoviesPage" />
        <MovieSection title="Prochainement" movies={upcomingMovies} />
      </div>
      <ChatbotWidget />
    </div>
  )
}

export default HomePage
