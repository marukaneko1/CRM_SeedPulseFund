"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal,
  Download,
  Upload,
  Maximize2,
  Share,
  Star,
  Plus,
  ChevronDown
} from "lucide-react"

// Demo deals only for admin
const demoDeals = [
  { 
    name: "Helix", 
    status: "Target Lead", 
    people: "Abby Hu Cole Hull", 
    dealTeam: "Parks King",
    connections: "Gregory Hartley & 11 mo",
    firstEmail: "2 years ago Apr 15, 2023",
    lastEmail: "17 days ago Sep 27, 2025",
    lastMeeting: "7 hours ago Oct 14, 2025",
    lastContact: "7 hours ago Oct 14, 2025"
  },
  { 
    name: "Lacework", 
    status: "Initial Meeting", 
    people: "", 
    dealTeam: "Sarah Ingersoll",
    connections: "No connections",
    firstEmail: "",
    lastEmail: "",
    lastMeeting: "",
    lastContact: ""
  },
  { 
    name: "MetaProp", 
    status: "Target Lead", 
    people: "Ethan Gold", 
    dealTeam: "Haley Weis",
    connections: "Steve Fried & 5 more",
    firstEmail: "1 year ago Jun 5, 2023",
    lastEmail: "19 days ago Sep 25, 2025",
    lastMeeting: "5 hours ago Oct 14, 2025",
    lastContact: "5 hours ago Oct 14, 2025"
  },
  { 
    name: "OpenAI", 
    status: "Deep Diligence/IC Re", 
    people: "Ricky Rooney Samanth", 
    dealTeam: "Sarah Ingersoll",
    connections: "Camilla Sloan & 7 more",
    firstEmail: "2 years ago Apr 20, 2023",
    lastEmail: "21 days ago Sep 23, 2025",
    lastMeeting: "2 hours ago Oct 14, 2025",
    lastContact: "2 hours ago Oct 14, 2025"
  },
  { 
    name: "Preply", 
    status: "Portfolio", 
    people: "Carol Good Andres La", 
    dealTeam: "Michael Lavendier",
    connections: "Megan Lieberman & 101",
    firstEmail: "2 years ago Apr 23, 2023",
    lastEmail: "28 days ago Sep 16, 2025",
    lastMeeting: "1 hour ago Oct 14, 2025",
    lastContact: "1 hour ago Oct 14, 2025"
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const [activeView, setActiveView] = useState('all-pipeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [isStarred, setIsStarred] = useState(false)
  const [selectedDeals, setSelectedDeals] = useState<number[]>([])
  const [showSlimView, setShowSlimView] = useState(false)
  
  // Filter & Sort states
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterDealTeam, setFilterDealTeam] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastContact'>('lastContact')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    status: true,
    people: true,
    dealTeam: true,
    connections: true,
    firstEmail: true,
    lastEmail: true,
    lastMeeting: true,
    lastContact: true,
  })
  
  // Modals
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  
  const allDeals = isAdmin ? demoDeals : []
  
  // Filter and sort deals
  const getFilteredAndSortedDeals = () => {
    let filtered = [...allDeals]
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dealTeam.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filterStatus.length > 0) {
      filtered = filtered.filter(d => filterStatus.includes(d.status))
    }
    
    // Apply deal team filter
    if (filterDealTeam.length > 0) {
      filtered = filtered.filter(d => filterDealTeam.includes(d.dealTeam))
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      } else if (sortBy === 'lastContact') {
        comparison = a.lastContact.localeCompare(b.lastContact)
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }
  
  // Get view-specific data
  const getViewData = () => {
    const baseDeals = getFilteredAndSortedDeals()
    
    switch (activeView) {
      case 'all-pipeline':
        return baseDeals
      case 'saved-1':
        return baseDeals.filter(d => d.status === 'Portfolio')
      case 'team-activity':
        return baseDeals.filter(d => d.lastContact && d.lastContact.includes('hours'))
      case 'funnel':
        return baseDeals
      case 'list-summary':
        return baseDeals
      default:
        return baseDeals
    }
  }
  
  const deals = getViewData()
  
  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(allDeals.map(d => d.status)))
  const uniqueDealTeams = Array.from(new Set(allDeals.map(d => d.dealTeam)))
  
  // Button handlers
  const handleShare = () => {
    setShowShareModal(true)
  }
  
  const handleListOptions = () => {
    router.push('/dashboard/settings?tab=list-options')
  }
  
  const handleFilter = () => {
    setShowFilterModal(true)
  }
  
  const handleSort = () => {
    // Cycle through sort options
    if (sortBy === 'lastContact') {
      setSortBy('name')
    } else if (sortBy === 'name') {
      setSortBy('status')
    } else {
      setSortBy('lastContact')
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    }
  }
  
  const handleCustomize = () => {
    setShowCustomizeModal(true)
  }
  
  const handleDownload = () => {
    const visibleCols = Object.keys(visibleColumns).filter(k => visibleColumns[k as keyof typeof visibleColumns])
    const headers = visibleCols.map(col => col.charAt(0).toUpperCase() + col.slice(1)).join(',')
    const rows = deals.map(d => {
      const row: string[] = []
      visibleCols.forEach(col => {
        row.push((d as any)[col] || '')
      })
      return row.join(',')
    }).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deals-${activeView}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }
  
  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      alert(`Upload functionality: Import ${file.name} to add new deals`)
    }
    input.click()
  }
  
  const handleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }
  
  const handleAddNew = () => {
    router.push('/dashboard/deals?action=create')
  }
  
  const toggleStar = () => {
    setIsStarred(!isStarred)
  }
  
  const toggleSlimView = () => {
    setShowSlimView(!showSlimView)
  }
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDeals(deals.map((_, i) => i))
    } else {
      setSelectedDeals([])
    }
  }
  
  const handleSelectDeal = (index: number) => {
    setSelectedDeals(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }
  
  const clearFilters = () => {
    setFilterStatus([])
    setFilterDealTeam([])
    setSearchQuery('')
  }
  
  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Deal Flow Pipelines</h1>
            <button onClick={toggleStar} className="hover:scale-110 transition-transform">
              <Star className={`w-5 h-5 ${isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleListOptions}>
              List Options
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          <button 
            onClick={() => setActiveView('all-pipeline')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'all-pipeline' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Master Dealflow Pipeline
          </button>
          <button 
            onClick={() => setActiveView('fund-pipeline')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'fund-pipeline' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Fund Pipeline
          </button>
          <button 
            onClick={() => setActiveView('gv-ventures')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'gv-ventures' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            GV Ventures
          </button>
          <button 
            onClick={() => setActiveView('ma-pipeline')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'ma-pipeline' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            M&A Pipeline
          </button>
          <button 
            onClick={() => setActiveView('master-accelerator')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'master-accelerator' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Master Accelerator
          </button>
          <button 
            onClick={handleAddNew}
            className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            title="Add new view"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {activeView === 'all-pipeline' && `Master Dealflow Pipeline: ${deals.length} organizations`}
              {activeView === 'fund-pipeline' && `Fund Pipeline: ${deals.length} organizations`}
              {activeView === 'gv-ventures' && `GV Ventures: ${deals.length} organizations`}
              {activeView === 'ma-pipeline' && `M&A Pipeline: ${deals.length} organizations`}
              {activeView === 'master-accelerator' && `Master Accelerator: ${deals.length} organizations`}
            </p>
            {(filterStatus.length > 0 || filterDealTeam.length > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Collaborators</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search deals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleSort}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort: {sortBy === 'name' ? 'Name' : sortBy === 'status' ? 'Status' : 'Last Contact'} {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCustomize}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button 
                variant={showSlimView ? "default" : "outline"} 
                size="sm" 
                onClick={toggleSlimView}
              >
                Slim View
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleDownload} title="Download CSV">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleUpload} title="Upload/Import">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleMaximize} title="Maximize">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 cursor-pointer" 
                  checked={selectedDeals.length === deals.length && deals.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                People
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connections
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Meeting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deals.map((deal, index) => (
              <tr key={index} className={`hover:bg-gray-50 cursor-pointer ${selectedDeals.includes(index) ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 cursor-pointer" 
                    checked={selectedDeals.includes(index)}
                    onChange={() => handleSelectDeal(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-700">
                        {deal.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                      <div className="text-sm text-gray-500">{deal.name.toLowerCase()}.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-900">{deal.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.people}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.dealTeam}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.connections}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.firstEmail}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.lastEmail}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.lastMeeting}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{deal.lastContact}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Filter Deals</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Status</h3>
              {uniqueStatuses.map(status => (
                <label key={status} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={filterStatus.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterStatus([...filterStatus, status])
                      } else {
                        setFilterStatus(filterStatus.filter(s => s !== status))
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Deal Team</h3>
              {uniqueDealTeams.map(team => (
                <label key={team} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={filterDealTeam.includes(team)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterDealTeam([...filterDealTeam, team])
                      } else {
                        setFilterDealTeam(filterDealTeam.filter(t => t !== team))
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{team}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowFilterModal(false)} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCustomizeModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Customize Columns</h2>
            
            {Object.keys(visibleColumns).map(col => (
              <label key={col} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={visibleColumns[col as keyof typeof visibleColumns]}
                  onChange={(e) => {
                    setVisibleColumns({
                      ...visibleColumns,
                      [col]: e.target.checked
                    })
                  }}
                  className="rounded"
                />
                <span className="text-sm capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}

            <div className="mt-4">
              <Button onClick={() => setShowCustomizeModal(false)} className="w-full">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Share View</h2>
            <p className="text-sm text-gray-600 mb-4">Share this view with team members or generate a public link</p>
            
            <div className="mb-4">
              <Input placeholder="Enter email address" className="mb-2" />
              <Button variant="outline" size="sm" className="w-full">
                <Share className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Public Link</p>
              <div className="flex gap-2">
                <Input value={`https://crm.app/view/${activeView}`} readOnly className="text-sm" />
                <Button size="sm" onClick={() => {
                  navigator.clipboard.writeText(`https://crm.app/view/${activeView}`)
                  alert('Link copied to clipboard!')
                }}>
                  Copy
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" onClick={() => setShowShareModal(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

