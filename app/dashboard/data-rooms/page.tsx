"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FolderOpen, 
  Plus, 
  Upload, 
  Users, 
  Share2, 
  Eye, 
  Download,
  Search,
  Filter,
  MoreVertical,
  Lock,
  Globe
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataRoom {
  id: string
  name: string
  description?: string
  dealId?: string
  companyId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  permissions: {
    userId: string
    role: 'ADMIN' | 'CONTRIBUTOR' | 'VIEWER'
    canView: boolean
    canUpload: boolean
    canDownload: boolean
    canManage: boolean
  }[]
  shareLinks: {
    id: string
    url: string
    expiresAt?: string
    password?: string
    permissions: string[]
    createdAt: string
  }[]
}

interface DataRoomFormData {
  name: string
  description: string
  dealId: string
  companyId: string
}

export default function DataRoomsPage() {
  const { data: session } = useSession()
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<DataRoomFormData>({
    name: '',
    description: '',
    dealId: '',
    companyId: ''
  })

  useEffect(() => {
    fetchDataRooms()
  }, [session])

  const fetchDataRooms = async () => {
    try {
      const response = await fetch('/api/data-rooms')
      if (response.ok) {
        const data = await response.json()
        setDataRooms(data)
      }
    } catch (error) {
      console.error('Error fetching data rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDataRoom = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a data room name')
      return
    }

    try {
      const response = await fetch('/api/data-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newDataRoom = await response.json()
        setDataRooms(prev => [newDataRoom, ...prev])
        setFormData({ name: '', description: '', dealId: '', companyId: '' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating data room:', error)
    }
  }

  const filteredDataRooms = dataRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800'
      case 'VIEWER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading data rooms...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-blue-600" />
              Data Rooms
            </h1>
            <p className="text-gray-600 mt-1">
              Secure document sharing and collaboration
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Data Room
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search data rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Rooms Grid */}
        {filteredDataRooms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDataRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      {room.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {room.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Permissions */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {room.permissions.length} member(s)
                      </span>
                    </div>

                    {/* Share Links */}
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {room.shareLinks.length} share link(s)
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Created {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No data rooms found</p>
            <p className="text-sm">Create your first data room to get started</p>
          </div>
        )}

        {/* Create Data Room Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Data Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <Input
                  placeholder="Data room name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  placeholder="Optional description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deal ID</label>
                <Input
                  placeholder="Optional deal ID"
                  value={formData.dealId}
                  onChange={(e) => setFormData(prev => ({ ...prev, dealId: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Company ID</label>
                <Input
                  placeholder="Optional company ID"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateDataRoom} className="flex-1">
                  Create Data Room
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
