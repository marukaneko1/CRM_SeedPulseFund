"use client"

import { useState } from "react"
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

export default function FilesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  const files = isAdmin ? demoFiles : []
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = !selectedFolder || file.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="p-8">
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
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
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
              
              {isAdmin && folders.map((folder) => (
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
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                        <file.icon className="w-5 h-5 text-blue-600" />
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
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No files yet</h3>
                <p className="text-gray-600 mb-4">
                  Upload your first file to get started
                </p>
                <Button>
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

