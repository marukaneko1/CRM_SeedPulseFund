"use client"

import { useSession } from "next-auth/react"
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
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const deals = isAdmin ? demoDeals : []
  
  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">GV Ventures</h1>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              List Options
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
            Views
          </button>
          <button className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            + All Pipeline
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
            Saved View 1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
            Team Activity 1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
            Funnel Analysis 2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
            List Summary
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">+ All Pipeline 104 organizations</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Collaborators</span>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort: Time In Current Status 1x
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm">
                Slim View
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
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
                <input type="checkbox" className="rounded border-gray-300" />
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
              <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
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

