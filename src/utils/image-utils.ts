export const API_URL = "https://backapp-production-01be.up.railway.app/api";

export const SERVER_URL = "https://backapp-production-01be.up.railway.app"

/**
 * Formate l'URL d'une image pour s'assurer qu'elle est complète et accessible
 */
export function formatImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  // Si l'URL est déjà complète, la retourner telle quelle
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // Si l'URL commence par /static, ajouter le serveur
  if (imageUrl.startsWith("/static")) {
    return `${SERVER_URL}${imageUrl}`
  }

  // Si l'URL est relative, construire l'URL complète
  if (imageUrl.startsWith("static/")) {
    return `${SERVER_URL}/${imageUrl}`
  }

  return imageUrl
}

/**
 * Obtient l'URL de l'avatar d'un utilisateur avec fallback
 */
export function getUserAvatarUrl(user: any): string | null {
  if (!user) return null

  const imageUrl = formatImageUrl(user.image)
  return imageUrl
}

/**
 * Génère une URL de placeholder pour les avatars
 */
export function getPlaceholderAvatarUrl(size = 40): string {
  return `/placeholder.svg?height=${size}&width=${size}`
}

/**
 * Vérifie si une URL d'image est valide et accessible
 */
export async function isImageUrlValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
    })
    return response.ok && response.headers.get("content-type")?.startsWith("image/")
  } catch {
    return false
  }
}

/**
 * Teste la connectivité avec le serveur d'images
 */
export async function testImageServer(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/test-uploads`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Obtient les informations de debug sur les uploads
 */
export async function getUploadDebugInfo(): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/test-uploads`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Teste si un fichier spécifique existe sur le serveur
 */
export async function testSpecificFile(filename: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/test-file/${filename}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}
