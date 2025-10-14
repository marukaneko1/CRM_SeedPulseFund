"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, Search, Plus, TrendingUp, MapPin, Users, DollarSign } from "lucide-react"

const companies = [
  {
    id: 1,
    name: "TechVenture Inc",
    logo: "T",
    industry: "SaaS",
    stage: "Series A",
    website: "techventure.com",
    location: "San Francisco, CA",
    employees: 45,
    funding: "$5.2M",
    lastContact: "2 days ago",
    status: "Active"
  },
  {
    id: 2,
    name: "DataFlow Systems",
    logo: "D",
    industry: "Data Analytics",
    stage: "Seed",
    website: "dataflow.io",
    location: "New York, NY",
    employees: 28,
    funding: "$2.1M",
    lastContact: "1 week ago",
    status: "Active"
  },
  {
    id: 3,
    name: "CloudBridge",
    logo: "C",
    industry: "Cloud Infrastructure",
    stage: "Series B",
    website: "cloudbridge.com",
    location: "Austin, TX",
    employees: 120,
    funding: "$15M",
    lastContact: "3 days ago",
    status: "Active"
  },
  {
    id: 4,
    name: "AI Innovations",
    logo: "A",
    industry: "Artificial Intelligence",
    stage: "Series A",
    website: "aiinnovations.ai",
    location: "Boston, MA",
    employees: 67,
    funding: "$8.5M",
    lastContact: "5 days ago",
    status: "Active"
  },
]

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStage, setFilterStage] = useState("all")

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === "all" || company.stage === filterStage
    return matchesSearch && matchesStage
  })

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-600" />
              All Organizations
            </h1>
            <p className="text-gray-600 mt-1">{companies.length} companies in your network</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Series C">Series C</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {company.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.website}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{company.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{company.employees} employees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{company.funding} raised</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {company.stage}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {company.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Last contact: {company.lastContact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

