"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Share2, X, Copy, Check } from 'lucide-react'

interface ShareDropdownProps {
  movieTitle: string
  movieId: number
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

const ShareDropdown: React.FC<ShareDropdownProps> = ({ movieTitle, movieId, isOpen, onToggle, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)

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

  // URL du film à partager
  const movieUrl = `${window.location.origin}/movie/${movieId}`
  const shareText = `Découvrez "${movieTitle}" sur CinéSoul !`

  // URLs de partage pour chaque plateforme
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${movieUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(movieUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(movieUrl)}`,
    instagram: movieUrl,
  }

  const handleShare = (platform: string) => {
    if (platform === "instagram") {
      navigator.clipboard
        .writeText(`${shareText} ${movieUrl}`)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          alert("Impossible de copier le lien.")
        })
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
    }
    onClose()
  }

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(movieUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        alert("Impossible de copier le lien")
      })
  }

  // Icônes authentiques des réseaux sociaux
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
    </svg>
  )

  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )

  const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1DA1F2">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  )

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      platform: "whatsapp",
      bgColor: "hover:bg-green-600/10",
      borderColor: "hover:border-green-600/20"
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      platform: "facebook",
      bgColor: "hover:bg-blue-600/10",
      borderColor: "hover:border-blue-600/20"
    },
    {
      name: "Twitter",
      icon: TwitterIcon,
      platform: "twitter",
      bgColor: "hover:bg-sky-600/10",
      borderColor: "hover:border-sky-600/20"
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      platform: "instagram",
      bgColor: "hover:bg-pink-600/10",
      borderColor: "hover:border-pink-600/20"
    },
  ]

  return (
    <div className="relative">
      {/* Bouton de partage Netflix-style */}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center px-4 py-2 bg-black/80 hover:bg-black text-white rounded border border-gray-600 hover:border-gray-500 transition-all duration-200"
      >
        <Share2 size={18} className="mr-2" />
        <span className="text-sm font-medium">Partager</span>
      </button>

      {/* Dropdown Netflix-style */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-black/95 backdrop-blur-sm rounded border border-gray-700 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200"
        >
          {/* En-tête minimaliste */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white text-lg font-semibold">Partager</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-4">
            {/* Titre du film */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Film :</p>
              <p className="text-white font-medium text-sm truncate">{movieTitle}</p>
            </div>

            {/* Options de partage en ligne */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareOptions.map((option) => (
                <button
                  key={option.platform}
                  onClick={() => handleShare(option.platform)}
                  className={`flex flex-col items-center p-3 bg-gray-900/30 ${option.bgColor} border border-gray-700 ${option.borderColor} rounded transition-all duration-200 hover:scale-105 min-h-[80px]`}
                  title={option.name}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded mb-2">
                    <option.icon />
                  </div>
                  <span className="text-white text-xs font-medium text-center leading-tight">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Section copie de lien */}
            <div className="space-y-2">
              <p className="text-gray-400 text-xs">Ou copier le lien</p>
              
              <div className="flex">
                <input
                  type="text"
                  value={movieUrl}
                  readOnly
                  className="flex-1 bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-2 rounded-l focus:outline-none focus:border-red-600"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 border border-l-0 border-gray-700 rounded-r transition-all duration-200 ${
                    copied 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              
              {copied && (
                <p className="text-green-500 text-xs flex items-center">
                  <Check size={14} className="mr-1" />
                  Copié !
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareDropdown