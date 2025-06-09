"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { useUser } from "../context/UserContext"

interface NotificationData {
  comment_id?: number
  parent_comment_id?: number
  movie_id?: number
  movie_title?: string
}

interface Notification {
  id: number
  user_id: number
  sender_id: number
  sender_name: string
  sender_avatar?: string
  type: string
  title: string
  message: string
  data: NotificationData
  read_status: boolean
  created_at: string
  time_ago: string
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  pages: number
  current_page: number
  has_next: boolean
  has_prev: boolean
}

const API_URL = "http://localhost:5000/api"

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoggedIn } = useUser()

  const fetchingRef = useRef(false)
  const lastFetchRef = useRef(0)

  // Récupérer les notifications
  const fetchNotifications = useCallback(
    async (force = false) => {
      if (!user || !isLoggedIn || fetchingRef.current) return

      const now = Date.now()
      if (!force && now - lastFetchRef.current < 30000) return // Debounce 30s

      fetchingRef.current = true
      lastFetchRef.current = now
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get<NotificationsResponse>(`${API_URL}/notifications/user/${user.id}`, {
          params: { per_page: 50 },
          withCredentials: true,
          timeout: 10000,
        })

        setNotifications(response.data.notifications || [])
      } catch (err: any) {
        console.error("Erreur lors de la récupération des notifications:", err)
        setError("Erreur lors du chargement des notifications")
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    },
    [user, isLoggedIn],
  )

  // Récupérer le nombre de notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !isLoggedIn) return

    try {
      const response = await axios.get(`${API_URL}/notifications/user/${user.id}/unread-count`, {
        withCredentials: true,
        timeout: 5000,
      })

      setUnreadCount(response.data.unread_count || 0)
    } catch (err) {
      console.error("Erreur lors du comptage des notifications:", err)
    }
  }, [user, isLoggedIn])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/mark-read`, {}, { withCredentials: true })

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read_status: true } : notif)),
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Erreur lors du marquage de la notification:", err)
    }
  }, [])

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      await axios.put(`${API_URL}/notifications/user/${user.id}/mark-all-read`, {}, { withCredentials: true })

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read_status: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Erreur lors du marquage des notifications:", err)
    }
  }, [user])

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, { withCredentials: true })

      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId)
        if (notification && !notification.read_status) {
          setUnreadCount((count) => Math.max(0, count - 1))
        }
        return prev.filter((notif) => notif.id !== notificationId)
      })
    } catch (err) {
      console.error("Erreur lors de la suppression de la notification:", err)
    }
  }, [])

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications(true)
      fetchUnreadCount()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isLoggedIn, user, fetchNotifications, fetchUnreadCount])

  // Polling pour les nouvelles notifications (toutes les 2 minutes)
  useEffect(() => {
    if (!isLoggedIn || !user) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [isLoggedIn, user, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: () => fetchNotifications(true),
  }
}
