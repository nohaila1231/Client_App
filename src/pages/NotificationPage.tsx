"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, Check, CheckCheck, Trash2, MessageSquare, Heart, User, Film, Filter, ArrowLeft } from "lucide-react"
import { useNotifications } from "../hooks/useNotifications"

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const [filter, setFilter] = useState<"all" | "unread">("all")

  // Filtrer les notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.read_status
    }
    return true
  })

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment_like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment_reply":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
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
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-red-600" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-400 mt-1">
                  {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filtre */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "unread")}
                className="bg-gray-800 text-white rounded-md px-3 py-1 text-sm border border-gray-700 focus:border-red-600 focus:outline-none"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
              </select>
            </div>

            {/* Marquer tout comme lu */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Marquer tout comme lu
              </button>
            )}
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-400 mt-4">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-800/50 transition-colors duration-300 ${
                    !notification.read_status ? "bg-gray-800/30 border-l-4 border-red-600" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar de l'expéditeur */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      {notification.sender_avatar ? (
                        <img
                          src={notification.sender_avatar || "/placeholder.svg"}
                          alt={notification.sender_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Contenu de la notification */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getNotificationIcon(notification.type)}
                          <h3 className="text-white text-lg font-semibold">{notification.title}</h3>
                          {!notification.read_status && <span className="w-3 h-3 bg-red-600 rounded-full"></span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read_status && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-400 p-2 rounded-md hover:bg-gray-700 transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-400 p-2 rounded-md hover:bg-gray-700 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-3">
                        <span className="font-medium text-white">{notification.sender_name}</span>{" "}
                        {notification.message.replace(notification.sender_name, "")}
                      </p>

                      {notification.data.movie_title && (
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <Film className="w-4 h-4" />
                          <span className="text-sm">{notification.data.movie_title}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">{notification.time_ago}</span>

                        <Link
                          to={getNotificationLink(notification)}
                          onClick={() => handleNotificationClick(notification)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Voir le commentaire
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
              </h3>
              <p className="text-sm">
                {filter === "unread"
                  ? "Toutes vos notifications ont été lues !"
                  : "Vous recevrez des notifications ici quand quelqu'un interagit avec vos commentaires."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
