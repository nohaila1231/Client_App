import type React from "react"
import { Spinner } from "./spinner"

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  variant?: "default" | "netflix"
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Chargement en cours...",
  variant = "netflix",
}) => {
  if (!isVisible) return null

  const bgColor = variant === "netflix" ? "bg-black/80" : "bg-white/80"
  const textColor = variant === "netflix" ? "text-red-600" : "text-gray-800"

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgColor}`}>
      <Spinner size="lg" color={variant === "netflix" ? "netflix" : "default"} className="mb-4" />
      <p className={`text-lg font-medium ${textColor}`}>{message}</p>
    </div>
  )
}

export default LoadingOverlay
