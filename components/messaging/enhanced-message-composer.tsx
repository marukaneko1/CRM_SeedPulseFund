"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface EnhancedMessageComposerProps {
  onSendMessage: (message: { content?: string; type: string; attachments?: any[]; poll?: any; event?: any }) => void
  channelId?: string
  directChatId?: string
  onInputChange?: (value: string) => void
  onStartTyping?: () => void
  onStopTyping?: () => void
}

export function EnhancedMessageComposer({ 
  onSendMessage, 
  channelId, 
  directChatId, 
  onInputChange, 
  onStartTyping, 
  onStopTyping 
}: EnhancedMessageComposerProps) {
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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Handle typing indicators
  const handleInputChange = useCallback((value: string) => {
    setMessage(value)
    
    if (onInputChange) {
      onInputChange(value)
    }

    // Start typing indicator
    if (value.trim().length > 0 && onStartTyping) {
      onStartTyping()
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping()
        }
      }, 2000)
    } else if (value.trim().length === 0 && onStopTyping) {
      onStopTyping()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [onInputChange, onStartTyping, onStopTyping])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleSendMessage = useCallback(() => {
    if (!message.trim() && attachments.length === 0 && !showPollForm && !showEventForm) return

    let messageData: any = {
      type: 'TEXT',
      content: message,
      attachments: attachments.length > 0 ? attachments : undefined
    }

    if (showPollForm && pollData.question.trim()) {
      messageData = {
        type: 'POLL',
        poll: {
          question: pollData.question,
          options: pollData.options.filter(opt => opt.trim()),
          expiresAt: pollData.expiresAt || undefined
        }
      }
      setShowPollForm(false)
      setPollData({ question: '', options: ['', ''], expiresAt: '' })
    } else if (showEventForm && eventData.title.trim()) {
      messageData = {
        type: 'EVENT',
        event: {
          title: eventData.title,
          description: eventData.description || undefined,
          startDate: eventData.startDate,
          endDate: eventData.endDate || undefined,
          location: eventData.location || undefined
        }
      }
      setShowEventForm(false)
      setEventData({ title: '', description: '', startDate: '', endDate: '', location: '' })
    }

    onSendMessage(messageData)
    setMessage('')
    setAttachments([])
    
    // Stop typing when message is sent
    if (onStopTyping) {
      onStopTyping()
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [message, attachments, showPollForm, showEventForm, pollData, eventData, onSendMessage, onStopTyping])

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
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' })
        
        // Upload voice message
        const formData = new FormData()
        formData.append('file', audioFile)
        
        setIsUploading(true)
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          const result = await response.json()
          
          onSendMessage({
            type: 'VOICE',
            attachments: [{
              filename: result.filename,
              fileType: result.fileType,
              fileSize: result.fileSize,
              fileUrl: result.fileUrl
            }]
          })
        } catch (error) {
          console.error('Error uploading voice message:', error)
        } finally {
          setIsUploading(false)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      setAttachments(prev => [...prev, {
        filename: result.filename,
        fileType: result.fileType,
        fileSize: result.fileSize,
        fileUrl: result.fileUrl
      }])
    } catch (error) {
      console.error('Error uploading file:', error)
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

  const updatePollOption = (index: number, value: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removePollOption = (index: number) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 truncate max-w-32">
                {attachment.filename}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Poll Form */}
      {showPollForm && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Create Poll</h3>
          <Input
            placeholder="Poll question"
            value={pollData.question}
            onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
            className="mb-3"
          />
          {pollData.options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
              />
              {pollData.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePollOption(index)}
                  className="h-10 w-10 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={addPollOption}>
              Add Option
            </Button>
            <Input
              type="datetime-local"
              placeholder="Expires at (optional)"
              value={pollData.expiresAt}
              onChange={(e) => setPollData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPollForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!pollData.question.trim() || pollData.options.filter(opt => opt.trim()).length < 2}
            >
              Create Poll
            </Button>
          </div>
        </div>
      )}

      {/* Event Form */}
      {showEventForm && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Create Event</h3>
          <Input
            placeholder="Event title"
            value={eventData.title}
            onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
            className="mb-3"
            required
          />
          <Textarea
            placeholder="Description (optional)"
            value={eventData.description}
            onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
            className="mb-3"
          />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Input
              type="datetime-local"
              placeholder="Start date"
              value={eventData.startDate}
              onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
              required
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
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEventForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!eventData.title.trim() || !eventData.startDate}
            >
              Create Event
            </Button>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white border rounded-lg shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-5 h-5 mb-1" />
                File
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <Square className="w-5 h-5 mb-1 text-red-500" /> : <Mic className="w-5 h-5 mb-1" />}
                {isRecording ? 'Stop' : 'Voice'}
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => onSendMessage({ type: 'IMAGE', content: 'Image shared' })}>
                <Image className="w-5 h-5 mb-1" alt="Photos" />
                Photos
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => onSendMessage({ type: 'VIDEO', content: 'Video shared' })}>
                <Video className="w-5 h-5 mb-1" />
                Videos
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => setShowPollForm(true)}>
                <BarChart3 className="w-5 h-5 mb-1" />
                Poll
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => setShowEventForm(true)}>
                <Calendar className="w-5 h-5 mb-1" />
                Event
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2" onClick={() => onSendMessage({ content: "AI image requested", type: 'AI_IMAGE' })}>
                <Sparkles className="w-5 h-5 mb-1" />
                AI Images
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => setShowAttachmentMenu(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          disabled={isRecording || isUploading}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-32 resize-none"
            disabled={isRecording || isUploading}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0 && !showPollForm && !showEventForm) || isRecording || isUploading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
