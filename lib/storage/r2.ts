import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://9c0a6d20b808ab67b3f3e0ca959d9398.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'crm-seedpulse-files'

/**
 * Upload a file to R2
 */
export async function uploadFileToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; key: string; url: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })

    await r2Client.send(command)

    // Generate public URL (if you have public access enabled)
    // Or use signed URL for private access
    const url = await getSignedUrl(r2Client, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }), { expiresIn: 3600 * 24 * 7 }) // 7 days

    return {
      success: true,
      key,
      url,
    }
  } catch (error) {
    console.error('Error uploading to R2:', error)
    throw error
  }
}

/**
 * Get a signed URL for a file (for downloading)
 */
export async function getSignedUrlForFile(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(r2Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('Error getting signed URL:', error)
    throw error
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFileFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch (error) {
    console.error('Error deleting from R2:', error)
    return false
  }
}

/**
 * Check if a file exists in R2
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Generate a unique file key (path in bucket)
 */
export function generateFileKey(userId: string, originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalFilename.split('.').pop()
  const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `uploads/${userId}/${timestamp}-${randomString}-${sanitizedName}`
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const response = await r2Client.send(command)
    
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    }
  } catch (error) {
    console.error('Error getting file metadata:', error)
    return null
  }
}

