"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  FileText, 
  Mail, 
  CheckSquare, 
  MessageSquare,
  TrendingUp,
  Brain
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface AIActionsMenuProps {
  context?: {
    dealId?: string
    companyId?: string
    companyName?: string
    industry?: string
  }
  onActionComplete?: (result: any) => void
}

export function AIActionsMenu({ context, onActionComplete }: AIActionsMenuProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  
  // Form states
  const [objectionText, setObjectionText] = useState('')
  const [emailType, setEmailType] = useState('introduction')
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailContext, setEmailContext] = useState('')

  const handleAction = async (action: string) => {
    setActionType(action)
    setShowDialog(true)
    setResult('')
  }

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')

    try {
      let endpoint = ''
      let body = {}

      switch (actionType) {
        case 'objection':
          endpoint = '/api/ai/objection-reply'
          body = {
            objection: objectionText,
            context: context?.companyName ? `Company: ${context.companyName}` : undefined,
            dealInfo: context
          }
          break

        case 'dd-checklist':
          endpoint = '/api/ai/dd-checklist'
          body = {
            companyName: context?.companyName || 'Company',
            industry: context?.industry || 'Technology',
            stage: 'Series A',
            investmentAmount: '$2M'
          }
          break

        case 'memo':
          endpoint = '/api/ai/memo'
          body = {
            companyName: context?.companyName || 'Company',
            industry: context?.industry || 'Technology',
            dealInfo: context,
            memoType: 'Full Investment Memo'
          }
          break

        case 'email':
          endpoint = '/api/ai/email-draft'
          body = {
            emailType,
            recipient: emailRecipient,
            context: emailContext
          }
          break

        default:
          return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            accumulatedText += chunk
            setResult(accumulatedText)
          }
        }

        onActionComplete?.({ action: actionType, result: accumulatedText })
      } else {
        const error = await response.json()
        setResult(`Error: ${error.error || 'Failed to generate content'}`)
      }
    } catch (error: any) {
      console.error('AI Action Error:', error)
      setResult(`Error: ${error.message || 'Something went wrong'}`)
    } finally {
      setLoading(false)
    }
  }

  const renderDialogContent = () => {
    switch (actionType) {
      case 'objection':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Objection Text</label>
              <Textarea
                placeholder="Enter the objection you want to address..."
                value={objectionText}
                onChange={(e) => setObjectionText(e.target.value)}
                rows={4}
              />
            </div>
            {!result && (
              <Button onClick={handleGenerate} disabled={loading || !objectionText.trim()}>
                {loading ? 'Generating...' : 'Generate Response'}
              </Button>
            )}
            {result && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">AI Response:</h4>
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
            )}
          </div>
        )

      case 'dd-checklist':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Generating due diligence checklist for:
              <div className="font-semibold mt-2">
                {context?.companyName || 'Company'} - {context?.industry || 'Technology'}
              </div>
            </div>
            {!result && (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Checklist'}
              </Button>
            )}
            {result && (
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <h4 className="font-semibold mb-2">DD Checklist:</h4>
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
            )}
          </div>
        )

      case 'memo':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Generating investment memo for:
              <div className="font-semibold mt-2">
                {context?.companyName || 'Company'}
              </div>
            </div>
            {!result && (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Memo'}
              </Button>
            )}
            {result && (
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <h4 className="font-semibold mb-2">Investment Memo:</h4>
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
            )}
          </div>
        )

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
              >
                <option value="introduction">Introduction</option>
                <option value="follow-up">Follow-up</option>
                <option value="investment_update">Investment Update</option>
                <option value="rejection">Polite Rejection</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recipient</label>
              <Input
                placeholder="e.g., John Smith, CEO of TechCo"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Context</label>
              <Textarea
                placeholder="Additional context or key points..."
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
                rows={3}
              />
            </div>
            {!result && (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Drafting...' : 'Draft Email'}
              </Button>
            )}
            {result && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">Email Draft:</h4>
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getDialogTitle = () => {
    switch (actionType) {
      case 'objection': return 'AI Objection Response'
      case 'dd-checklist': return 'Generate DD Checklist'
      case 'memo': return 'Generate Investment Memo'
      case 'email': return 'Draft Email'
      default: return 'AI Assistant'
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleAction('objection')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Reply to Objection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('dd-checklist')}>
            <CheckSquare className="w-4 h-4 mr-2" />
            Generate DD Checklist
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('memo')}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Investment Memo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction('email')}>
            <Mail className="w-4 h-4 mr-2" />
            Draft Email
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <TrendingUp className="w-4 h-4 mr-2" />
            Analyze Deal (Coming Soon)
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Brain className="w-4 h-4 mr-2" />
            Suggest Next Steps (Coming Soon)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  )
}
