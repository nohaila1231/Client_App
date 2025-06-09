"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Bell, X, Check, CheckCheck, Trash2, MessageSquare, Heart, User, Film } from "lucide-react"
import { useNotifications } from "../../hooks/useNotifications"

interface NotificationDropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onToggle, onClose }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment_like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment_reply":
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  // Obtenir le lien de redirection
  const getNotificationLink = (notification: any) => {
    const { type, data } = notification

    if (type === "comment_like" || type === "comment_reply") {
      return `/movie/${data.movie_id}#comment-${data.comment_id}`
    }

    return "#"
  }

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.read_status) {
      await markAsRead(notification.id)
    }
    onClose()
  }

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors duration-300"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50"
        >
          {/* En-tête */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white text-lg font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                  title="Marquer tout comme lu"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tout lire
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Chargement...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-300 ${
                    !notification.read_status ? "bg-gray-800/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar de l'expéditeur */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      {notification.sender_avatar ? (
                        <img
                          src={notification.sender_avatar || "/placeholder.svg"}
                          alt={notification.sender_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Contenu de la notification */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="text-white text-sm font-medium">{notification.title}</span>
                          {!notification.read_status && <span className="w-2 h-2 bg-red-600 rounded-full"></span>}
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read_status && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="text-gray-400 hover:text-green-400 p-1"
                              title="Marquer comme lu"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-red-400 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-2">{notification.message}</p>

                      {notification.data.movie_title && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                          <Film className="w-3 h-3" />
                          <span>{notification.data.movie_title}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{notification.time_ago}</span>

                        <Link
                          to={getNotificationLink(notification)}
                          onClick={() => handleNotificationClick(notification)}
                          className="text-red-500 hover:text-red-400 text-xs font-medium"
                        >
                          Voir →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune notification pour le moment</p>
              </div>
            )}
          </div>

          {/* Pied de page */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 text-center">
              <Link
                to="/notifications"
                onClick={onClose}
                className="text-red-500 hover:text-red-400 text-sm font-medium"
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
