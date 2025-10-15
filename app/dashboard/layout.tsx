"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { UpdateBanner } from "@/components/update-banner"
import {
  Home,
  Bell,
  Calendar,
  Mail,
  Eye,
  Users,
  Building,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  Plus,
  Search,
  FileText,
  TrendingUp,
  Target,
  Globe,
  Star,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react"

const navigation = [
  // Main navigation
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: "18" },
  { name: "Reminders", href: "/dashboard/reminders", icon: Calendar },
  { name: "Meetings", href: "/dashboard/calendar", icon: Calendar },
  { name: "Unanswered Emails", href: "/dashboard/email", icon: Mail },
  { name: "Watching", href: "/dashboard/watching", icon: Eye, badge: "11" },
  { name: "Screeners", href: "/dashboard/screeners", icon: Eye },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  
  // Separator
  { type: "separator" },
  
  // Your Network
  { type: "section", name: "YOUR NETWORK" },
  { name: "All People", href: "/dashboard/contacts", icon: Users },
  { name: "All Organizations", href: "/dashboard/companies", icon: Building },
  
  // Separator
  { type: "separator" },
  
  // Favorites/Pipelines
  { type: "section", name: "FAVORITES" },
  { name: "Fund Pipeline", href: "/dashboard/fund-pipeline", icon: Briefcase },
  { name: "GV Ventures", href: "/dashboard/gv-ventures", icon: Star },
  { name: "M&A Pipeline", href: "/dashboard/ma-pipeline", icon: TrendingUp },
  { name: "Master Accelerator/Incubat...", href: "/dashboard/accelerator", icon: Target },
  { name: "Master Corp Dev Pipeline", href: "/dashboard/corp-dev", icon: Building },
  { name: "Master Dealflow Pipeline", href: "/dashboard/deals", icon: Briefcase },
  { name: "Master Fund Performance T...", href: "/dashboard/fund-performance", icon: BarChart3 },
  { name: "Master Intermediary Tracker", href: "/dashboard/intermediary", icon: Globe },
  { name: "Master Investor Network/Ec...", href: "/dashboard/investor-network", icon: Users },
  { name: "Master Key Relationships", href: "/dashboard/relationships", icon: Star },
  { name: "Master Limited Partner Trac...", href: "/dashboard/lp-tracker", icon: Users },
  { name: "Master LP Contacts", href: "/dashboard/lp-contacts", icon: Users },
  { name: "Master Newsletter", href: "/dashboard/newsletter", icon: Mail },
  { name: "Master Portfolio Companies", href: "/dashboard/portfolio", icon: Building },
  { name: "Master Real Estate Investme...", href: "/dashboard/real-estate", icon: Building },
  { name: "Master Talent Network", href: "/dashboard/talent", icon: Users },
  { name: "PE & Banker Contacts", href: "/dashboard/pe-bankers", icon: Users },
  { name: "Private Equity Pipeline", href: "/dashboard/pe-pipeline", icon: Briefcase },
  { name: "Project/Engagement Executi...", href: "/dashboard/projects", icon: FileText },
  
  // Separator
  { type: "separator" },
  
  // Deal Assist
  { name: "Deal Assist", href: "/dashboard/deal-assist", icon: Star },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // You can implement search functionality here
      console.log("Searching for:", searchQuery)
      // Example: router.push(`/dashboard/search?q=${searchQuery}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  useEffect(() => {
    // Check if user should see onboarding
    const isNewUser = localStorage.getItem('new_user')
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed')
    
    if (isNewUser && !hasSeenOnboarding && pathname === '/dashboard') {
      localStorage.removeItem('new_user')
      router.push('/dashboard/onboarding')
    }
  }, [pathname, router])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-900 text-white flex flex-col">
        {/* Header */}
          <div className="border-b border-gray-700">
            {/* Update Banner */}
            <div className="pt-3">
              <UpdateBanner />
            </div>
            
            <div className="px-6 pb-6">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 mb-4 w-full hover:bg-gray-800 rounded-lg p-2 -ml-2 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{session?.user?.name || "User"}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {session?.user?.role || "Member"}
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 overflow-hidden">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-left text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
              
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                className="w-full bg-gray-800 text-white placeholder-gray-400 px-10 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                ↵
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showSearch && searchQuery && (
              <div className="absolute top-full left-6 right-6 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-xs text-gray-400">Search results for &quot;{searchQuery}&quot;</p>
                </div>
                <div className="p-2">
                  {/* Quick navigation results */}
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 px-3 py-1 font-semibold">QUICK LINKS</p>
                    {navigation.filter(item => 
                      !item.type && 
                      item.href &&
                      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).slice(0, 5).map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href!}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-md text-sm"
                          onClick={() => {
                            setShowSearch(false)
                            setSearchQuery("")
                          }}
                        >
                          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                  {navigation.filter(item => 
                    !item.type && 
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-8 text-center text-gray-500 text-sm">
                      No results found
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {navigation.map((item, index) => {
              if (item.type === "separator") {
                return <div key={index} className="h-px bg-gray-700 my-4" />
              }
              
              if (item.type === "section") {
                return (
                  <div key={index} className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </h3>
                  </div>
                )
              }

              if (!item.href) return null
              
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors group",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}

