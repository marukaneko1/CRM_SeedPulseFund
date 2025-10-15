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
  const imageInputRef = useRef<HTMLInputElement>(null)

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
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      console.log('Microphone access granted, starting recording...')
      
      // Check browser support for audio formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav'
      
      console.log('Using MIME type:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
          console.log('Audio chunk received, size:', event.data.size)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...')
        console.log('Total chunks:', audioChunks.length)
        
        const audioBlob = new Blob(audioChunks, { type: mimeType })
        console.log('Audio blob created, size:', audioBlob.size, 'bytes')
        
        if (audioBlob.size === 0) {
          alert('Recording failed: No audio data captured')
          stream.getTracks().forEach(track => track.stop())
          return
        }

        const timestamp = Date.now()
        const extension = mimeType.split('/')[1]
        const audioFile = new File([audioBlob], `voice-${timestamp}.${extension}`, { type: mimeType })

        console.log('Voice file created:', {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type
        })

        // Upload voice message
        const formData = new FormData()
        formData.append('file', audioFile)

        setIsUploading(true)
        try {
          console.log('Uploading voice message to /api/upload...')
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          console.log('Upload response:', { status: response.status, result })

          if (response.ok) {
            console.log('Voice message uploaded successfully, sending message...')
            onSendMessage({
              type: 'VOICE',
              content: 'Voice message',
              attachments: [result]
            })
            console.log('Voice message sent!')
          } else {
            console.error('Upload failed with status:', response.status, result)
            alert('Failed to upload voice message: ' + (result.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Error uploading voice message:', error)
          alert('Error uploading voice message. Please check your connection and try again.')
        } finally {
          setIsUploading(false)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('Recording error occurred. Please try again.')
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      console.log('Recording started successfully')

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error: any) {
      console.error('Error accessing microphone:', error)
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access to record voice messages.')
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.')
      } else {
        alert('Error accessing microphone: ' + error.message)
      }
    }
  }

  const stopRecording = () => {
    console.log('Stop recording button clicked')
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping media recorder...')
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      console.log('Recording stopped')
    } else {
      console.warn('No active recording to stop')
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
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
              <div className="flex gap-4 justify-evenly items-center">
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FileText className="w-7 h-7 mb-2 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">File</span>
                </button>
                
                <button
                  onClick={() => {
                    imageInputRef.current?.click()
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Image className="w-7 h-7 mb-2 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Photo</span>
                </button>
                
                <button
                  onClick={() => {
                    imageInputRef.current?.click()
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Video className="w-7 h-7 mb-2 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Video</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowPollForm(true)
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-7 h-7 mb-2 text-orange-600" />
                  <span className="text-xs font-medium text-gray-700">Poll</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowEventForm(true)
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Calendar className="w-7 h-7 mb-2 text-red-600" />
                  <span className="text-xs font-medium text-gray-700">Event</span>
                </button>
                
                <button
                  onClick={() => {
                    alert('AI Image generation coming soon!')
                    setShowAttachmentMenu(false)
                  }}
                  className="flex flex-col items-center justify-center min-w-[70px] p-3 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Sparkles className="w-7 h-7 mb-2 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-700">AI</span>
                </button>
              </div>
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

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
