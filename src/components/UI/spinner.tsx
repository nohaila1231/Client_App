import type React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  color?: "default" | "primary" | "netflix"
}

export const Spinner = ({ size = "md", color = "default", className, ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  const colorClasses = {
    default: "border-gray-300 border-t-gray-800",
    primary: "border-gray-300 border-t-blue-600",
    netflix: "border-gray-800 border-t-red-600", // Style Netflix
  }

  return (
    <div className={cn("animate-spin rounded-full", sizeClasses[size], colorClasses[color], className)} {...props} />
  )
}
