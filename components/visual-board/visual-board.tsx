"use client"

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Maximize2, 
  Minimize2, 
  Save, 
  Download, 
  Trash2,
  Users,
  Building2,
  GitBranch,
  Network,
  Zap,
  Type,
  Square,
  Circle,
  Triangle,
  StickyNote,
  ArrowRight,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface VisualBoardProps {
  boardId?: string
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
}

export function VisualBoard({ 
  boardId, 
  initialNodes = [], 
  initialEdges = [], 
  onSave 
}: VisualBoardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [boardName, setBoardName] = useState('')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  
  // Draggable states
  const [toolbarPos, setToolbarPos] = useState({ x: 16, y: 16, dragging: false })
  const [templatesPos, setTemplatesPos] = useState({ x: 800, y: 16, dragging: false })
  const [helpPos, setHelpPos] = useState({ x: 600, y: 600, dragging: false })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [activePanel, setActivePanel] = useState<string | null>(null)
  
  // Minimize states
  const [templatesMin, setTemplatesMin] = useState(false)
  const [helpMin, setHelpMin] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Dragging
  const startDrag = (e: React.MouseEvent, panel: string, pos: { x: number; y: number }) => {
    e.preventDefault()
    setActivePanel(panel)
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y })
    if (panel === 'toolbar') setToolbarPos(p => ({ ...p, dragging: true }))
    if (panel === 'templates') setTemplatesPos(p => ({ ...p, dragging: true }))
    if (panel === 'help') setHelpPos(p => ({ ...p, dragging: true }))
  }

  const onDrag = (e: React.MouseEvent) => {
    if (activePanel === 'toolbar' && toolbarPos.dragging) {
      setToolbarPos(p => ({ ...p, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }))
    }
    if (activePanel === 'templates' && templatesPos.dragging) {
      setTemplatesPos(p => ({ ...p, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }))
    }
    if (activePanel === 'help' && helpPos.dragging) {
      setHelpPos(p => ({ ...p, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }))
    }
  }

  const stopDrag = () => {
    setToolbarPos(p => ({ ...p, dragging: false }))
    setTemplatesPos(p => ({ ...p, dragging: false }))
    setHelpPos(p => ({ ...p, dragging: false }))
    setActivePanel(null)
  }

  // Node creation
  const addCompanyNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `company-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg"><Building2 className="w-4 h-4 inline mr-2" />New Company</div>) }
    }])
  }, [setNodes])

  const addPersonNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `person-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg"><Users className="w-4 h-4 inline mr-2" />New Person</div>) }
    }])
  }, [setNodes])

  const addDepartmentNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `dept-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-lg"><Network className="w-4 h-4 inline mr-2" />New Department</div>) }
    }])
  }, [setNodes])

  const addConnectionNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `connection-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg"><Zap className="w-4 h-4 inline mr-2" />New Connection</div>) }
    }])
  }, [setNodes])

  const addTextBox = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `text-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-6 py-3 bg-white border-2 border-gray-300 rounded shadow-sm"><Type className="w-4 h-4 inline mr-2 text-gray-600" /><input type="text" defaultValue="Click to edit text" className="border-none outline-none bg-transparent text-gray-800 w-full" onFocus={(e) => { if (e.target.value === 'Click to edit text') e.target.value = '' }} onClick={(e) => e.stopPropagation()} /></div>) }
    }])
  }, [setNodes])

  const addStickyNote = useCallback(() => {
    const colors = ['#fef3c7', '#fecaca', '#ddd6fe', '#bfdbfe', '#d1fae5']
    const color = colors[Math.floor(Math.random() * colors.length)]
    setNodes((nds) => [...nds, {
      id: `sticky-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-3 rounded shadow-lg min-w-[150px] min-h-[120px]" style={{ backgroundColor: color }}><StickyNote className="w-4 h-4 mb-2 text-gray-700" /><textarea defaultValue="Click to edit sticky note" className="text-sm text-gray-800 whitespace-pre-wrap w-full border-none outline-none bg-transparent resize-none" rows={3} onFocus={(e) => { if (e.target.value === 'Click to edit sticky note') e.target.value = '' }} onClick={(e) => e.stopPropagation()} /></div>) }
    }])
  }, [setNodes])

  const addSquare = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `square-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="w-32 h-32 border-4 border-blue-500 bg-blue-100 rounded-lg shadow-lg flex items-center justify-center"><Square className="w-8 h-8 text-blue-600" /></div>) }
    }])
  }, [setNodes])

  const addCircleNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `circle-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="w-32 h-32 border-4 border-green-500 bg-green-100 rounded-full shadow-lg flex items-center justify-center"><Circle className="w-8 h-8 text-green-600" /></div>) }
    }])
  }, [setNodes])

  const addTriangleNode = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `triangle-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="relative w-32 h-32 flex items-center justify-center"><div className="w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[110px] border-b-purple-500"></div><Triangle className="w-8 h-8 text-purple-600 absolute" /></div>) }
    }])
  }, [setNodes])

  const addArrow = useCallback(() => {
    setNodes((nds) => [...nds, {
      id: `arrow-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: (<div className="px-4 py-2 bg-gray-200 rounded shadow"><ArrowRight className="w-8 h-8 text-gray-700" /></div>) }
    }])
  }, [setNodes])

  const loadCompanyOrgTemplate = useCallback(() => {
    const ceoNode: Node = {
      id: 'ceo',
      type: 'default',
      position: { x: 400, y: 50 },
      data: { label: (<div className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-xl font-semibold text-center min-w-[150px]"><Building2 className="w-5 h-5 inline mr-2" />CEO</div>) }
    }
    const departments = [
      { id: 'engineering', label: 'Engineering', x: 150, color: 'bg-green-500' },
      { id: 'sales', label: 'Sales', x: 400, color: 'bg-purple-500' },
      { id: 'operations', label: 'Operations', x: 650, color: 'bg-orange-500' }
    ]
    const deptNodes: Node[] = departments.map(dept => ({
      id: dept.id,
      type: 'default',
      position: { x: dept.x, y: 200 },
      data: { label: (<div className={`px-6 py-3 ${dept.color} text-white rounded-lg shadow-xl font-semibold text-center min-w-[150px]`}><Network className="w-5 h-5 inline mr-2" />{dept.label}</div>) }
    }))
    const deptEdges: Edge[] = departments.map(dept => ({
      id: `e-ceo-${dept.id}`,
      source: 'ceo',
      target: dept.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    }))
    setNodes([ceoNode, ...deptNodes])
    setEdges(deptEdges)
    setSelectedTemplate('company-org')
  }, [setNodes, setEdges])

  const loadCompanyTreeTemplate = useCallback(() => {
    const parentNode: Node = {
      id: 'parent-company',
      type: 'default',
      position: { x: 400, y: 50 },
      data: { label: (<div className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-xl font-semibold text-center min-w-[180px]"><Building2 className="w-5 h-5 inline mr-2" />Parent Company</div>) }
    }
    const subsidiaries = [
      { id: 'sub1', label: 'Subsidiary A', x: 200 },
      { id: 'sub2', label: 'Subsidiary B', x: 400 },
      { id: 'sub3', label: 'Subsidiary C', x: 600 }
    ]
    const subNodes: Node[] = subsidiaries.map(sub => ({
      id: sub.id,
      type: 'default',
      position: { x: sub.x, y: 200 },
      data: { label: (<div className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-xl font-semibold text-center min-w-[150px]"><GitBranch className="w-5 h-5 inline mr-2" />{sub.label}</div>) }
    }))
    const subEdges: Edge[] = subsidiaries.map(sub => ({
      id: `e-parent-${sub.id}`,
      source: 'parent-company',
      target: sub.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 2 }
    }))
    setNodes([parentNode, ...subNodes])
    setEdges(subEdges)
    setSelectedTemplate('company-tree')
  }, [setNodes, setEdges])

  const handleSave = useCallback(() => {
    if (onSave) onSave(nodes, edges)
    const boardData = { name: boardName || 'Untitled Board', nodes, edges, timestamp: new Date().toISOString() }
    localStorage.setItem(`visual-board-${boardId || 'default'}`, JSON.stringify(boardData))
    alert('Board saved successfully!')
  }, [nodes, edges, boardName, boardId, onSave])

  const handleExport = useCallback(() => {
    const boardData = { name: boardName || 'Untitled Board', nodes, edges, timestamp: new Date().toISOString() }
    const dataStr = JSON.stringify(boardData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `${boardName || 'board'}-${Date.now()}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [nodes, edges, boardName])

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the board?')) {
      setNodes([])
      setEdges([])
    }
  }, [setNodes, setEdges])

  return (
    <div 
      ref={reactFlowWrapper}
      className={isFullScreen ? 'fixed inset-0 z-50 bg-gray-50' : 'relative h-[800px] w-full bg-gray-50 rounded-lg border border-gray-200'}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Toolbar */}
      <div 
        className="absolute z-10 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 flex-wrap max-w-4xl"
        style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px`, userSelect: 'none' }}
      >
        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded" onMouseDown={(e) => startDrag(e, 'toolbar', toolbarPos)}>
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <Input placeholder="Board name..." value={boardName} onChange={(e) => setBoardName(e.target.value)} className="w-48" />
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Nodes:</span>
          <Button onClick={addCompanyNode} size="sm" variant="outline" title="Add Company"><Building2 className="w-4 h-4" /></Button>
          <Button onClick={addPersonNode} size="sm" variant="outline" title="Add Person"><Users className="w-4 h-4" /></Button>
          <Button onClick={addDepartmentNode} size="sm" variant="outline" title="Add Department"><Network className="w-4 h-4" /></Button>
          <Button onClick={addConnectionNode} size="sm" variant="outline" title="Add Connection"><Zap className="w-4 h-4" /></Button>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Text:</span>
          <Button onClick={addTextBox} size="sm" variant="outline" title="Add Text Box"><Type className="w-4 h-4" /></Button>
          <Button onClick={addStickyNote} size="sm" variant="outline" title="Add Sticky Note" className="bg-yellow-50 hover:bg-yellow-100"><StickyNote className="w-4 h-4 text-yellow-600" /></Button>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Shapes:</span>
          <Button onClick={addSquare} size="sm" variant="outline" title="Add Square"><Square className="w-4 h-4" /></Button>
          <Button onClick={addCircleNode} size="sm" variant="outline" title="Add Circle"><Circle className="w-4 h-4" /></Button>
          <Button onClick={addTriangleNode} size="sm" variant="outline" title="Add Triangle"><Triangle className="w-4 h-4" /></Button>
          <Button onClick={addArrow} size="sm" variant="outline" title="Add Arrow"><ArrowRight className="w-4 h-4" /></Button>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-center gap-1">
          <Button onClick={handleSave} size="sm" variant="outline" title="Save Board"><Save className="w-4 h-4" /></Button>
          <Button onClick={handleExport} size="sm" variant="outline" title="Export Board"><Download className="w-4 h-4" /></Button>
          <Button onClick={handleClear} size="sm" variant="outline" title="Clear Board"><Trash2 className="w-4 h-4" /></Button>
          <Button onClick={() => setIsFullScreen(!isFullScreen)} size="sm" variant="outline" title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Templates */}
      <div className="absolute z-10 bg-white rounded-lg shadow-lg p-3" style={{ left: `${templatesPos.x}px`, top: `${templatesPos.y}px`, userSelect: 'none' }}>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-sm font-semibold">Templates</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setTemplatesMin(!templatesMin)} className="p-1 hover:bg-gray-100 rounded">{templatesMin ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</button>
            <div className="cursor-grab p-1 hover:bg-gray-100 rounded" onMouseDown={(e) => startDrag(e, 'templates', templatesPos)}><GripVertical className="w-4 h-4 text-gray-400" /></div>
          </div>
        </div>
        {!templatesMin && (<div className="space-y-2">
          <Button onClick={loadCompanyOrgTemplate} size="sm" variant={selectedTemplate === 'company-org' ? 'default' : 'outline'} className="w-full justify-start"><Network className="w-4 h-4 mr-2" />Org Chart</Button>
          <Button onClick={loadCompanyTreeTemplate} size="sm" variant={selectedTemplate === 'company-tree' ? 'default' : 'outline'} className="w-full justify-start"><GitBranch className="w-4 h-4 mr-2" />Company Tree</Button>
        </div>)}
      </div>

      {/* ReactFlow */}
      <div className="w-full h-full">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap nodeColor={(n) => n.id.startsWith('company') ? '#3b82f6' : n.id.startsWith('person') ? '#22c55e' : n.id.startsWith('dept') ? '#a855f7' : '#f97316'} />
          <Panel position="bottom-center" className="bg-white px-4 py-2 rounded-lg shadow-lg"><div className="text-xs text-gray-600">{nodes.length} nodes • {edges.length} connections</div></Panel>
        </ReactFlow>
      </div>

      {/* Help */}
      <div className="absolute z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs" style={{ left: `${helpPos.x}px`, top: `${helpPos.y}px`, userSelect: 'none' }}>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-xs font-semibold">Quick Help</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setHelpMin(!helpMin)} className="p-1 hover:bg-gray-100 rounded">{helpMin ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}</button>
            <div className="cursor-grab p-1 hover:bg-gray-100 rounded" onMouseDown={(e) => startDrag(e, 'help', helpPos)}><GripVertical className="w-3 h-3 text-gray-400" /></div>
          </div>
        </div>
        {!helpMin && (<div className="text-xs text-gray-600 space-y-1">
          <div>• <strong>Drag panels:</strong> Use ⋮⋮ grip</div>
          <div>• <strong>Move nodes:</strong> Click and drag</div>
          <div>• <strong>Connect:</strong> Drag from edge</div>
          <div>• <strong>Zoom:</strong> Scroll wheel</div>
        </div>)}
      </div>
    </div>
  )
}
