"use client"

import { useState, useEffect } from "react"

export function useTutorial(tutorialKey: string) {
  const [showTutorial, setShowTutorial] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed this tutorial
    const completed = localStorage.getItem(`tutorial_${tutorialKey}_completed`)
    setShowTutorial(!completed)
    setIsLoading(false)
  }, [tutorialKey])

  const completeTutorial = () => {
    localStorage.setItem(`tutorial_${tutorialKey}_completed`, 'true')
    setShowTutorial(false)
  }

  const skipTutorial = () => {
    localStorage.setItem(`tutorial_${tutorialKey}_completed`, 'true')
    setShowTutorial(false)
  }

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial_${tutorialKey}_completed`)
    setShowTutorial(true)
  }

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  }
}
