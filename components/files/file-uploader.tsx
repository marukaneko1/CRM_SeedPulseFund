"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  folder?: string
  dealId?: string
  contactId?: string
  companyId?: string
  onUploadComplete?: (fileId: string) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function FileUploader({
  folder = 'general',
  dealId,
  contactId,
  companyId,
  onUploadComplete,
  maxSize = 50,
  acceptedTypes,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrors([])
    setProgress(0)

    for (const file of acceptedFiles) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setErrors(prev => [...prev, `${file.name} is too large (max ${maxSize}MB)`])
        continue
      }

      // Upload file
      try {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        if (folder) formData.append('folder', folder)
        if (dealId) formData.append('dealId', dealId)
        if (contactId) formData.append('contactId', contactId)
        if (companyId) formData.append('companyId', companyId)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        setUploadedFiles(prev => [...prev, { name: file.name, id: result.file.id, success: true }])
        
        if (onUploadComplete) {
          onUploadComplete(result.file.id)
        }
        
        setProgress(100)
      } catch (error) {
        console.error('Upload error:', error)
        setErrors(prev => [...prev, `Failed to upload ${file.name}`])
        setUploadedFiles(prev => [...prev, { name: file.name, success: false }])
      } finally {
        setUploading(false)
      }
    }
  }, [folder, dealId, contactId, companyId, maxSize, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes ? acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : undefined,
    maxSize: maxSize * 1024 * 1024,
  })

  const clearUploadedFiles = () => {
    setUploadedFiles([])
    setErrors([])
    setProgress(0)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Max file size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Uploaded Files</h4>
            <Button variant="ghost" size="sm" onClick={clearUploadedFiles}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {file.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <File className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                {file.success && (
                  <span className="text-xs text-green-600 font-medium">Uploaded</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

