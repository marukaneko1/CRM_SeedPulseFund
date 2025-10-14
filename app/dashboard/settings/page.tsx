"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Bell, Lock, Mail, CreditCard, Users as UsersIcon } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "email", label: "Email", icon: Mail },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "team", label: "Team", icon: UsersIcon },
  ]

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Admin User" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="admin@demo.com" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="ADMIN" className="mt-1" disabled />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" defaultValue="SeedPulse Fund" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1" />
                      </div>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email updates about your activity</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium">Deal Updates</p>
                          <p className="text-sm text-gray-500">Notifications when deals change status</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium">Meeting Reminders</p>
                          <p className="text-sm text-gray-500">Get reminders before scheduled meetings</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium">Weekly Digest</p>
                          <p className="text-sm text-gray-500">Summary of your activity each week</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600" />
                      </div>
                      <Button>Save Preferences</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" className="mt-1" />
                      </div>
                      <Button>Update Password</Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                      <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Email Integration</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">Connect your email to sync conversations and track communications</p>
                      </div>
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input id="smtp-host" placeholder="smtp.gmail.com" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input id="smtp-port" defaultValue="587" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="smtp-user">SMTP Username</Label>
                        <Input id="smtp-user" type="email" placeholder="your-email@example.com" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input id="smtp-password" type="password" className="mt-1" />
                      </div>
                      <Button>Connect Email</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Enterprise Plan</h3>
                          <p className="text-gray-600 mt-1">Full access to all features</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">$499</p>
                          <p className="text-gray-600">/month</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <p className="font-medium">Next billing date</p>
                        <p className="text-gray-600">November 14, 2025</p>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <p className="font-medium">Payment method</p>
                        <p className="text-gray-600">•••• •••• •••• 4242</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">Update Payment Method</Button>
                        <Button variant="outline">View Invoices</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Team Members</h2>
                      <Button>Invite Team Member</Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            A
                          </div>
                          <div>
                            <p className="font-medium">Admin User</p>
                            <p className="text-sm text-gray-500">admin@demo.com</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          Admin
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            S
                          </div>
                          <div>
                            <p className="font-medium">Sarah Johnson</p>
                            <p className="text-sm text-gray-500">sarah@demo.com</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Member
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}