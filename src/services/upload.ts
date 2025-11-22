import axios from 'axios'
import api from './api'

const CLOUDINARY_CLOUD_NAME = 'dthdcnchy'

export const uploadImage = async (file: File): Promise<string> => {
  const signatureResponse = await api.get('/uploads/signature')
  const { signature, timestamp, api_key, folder } = signatureResponse.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', api_key)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
    )
    return response.data.secure_url
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Image upload failed.')
  }
}
