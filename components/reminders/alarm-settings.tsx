"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Volume2, Clock, TestTube } from 'lucide-react'
import { ReminderAlarmSettings } from '@/lib/reminder-alarm'

interface AlarmSettingsProps {
  settings: ReminderAlarmSettings
  onSettingsChange: (settings: Partial<ReminderAlarmSettings>) => void
  onTestAlarm: () => void
  notificationPermission: NotificationPermission
  onRequestPermission: () => Promise<boolean>
  isNotificationSupported: boolean
}

export function AlarmSettings({
  settings,
  onSettingsChange,
  onTestAlarm,
  notificationPermission,
  onRequestPermission,
  isNotificationSupported
}: AlarmSettingsProps) {
  const [isTesting, setIsTesting] = useState(false)

  const handleTestAlarm = async () => {
    setIsTesting(true)
    onTestAlarm()
    setTimeout(() => setIsTesting(false), 1000)
  }

  const handleRequestPermission = async () => {
    const granted = await onRequestPermission()
    if (granted) {
      // Show success message or toast
      console.log('Notification permission granted!')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alarm Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be notified about reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Browser Notifications</Label>
              <p className="text-sm text-gray-500">
                Show desktop notifications for reminders
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => 
                onSettingsChange({ enableNotifications: checked })
              }
              disabled={!isNotificationSupported || notificationPermission === 'denied'}
            />
          </div>

          {!isNotificationSupported && (
            <p className="text-sm text-amber-600">
              Browser notifications are not supported in this browser
            </p>
          )}

          {isNotificationSupported && notificationPermission === 'default' && (
            <div className="space-y-2">
              <p className="text-sm text-blue-600">
                Click to enable browser notifications
              </p>
              <Button onClick={handleRequestPermission} size="sm" variant="outline">
                Enable Notifications
              </Button>
            </div>
          )}

          {notificationPermission === 'denied' && (
            <p className="text-sm text-red-600">
              Notification permission denied. Please enable it in your browser settings.
            </p>
          )}
        </div>

        {/* Sound Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Alarm Sound</Label>
              <p className="text-sm text-gray-500">
                Play sound when reminders are due
              </p>
            </div>
            <Switch
              id="sound"
              checked={settings.enableSound}
              onCheckedChange={(checked) => 
                onSettingsChange({ enableSound: checked })
              }
            />
          </div>

          {settings.enableSound && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alarm-sound">Sound Type</Label>
                <Select
                  value={settings.alarmSound}
                  onValueChange={(value: 'default' | 'bell' | 'chime' | 'beep') => 
                    onSettingsChange({ alarmSound: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="beep">Beep</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume: {settings.volume}%</Label>
                <Input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => 
                    onSettingsChange({ volume: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Advance Warning */}
        <div className="space-y-2">
          <Label htmlFor="advance-warning">Advance Warning (minutes)</Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Input
              id="advance-warning"
              type="number"
              min="0"
              max="60"
              value={settings.advanceWarning}
              onChange={(e) => 
                onSettingsChange({ advanceWarning: parseInt(e.target.value) || 0 })
              }
              className="w-20"
            />
            <span className="text-sm text-gray-500">
              minutes before reminder time
            </span>
          </div>
        </div>

        {/* Test Alarm */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Test Alarm</Label>
              <p className="text-sm text-gray-500">
                Test your alarm settings
              </p>
            </div>
            <Button
              onClick={handleTestAlarm}
              disabled={isTesting}
              variant="outline"
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test Alarm'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

