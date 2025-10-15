"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Filter, SlidersHorizontal } from "lucide-react"

interface AdvancedSearchProps {
  onSearch: (filters: any) => void
  fields: {
    name: string
    label: string
    type: 'text' | 'select' | 'date' | 'number'
    options?: string[]
  }[]
}

export function AdvancedSearch({ onSearch, fields }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})

  const handleFilterChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleSearch = () => {
    onSearch(filters)
    setShowFilters(false)
  }

  const handleClear = () => {
    setFilters({})
    onSearch({})
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Quick search..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === 'select' && field.options ? (
                    <select
                      id={field.name}
                      value={filters[field.name] || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="">All</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <Input
                      id={field.name}
                      type="date"
                      value={filters[field.name] || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      className="mt-1"
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      id={field.name}
                      type="number"
                      value={filters[field.name] || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      value={filters[field.name] || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
              <Button onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

