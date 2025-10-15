"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

export function useSimpleTyping() {
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = useCallback((value: string) => {
    if (value.trim().length > 0) {
      setIsTyping(true)
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
    } else {
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    isTyping,
    handleInputChange,
    stopTyping
  }
}
