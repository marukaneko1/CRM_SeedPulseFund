"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Users, DollarSign } from "lucide-react"

export default function FundraisingPage() {
  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Fundraising
            </h1>
            <p className="text-gray-600 mt-1">Manage fund raising, LP pipeline, and commitments</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />Add LP</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fund Target</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$50M</div>
              <p className="text-xs text-gray-500 mt-1">Fund II Target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Committed</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$35M</div>
              <p className="text-xs text-green-600 mt-1">70% of target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LPs</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">Active investors</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>LP Pipeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'ABC Family Office', commitment: 5000000, status: 'Committed' },
                { name: 'XYZ Pension Fund', commitment: 10000000, status: 'In Diligence' },
                { name: 'University Endowment', commitment: 7500000, status: 'Initial Contact' },
              ].map((lp, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{lp.name}</p>
                    <p className="text-sm text-gray-600">${(lp.commitment / 1000000).toFixed(1)}M commitment</p>
                  </div>
                  <Badge className={
                    lp.status === 'Committed' ? 'bg-green-100 text-green-800' :
                    lp.status === 'In Diligence' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>{lp.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
