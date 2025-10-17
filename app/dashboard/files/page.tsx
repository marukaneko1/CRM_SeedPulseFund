"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Folder, 
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Eye,
  Trash2,
  Share2,
  Plus
} from "lucide-react"

// Demo files only for admin
const demoFiles = [
  {
    id: "1",
    name: "Investment Memo - Startup X.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "John Doe",
    uploadedAt: "2024-01-10",
    folder: "Due Diligence",
    icon: FileText
  },
  {
    id: "2",
    name: "Q4 Portfolio Metrics.xlsx",
    type: "spreadsheet",
    size: "1.8 MB",
    uploadedBy: "Sarah Smith",
    uploadedAt: "2024-01-09",
    folder: "Portfolio",
    icon: FileSpreadsheet
  },
  {
    id: "3",
    name: "Pitch Deck - TechVenture.pdf",
    type: "pdf",
    size: "5.2 MB",
    uploadedBy: "Mike Johnson",
    uploadedAt: "2024-01-08",
    folder: "Pitch Decks",
    icon: FileText
  },
  {
    id: "4",
    name: "Term Sheet - InnovateLab.pdf",
    type: "pdf",
    size: "856 KB",
    uploadedBy: "Emily Chen",
    uploadedAt: "2024-01-07",
    folder: "Legal",
    icon: FileText
  },
]

const folders = [
  { name: "Due Diligence", count: 15, icon: Folder },
  { name: "Pitch Decks", count: 23, icon: Folder },
  { name: "Portfolio", count: 8, icon: Folder },
  { name: "Legal", count: 12, icon: Folder },
  { name: "Financial Models", count: 6, icon: Folder },
]

// Helper function to get icon based on file type
const getFileIcon = (file: any) => {
  if (file.icon) return file.icon // Use existing icon if available
  
  const fileName = (file.name || '').toLowerCase()
  const fileType = (file.fileType || file.type || '').toLowerCase()
  
  if (fileName.includes('.xlsx') || fileName.includes('.xls') || fileType.includes('spreadsheet')) {
    return FileSpreadsheet
  }
  if (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.gif') || fileType.includes('image')) {
    return ImageIcon
  }
  // Default to FileText for PDFs and other documents
  return FileText
}

export default function FilesPage() {
  const { data: session } = useSession()
  const [files, setFiles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    try {
      const url = selectedFolder 
        ? `/api/files?folder=${encodeURIComponent(selectedFolder)}`
        : '/api/files'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedFolder])

  useEffect(() => {
    fetchFiles()
  }, [session, selectedFolder, fetchFiles])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(selectedFiles)) {
        // First upload the file
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()

          // Then save file metadata to database
          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              originalName: file.name,
              fileType: uploadData.fileType,
              fileSize: file.size,
              fileUrl: uploadData.fileUrl,
              folder: selectedFolder || 'General'
            })
          })
        }
      }

      fetchFiles()
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchFiles()
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !selectedFolder || file.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Files</h1>
          <p className="text-gray-600">Manage and organize your documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                  !selectedFolder ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span className="text-sm font-medium">All Files</span>
                </div>
                <span className="text-xs text-gray-500">{files.length}</span>
              </button>
              
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                    selectedFolder === folder.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <folder.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{folder.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Files Grid */}
          {filteredFiles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file)
                return (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">{file.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{file.size} • {file.folder}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{file.uploadedBy}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" variant="ghost" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No files yet</h3>
                <p className="text-gray-600 mb-4">
                  Upload your first file to get started
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

