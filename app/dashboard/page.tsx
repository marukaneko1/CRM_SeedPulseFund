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
  
  const deals = isAdmin ? demoDeals : []
  
  // Button handlers
  const handleShare = () => {
    alert('Share functionality - Generate shareable link or invite collaborators')
  }
  
  const handleListOptions = () => {
    alert('List Options - Configure list settings and permissions')
  }
  
  const handleFilter = () => {
    alert('Filter - Apply filters to narrow down results')
  }
  
  const handleSort = () => {
    alert('Sort - Change sorting criteria')
  }
  
  const handleCustomize = () => {
    alert('Customize - Customize columns and layout')
  }
  
  const handleDownload = () => {
    // Export deals to CSV
    const csv = deals.map(d => 
      `${d.name},${d.status},${d.dealTeam},${d.connections}`
    ).join('\n')
    const blob = new Blob([`Name,Status,Deal Team,Connections\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deals-export.csv'
    a.click()
  }
  
  const handleUpload = () => {
    alert('Upload - Import deals from CSV or other sources')
  }
  
  const handleMaximize = () => {
    alert('Maximize - Enter fullscreen mode')
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
  
  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">GV Ventures</h1>
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
            onClick={() => setActiveView('views')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'views' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Views
          </button>
          <button 
            onClick={() => setActiveView('all-pipeline')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'all-pipeline' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            + All Pipeline
          </button>
          <button 
            onClick={() => setActiveView('saved-1')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'saved-1' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Saved View 1
          </button>
          <button 
            onClick={() => setActiveView('team-activity')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'team-activity' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Team Activity 1
          </button>
          <button 
            onClick={() => setActiveView('funnel')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'funnel' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            Funnel Analysis 2
          </button>
          <button 
            onClick={() => setActiveView('list-summary')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'list-summary' 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            List Summary
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
          <p className="text-sm text-gray-600">+ All Pipeline 104 organizations</p>
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
                Sort: Time In Current Status 1x
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
    </div>
  )
}

