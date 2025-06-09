"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "../context/UserContext"
import {
  UserIcon,
  Mail,
  Camera,
  Save,
  Edit3,
  X,
  Check,
  AlertCircle,
  Loader2,
  Upload,
  Film,
  MessageSquare,
  Heart,
  Bookmark,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { getUserAvatarUrl } from "../utils/image-utils"

const ProfilePage: React.FC = () => {
  const {
    user,
    loading: userLoading,
    uploadProfileImage,
    updateProfile,
    refreshUserData,
    userStats,
    getUserStats,
    isStatsLoading,
    likedMovies,
    watchlist,
  } = useUser()

  const [isEditing, setIsEditing] = useState(false)
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CORRECTION: Effet pour initialiser les données utilisateur
  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "")
      setEmail(user.email || "")
      setPreviewUrl(getUserAvatarUrl(user) || null)

      // CORRECTION: Récupérer les stats avec un délai pour éviter le rate limiting
      const timer = setTimeout(() => {
        if (!userStats) {
          console.log("🔄 Fetching stats from ProfilePage useEffect")
          getUserStats(true)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [user, getUserStats, userStats])

  // Animation effect
  useEffect(() => {
    setMounted(true)

    // Auto-dismiss success message
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // CORRECTION: Manual retry avec délai
  const handleRetryFetch = () => {
    if (user && user.id) {
      setError("")
      console.log("🔄 Manual retry fetch stats")
      setTimeout(() => {
        getUserStats(true)
      }, 1000)
    }
  }

  // Format date to display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
  }

  // Calculate time ago
  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
    return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? "s" : ""}`
  }

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return

    setSaving(true)
    setSuccess("")
    setError("")

    try {
      // Update profile information if changed
      if (fullname !== user.fullname) {
        await updateProfile(user.id, { fullname })
      }

      // Upload image if changed
      if (imageFile) {
        await uploadProfileImage(user.id, imageFile)
      }

      // Refresh user data to ensure all components get updated
      await refreshUserData()

      setSuccess("Profil mis à jour avec succès!")
      setIsEditing(false)
      setImageFile(null)
    } catch (err: any) {
      console.error("Error updating profile:", err)

      if (err.response?.status === 404) {
        setError("Utilisateur non trouvé. Veuillez vous reconnecter.")
      } else if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.")
      } else if (err.message === "Network Error") {
        setError("Erreur de connexion au serveur. Vérifiez votre connexion internet.")
      } else {
        setError(err.response?.data?.error || "Une erreur est survenue lors de la mise à jour du profil")
      }
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    setFullname(user?.fullname || "")
    setPreviewUrl(getUserAvatarUrl(user) || null)
    setImageFile(null)
    setError("")
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={18} className="text-red-500" />
      case "watchlist":
        return <Bookmark size={18} className="text-red-500" />
      case "comment":
        return <MessageSquare size={18} className="text-red-500" />
      default:
        return <Check size={18} className="text-red-500" />
    }
  }

  // Get activity text based on type
  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case "like":
        return `Vous avez aimé ${activity.movieTitle ? `"${activity.movieTitle}"` : "un film"}`
      case "watchlist":
        return `Vous avez ajouté ${activity.movieTitle ? `"${activity.movieTitle}"` : "un film"} à votre liste`
      case "comment":
        return `Vous avez commenté ${activity.movieTitle ? `"${activity.movieTitle}"` : "un film"}`
      default:
        return "Activité inconnue"
    }
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Accès restreint</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Connectez-vous pour accéder à votre espace personnel et gérer votre profil.
          </p>
          <a
            href="/signin"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Se connecter
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Profil <span className="text-red-500">utilisateur</span>
              </h1>
              <p className="text-gray-400">Gérez vos informations et préférences</p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <Edit3 size={18} />
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <X size={18} />
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3 text-green-400">
            <Check size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between text-red-400">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
            <button
              onClick={handleRetryFetch}
              className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
              disabled={isStatsLoading}
            >
              {isStatsLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Réessayer
            </button>
          </div>
        )}

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-400 text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="space-y-1">
              <p>Likes dans UserContext: {likedMovies.length}</p>
              <p>Watchlist dans UserContext: {watchlist.length}</p>
              <p>Stats API - Likes: {userStats?.likedMovies || 0}</p>
              <p>Stats API - Watchlist: {userStats?.watchlistCount || 0}</p>
              <p>Stats API - Comments: {userStats?.commentsCount || 0}</p>
              <p>Stats Loading: {isStatsLoading ? "Oui" : "Non"}</p>
              <p>Stats Object: {userStats ? "Présent" : "Null"}</p>
              {userStats && (
                <div className="mt-2 p-2 bg-blue-500/5 rounded text-xs">
                  <p>Raw Stats: {JSON.stringify(userStats, null, 2)}</p>
                </div>
              )}
            </div>
          </div>
        )} */}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              {/* Avatar */}
              <div className="relative mb-6">
                <div className={`w-32 h-32 mx-auto rounded-full overflow-hidden ${isEditing ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-700'} transition-all`}>
                  {previewUrl ? (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=128"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <UserIcon size={48} className="text-gray-500" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <button
                      onClick={triggerFileInput}
                      className="absolute bottom-2 right-1/2 transform translate-x-12 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Camera size={18} className="text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nom complet</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full bg-gray-800 border ${
                        isEditing ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700'
                      } rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none transition-all disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Adresse e-mail</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      disabled={true}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none transition-all disabled:opacity-60"
                    />
                  </div>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">L'adresse e-mail ne peut pas être modifiée.</p>
                  )}
                </div>

                {isEditing && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Upload size={16} className="text-red-500" />
                      Changer votre photo de profil
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Téléchargez une image claire de votre visage. Les formats JPG, PNG et GIF sont acceptés.
                    </p>
                    <button
                      onClick={triggerFileInput}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Sélectionner une image
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Membre depuis</span>
                      <span className="text-white text-sm flex items-center gap-2">
                        <Calendar size={14} className="text-red-500" />
                        {isStatsLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          userStats?.memberSince || "Juin 2025"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Statut du compte</span>
                      <span className="text-white text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Actif
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Activité récente</h2>
                <button
                  onClick={handleRetryFetch}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={isStatsLoading}
                  title="Actualiser les données"
                >
                  <RefreshCw size={18} className={isStatsLoading ? "animate-spin" : ""} />
                </button>
              </div>
              
              <div className="p-6">
                {isStatsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userStats?.recentActivities && userStats.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {userStats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{getActivityText(activity)}</p>
                          <p className="text-sm text-gray-400 mt-1">{activity.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Film size={24} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 mb-4">Aucune activité récente</p>
                    <button
                      onClick={handleRetryFetch}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                      disabled={isStatsLoading}
                    >
                      <RefreshCw size={16} />
                      Actualiser les données
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics & Preferences */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Statistiques & Préférences</h2>
              </div>
              
              <div className="p-6">
                {isStatsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-500">Statistiques</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart size={20} className="text-red-500" />
                            <span className="text-gray-300">Films aimés</span>
                          </div>
                          <span className="text-white font-semibold text-lg">
                            {userStats?.likedMovies || likedMovies.length || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bookmark size={20} className="text-red-500" />
                            <span className="text-gray-300">Liste de films</span>
                          </div>
                          <span className="text-white font-semibold text-lg">
                            {userStats?.watchlistCount || watchlist.length || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={20} className="text-red-500" />
                            <span className="text-gray-300">Commentaires</span>
                          </div>
                          <span className="text-white font-semibold text-lg">
                            {userStats?.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Favorite Genres */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-500">Genres préférés</h3>
                      {userStats?.favoriteGenres && userStats.favoriteGenres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userStats.favoriteGenres.map((genre, index) => (
                            <span 
                              key={index} 
                              className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-2 rounded-lg text-sm font-medium"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Film size={20} className="text-gray-600" />
                          </div>
                          <p className="text-gray-400">Aucun genre préféré identifié</p>
                          <p className="text-sm text-gray-500 mt-1">Likez plus de films pour voir vos préférences</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage