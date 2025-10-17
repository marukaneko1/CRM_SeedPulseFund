/**
 * Reminder Alarm System
 * Handles browser notifications, alarm sounds, and real-time reminder alerts
 */

export interface ReminderAlarmSettings {
  enableNotifications: boolean
  enableSound: boolean
  alarmSound: 'default' | 'bell' | 'chime' | 'beep'
  volume: number // 0-100
  advanceWarning: number // minutes before reminder
}

export interface Reminder {
  id: string
  title: string
  description?: string
  reminderDate: string
  completed: boolean
  createdAt: string
}

class ReminderAlarmManager {
  private settings: ReminderAlarmSettings
  private audioContext: AudioContext | null = null
  private notificationPermission: NotificationPermission = 'default'
  private checkInterval: NodeJS.Timeout | null = null
  private alreadyAlerted: Set<string> = new Set() // Track which reminders we've already alerted for
  private currentReminders: Reminder[] = [] // Store current reminders

  constructor() {
    this.settings = this.loadSettings()
    this.initializeAudio()
    this.requestNotificationPermission()
  }

  private loadSettings(): ReminderAlarmSettings {
    if (typeof window === 'undefined') {
      return {
        enableNotifications: true,
        enableSound: true,
        alarmSound: 'default',
        volume: 80,
        advanceWarning: 5
      }
    }

    const saved = localStorage.getItem('reminderAlarmSettings')
    if (saved) {
      return { ...this.getDefaultSettings(), ...JSON.parse(saved) }
    }
    return this.getDefaultSettings()
  }

  private getDefaultSettings(): ReminderAlarmSettings {
    return {
      enableNotifications: true,
      enableSound: true,
      alarmSound: 'default',
      volume: 80,
      advanceWarning: 5
    }
  }

  private async initializeAudio() {
    if (typeof window === 'undefined') return
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  private async requestNotificationPermission() {
    if (typeof window === 'undefined') return
    
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission()
    }
  }

  public updateSettings(newSettings: Partial<ReminderAlarmSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    if (typeof window !== 'undefined') {
      localStorage.setItem('reminderAlarmSettings', JSON.stringify(this.settings))
    }
  }

  public getSettings(): ReminderAlarmSettings {
    return { ...this.settings }
  }

  public startMonitoring(reminders: Reminder[]) {
    // Store the reminders
    this.currentReminders = reminders
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    console.log(`🔔 Starting reminder monitoring for ${reminders.length} reminders`)

    // Check every 10 seconds for due reminders (more frequent for testing)
    this.checkInterval = setInterval(() => {
      console.log(`🔔 Checking reminders at ${new Date().toLocaleTimeString()}`)
      this.checkDueReminders(this.currentReminders)
    }, 10000) // Check every 10 seconds

    // Also do an initial check after 5 seconds (gives time for page to load)
    setTimeout(() => {
      console.log('🔔 Initial reminder check after page load')
      this.checkDueReminders(this.currentReminders)
    }, 5000)
  }

  public stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private checkDueReminders(reminders: Reminder[]) {
    const now = new Date()
    const advanceTime = new Date(now.getTime() + (this.settings.advanceWarning * 60000))

    console.log(`🔔 Checking ${reminders.length} reminders`)
    console.log(`🔔 Current time: ${now.toLocaleString()}`)
    console.log(`🔔 Advance warning: ${this.settings.advanceWarning} minutes`)
    console.log(`🔔 Will alert for reminders between now and ${advanceTime.toLocaleString()}`)

    // Clean up alreadyAlerted set - remove reminders that are no longer in the list or are completed
    const currentReminderIds = new Set(reminders.map(r => r.id))
    this.alreadyAlerted.forEach(id => {
      const reminder = reminders.find(r => r.id === id)
      if (!currentReminderIds.has(id) || reminder?.completed) {
        console.log(`🔔 Removing ${id} from already alerted (completed or deleted)`)
        this.alreadyAlerted.delete(id)
      }
    })

    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.reminderDate)
      const timeDiff = reminderDate.getTime() - now.getTime()
      const minutesUntil = Math.floor(timeDiff / 60000)
      const secondsUntil = Math.floor(timeDiff / 1000)

      console.log(`🔔 Reminder "${reminder.title}":`)
      console.log(`   - Due: ${reminderDate.toLocaleString()}`)
      console.log(`   - Current: ${now.toLocaleString()}`)
      console.log(`   - Time difference: ${secondsUntil} seconds (${minutesUntil} minutes)`)
      console.log(`   - Advance warning window: ${this.settings.advanceWarning} minutes`)
      console.log(`   - Completed: ${reminder.completed}`)
      console.log(`   - Already alerted: ${this.alreadyAlerted.has(reminder.id)}`)

      if (reminder.completed) {
        console.log(`   ⏭️  Skipping (completed)`)
        return
      }
      
      if (this.alreadyAlerted.has(reminder.id)) {
        console.log(`   ⏭️  Skipping (already alerted)`)
        return
      }

      // Calculate time windows
      const advanceWarningMs = this.settings.advanceWarning * 60000
      const timeUntilReminder = reminderDate.getTime() - now.getTime()
      
      // Trigger if:
      // 1. Reminder time has passed (timeUntilReminder <= 0)
      // 2. OR reminder is within advance warning window (timeUntilReminder <= advanceWarningMs)
      // 3. AND reminder is not too old (within last 5 minutes)
      const isTooOld = timeUntilReminder < -300000 // 5 minutes ago
      const isWithinWindow = timeUntilReminder <= advanceWarningMs && !isTooOld
      
      console.log(`   - Is within alert window: ${isWithinWindow}`)
      console.log(`   - Is too old (>5min past): ${isTooOld}`)

      if (isWithinWindow) {
        console.log(`   🔔 TRIGGERING ALARM! (${secondsUntil}s ${secondsUntil >= 0 ? 'until' : 'overdue'})`)
        this.triggerAlarm(reminder)
        this.alreadyAlerted.add(reminder.id) // Mark as alerted
      } else if (isTooOld) {
        console.log(`   ⏭️  Skipping (too old - more than 5 minutes past)`)
      } else {
        console.log(`   ⏰ Not due yet (${minutesUntil} minutes, ${secondsUntil} seconds to go)`)
      }
    })
  }

  private async triggerAlarm(reminder: Reminder) {
    console.log('🔔 Reminder alarm triggered:', reminder.title)

    // Show browser notification
    if (this.settings.enableNotifications && this.notificationPermission === 'granted') {
      this.showNotification(reminder)
    }

    // Play alarm sound
    if (this.settings.enableSound) {
      this.playAlarmSound()
    }
  }

  private showNotification(reminder: Reminder) {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const notification = new Notification(`🔔 Reminder: ${reminder.title}`, {
      body: reminder.description || 'Time for your reminder!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `reminder-${reminder.id}`,
      requireInteraction: true,
      // Note: actions are only supported in service worker notifications
      // For regular notifications, we use onclick handler instead
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  }

  private async playAlarmSound() {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Configure sound based on settings
      switch (this.settings.alarmSound) {
        case 'bell':
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5)
          break
        case 'chime':
          oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2) // E5
          oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.4) // G5
          break
        case 'beep':
          oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)
          break
        default:
          oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.3)
      }

      // Set volume
      const volume = this.settings.volume / 100
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.5)

    } catch (error) {
      console.error('Failed to play alarm sound:', error)
    }
  }

  public testAlarm() {
    const testReminder: Reminder = {
      id: `test-${Date.now()}`, // Unique ID for each test to avoid tracking
      title: 'Test Alarm',
      description: 'This is a test of the alarm system',
      reminderDate: new Date().toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    // Don't add test alarms to the alreadyAlerted set
    this.triggerAlarm(testReminder)
  }

  public cleanup() {
    this.stopMonitoring()
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// Export singleton instance
export const reminderAlarmManager = new ReminderAlarmManager()

// Export utility functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window
}

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}
