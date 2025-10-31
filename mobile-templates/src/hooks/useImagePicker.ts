/**
 * useImagePicker Hook
 * Custom hook để pick images từ device
 */

import { useState } from 'react'
import { Platform, Alert } from 'react-native'
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker'

export interface PickedImage {
  uri: string
  type: string
  name: string
  fileSize?: number
  width?: number
  height?: number
}

export function useImagePicker() {
  const [loading, setLoading] = useState(false)

  /**
   * Pick image từ thư viện
   */
  const pickFromLibrary = async (): Promise<PickedImage[]> => {
    setLoading(true)
    
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10, // Cho phép chọn nhiều ảnh
      })

      if (result.didCancel) {
        return []
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Failed to pick image')
      }

      return processImagePickerResponse(result)
    } catch (error) {
      console.error('Error picking image from library:', error)
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện')
      return []
    } finally {
      setLoading(false)
    }
  }

  /**
   * Chụp ảnh từ camera
   */
  const pickFromCamera = async (): Promise<PickedImage | null> => {
    setLoading(true)
    
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      })

      if (result.didCancel) {
        return null
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Failed to take photo')
      }

      const images = processImagePickerResponse(result)
      return images[0] || null
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Lỗi', 'Không thể chụp ảnh')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Show action sheet để chọn nguồn ảnh
   */
  const pickImage = async (): Promise<PickedImage[]> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Chọn ảnh',
        'Bạn muốn chọn ảnh từ đâu?',
        [
          {
            text: 'Thư viện',
            onPress: async () => {
              const images = await pickFromLibrary()
              resolve(images)
            },
          },
          {
            text: 'Chụp ảnh',
            onPress: async () => {
              const image = await pickFromCamera()
              resolve(image ? [image] : [])
            },
          },
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => resolve([]),
          },
        ],
        { cancelable: true }
      )
    })
  }

  return {
    pickImage,
    pickFromLibrary,
    pickFromCamera,
    loading,
  }
}

/**
 * Process ImagePickerResponse thành PickedImage[]
 */
function processImagePickerResponse(response: ImagePickerResponse): PickedImage[] {
  if (!response.assets || response.assets.length === 0) {
    return []
  }

  return response.assets.map((asset) => ({
    uri: asset.uri || '',
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `image_${Date.now()}.jpg`,
    fileSize: asset.fileSize,
    width: asset.width,
    height: asset.height,
  }))
}

/**
 * Convert PickedImage to FormData
 */
export function imagesToFormData(images: PickedImage[], fieldName: string = 'images'): FormData {
  const formData = new FormData()

  images.forEach((image, index) => {
    formData.append(fieldName, {
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      type: image.type,
      name: image.name,
    } as any)
  })

  return formData
}

