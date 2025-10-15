"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image, 
  Video, 
  FileText, 
  BarChart3, 
  Calendar,
  Sparkles,
  X,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface MessageComposerProps {
  onSendMessage: (message: { content?: string; type: string; attachments?: any[]; poll?: any; event?: any }) => void
  channelId?: string
  directChatId?: string
  onInputChange?: (value: string) => void
  onStartTyping?: () => void
  onStopTyping?: () => void
}

export function MessageComposer({ onSendMessage, channelId, directChatId, onInputChange, onStartTyping, onStopTyping }: MessageComposerProps) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showPollForm, setShowPollForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Poll form state
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    expiresAt: ''
  })

  // Event form state
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: ''
  })

  const handleSendMessage = useCallback(() => {
    if (!message.trim() && attachments.length === 0 && !showPollForm && !showEventForm) return

    let messageData: any = {
      type: 'TEXT',
      content: message,
      attachments: attachments
    }

    if (showPollForm) {
      messageData = {
        type: 'POLL',
        poll: pollData
      }
    }

    if (showEventForm) {
      messageData = {
        type: 'EVENT',
        event: eventData
      }
    }

    onSendMessage(messageData)
    
    // Reset form
    setMessage('')
    setAttachments([])
    setShowPollForm(false)
    setShowEventForm(false)
    setPollData({ question: '', options: ['', ''], expiresAt: '' })
    setEventData({ title: '', description: '', startDate: '', endDate: '', location: '' })
  }, [message, attachments, showPollForm, showEventForm, pollData, eventData, onSendMessage])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        // Use webm format which is better supported
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const timestamp = Date.now()
        const audioFile = new File([audioBlob], `voice-${timestamp}.webm`, { type: 'audio/webm' })
        
        console.log('Voice recording stopped, file size:', audioBlob.size)
        
        // Upload voice message
        const formData = new FormData()
        formData.append('file', audioFile)
        
        setIsUploading(true)
        try {
          console.log('Uploading voice message...')
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          const result = await response.json()
          
          console.log('Upload response:', result)
          
          if (response.ok) {
            console.log('Voice message uploaded, sending...', result)
            onSendMessage({
              type: 'VOICE',
              content: 'Voice message',
              attachments: [result]
            })
          } else {
            console.error('Upload failed:', result)
            alert('Failed to upload voice message: ' + (result.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Error uploading voice message:', error)
          alert('Error uploading voice message. Please try again.')
        } finally {
          setIsUploading(false)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const result = await response.json()

        if (response.ok) {
          setAttachments(prev => [...prev, result])
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const addPollOption = () => {
    setPollData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removePollOption = (index: number) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updatePollOption = (index: number, value: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {/* Poll Form */}
      {showPollForm && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Create Poll</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPollForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Poll question"
              value={pollData.question}
              onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
            />
            
            {pollData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                />
                {pollData.options.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removePollOption(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button variant="outline" size="sm" onClick={addPollOption}>
              Add Option
            </Button>
            
            <Input
              type="datetime-local"
              placeholder="Expiration (optional)"
              value={pollData.expiresAt}
              onChange={(e) => setPollData(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Event Form */}
      {showEventForm && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-900">Create Event</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEventForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Event title"
              value={eventData.title}
              onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <Input
              placeholder="Description (optional)"
              value={eventData.description}
              onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="datetime-local"
                placeholder="Start date"
                value={eventData.startDate}
                onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                type="datetime-local"
                placeholder="End date (optional)"
                value={eventData.endDate}
                onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            
            <Input
              placeholder="Location (optional)"
              value={eventData.location}
              onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <span className="text-sm">{attachment.filename}</span>
              <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              onInputChange?.(e.target.value)
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isRecording || isUploading}
            className="min-h-[40px]"
          />
        </div>

        {/* Attachment Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={isRecording || isUploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {showAttachmentMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-2 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click()
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <FileText className="w-4 h-4 mb-1" />
                <span className="text-xs">File</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click()
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <Image className="w-4 h-4 mb-1" />
                <span className="text-xs">Photo</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click()
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <Video className="w-4 h-4 mb-1" />
                <span className="text-xs">Video</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPollForm(true)
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <BarChart3 className="w-4 h-4 mb-1" />
                <span className="text-xs">Poll</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEventForm(true)
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <Calendar className="w-4 h-4 mb-1" />
                <span className="text-xs">Event</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // AI Image generation - placeholder
                  alert('AI Image generation coming soon!')
                  setShowAttachmentMenu(false)
                }}
                className="flex flex-col items-center p-2 h-auto"
              >
                <Sparkles className="w-4 h-4 mb-1" />
                <span className="text-xs">AI Image</span>
              </Button>
            </div>
          )}
        </div>

        {/* Voice Recording */}
        {!isRecording ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={startRecording}
            disabled={isUploading}
          >
            <Mic className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">{formatTime(recordingTime)}</span>
            <Button variant="ghost" size="sm" onClick={stopRecording}>
              <Square className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0 && !showPollForm && !showEventForm) || isRecording || isUploading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
