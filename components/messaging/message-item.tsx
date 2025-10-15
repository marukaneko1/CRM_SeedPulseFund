"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Download, 
  Calendar, 
  MapPin, 
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface MessageItemProps {
  message: {
    id: string
    content?: string
    type: string
    sender: {
      id: string
      name: string | null
      avatar?: string
    }
    attachments?: Array<{
      id: string
      filename: string
      fileType: string
      fileUrl: string
    }>
    poll?: {
      id: string
      question: string
      options: Array<{
        id: string
        text: string
        votes: Array<{
          user: {
            id: string
            name: string
          }
        }>
      }>
      expiresAt?: string
    }
    event?: {
      id: string
      title: string
      description?: string
      startDate: string
      endDate?: string
      location?: string
      attendees: Array<{
        id: string
        status: string
        user: {
          id: string
          name: string
        }
      }>
    }
    createdAt: string
  }
  onVotePoll?: (pollId: string, optionId: string) => void
  onRespondToEvent?: (eventId: string, status: string) => void
}

export function MessageItem({ message, onVotePoll, onRespondToEvent }: MessageItemProps) {
  const { data: session } = useSession()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const isOwnMessage = session?.user?.id === message.sender.id
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleVoicePlay = () => {
    if (message.type === 'VOICE' && message.attachments?.[0]) {
      if (isPlaying && audioElement) {
        audioElement.pause()
        setIsPlaying(false)
        setAudioElement(null)
      } else {
        const audio = new Audio(message.attachments[0].fileUrl)
        audio.play()
        setAudioElement(audio)
        setIsPlaying(true)
        
        audio.onended = () => {
          setIsPlaying(false)
          setAudioElement(null)
        }
      }
    }
  }

  const handlePollVote = (optionId: string) => {
    if (message.poll && onVotePoll) {
      onVotePoll(message.poll.id, optionId)
    }
  }

  const handleEventResponse = (status: string) => {
    if (message.event && onRespondToEvent) {
      onRespondToEvent(message.event.id, status)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      default:
        return '📄'
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'TEXT':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )

      case 'VOICE':
        const voiceUrl = message.attachments?.[0]?.fileUrl
        console.log('Voice message URL:', voiceUrl)
        
        return (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoicePlay}
                className="flex items-center gap-2 bg-white hover:bg-blue-100"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <span className="text-sm text-gray-600">
                {message.attachments?.[0]?.filename || 'Voice message'}
              </span>
            </div>
            {/* Built-in audio controls as backup */}
            {voiceUrl && (
              <audio 
                controls 
                className="w-full h-10"
                preload="metadata"
              >
                <source src={voiceUrl} type="audio/webm" />
                <source src={voiceUrl} type="audio/mp4" />
                <source src={voiceUrl} type="audio/wav" />
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        )

      case 'FILE':
      case 'IMAGE':
      case 'VIDEO':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-lg">{getFileIcon(attachment.fileType)}</span>
                <div className="flex-1">
                  <p className="font-medium">{attachment.filename}</p>
                  <p className="text-sm text-gray-500">{attachment.fileType}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={attachment.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
            {message.content && (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}
          </div>
        )

      case 'POLL':
        if (!message.poll) return null
        return (
          <div className="space-y-3">
            <h4 className="font-semibold">{message.poll.question}</h4>
            <div className="space-y-2">
              {message.poll.options.map((option) => {
                const totalVotes = message.poll?.options.reduce((sum, opt) => sum + opt.votes.length, 0) || 0
                const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0
                const hasVoted = option.votes.some(vote => vote.user.id === session?.user?.id)
                
                return (
                  <div key={option.id} className="space-y-1">
                    <Button
                      variant={hasVoted ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handlePollVote(option.id)}
                    >
                      {option.text}
                    </Button>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{option.votes.length} vote{option.votes.length !== 1 ? 's' : ''}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {message.poll.expiresAt && (
              <p className="text-sm text-gray-500">
                Expires: {new Date(message.poll.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        )

      case 'EVENT':
        if (!message.event) return null
        return (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">{message.event.title}</h4>
            
            {message.event.description && (
              <p className="text-gray-700">{message.event.description}</p>
            )}
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>
                  {new Date(message.event.startDate).toLocaleString()}
                  {message.event.endDate && ` - ${new Date(message.event.endDate).toLocaleString()}`}
                </span>
              </div>
              
              {message.event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{message.event.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEventResponse('ACCEPTED')}
                className="flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEventResponse('DECLINED')}
                className="flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEventResponse('PENDING')}
                className="flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                Maybe
              </Button>
            </div>
            
            {message.event.attendees.length > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Attendees</span>
                </div>
                <div className="space-y-1">
                  {message.event.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-2 text-sm">
                      <span>{attendee.user.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        attendee.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        attendee.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendee.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>{message.content}</div>
    }
  }

  return (
    <div className={`flex gap-3 p-3 hover:bg-gray-50 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isOwnMessage ? 'order-2' : ''}`}>
        {message.sender.avatar ? (
          <img 
            src={message.sender.avatar} 
            alt={message.sender.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          (message.sender.name || 'U').charAt(0).toUpperCase()
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{message.sender.name || 'Unknown User'}</span>
          <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
        </div>
        
        <div className={`rounded-lg p-3 ${
          isOwnMessage 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200'
        }`}>
          {renderMessageContent()}
        </div>
      </div>
    </div>
  )
}
