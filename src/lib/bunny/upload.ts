/**
 * Bunny.net Upload Utility
 *
 * This module handles video uploads to Bunny.net Storage
 * and returns the CDN URL for streaming.
 */

const BUNNY_STORAGE_URL = `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}`
const BUNNY_API_KEY = process.env.BUNNY_STORAGE_PASSWORD || ''
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || ''

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload a file to Bunny.net Storage
 *
 * @param file - The file to upload
 * @param path - The path/filename in storage (e.g., "videos/my-video.mp4")
 * @returns The CDN URL of the uploaded file
 */
export async function uploadToBunny(
  fileBuffer: Buffer,
  path: string
): Promise<UploadResult> {
  try {
    const response = await fetch(`${BUNNY_STORAGE_URL}/${path}`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    // Return the CDN URL
    return {
      success: true,
      url: `${BUNNY_CDN_URL}/${path}`,
    }
  } catch (error) {
    console.error('Upload to Bunny failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete a file from Bunny.net Storage
 *
 * @param path - The path/filename in storage
 */
export async function deleteFromBunny(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${BUNNY_STORAGE_URL}/${path}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_API_KEY,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Delete from Bunny failed:', error)
    return false
  }
}

/**
 * List files in a Bunny.net Storage directory
 *
 * @param directory - The directory path to list
 */
export async function listBunnyFiles(directory: string = ''): Promise<string[]> {
  try {
    const response = await fetch(`${BUNNY_STORAGE_URL}/${directory}/`, {
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`List failed: ${response.statusText}`)
    }

    const files = await response.json()
    return files.map((f: { ObjectName: string }) => f.ObjectName)
  } catch (error) {
    console.error('List Bunny files failed:', error)
    return []
  }
}

/**
 * Generate a unique filename for uploads
 *
 * @param originalName - The original filename
 * @returns A unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
  return `${baseName}-${timestamp}-${randomString}.${extension}`
}

/**
 * Get the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Validate if a file is a supported video format
 */
export function isValidVideoFile(filename: string): boolean {
  const supportedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v']
  const extension = getFileExtension(filename)
  return supportedFormats.includes(extension)
}

/**
 * Validate if a file is a supported image format (for thumbnails)
 */
export function isValidImageFile(filename: string): boolean {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const extension = getFileExtension(filename)
  return supportedFormats.includes(extension)
}
