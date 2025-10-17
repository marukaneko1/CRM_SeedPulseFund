"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Pin, 
  PinOff, 
  Archive, 
  ArchiveRestore,
  Filter,
  Search,
  Grid3X3,
  List,
  Lightbulb,
  Users,
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react'

interface Idea {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  tags?: string
  color: string
  positionX?: number
  positionY?: number
  isPinned: boolean
  isArchived: boolean
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  comments: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      email: string
      avatar?: string
    }
    createdAt: string
  }>
  votes: Array<{
    id: string
    type: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    comments: number
    votes: number
  }
  createdAt: string
  updatedAt: string
}

const STATUS_COLORS = {
  NEW: 'bg-blue-100 border-blue-300',
  IN_PROGRESS: 'bg-yellow-100 border-yellow-300',
  REVIEW: 'bg-purple-100 border-purple-300',
  IMPLEMENTED: 'bg-green-100 border-green-300',
  REJECTED: 'bg-red-100 border-red-300',
  NEW_COMPANY: 'bg-pink-100 border-pink-300'
}

const STATUS_ICONS = {
  NEW: <Lightbulb className="w-4 h-4" />,
  IN_PROGRESS: <Clock className="w-4 h-4" />,
  REVIEW: <AlertCircle className="w-4 h-4" />,
  IMPLEMENTED: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  NEW_COMPANY: <Star className="w-4 h-4" />
}

const POST_IT_COLORS = {
  YELLOW: 'bg-yellow-200 border-yellow-400',
  BLUE: 'bg-blue-200 border-blue-400',
  GREEN: 'bg-green-200 border-green-400',
  PINK: 'bg-pink-200 border-pink-400',
  ORANGE: 'bg-orange-200 border-orange-400',
  PURPLE: 'bg-purple-200 border-purple-400'
}

export default function IdeasPage() {
  const { data: session } = useSession()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [newComment, setNewComment] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // New idea form state
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    tags: '',
    color: 'YELLOW'
  })

  useEffect(() => {
    fetchIdeas()
  }, [filterStatus, filterCategory, showArchived])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (showArchived) params.append('isArchived', 'true')

      const response = await fetch(`/api/ideas?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setIdeas(data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const createIdea = async () => {
    if (!newIdea.title || !newIdea.description) {
      alert('Please fill in both title and description')
      return
    }

    try {
      setCreating(true)
      console.log('Creating idea with data:', newIdea)
      
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const idea = await response.json()
        console.log('Idea created successfully:', idea)
        setIdeas([idea, ...ideas])
        setNewIdea({
          title: '',
          description: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
          tags: '',
          color: 'YELLOW'
        })
        setShowCreateDialog(false)
        alert('Idea created successfully!')
      } else {
        const error = await response.json()
        console.error('Error response:', error)
        alert(`Failed to create idea: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating idea:', error)
      alert('Failed to create idea. Please check the console for details.')
    } finally {
      setCreating(false)
    }
  }

  const updateIdeaStatus = async (ideaId: string, status: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        const updatedIdea = await response.json()
        setIdeas(ideas.map(idea => idea.id === ideaId ? updatedIdea : idea))
        if (selectedIdea?.id === ideaId) {
          setSelectedIdea(updatedIdea)
        }
      }
    } catch (error) {
      console.error('Error updating idea:', error)
    }
  }

  const togglePin = async (ideaId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned })
      })

      if (response.ok) {
        const updatedIdea = await response.json()
        setIdeas(ideas.map(idea => idea.id === ideaId ? updatedIdea : idea))
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const addComment = async (ideaId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const comment = await response.json()
        setIdeas(ideas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, comments: [...idea.comments, comment] }
            : idea
        ))
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const voteOnIdea = async (ideaId: string, type: 'UP' | 'DOWN') => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        fetchIdeas() // Refresh to get updated vote counts
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const filteredIdeas = ideas.filter(idea => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return idea.title.toLowerCase().includes(query) || 
             idea.description.toLowerCase().includes(query) ||
             idea.tags?.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 border-gray-300'
  }

  const getStatusIcon = (status: string) => {
    return STATUS_ICONS[status as keyof typeof STATUS_ICONS] || <Lightbulb className="w-4 h-4" />
  }

  const getPostItColor = (color: string) => {
    return POST_IT_COLORS[color as keyof typeof POST_IT_COLORS] || POST_IT_COLORS.YELLOW
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ideas Board</h1>
          <p className="text-gray-600">Share, collaborate, and track innovative ideas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Idea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                    placeholder="What's your idea?"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                    placeholder="Describe your idea in detail..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newIdea.category} onValueChange={(value) => setNewIdea({...newIdea, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="PROCESS">Process</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="TECH">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newIdea.priority} onValueChange={(value) => setNewIdea({...newIdea, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newIdea.tags}
                      onChange={(e) => setNewIdea({...newIdea, tags: e.target.value})}
                      placeholder="innovation, efficiency, growth"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select value={newIdea.color} onValueChange={(value) => setNewIdea({...newIdea, color: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YELLOW">Yellow</SelectItem>
                        <SelectItem value="BLUE">Blue</SelectItem>
                        <SelectItem value="GREEN">Green</SelectItem>
                        <SelectItem value="PINK">Pink</SelectItem>
                        <SelectItem value="ORANGE">Orange</SelectItem>
                        <SelectItem value="PURPLE">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
                    Cancel
                  </Button>
                  <Button onClick={createIdea} disabled={creating || !newIdea.title || !newIdea.description}>
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {creating ? 'Creating...' : 'Create Idea'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="NEW_COMPANY">New Company</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="PRODUCT">Product</SelectItem>
            <SelectItem value="PROCESS">Process</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
            <SelectItem value="TECH">Technology</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={viewMode === 'board' ? 'default' : 'outline'}
          onClick={() => setViewMode('board')}
          size="sm"
        >
          <Grid3X3 className="w-4 h-4 mr-2" />
          Board
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
          size="sm"
        >
          <List className="w-4 h-4 mr-2" />
          List
        </Button>
      </div>

      {/* Ideas Display */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIdeas.map((idea) => (
            <Card 
              key={idea.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${getPostItColor(idea.color)} ${
                idea.isPinned ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedIdea(idea)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {idea.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                    <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin(idea.id, idea.isPinned)
                      }}
                    >
                      {idea.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">{idea.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${getStatusColor(idea.status)} text-xs`}>
                    {getStatusIcon(idea.status)}
                    <span className="ml-1">{idea.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {idea.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{idea._count.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{idea.votes.filter(v => v.type === 'UP').length}</span>
                    </div>
                  </div>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedIdea(idea)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {idea.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                      <h3 className="font-semibold text-lg">{idea.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{idea.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(idea.status)} text-xs`}>
                        {getStatusIcon(idea.status)}
                        <span className="ml-1">{idea.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">{idea.category}</Badge>
                      <Badge variant="outline" className="text-xs">{idea.priority}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{idea._count.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{idea.votes.filter(v => v.type === 'UP').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedIdea.isPinned && <Pin className="w-5 h-5 text-blue-600" />}
                {selectedIdea.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Idea Details */}
              <div>
                <p className="text-gray-700 mb-4">{selectedIdea.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${getStatusColor(selectedIdea.status)}`}>
                    {getStatusIcon(selectedIdea.status)}
                    <span className="ml-1">{selectedIdea.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge variant="outline">{selectedIdea.category}</Badge>
                  <Badge variant="outline">{selectedIdea.priority}</Badge>
                  {selectedIdea.tags && (
                    <Badge variant="secondary">{selectedIdea.tags}</Badge>
                  )}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label>Update Status</Label>
                <Select 
                  value={selectedIdea.status} 
                  onValueChange={(status) => updateIdeaStatus(selectedIdea.id, status)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="NEW_COMPANY">New Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voting */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => voteOnIdea(selectedIdea.id, 'UP')}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {selectedIdea.votes.filter(v => v.type === 'UP').length}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => voteOnIdea(selectedIdea.id, 'DOWN')}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {selectedIdea.votes.filter(v => v.type === 'DOWN').length}
                </Button>
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-semibold mb-3">Comments ({selectedIdea.comments.length})</h4>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {selectedIdea.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(selectedIdea.id)}
                  />
                  <Button onClick={() => addComment(selectedIdea.id)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No ideas found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Be the first to share an idea!'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Idea
          </Button>
        </div>
      )}
    </div>
  )
}
