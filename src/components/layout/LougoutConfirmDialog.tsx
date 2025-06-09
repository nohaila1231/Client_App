"use client"

import type React from "react"
import { LogOut } from "lucide-react"

interface LogoutConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  // Prevent clicks on the dialog from propagating to the overlay
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose} // Close when clicking the overlay
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>

      {/* Dialog */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative transform overflow-hidden rounded-lg bg-dark-200 px-6 py-5 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
          onClick={handleDialogClick}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-600/10 sm:mx-0">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-semibold text-white">Confirmer la déconnexion</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
            >
              Se déconnecter
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-dark-300 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-dark-400 sm:mt-0 sm:w-auto"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmDialog
