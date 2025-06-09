"use client"

import type React from "react"
import { useState } from "react"
import { User } from "lucide-react"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackIcon?: React.ReactNode
  onError?: () => void
  onLoad?: () => void
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className = "", fallbackIcon, onError, onLoad }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    if (onError) onError()
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    if (onLoad) onLoad()
  }

  // Si pas de src ou erreur, afficher le fallback
  if (!src || imageError) {
    return (
      <div className={`bg-gray-700 flex items-center justify-center ${className}`}>
        {fallbackIcon || <User className="text-gray-400" size={20} />}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />

      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      )}
    </div>
  )
}

export default SafeImage
