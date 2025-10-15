"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface PortfolioFormProps {
  portfolio?: any
  onClose: () => void
  onSuccess: () => void
}

export function PortfolioForm({ portfolio, onClose, onSuccess }: PortfolioFormProps) {
  const [formData, setFormData] = useState({
    companyId: portfolio?.companyId || '',
    investmentAmount: portfolio?.investmentAmount || '',
    investmentDate: portfolio?.investmentDate || '',
    equityPercentage: portfolio?.equityPercentage || '',
    currentValuation: portfolio?.currentValuation || '',
    status: portfolio?.status || 'ACTIVE',
    notes: portfolio?.notes || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = portfolio ? `/api/portfolio/${portfolio.id}` : '/api/portfolio'
      const method = portfolio ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          investmentAmount: parseFloat(formData.investmentAmount),
          equityPercentage: formData.equityPercentage ? parseFloat(formData.equityPercentage) : null,
          currentValuation: formData.currentValuation ? parseFloat(formData.currentValuation) : null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save portfolio company')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{portfolio ? 'Edit Portfolio Company' : 'Add Portfolio Company'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="companyId">Company ID *</Label>
            <Input
              id="companyId"
              placeholder="Select or enter company ID"
              value={formData.companyId}
              onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Tip: Create company first in Companies page</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investmentAmount">Investment Amount *</Label>
              <Input
                id="investmentAmount"
                type="number"
                step="0.01"
                placeholder="500000"
                value={formData.investmentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentAmount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="investmentDate">Investment Date *</Label>
              <Input
                id="investmentDate"
                type="date"
                value={formData.investmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equityPercentage">Equity %</Label>
              <Input
                id="equityPercentage"
                type="number"
                step="0.01"
                placeholder="15"
                value={formData.equityPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, equityPercentage: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="currentValuation">Current Valuation</Label>
              <Input
                id="currentValuation"
                type="number"
                step="0.01"
                placeholder="1000000"
                value={formData.currentValuation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentValuation: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full p-2 border rounded-md"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="ACTIVE">Active</option>
              <option value="EXITED">Exited</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (portfolio ? 'Update Company' : 'Add Company')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

