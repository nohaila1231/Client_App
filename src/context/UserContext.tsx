"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
import axios from "axios"
import type { Movie } from "../types/movie"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { formatImageUrl } from "../utils/image-utils"

interface User {
  id: number
  fullname: string
  email: string
  image?: string
}

interface UserStats {
  likedMovies: number
  watchlistCount: number
  commentsCount: number
  memberSince: string
  recentActivities: {
    type: "like" | "watchlist" | "comment"
    movieId: number
    movieTitle?: string
    date: string
    timeAgo: string
  }[]
  favoriteGenres: string[]
}

interface LoadingStates {
  likes: Record<number, boolean>
  watchlist: Record<number, boolean>
  global: boolean
  profileUpdate: boolean
  recommendations: boolean
  stats: boolean
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoggedIn: boolean

  watchlist: Movie[]
  addToWatchlist: (movie: Movie) => Promise<void>
  removeFromWatchlist: (movieId: number) => Promise<void>
  isInWatchlist: (movieId: number) => boolean
  isWatchlistLoading: (movieId: number) => boolean
  refreshWatchlist: () => Promise<void>

  likedMovies: number[]
  toggleLike: (movieId: number, movieData?: Partial<Movie>) => Promise<void>
  isLiked: (movieId: number) => boolean
  isLikeLoading: (movieId: number) => boolean

  addComment: (movieId: number, text: string) => Promise<void>

  loading: boolean
  isProfileUpdateLoading: boolean
  updateProfile: (userId: number, data: { fullname: string }) => Promise<void>
  uploadProfileImage: (userId: number, imageFile: File) => Promise<void>

  getRecommendedMovies: (limit?: number) => Promise<Movie[]>
  trainRecommendationModels: () => Promise<boolean>
  isRecommendationsLoading: boolean

  refreshUserData: () => Promise<void>

  userStats: UserStats | null
  getUserStats: (force?: boolean) => Promise<UserStats | null>
  isStatsLoading: boolean
}

const API_URL = "https://backapp-production-01be.up.railway.app/api";


const UserContext = createContext<UserContextType | undefined>(undefined)

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkSqyff-396R7sLcH-jT6_SdXtjYxRyaw",
  authDomain: "recommendationffilm.firebaseapp.com",
  projectId: "recommendationffilm",
  storageBucket: "recommendationffilm.appspot.com",
  messagingSenderId: "1070862765035",
  appId: "1:1070862765035:web:cbcde6514ebf34e385e7ae",
  measurementId: "G-LTP0P71S3S",
}

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [likedMovies, setLikedMovies] = useState<number[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [authChecked, setAuthChecked] = useState<boolean>(false)
  const [firebaseUser, setFirebaseUser] = useState(null)

  // CORRECTION: Références pour éviter les appels multiples
  const verifyingTokenRef = useRef<boolean>(false)
  const lastVerifyAttemptRef = useRef<number>(0)
  const lastWatchlistFetchRef = useRef<number>(0)
  const lastLikesFetchRef = useRef<number>(0)

  // État pour gérer les chargements spécifiques
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    likes: {},
    watchlist: {},
    global: false,
    profileUpdate: false,
    recommendations: false,
    stats: false,
  })

  // CORRECTION: Fonction pour attendre et éviter le rate limiting
  const waitForRateLimit = async (lastCallTime: number, minInterval = 5000) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall
      console.log(`⏳ Waiting ${waitTime}ms to avoid rate limiting...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  // CORRECTION: Fonction fetchWatchlist avec protection rate limiting
  const fetchWatchlist = useCallback(async (userId: number): Promise<Movie[]> => {
    if (!userId) {
      console.log("❌ FETCH WATCHLIST: No userId provided")
      return []
    }

    // CORRECTION: Attendre pour éviter le rate limiting
    await waitForRateLimit(lastWatchlistFetchRef.current, 5000)
    lastWatchlistFetchRef.current = Date.now()

    console.log("🔍 ==========================================")
    console.log("🔍 STARTING FETCH WATCHLIST")
    console.log("🔍 User ID:", userId)
    console.log("🔍 API URL:", `${API_URL}/users/${userId}/watchlist/`)
    console.log("🔍 Current time:", new Date().toISOString())
    console.log("🔍 ==========================================")

    try {
      console.log("🔍 Making watchlist request...")

      const response = await axios.get(`${API_URL}/users/${userId}/watchlist/`, {
        withCredentials: true,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log("🔍 ==========================================")
      console.log("🔍 WATCHLIST API RESPONSE")
      console.log("🔍 Status:", response.status)
      console.log("🔍 Status Text:", response.statusText)
      console.log("🔍 Headers:", response.headers)
      console.log("🔍 Raw Data:", response.data)
      console.log("🔍 Data Type:", typeof response.data)
      console.log("🔍 Is Array:", Array.isArray(response.data))
      console.log("🔍 Data Length:", response.data?.length)
      console.log("🔍 ==========================================")

      let watchlistArray: Movie[] = []

      if (Array.isArray(response.data)) {
        watchlistArray = response.data
        console.log("🔍 Data is array, using directly")
      } else if (response.data && typeof response.data === "object") {
        if (response.data.watchlist && Array.isArray(response.data.watchlist)) {
          watchlistArray = response.data.watchlist
          console.log("🔍 Data has watchlist property, using that")
        } else if (response.data.data && Array.isArray(response.data.data)) {
          watchlistArray = response.data.data
          console.log("🔍 Data has data property, using that")
        } else {
          console.log("🔍 Data is object but no recognizable array property")
          console.log("🔍 Object keys:", Object.keys(response.data))
        }
      } else {
        console.log("🔍 Data is not array or object, treating as empty")
      }

      console.log("🔍 ==========================================")
      console.log("🔍 PROCESSED WATCHLIST")
      console.log("🔍 Final array length:", watchlistArray.length)
      console.log("🔍 Movies:")
      watchlistArray.forEach((movie, index) => {
        console.log(`🔍   ${index + 1}. ID: ${movie.id}, Title: ${movie.title}`)
      })
      console.log("🔍 ==========================================")

      setWatchlist(watchlistArray)
      return watchlistArray
    } catch (error: any) {
      console.log("🔍 ==========================================")
      console.log("🔍 WATCHLIST FETCH ERROR")
      console.error("❌ Error:", error.message)
      console.error("❌ Status:", error.response?.status)
      console.error("❌ Status Text:", error.response?.statusText)
      console.error("❌ Response Data:", error.response?.data)

      // CORRECTION: Si c'est un rate limiting, attendre plus longtemps
      if (error.response?.status === 429) {
        console.log("⏳ Rate limited! Waiting 10 seconds before next attempt...")
        lastWatchlistFetchRef.current = Date.now() + 10000 // Ajouter 10 secondes de plus
      }

      console.log("🔍 ==========================================")

      setWatchlist([])
      return []
    }
  }, [])

  // CORRECTION: Fonction fetchLikes avec protection rate limiting
  const fetchLikes = useCallback(async (userId: number): Promise<number[]> => {
    if (!userId) {
      console.log("❌ No userId provided for fetchLikes")
      return []
    }

    // CORRECTION: Attendre pour éviter le rate limiting
    await waitForRateLimit(lastLikesFetchRef.current, 5000)
    lastLikesFetchRef.current = Date.now()

    try {
      console.log(`🔍 FETCHING LIKES for user ${userId}`)

      const response = await axios.get(`${API_URL}/users/${userId}/likes`, {
        withCredentials: true,
        timeout: 30000,
      })

      console.log("❤️ RAW LIKES RESPONSE:", response.data)

      const likesArray = Array.isArray(response.data) ? response.data : []
      const movieIds = likesArray.map((like: any) => like.movie_id) || []

      console.log(`❤️ PROCESSED LIKES: ${movieIds.length} movies`)
      console.log("❤️ LIKED MOVIE IDS:", movieIds)

      setLikedMovies(movieIds)
      return movieIds
    } catch (error: any) {
      console.error("❌ ERROR FETCHING LIKES:", error)

      // CORRECTION: Si c'est un rate limiting, attendre plus longtemps
      if (error.response?.status === 429) {
        console.log("⏳ Likes rate limited! Waiting 10 seconds...")
        lastLikesFetchRef.current = Date.now() + 10000
      }

      setLikedMovies([])
      return []
    }
  }, [])

  // Fonction pour récupérer les statistiques utilisateur
  const getUserStats = useCallback(
    async (force = false): Promise<UserStats | null> => {
      if (!user || !user.id) {
        console.log("getUserStats: No user logged in")
        return null
      }

      try {
        setLoadingStates((prev) => ({ ...prev, stats: true }))
        console.log(`🔍 Getting user stats for user ID: ${user.id}`)

        // CORRECTION: Attendre pour éviter le rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const response = await axios.get(`${API_URL}/users/${user.id}/stats`, {
          withCredentials: true,
          timeout: 30000,
        })

        console.log("📊 User stats response:", response.data)

        if (response.data) {
          setUserStats(response.data)
          return response.data
        }

        return null
      } catch (error: any) {
        console.error("❌ Error fetching user stats:", error)
        return null
      } finally {
        setLoadingStates((prev) => ({ ...prev, stats: false }))
      }
    },
    [user],
  )

  // CORRECTION: Fonction fetchUserData avec délais importants pour éviter rate limiting
  const fetchUserData = useCallback(
    async (userId: number) => {
      if (!userId) {
        console.log("❌ No userId provided for fetchUserData")
        return
      }

      console.log(`🔍 ==========================================`)
      console.log(`🔍 STARTING FETCH USER DATA for user ${userId}`)
      console.log(`🔍 Will use delays to avoid rate limiting`)
      console.log(`🔍 ==========================================`)

      try {
        // 1. Fetch watchlist IMMÉDIATEMENT
        console.log("📋 Step 1: Fetching watchlist...")
        await fetchWatchlist(userId)

        // 2. Attendre 8 secondes avant les likes pour éviter rate limiting
        console.log("⏳ Waiting 8 seconds before fetching likes...")
        setTimeout(async () => {
          console.log("❤️ Step 2: Fetching likes...")
          await fetchLikes(userId)
        }, 8000)

        // 3. Attendre 15 secondes avant les stats
        console.log("⏳ Will fetch stats in 15 seconds...")
        setTimeout(async () => {
          console.log("📊 Step 3: Fetching stats...")
          await getUserStats(false)
        }, 15000)

        console.log("✅ USER DATA FETCH INITIATED (with delays)")
      } catch (error) {
        console.error("❌ ERROR IN FETCH USER DATA:", error)
      }
    },
    [fetchWatchlist, fetchLikes, getUserStats],
  )

  // Helper function to clear user data
  const clearUserData = useCallback(() => {
    console.log("🧹 CLEARING USER DATA")
    setWatchlist([])
    setLikedMovies([])
    setUserStats(null)
    verifyingTokenRef.current = false
    lastWatchlistFetchRef.current = 0
    lastLikesFetchRef.current = 0
  }, [])

  // Fonction pour rafraîchir uniquement la watchlist
  const refreshWatchlist = useCallback(async () => {
    if (!user || !user.id) {
      console.log("❌ Cannot refresh watchlist: no user")
      return
    }
    console.log("🔄 REFRESHING WATCHLIST")
    await fetchWatchlist(user.id)
  }, [user, fetchWatchlist])

  // CORRECTION: Initialize Firebase avec délais pour éviter rate limiting
  useEffect(() => {
    let unsubscribe = () => {}

    try {
      console.log("🔥 Initializing Firebase")
      const app = initializeApp(firebaseConfig)
      const auth = getAuth(app)

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        console.log("🔥 Firebase auth state changed:", fbUser ? "Logged in" : "Logged out")

        // CORRECTION: Protection contre les appels multiples avec délai plus long
        const now = Date.now()
        if (verifyingTokenRef.current || now - lastVerifyAttemptRef.current < 10000) {
          console.log("⏭️ Skipping verification - too recent (10s minimum)")
          return
        }

        setFirebaseUser(fbUser)

        if (fbUser) {
          verifyingTokenRef.current = true
          lastVerifyAttemptRef.current = now

          try {
            console.log("🔑 Getting Firebase ID token")
            const idToken = await fbUser.getIdToken()

            // CORRECTION: Attendre 3 secondes avant de vérifier avec le backend
            console.log("⏳ Waiting 3 seconds before backend verification...")
            await new Promise((resolve) => setTimeout(resolve, 3000))

            console.log("🔐 Verifying with backend")
            const response = await axios.post(
              `${API_URL}/users/verify`,
              { idToken },
              {
                withCredentials: true,
                timeout: 30000,
              },
            )

            console.log("✅ Backend verification successful:", response.data)

            if (response.data && response.data.id) {
              const userData: User = {
                id: response.data.id,
                fullname: response.data.fullname,
                email: response.data.email,
                image: formatImageUrl(response.data.image),
              }

              console.log("👤 Setting user data:", userData)
              setUser(userData)

              // CORRECTION: Attendre 5 secondes avant de fetch les données
              console.log("🚀 Starting data fetch in 5 seconds...")
              setTimeout(() => {
                fetchUserData(userData.id)
              }, 5000)
            }
          } catch (error: any) {
            console.error("❌ Error verifying token:", error)
            if (error.response?.status !== 429) {
              setUser(null)
              clearUserData()
            } else {
              console.log("⏳ Verification rate limited, will retry later")
            }
          } finally {
            verifyingTokenRef.current = false
          }
        } else {
          setUser(null)
          clearUserData()
        }

        setLoading(false)
        setAuthChecked(true)
      })
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error)
      setLoading(false)
      setAuthChecked(true)
    }

    return () => unsubscribe()
  }, [fetchUserData, clearUserData])

  // Configure axios
  useEffect(() => {
    axios.defaults.withCredentials = true
  }, [])

  // CORRECTION: Check backend session avec délai pour éviter rate limiting
  useEffect(() => {
    const checkBackendSession = async () => {
      if (firebaseUser || user || !authChecked || verifyingTokenRef.current) return

      try {
        console.log("🔍 Checking backend session in 5 seconds...")
        await new Promise((resolve) => setTimeout(resolve, 5000))

        console.log("🔍 Now checking backend session")
        setLoading(true)
        const response = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true,
          timeout: 30000,
        })

        console.log("✅ Backend session found:", response.data)

        if (response.data && response.data.user && response.data.user.id) {
          const userData: User = {
            id: response.data.user.id,
            fullname: response.data.user.fullname,
            email: response.data.user.email,
            image: formatImageUrl(response.data.user.image),
          }

          setUser(userData)
          setTimeout(() => {
            fetchUserData(userData.id)
          }, 5000)
        }
      } catch (error) {
        console.error("❌ No valid backend session:", error)
        clearUserData()
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      if (authChecked && !user && !firebaseUser && !verifyingTokenRef.current) {
        checkBackendSession()
      }
    }, 8000) // Délai plus long

    return () => clearTimeout(timeoutId)
  }, [authChecked, firebaseUser, user, fetchUserData, clearUserData])

  // Fonction refreshUserData simplifiée
  const refreshUserData = useCallback(async () => {
    if (!user || !user.id) return

    try {
      console.log("🔄 Refreshing user data")

      // CORRECTION: Attendre pour éviter rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const response = await axios.get(`${API_URL}/users/${user.id}`, {
        withCredentials: true,
        timeout: 30000,
      })

      if (response.data) {
        setUser((prev) => ({
          ...prev!,
          fullname: response.data.fullname,
          email: response.data.email,
          image: formatImageUrl(response.data.image),
        }))
      }

      await fetchUserData(user.id)
      return response.data
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }, [user, fetchUserData])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          timeout: 30000,
        },
      )

      console.log("✅ Login successful:", response.data)

      if (response.data && response.data.user && response.data.user.id) {
        const userData = {
          ...response.data.user,
          image: formatImageUrl(response.data.user.image),
        }
        setUser(userData)
        setTimeout(() => {
          fetchUserData(userData.id)
        }, 3000)
      } else {
        throw new Error("Invalid login response")
      }

      return response.data
    } catch (error) {
      console.error("❌ Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      const auth = getAuth()
      await signOut(auth)

      await axios.post(
        `${API_URL}/users/signout`,
        {},
        {
          withCredentials: true,
          timeout: 30000,
        },
      )

      setUser(null)
      clearUserData()

      localStorage.clear()
      sessionStorage.clear()

      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
      setUser(null)
      clearUserData()
      localStorage.clear()
      sessionStorage.clear()
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fonctions pour vérifier l'état de chargement
  const isLikeLoading = (movieId: number): boolean => {
    return !!loadingStates.likes[movieId]
  }

  const isWatchlistLoading = (movieId: number): boolean => {
    return !!loadingStates.watchlist[movieId]
  }

  const isProfileUpdateLoading = (): boolean => {
    return loadingStates.profileUpdate
  }

  const isRecommendationsLoading = loadingStates.recommendations
  const isStatsLoading = loadingStates.stats

  // CORRECTION: Fonction addToWatchlist avec protection rate limiting
  const addToWatchlist = async (movie: Movie) => {
    if (!user || !user.id) {
      console.error("❌ User not authenticated")
      throw new Error("User not authenticated")
    }

    console.log(`➕ ADDING MOVIE ${movie.id} (${movie.title}) TO WATCHLIST`)

    try {
      setLoadingStates((prev) => ({
        ...prev,
        watchlist: { ...prev.watchlist, [movie.id]: true },
      }))

      // Vérifier d'abord si le film n'est pas déjà dans la watchlist
      const isAlreadyInWatchlist = watchlist.some((m) => m.id === movie.id)
      if (isAlreadyInWatchlist) {
        console.log("⚠️ Movie already in watchlist locally")
        return
      }

      const movieData = {
        movie_id: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        poster_path: movie.poster_path || "",
        popularity: movie.popularity || 0,
        release_date: movie.release_date || "2023-01-01",
        genres: movie.genres || [],
      }

      console.log("📤 Sending movie data to backend:", movieData)

      // CORRECTION: Attendre pour éviter rate limiting
      await waitForRateLimit(lastWatchlistFetchRef.current, 5000)

      const response = await axios.post(`${API_URL}/users/${user.id}/watchlist/`, movieData, {
        withCredentials: true,
        timeout: 30000,
      })

      console.log("✅ BACKEND RESPONSE:", response.data)

      // Mise à jour IMMÉDIATE du state local
      const updatedWatchlist = [...watchlist, movie]
      setWatchlist(updatedWatchlist)
      console.log(`✅ LOCAL WATCHLIST UPDATED: ${updatedWatchlist.length} movies`)

      // Mettre à jour le timestamp pour éviter rate limiting
      lastWatchlistFetchRef.current = Date.now()

      // Rafraîchir la watchlist après 10 secondes pour confirmer
      setTimeout(async () => {
        console.log("🔄 Confirming watchlist update...")
        await fetchWatchlist(user.id)
      }, 10000)

      // Rafraîchir les stats
      setTimeout(() => {
        getUserStats(true)
      }, 15000)
    } catch (error: any) {
      console.error("❌ ERROR ADDING TO WATCHLIST:", error)
      console.error("❌ ERROR DETAILS:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })

      if (error.response?.status === 429) {
        throw new Error("Serveur surchargé. Veuillez attendre quelques secondes et réessayer.")
      }

      throw error
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        watchlist: { ...prev.watchlist, [movie.id]: false },
      }))
    }
  }

  const removeFromWatchlist = async (movieId: number) => {
    if (!user || !user.id) {
      console.error("❌ User not authenticated")
      throw new Error("User not authenticated")
    }

    console.log(`🗑️ REMOVING MOVIE ${movieId} FROM WATCHLIST`)

    try {
      setLoadingStates((prev) => ({
        ...prev,
        watchlist: { ...prev.watchlist, [movieId]: true },
      }))

      // CORRECTION: Attendre pour éviter rate limiting
      await waitForRateLimit(lastWatchlistFetchRef.current, 5000)

      const response = await axios.delete(`${API_URL}/users/${user.id}/watchlist/${movieId}`, {
        withCredentials: true,
        timeout: 30000,
      })

      console.log("✅ REMOVAL RESPONSE:", response.data)

      // Mise à jour IMMÉDIATE du state local
      const updatedWatchlist = watchlist.filter((movie) => movie.id !== movieId)
      setWatchlist(updatedWatchlist)
      console.log(`✅ LOCAL WATCHLIST UPDATED: ${updatedWatchlist.length} movies`)

      // Mettre à jour le timestamp
      lastWatchlistFetchRef.current = Date.now()

      // Confirmer la suppression
      setTimeout(async () => {
        console.log("🔄 Confirming watchlist removal...")
        await fetchWatchlist(user.id)
      }, 10000)

      setTimeout(() => {
        getUserStats(true)
      }, 15000)
    } catch (error: any) {
      console.error("❌ ERROR REMOVING FROM WATCHLIST:", error)

      if (error.response?.status === 429) {
        throw new Error("Serveur surchargé. Veuillez attendre quelques secondes et réessayer.")
      }

      throw error
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        watchlist: { ...prev.watchlist, [movieId]: false },
      }))
    }
  }

  const isInWatchlist = (movieId: number) => {
    const inWatchlist = watchlist.some((movie) => movie.id === movieId)
    console.log(`🔍 Movie ${movieId} in watchlist: ${inWatchlist}`)
    return inWatchlist
  }

  // Fonction toggleLike avec protection rate limiting
  const toggleLike = async (movieId: number, movieData?: Partial<Movie>) => {
    if (!user || !user.id) {
      console.error("User not authenticated")
      throw new Error("User not authenticated")
    }

    try {
      setLoadingStates((prev) => ({
        ...prev,
        likes: { ...prev.likes, [movieId]: true },
      }))

      // CORRECTION: Attendre pour éviter rate limiting
      await waitForRateLimit(lastLikesFetchRef.current, 5000)

      if (isLiked(movieId)) {
        console.log("Unlike movie:", movieId)
        await axios.delete(`${API_URL}/movies/${movieId}/likes`, {
          withCredentials: true,
          timeout: 30000,
          data: { user_id: user.id },
        })

        const updatedLikes = likedMovies.filter((id) => id !== movieId)
        setLikedMovies(updatedLikes)
      } else {
        console.log("Like movie:", movieId)

        const likeData = {
          user_id: user.id,
          ...(movieData && {
            title: movieData.title,
            overview: movieData.overview || "",
            poster_path: movieData.poster_path || "",
            popularity: movieData.popularity || 0,
            release_date: movieData.release_date || "2023-01-01",
            genres: movieData.genres || [],
          }),
        }

        await axios.post(`${API_URL}/movies/${movieId}/likes`, likeData, {
          withCredentials: true,
          timeout: 30000,
        })

        const updatedLikes = [...likedMovies, movieId]
        setLikedMovies(updatedLikes)
      }

      // Mettre à jour le timestamp
      lastLikesFetchRef.current = Date.now()

      setTimeout(() => {
        getUserStats(true)
      }, 10000)
    } catch (error: any) {
      console.error("Error toggling like:", error)

      if (error.response?.status === 429) {
        throw new Error("Serveur surchargé. Veuillez attendre quelques secondes et réessayer.")
      }

      throw error
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        likes: { ...prev.likes, [movieId]: false },
      }))
    }
  }

  const isLiked = (movieId: number) => {
    return likedMovies.includes(movieId)
  }

  const addComment = async (movieId: number, text: string): Promise<void> => {
    if (!user || !user.id) {
      console.error("User not authenticated")
      throw new Error("User not authenticated")
    }

    try {
      console.log("Adding comment to movie:", movieId)

      // CORRECTION: Attendre pour éviter rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000))

      await axios.post(
        `${API_URL}/movies/${movieId}/comments/`,
        {
          user_id: user.id,
          content: text,
        },
        {
          withCredentials: true,
          timeout: 30000,
        },
      )

      setTimeout(() => {
        getUserStats(true)
      }, 10000)
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  }

  const updateProfile = async (userId: number, data: { fullname: string }) => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    try {
      setLoadingStates((prev) => ({
        ...prev,
        profileUpdate: true,
      }))

      const response = await axios.put(`${API_URL}/users/${userId}`, data, {
        withCredentials: true,
        timeout: 30000,
      })

      setUser((prev) => (prev ? { ...prev, ...data } : null))

      return response.data
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        profileUpdate: false,
      }))
    }
  }

  const uploadProfileImage = async (userId: number, imageFile: File) => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    try {
      setLoadingStates((prev) => ({
        ...prev,
        profileUpdate: true,
      }))

      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await axios.post(`${API_URL}/users/upload-image/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        timeout: 30000,
      })

      if (response.data && response.status === 200) {
        const imageUrl = formatImageUrl(response.data.image)
        setUser((prev) => (prev ? { ...prev, image: imageUrl } : null))

        await refreshUserData()
      }

      return response.data
    } catch (error) {
      console.error("Error uploading profile image:", error)
      throw error
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        profileUpdate: false,
      }))
    }
  }

  // Fonction getRecommendedMovies simplifiée
  const recommendationsCache = useRef<{ data: Movie[]; timestamp: number } | null>(null)
  const recommendationsFetchingRef = useRef<boolean>(false)

  const getRecommendedMovies = async (limit = 10): Promise<Movie[]> => {
    if (!user || !user.id) {
      console.log("getRecommendedMovies: user not logged in, returning empty array")
      return []
    }

    // Vérifier le cache (5 minutes)
    const now = Date.now()
    if (recommendationsCache.current && now - recommendationsCache.current.timestamp < 300000) {
      console.log("Returning cached recommendations")
      return recommendationsCache.current.data
    }

    if (recommendationsFetchingRef.current) {
      console.log("Recommendations already being fetched, returning empty array")
      return []
    }

    try {
      recommendationsFetchingRef.current = true
      setLoadingStates((prev) => ({
        ...prev,
        recommendations: true,
      }))

      console.log(`Getting recommendations for user ${user.id} with limit ${limit}`)

      // CORRECTION: Attendre pour éviter rate limiting
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await axios.get(`${API_URL}/recommendations/user/${user.id}?limit=${limit}`, {
        withCredentials: true,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const recommendations = response.data || []

      console.log("Recommendations response:", recommendations)

      recommendationsCache.current = {
        data: recommendations,
        timestamp: now,
      }

      return recommendations
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Recommendations request was aborted")
      } else {
        console.error("Error getting recommendations:", error)
      }
      return []
    } finally {
      recommendationsFetchingRef.current = false
      setLoadingStates((prev) => ({
        ...prev,
        recommendations: false,
      }))
    }
  }

  const trainRecommendationModels = async (): Promise<boolean> => {
    try {
      console.log("Training recommendation models")

      const response = await axios.post(
        `${API_URL}/recommendations/train`,
        {},
        {
          withCredentials: true,
          timeout: 60000,
        },
      )

      console.log("Training response:", response.data)

      recommendationsCache.current = null

      return response.status === 200
    } catch (error) {
      console.error("Error training recommendation models:", error)
      return false
    }
  }

  const isLoggedIn = !!user && !!user.id

  // Logs de debug détaillés
  console.log("🔍 === USER CONTEXT DEBUG ===")
  console.log("🔍 Auth status:", isLoggedIn ? "✅ LOGGED IN" : "❌ NOT LOGGED IN")
  console.log("🔍 Loading:", loading)
  console.log("🔍 Auth checked:", authChecked)
  if (isLoggedIn && user) {
    console.log("👤 User ID:", user.id)
    console.log("👤 User name:", user.fullname)
    console.log("📋 Watchlist count:", watchlist.length)
    console.log(
      "📋 Watchlist movies:",
      watchlist.map((m) => `${m.id}: ${m.title}`),
    )
    console.log("❤️ Liked movies count:", likedMovies.length)
    console.log("❤️ Liked movie IDs:", likedMovies)
  }
  console.log("🔍 === END DEBUG ===")

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        isWatchlistLoading,
        refreshWatchlist,
        likedMovies,
        toggleLike,
        isLiked,
        isLikeLoading,
        addComment,
        loading,
        isProfileUpdateLoading,
        updateProfile,
        uploadProfileImage,
        getRecommendedMovies,
        trainRecommendationModels,
        isRecommendationsLoading,
        refreshUserData,
        userStats,
        getUserStats,
        isStatsLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
