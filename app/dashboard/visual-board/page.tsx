"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VisualBoard } from "@/components/visual-board/visual-board"
import { Plus, Grid, List, Building2, GitBranch, Network, Users } from "lucide-react"

interface Board {
  id: string
  name: string
  description: string
  type: 'company-tree' | 'org-chart' | 'network' | 'custom'
  thumbnail?: string
  lastEdited: string
}

export default function VisualBoardPage() {
  const { data: session } = useSession()
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardType, setNewBoardType] = useState<Board['type']>('custom')

  useEffect(() => {
    fetchBoards()
  }, [session])

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/visual-boards')
      if (response.ok) {
        const data = await response.json()
        setBoards(data)
      }
    } catch (error) {
      console.error('Error fetching boards:', error)
    }
  }

  const createNewBoard = async () => {
    if (!newBoardName.trim()) {
      alert('Please enter a board name')
      return
    }

    try {
      const response = await fetch('/api/visual-boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBoardName,
          type: newBoardType,
          description: `${newBoardType === 'company-tree' ? 'Company structure' : newBoardType === 'org-chart' ? 'Organization chart' : 'Custom'} board`
        })
      })

      if (response.ok) {
        const newBoard = await response.json()
        setBoards([...boards, newBoard])
        setSelectedBoard(newBoard)
        setShowNewBoardDialog(false)
        setNewBoardName('')
      }
    } catch (error) {
      console.error('Error creating board:', error)
      alert('Failed to create board')
    }
  }

  const handleSaveBoard = async (nodes: any[], edges: any[]) => {
    if (!selectedBoard) return

    try {
      const response = await fetch(`/api/visual-boards/${selectedBoard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      })

      if (response.ok) {
        alert('Board saved successfully!')
        fetchBoards()
      }
    } catch (error) {
      console.error('Error saving board:', error)
      alert('Failed to save board')
    }
  }

  if (selectedBoard) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-blue-600" />
              {selectedBoard.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{selectedBoard.description}</p>
          </div>
          <Button
            onClick={() => setSelectedBoard(null)}
            variant="outline"
          >
            Back to Boards
          </Button>
        </div>

        <div className="flex-1 p-4">
          <VisualBoard
            boardId={selectedBoard.id}
            onSave={handleSaveBoard}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Visual Boards
            </h1>
            <p className="text-gray-600 mt-2">
              Create company trees, org charts, and visual diagrams
            </p>
          </div>
          <Button
            onClick={() => setShowNewBoardDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Board
          </Button>
        </div>

        {/* New Board Dialog */}
        {showNewBoardDialog && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Board Name</label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Acme Corp Organization"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Board Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewBoardType('company-tree')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        newBoardType === 'company-tree'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <GitBranch className="w-6 h-6 mb-2 text-blue-600" />
                      <div className="font-semibold">Company Tree</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Parent-subsidiary relationships
                      </div>
                    </button>

                    <button
                      onClick={() => setNewBoardType('org-chart')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        newBoardType === 'org-chart'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Network className="w-6 h-6 mb-2 text-purple-600" />
                      <div className="font-semibold">Org Chart</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Employee hierarchy
                      </div>
                    </button>

                    <button
                      onClick={() => setNewBoardType('network')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        newBoardType === 'network'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Users className="w-6 h-6 mb-2 text-green-600" />
                      <div className="font-semibold">Network Diagram</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Relationships and connections
                      </div>
                    </button>

                    <button
                      onClick={() => setNewBoardType('custom')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        newBoardType === 'custom'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Grid className="w-6 h-6 mb-2 text-orange-600" />
                      <div className="font-semibold">Custom</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Start from scratch
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={createNewBoard}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Board
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewBoardDialog(false)
                      setNewBoardName('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBoard(board)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {board.type === 'company-tree' && <GitBranch className="w-5 h-5 text-blue-600" />}
                  {board.type === 'org-chart' && <Network className="w-5 h-5 text-purple-600" />}
                  {board.type === 'network' && <Users className="w-5 h-5 text-green-600" />}
                  {board.type === 'custom' && <Grid className="w-5 h-5 text-orange-600" />}
                  {board.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{board.description}</p>
                <div className="text-xs text-gray-500">
                  Last edited: {new Date(board.lastEdited).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {boards.length === 0 && !showNewBoardDialog && (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No boards yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first visual board to organize company structures and relationships
              </p>
              <Button
                onClick={() => setShowNewBoardDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Board
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
