"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, Plus, TrendingUp, DollarSign, Users, MapPin } from "lucide-react"

const companies = [
  {
    id: 1,
    name: "NeuralTech AI",
    industry: "Artificial Intelligence",
    stage: "Series A",
    revenue: "$2.5M ARR",
    growth: "+180%",
    employees: 45,
    location: "San Francisco, CA",
    founded: 2022,
    match: 95
  },
  {
    id: 2,
    name: "GreenEnergy Solutions",
    industry: "CleanTech",
    stage: "Seed",
    revenue: "$800K ARR",
    growth: "+250%",
    employees: 18,
    location: "Austin, TX",
    founded: 2023,
    match: 88
  },
  {
    id: 3,
    name: "HealthBridge Platform",
    industry: "HealthTech",
    stage: "Pre-Seed",
    revenue: "$200K ARR",
    growth: "+320%",
    employees: 12,
    location: "Boston, MA",
    founded: 2024,
    match: 82
  },
  {
    id: 4,
    name: "QuantumSecure",
    industry: "Cybersecurity",
    stage: "Series A",
    revenue: "$3.2M ARR",
    growth: "+150%",
    employees: 52,
    location: "New York, NY",
    founded: 2021,
    match: 90
  },
]

export default function ScreenersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStage, setSelectedStage] = useState<string>("all")

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = selectedStage === "all" || company.stage === selectedStage
    return matchesSearch && matchesStage
  })

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 bg-green-50"
    if (match >= 80) return "text-blue-600 bg-blue-50"
    return "text-orange-600 bg-orange-50"
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Filter className="w-8 h-8 text-blue-600" />
              Deal Screeners
            </h1>
            <p className="text-gray-600 mt-1">
              Find and evaluate investment opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Screener
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search companies or industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">Industry: All</Button>
            <Button variant="outline" size="sm">Revenue: Any</Button>
            <Button variant="outline" size="sm">Growth: Any</Button>
            <Button variant="outline" size="sm">Location: Any</Button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredCompanies.length} Companies Match Your Criteria
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sort by Match</Button>
              <Button variant="outline" size="sm">Sort by Revenue</Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getMatchColor(company.match)}`}>
                        {company.match}% Match
                      </span>
                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        {company.stage}
                      </span>
                    </div>
                    <p className="text-gray-600">{company.industry} • Founded {company.founded}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">View Profile</Button>
                    <Button>Add to Pipeline</Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900">{company.revenue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Growth</p>
                      <p className="font-semibold text-green-600">{company.growth}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Team Size</p>
                      <p className="font-semibold text-gray-900">{company.employees}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{company.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

