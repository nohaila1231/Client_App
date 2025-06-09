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

const API_URL = "http://localhost:5000/api"

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
    <div key={comment.id} className={`bg-gray-800 rounded-lg p-4 ${isReply ? "ml-8 mt-2" : ""}`}>
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-red-600/20 flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
          <SafeImage
            src={getUserAvatarUrl(comment.user)}
            alt="Profile"
            className="w-full h-full rounded-full"
            fallbackIcon={
              <span className="text-red-600 font-semibold">
                {comment.user?.fullname?.charAt(0).toUpperCase() || "?"}
              </span>
            }
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">{comment.user?.fullname || "Utilisateur anonyme"}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
              {user && user.id === comment.user_id && (
                <div className="relative">
                  <button
                    onClick={(e) => toggleDropdown(comment.id, e)}
                    className="h-6 w-6 p-0 rounded hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>

                  {openDropdowns.has(comment.id) && (
                    <div className="absolute right-0 top-8 bg-gray-700 rounded-md shadow-lg border border-gray-600 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditText(comment.content)
                          setOpenDropdowns(new Set())
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id)
                          setOpenDropdowns(new Set())
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-2 min-h-[80px] border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
                placeholder="Modifier votre commentaire..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={!editText.trim()}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setEditText("")
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-200 mb-2">{comment.content}</p>

              <div className="flex items-center gap-4 text-sm">
                {isLoggedIn && (
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={likingComments.has(comment.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all duration-200 relative ${
                      comment.is_liked_by_user
                        ? "text-red-500 bg-red-500/10"
                        : "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                    } ${likingComments.has(comment.id) ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    {likingComments.has(comment.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 transition-all ${comment.is_liked_by_user ? "fill-current scale-110" : ""}`}
                      />
                    )}
                    <span className={`transition-all ${comment.is_liked_by_user ? "font-medium" : ""}`}>
                      {comment.likes_count || 0}
                    </span>

                    {/* Indicateur de succès */}
                    {likeSuccess.has(comment.id) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </button>
                )}

                {isLoggedIn && !isReply && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 px-2 py-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Répondre
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="mt-4 ml-13">
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrivez votre réponse..."
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 min-h-[60px] border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyText.trim()}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Répondre
            </button>
            <button
              onClick={() => {
                setReplyingTo(null)
                setReplyText("")
              }}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">{comment.replies.map((reply) => renderComment(reply, true))}</div>
      )}
    </div>
  )

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <MessageSquare size={20} className="mr-2" />
        Commentaires
        <span className="ml-2 text-sm bg-gray-800 text-gray-200 px-2 py-0.5 rounded-full">
          {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
        </span>
      </h3>

      {!isLoggedIn && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 flex items-center text-gray-300">
          <AlertCircle size={20} className="mr-2 text-red-600" />
          <p>
            Connectez-vous pour ajouter votre commentaire.
            <Link to="/signin" className="ml-2 text-red-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      )}

      {isLoggedIn && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <SafeImage
                src={getUserAvatarUrl(user)}
                alt="Profile"
                className="w-full h-full rounded-full"
                fallbackIcon={<User size={20} className="text-red-600" />}
              />
            </div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre avis sur ce film..."
                className="w-full bg-gray-800 text-white rounded-lg p-3 min-h-[100px] border border-gray-700 focus:border-red-600 focus:outline-none resize-none"
              />

              {error && (
                <div className="mt-2 text-red-500 text-sm bg-red-900/20 border border-red-600/30 rounded p-2 flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="mr-2" />
                  Publier
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/6 mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))
        ) : comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="text-center py-6 text-gray-300">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
            <p>Aucun commentaire pour le moment. Soyez le premier à donner votre avis!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection
