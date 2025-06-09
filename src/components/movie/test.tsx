"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  MessageSquare,
  AlertCircle,
  Send,
  User,
  Heart,
  Reply,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  Sparkles,
  Clock,
  ThumbsUp
} from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useUser } from "../../context/UserContext"
import { getUserAvatarUrl } from "../../utils/image-utils"
import SafeImage from "./SafeImage"
import type { Comment } from "../../types/movie"

interface CommentSectionProps {
  movieId: number
  onCommentAdded?: () => void
}

interface ExtendedComment extends Comment {
  is_liked_by_user?: boolean
  likes_count?: number
  replies_count?: number
  replies?: ExtendedComment[]
}

const API_URL = "https://backapp-production-01be.up.railway.app/api"

const CommentSection: React.FC<CommentSectionProps> = ({ movieId, onCommentAdded }) => {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<ExtendedComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [likingComments, setLikingComments] = useState<Set<number>>(new Set())
  const [openDropdowns, setOpenDropdowns] = useState<Set<number>>(new Set())
  const [likeSuccess, setLikeSuccess] = useState<Set<number>>(new Set())
  const { user, isLoggedIn } = useUser()

  // Références pour éviter les appels multiples
  const isFetchingRef = useRef<boolean>(false)
  const lastFetchTimeRef = useRef<number>(0)
  const commentsLoadedRef = useRef<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Toggle dropdown menu
  const toggleDropdown = (commentId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.clear()
        newSet.add(commentId)
      }
      return newSet
    })
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns(new Set())
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  // Auto-clear success indicators
  useEffect(() => {
    if (likeSuccess.size > 0) {
      const timer = setTimeout(() => {
        setLikeSuccess(new Set())
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [likeSuccess])

  // Fetch comments avec debouncing et cache
  const fetchComments = useCallback(
    async (force = false) => {
      const now = Date.now()
      if (!force && (isFetchingRef.current || now - lastFetchTimeRef.current < 2000)) {
        console.log("Skipping fetchComments - already fetching or too soon")
        return
      }

      if (!force && commentsLoadedRef.current && comments.length > 0) {
        console.log("Comments already loaded, skipping fetch")
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      isFetchingRef.current = true
      lastFetchTimeRef.current = now
      setIsLoading(true)
      setError(null)

      try {
        const url = `${API_URL}/movies/${movieId}/comments/`
        const params = user?.id ? { user_id: user.id } : {}

        console.log(`Fetching comments for movie ${movieId}${user?.id ? ` with user ${user.id}` : ""}`)

        const response = await axios.get(url, {
          params,
          withCredentials: true,
          signal: abortControllerRef.current.signal,
          timeout: 5000,
        })

        if (response.data && Array.isArray(response.data)) {
          setComments(response.data)
          commentsLoadedRef.current = true
        } else {
          console.error("Unexpected comments data format:", response.data)
          setComments([])
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch comments request was aborted")
        } else if (err.code === "ECONNABORTED") {
          console.error("Timeout fetching comments")
          setError("La requête a pris trop de temps. Veuillez réessayer.")
        } else {
          console.error("Error fetching comments:", err)
        }
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
        abortControllerRef.current = null
      }
    },
    [movieId, user?.id],
  )

  // Load comments on mount avec cleanup
  useEffect(() => {
    setComments([])
    commentsLoadedRef.current = false
    lastFetchTimeRef.current = 0

    fetchComments(true)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchComments, movieId])

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim() || !isLoggedIn || !user) {
      return
    }

    setError(null)

    try {
      await axios.post(
        `${API_URL}/movies/${movieId}/comments/`,
        {
          user_id: user.id,
          content: comment,
        },
        {
          withCredentials: true,
        },
      )

      setComment("")
      fetchComments(true)

      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (err: any) {
      console.error("Error adding comment:", err)
      setError(err.response?.data?.error || "Erreur lors de l'ajout du commentaire")
    }
  }

  // Handle reply submission
  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim() || !isLoggedIn || !user) {
      return
    }

    try {
      await axios.post(
        `${API_URL}/movies/${movieId}/comments/`,
        {
          user_id: user.id,
          content: replyText,
          parent_id: parentId,
        },
        {
          withCredentials: true,
        },
      )

      setReplyText("")
      setReplyingTo(null)
      fetchComments(true)
    } catch (err: any) {
      console.error("Error adding reply:", err)
      setError(err.response?.data?.error || "Erreur lors de l'ajout de la réponse")
    }
  }

  // Handle comment edit
  const handleEditComment = async (commentId: number) => {
    if (!editText.trim() || !user) {
      return
    }

    try {
      await axios.put(
        `${API_URL}/movies/${movieId}/comments/${commentId}`,
        {
          user_id: user.id,
          content: editText,
        },
        {
          withCredentials: true,
        },
      )

      setEditText("")
      setEditingComment(null)
      fetchComments(true)
    } catch (err: any) {
      console.error("Error editing comment:", err)
      setError(err.response?.data?.error || "Erreur lors de la modification du commentaire")
    }
  }

  // Handle comment delete
  const handleDeleteComment = async (commentId: number) => {
    if (!user || !confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return
    }

    try {
      await axios.delete(`${API_URL}/movies/${movieId}/comments/${commentId}`, {
        data: { user_id: user.id },
        withCredentials: true,
      })

      fetchComments(true)
    } catch (err: any) {
      console.error("Error deleting comment:", err)
      setError(err.response?.data?.error || "Erreur lors de la suppression du commentaire")
    }
  }

  // Fonction récursive pour mettre à jour les likes dans les commentaires imbriqués
  const updateCommentLike = (
    comments: ExtendedComment[],
    commentId: number,
    isLiked: boolean,
    likesCount: number,
  ): ExtendedComment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          is_liked_by_user: isLiked,
          likes_count: likesCount,
        }
      }

      // Si ce commentaire a des réponses, les mettre à jour récursivement
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLike(comment.replies, commentId, isLiked, likesCount),
        }
      }

      return comment
    })
  }

  // Handle comment like - VERSION AMÉLIORÉE
  const handleLikeComment = async (commentId: number) => {
    if (!user || likingComments.has(commentId)) {
      console.log("Cannot like: user not logged in or already liking")
      return
    }

    // Trouver le commentaire dans la structure (peut être une réponse)
    const findComment = (comments: ExtendedComment[], id: number): ExtendedComment | null => {
      for (const comment of comments) {
        if (comment.id === id) return comment
        if (comment.replies) {
          const found = findComment(comment.replies, id)
          if (found) return found
        }
      }
      return null
    }

    const targetComment = findComment(comments, commentId)
    if (!targetComment) {
      console.error("Comment not found")
      return
    }

    // Mise à jour optimiste IMMÉDIATE
    const newIsLiked = !targetComment.is_liked_by_user
    const newLikesCount = newIsLiked
      ? (targetComment.likes_count || 0) + 1
      : Math.max((targetComment.likes_count || 1) - 1, 0)

    // Mettre à jour l'état immédiatement pour un feedback visuel instantané
    setComments((prevComments) => updateCommentLike(prevComments, commentId, newIsLiked, newLikesCount))

    // Ajouter l'indicateur de chargement
    setLikingComments((prev) => new Set(prev).add(commentId))

    try {
      console.log(`Liking comment ${commentId} for user ${user.id}`)

      const response = await axios.post(
        `${API_URL}/movies/${movieId}/comments/${commentId}/like`,
        {
          user_id: user.id,
        },
        {
          withCredentials: true,
          timeout: 10000, // 10 secondes de timeout
        },
      )

      console.log("Like response:", response.data)

      // Ajouter l'indicateur de succès
      setLikeSuccess((prev) => new Set(prev).add(commentId))

      // Si la réponse contient des données mises à jour, les utiliser
      if (response.data && typeof response.data.likes_count !== "undefined") {
        setComments((prevComments) =>
          updateCommentLike(prevComments, commentId, response.data.is_liked, response.data.likes_count),
        )
      }
    } catch (err: any) {
      console.error("Error liking comment:", err)

      // Annuler la mise à jour optimiste en cas d'erreur
      setComments((prevComments) =>
        updateCommentLike(
          prevComments,
          commentId,
          targetComment.is_liked_by_user || false,
          targetComment.likes_count || 0,
        ),
      )

      // Afficher l'erreur
      if (err.response?.status === 401) {
        setError("Vous devez être connecté pour aimer un commentaire")
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation de faire cette action")
      } else if (err.code === "ECONNABORTED") {
        setError("La requête a pris trop de temps. Veuillez réessayer.")
      } else {
        setError(err.response?.data?.error || "Erreur lors du like du commentaire")
      }

      // Effacer l'erreur après 3 secondes
      setTimeout(() => setError(null), 3000)
    } finally {
      // Retirer l'indicateur de chargement
      setLikingComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Render a single comment
  const renderComment = (comment: ExtendedComment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`group relative border border-gray-700/50 backdrop-blur-sm bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 ${
        isReply ? "ml-12 mt-3 bg-gradient-to-br from-slate-700/40 to-slate-800/40" : ""
      }`}
    >
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      <div className="relative flex items-start space-x-4">
        {/* Avatar avec bordure animée */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 group-hover:from-cyan-400 group-hover:to-purple-500 transition-all duration-300">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
              <SafeImage
                src={getUserAvatarUrl(comment.user)}
                alt="Profile"
                className="w-full h-full rounded-full"
                fallbackIcon={
                  <span className="text-purple-400 font-bold text-lg">
                    {comment.user?.fullname?.charAt(0).toUpperCase() || "?"}
                  </span>
                }
              />
            </div>
          </div>
          {/* Indicateur en ligne */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-slate-800 animate-pulse"></div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header du commentaire */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                {comment.user?.fullname || "Utilisateur anonyme"}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(comment.created_at)}</span>
              </div>
            </div>
            
            {user && user.id === comment.user_id && (
              <div className="relative">
                <button
                  onClick={(e) => toggleDropdown(comment.id, e)}
                  className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/70 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4 text-slate-300" />
                </button>

                {openDropdowns.has(comment.id) && (
                  <div className="absolute right-0 top-10 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600/50 py-2 z-20 min-w-[140px]">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id)
                        setEditText(comment.content)
                        setOpenDropdowns(new Set())
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/50 flex items-center transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-3 text-blue-400" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteComment(comment.id)
                        setOpenDropdowns(new Set())
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700/50 flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-slate-700/50 text-white rounded-xl p-4 min-h-[100px] border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                  placeholder="Modifier votre commentaire..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                  {editText.length}/500
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={!editText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setEditText("")
                  }}
                  className="px-4 py-2 bg-slate-600/50 text-white rounded-lg font-medium hover:bg-slate-500/50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-200 leading-relaxed mb-4 text-sm">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-6">
                {isLoggedIn && (
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={likingComments.has(comment.id)}
                    className={`group/like flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 relative ${
                      comment.is_liked_by_user
                        ? "text-pink-500 bg-pink-500/10 hover:bg-pink-500/20"
                        : "text-slate-400 hover:text-pink-400 hover:bg-slate-700/30"
                    } ${likingComments.has(comment.id) ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {likingComments.has(comment.id) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          comment.is_liked_by_user 
                            ? "fill-current scale-110" 
                            : "group-hover/like:scale-110"
                        }`}
                      />
                    )}
                    <span className="font-medium text-sm">
                      {comment.likes_count || 0}
                    </span>

                    {/* Particules d'animation pour le succès */}
                    {likeSuccess.has(comment.id) && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                )}

                {isLoggedIn && !isReply && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-400 rounded-full hover:text-cyan-400 hover:bg-slate-700/30 transition-all duration-200"
                  >
                    <Reply className="w-5 h-5" />
                    <span className="font-medium text-sm">Répondre</span>
                  </button>
                )}

                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Utile</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulaire de réponse */}
      {replyingTo === comment.id && (
        <div className="mt-6 ml-16">
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrivez votre réponse..."
              className="w-full bg-slate-600/30 text-white rounded-lg p-3 min-h-[80px] border border-slate-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none transition-all"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-slate-400">
                Réponse à {comment.user?.fullname}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Répondre</span>
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText("")
                  }}
                  className="px-4 py-2 bg-slate-600/50 text-white rounded-lg font-medium hover:bg-slate-500/50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Réponses */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-6 space-y-3">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      {/* Background avec effet de verre */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-3xl"></div>
      
      <div className="relative p-8">
        {/* Header avec animation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Discussion
              </h3>
              <p className="text-slate-400 text-sm">
                Partagez vos impressions sur ce film
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 font-medium text-sm">
                {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)} messages
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Message de connexion */}
        {!isLoggedIn && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Rejoignez la conversation</h4>
                <p className="text-amber-200/80 text-sm">
                  Connectez-vous pour partager votre avis et interagir avec la communauté.
                  <Link to="/signin" className="ml-2 text-amber-300 hover:text-white font-medium underline underline-offset-2 hover:no-underline transition-all">
                    Se connecter →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de commentaire */}
        {isLoggedIn && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
              <div className="flex items-start space-x-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      <SafeImage
                        src={getUserAvatarUrl(user)}
                        alt="Profile"
                        className="w-full h-full rounded-full"
                        fallbackIcon={<User className="w-6 h-6 text-cyan-400" />}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-slate-800"></div>
                </div>

                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Que pensez-vous de ce film ? Partagez votre avis..."
                      className="w-full bg-slate-700/50 text-white rounded-xl p-4 min-h-[120px] border border-slate-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-300 placeholder:text-slate-400"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <span className="text-xs text-slate-400">
                        {comment.length}/500
                      </span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>💡 Soyez respectueux et constructif</span>
                    </div>
                    <button
                      type="submit"
                      disabled={!comment.trim()}
                      className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      <span>Publier</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Liste des commentaires */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="border border-slate-700/50 bg-slate-800/30 rounded-2xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-4 bg-slate-700 rounded w-24"></div>
                          <div className="h-3 bg-slate-700 rounded w-16"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-full"></div>
                          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="h-8 bg-slate-700 rounded-full w-16"></div>
                          <div className="h-8 bg-slate-700 rounded-full w-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => renderComment(comment))
          ) : (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Première impression ?
              </h4>
              <p className="text-slate-400 max-w-md mx-auto">
                Soyez le premier à partager votre avis sur ce film et lancez la discussion !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentSection