"use client"

import { useEffect, useState, useCallback } from 'react'
import { reminderAlarmManager, ReminderAlarmSettings, Reminder } from '@/lib/reminder-alarm'

export function useReminderAlarm(reminders: Reminder[]) {
  const [settings, setSettings] = useState<ReminderAlarmSettings>(reminderAlarmManager.getSettings())
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Initialize notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Start monitoring when reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      reminderAlarmManager.startMonitoring(reminders)
      setIsMonitoring(true)
    } else {
      reminderAlarmManager.stopMonitoring()
      setIsMonitoring(false)
    }

    return () => {
      reminderAlarmManager.stopMonitoring()
      setIsMonitoring(false)
    }
  }, [reminders])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ReminderAlarmSettings>) => {
    reminderAlarmManager.updateSettings(newSettings)
    setSettings(reminderAlarmManager.getSettings())
  }, [])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission === 'granted'
  }, [])

  // Test alarm
  const testAlarm = useCallback(() => {
    reminderAlarmManager.testAlarm()
  }, [])

  // Check if notifications are supported
  const isNotificationSupported = useCallback(() => {
    return typeof window !== 'undefined' && 'Notification' in window
  }, [])

  return {
    settings,
    updateSettings,
    isMonitoring,
    notificationPermission,
    requestNotificationPermission,
    testAlarm,
    isNotificationSupported: isNotificationSupported()
  }
}

