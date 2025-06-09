import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Configure axios
axios.defaults.withCredentials = true

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/me`)
    return response.data.user
  } catch (error) {
    console.error("Error fetching current user:", error)
    throw error
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: number, data: { fullname: string }) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

/**
 * Upload profile image
 */
export const uploadProfileImage = async (userId: number, imageFile: File) => {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const response = await axios.post(`${API_URL}/users/upload-image/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error uploading profile image:", error)
    throw error
  }
}
