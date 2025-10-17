"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Calculator, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Brain,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Building,
  Users,
  MapPin,
  FileSpreadsheet,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TAX_FORMS, TAX_DEADLINES, getTaxFormsForEntity, getUpcomingDeadlines, getRequiredForms, getTaxOptimizationTips } from '@/lib/tax-forms'

interface CompanyInfo {
  name: string
  type: string
  stage: string
  revenue: string
  employees: string
  jurisdiction: string
  documents: Array<{
    name: string
    type: string
    uploaded: boolean
  }>
}

interface TaxAnalysis {
  analysis: string
  recommendations: string[]
  requiredForms: string[]
  deadlines: string[]
  risks: string[]
  optimization: string[]
}

export default function TaxManagementPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'

  // State management
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    type: '',
    stage: '',
    revenue: '',
    employees: '',
    jurisdiction: 'United States',
    documents: []
  })

  const [questions, setQuestions] = useState<string[]>([''])
  const [taxAnalysis, setTaxAnalysis] = useState<TaxAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedEntityType, setSelectedEntityType] = useState<string>('')
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)

  // Demo data for admin
  const demoCompanies = [
    {
      name: 'TechStart Inc.',
      type: 'C-Corp',
      stage: 'Series A',
      revenue: '$2.5M',
      employees: '25',
      jurisdiction: 'California, USA'
    },
    {
      name: 'Innovation Labs LLC',
      type: 'LLC',
      stage: 'Seed',
      revenue: '$500K',
      employees: '8',
      jurisdiction: 'Delaware, USA'
    },
    {
      name: 'Growth Partners',
      type: 'Partnership',
      stage: 'Established',
      revenue: '$5M',
      employees: '15',
      jurisdiction: 'New York, USA'
    }
  ]

  const handleAnalyzeTax = async () => {
    if (!companyInfo.name || !companyInfo.type) {
      alert('Please provide company name and type')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/tax-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyInfo.name,
          companyType: companyInfo.type,
          businessStage: companyInfo.stage,
          revenue: companyInfo.revenue,
          employees: companyInfo.employees,
          jurisdiction: companyInfo.jurisdiction,
          documents: companyInfo.documents,
          questions: questions.filter(q => q.trim())
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze tax requirements')
      }

      const analysisText = await response.text()
      
      // Parse the AI response (in a real app, you'd have structured JSON)
      const analysis: TaxAnalysis = {
        analysis: analysisText,
        recommendations: [
          'Consider S-Corp election for pass-through taxation',
          'Implement quarterly estimated tax payments',
          'Set up proper record-keeping system'
        ],
        requiredForms: getRequiredForms(companyInfo.type).map(f => f.name),
        deadlines: getUpcomingDeadlines(companyInfo.type).map(d => d.description),
        risks: [
          'Potential underpayment penalties',
          'Missing quarterly deadlines',
          'Inadequate record keeping'
        ],
        optimization: getTaxOptimizationTips(companyInfo.type)
      }

      setTaxAnalysis(analysis)
      setShowAnalysisDialog(true)
    } catch (error) {
      console.error('Tax analysis error:', error)
      alert('Failed to analyze tax requirements. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, ''])
  }

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const getEntityTypeForms = () => {
    if (!selectedEntityType) return []
    return getTaxFormsForEntity(selectedEntityType)
  }

  const getEntityTypeDeadlines = () => {
    if (!selectedEntityType) return []
    return getUpcomingDeadlines(selectedEntityType)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tax Management</h1>
            <p className="text-gray-600">
              AI-powered tax analysis, compliance tracking, and form management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">AI Tax Analysis</TabsTrigger>
          <TabsTrigger value="forms">Tax Forms</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* AI Tax Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Tax Analysis
              </CardTitle>
              <CardDescription>
                Get personalized tax guidance based on your company&apos;s specific situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="companyType">Business Type *</Label>
                  <Select value={companyInfo.type} onValueChange={(value) => setCompanyInfo({...companyInfo, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C-Corp">C Corporation</SelectItem>
                      <SelectItem value="S-Corp">S Corporation</SelectItem>
                      <SelectItem value="LLC">Limited Liability Company</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessStage">Business Stage</Label>
                  <Select value={companyInfo.stage} onValueChange={(value) => setCompanyInfo({...companyInfo, stage: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea Stage</SelectItem>
                      <SelectItem value="Seed">Seed Stage</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Growth">Growth Stage</SelectItem>
                      <SelectItem value="Established">Established</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  <Input
                    id="revenue"
                    value={companyInfo.revenue}
                    onChange={(e) => setCompanyInfo({...companyInfo, revenue: e.target.value})}
                    placeholder="e.g., $1M, $500K"
                  />
                </div>
                <div>
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    value={companyInfo.employees}
                    onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                    placeholder="e.g., 10, 25"
                  />
                </div>
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    value={companyInfo.jurisdiction}
                    onChange={(e) => setCompanyInfo({...companyInfo, jurisdiction: e.target.value})}
                    placeholder="e.g., California, USA"
                  />
                </div>
              </div>

              {/* Specific Questions */}
              <div>
                <Label>Specific Tax Questions</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Ask specific questions about your tax situation
                </p>
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder="e.g., What tax forms do I need to file? When are the deadlines?"
                      className="flex-1"
                    />
                    {questions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addQuestion} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {/* Analyze Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleAnalyzeTax}
                  disabled={isAnalyzing || !companyInfo.name || !companyInfo.type}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Tax Requirements'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Companies for Admin */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Demo Companies</CardTitle>
                <CardDescription>
                  Click on a demo company to populate the form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demoCompanies.map((company, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4" onClick={() => setCompanyInfo({
                        name: company.name,
                        type: company.type,
                        stage: company.stage,
                        revenue: company.revenue,
                        employees: company.employees,
                        jurisdiction: company.jurisdiction,
                        documents: []
                      })}>
                        <h3 className="font-semibold mb-2">{company.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Type:</strong> {company.type}</p>
                          <p><strong>Stage:</strong> {company.stage}</p>
                          <p><strong>Revenue:</strong> {company.revenue}</p>
                          <p><strong>Employees:</strong> {company.employees}</p>
                          <p><strong>Location:</strong> {company.jurisdiction}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tax Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Forms by Entity Type</CardTitle>
              <CardDescription>
                Select your business entity type to see required tax forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label>Select Entity Type</Label>
                <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your business entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C-Corp">C Corporation</SelectItem>
                    <SelectItem value="S-Corp">S Corporation</SelectItem>
                    <SelectItem value="LLC">Limited Liability Company</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedEntityType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Forms for {selectedEntityType}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getEntityTypeForms().map((form) => (
                      <Card key={form.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{form.name}</h4>
                            <Badge variant={form.required ? "destructive" : "secondary"}>
                              {form.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Frequency: {form.filingFrequency}</span>
                            <span>Deadline: {form.deadline}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              View Form
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tax Deadlines</CardTitle>
              <CardDescription>
                Track important tax filing deadlines and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntityType ? (
                <div className="space-y-4">
                  {getEntityTypeDeadlines().map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          deadline.priority === 'high' ? 'bg-red-500' : 
                          deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <h4 className="font-semibold">{deadline.description}</h4>
                          <p className="text-sm text-gray-600">Due: {deadline.dueDate}</p>
                        </div>
                      </div>
                      <Badge variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}>
                        {deadline.priority.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select an entity type to view tax deadlines
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>
                  Track your tax compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { item: 'Annual tax return filed', completed: false },
                    { item: 'Quarterly estimated taxes paid', completed: true },
                    { item: 'Payroll taxes current', completed: false },
                    { item: 'Sales tax returns filed', completed: true },
                    { item: 'Business license current', completed: true }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={item.completed ? 'text-green-700' : 'text-gray-700'}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Potential tax risks and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { risk: 'Underpayment penalties', severity: 'high' },
                    { risk: 'Missing quarterly deadlines', severity: 'medium' },
                    { risk: 'Inadequate record keeping', severity: 'low' }
                  ].map((risk, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        risk.severity === 'high' ? 'text-red-500' : 
                        risk.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-700">{risk.risk}</span>
                      <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tax Analysis Results Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Tax Analysis Results</DialogTitle>
            <DialogDescription>
              Comprehensive tax analysis for {companyInfo.name}
            </DialogDescription>
          </DialogHeader>
          {taxAnalysis && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Analysis Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{taxAnalysis.analysis}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Required Forms</h3>
                  <ul className="space-y-1">
                    {taxAnalysis.requiredForms.map((form, index) => (
                      <li key={index} className="text-sm text-gray-600">• {form}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
                  <ul className="space-y-1">
                    {taxAnalysis.deadlines.map((deadline, index) => (
                      <li key={index} className="text-sm text-gray-600">• {deadline}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tax Optimization Tips</h3>
                  <ul className="space-y-1">
                    {taxAnalysis.optimization.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600">• {tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Risk Factors</h3>
                  <ul className="space-y-1">
                    {taxAnalysis.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-red-600">• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
