"use client"

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, DollarSign, Calendar, User } from 'lucide-react'

interface Deal {
  id: string
  title: string
  amount?: number
  stage: string
  probability: number
  expectedCloseDate?: string
  company?: {
    name: string
    logo?: string
  }
  contact?: {
    firstName: string
    lastName: string
  }
}

interface KanbanBoardProps {
  deals: Deal[]
  onDealMove: (dealId: string, newStage: string) => Promise<void>
}

const STAGES = [
  { id: 'LEAD', label: 'Lead', color: 'bg-gray-100 border-gray-300' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-blue-50 border-blue-300' },
  { id: 'MEETING', label: 'Meeting', color: 'bg-purple-50 border-purple-300' },
  { id: 'PROPOSAL', label: 'Proposal', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-50 border-orange-300' },
  { id: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-50 border-green-300' },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-50 border-red-300' },
]

export function KanbanBoard({ deals, onDealMove }: KanbanBoardProps) {
  const [localDeals, setLocalDeals] = useState(deals)
  const [isDragging, setIsDragging] = useState(false)

  // Group deals by stage
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = localDeals.filter(deal => deal.stage === stage.id)
    return acc
  }, {} as Record<string, Deal[]>)

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    
    const { source, destination, draggableId } = result

    // Dropped outside any droppable
    if (!destination) return

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const newStage = destination.droppableId
    const dealId = draggableId

    // Optimistically update UI
    setLocalDeals(prev => 
      prev.map(deal => 
        deal.id === dealId ? { ...deal, stage: newStage } : deal
      )
    )

    // Call API to update deal
    try {
      await onDealMove(dealId, newStage)
    } catch (error) {
      // Revert on error
      setLocalDeals(deals)
      console.error('Error updating deal stage:', error)
    }
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)]">
        {STAGES.map(stage => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${stage.color} p-3 mb-3`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {dealsByStage[stage.id]?.length || 0}
                </Badge>
              </div>
              {dealsByStage[stage.id]?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  ${dealsByStage[stage.id]
                    .reduce((sum, deal) => sum + (deal.amount || 0), 0)
                    .toLocaleString()}
                </div>
              )}
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'
                  }`}
                >
                  {dealsByStage[stage.id]?.map((deal, index) => (
                    <Draggable key={deal.id} draggableId={deal.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 cursor-move transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Title */}
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {deal.title}
                            </h4>

                            {/* Company */}
                            {deal.company && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{deal.company.name}</span>
                              </div>
                            )}

                            {/* Amount */}
                            {deal.amount && (
                              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                <DollarSign className="w-4 h-4" />
                                <span>${deal.amount.toLocaleString()}</span>
                              </div>
                            )}

                            {/* Contact */}
                            {deal.contact && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span className="truncate">
                                  {deal.contact.firstName} {deal.contact.lastName}
                                </span>
                              </div>
                            )}

                            {/* Expected Close Date */}
                            {deal.expectedCloseDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {/* Probability */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Probability</span>
                              <Badge variant="outline" className="text-xs">
                                {deal.probability}%
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

