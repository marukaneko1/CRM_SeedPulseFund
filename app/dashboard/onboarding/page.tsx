"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Home, 
  Users, 
  Briefcase, 
  Mail, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from "lucide-react"

const features = [
  {
    icon: Home,
    title: "Dashboard",
    description: "Get a quick overview of your deals, contacts, and activities. Track your pipeline and see what needs attention.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Users,
    title: "Contacts & Companies",
    description: "Manage all your relationships in one place. Add contacts, track interactions, and build your network.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Briefcase,
    title: "Deal Pipeline",
    description: "Track investment opportunities through each stage. Monitor deal values, probabilities, and expected close dates.",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Mail,
    title: "Email Management",
    description: "Send emails, track opens and clicks, run campaigns, and manage follow-ups all in one place.",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Calendar,
    title: "Calendar & Meetings",
    description: "Schedule meetings, sync with Google Calendar and Calendly. Never miss an important call or event.",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: MessageSquare,
    title: "Team Messaging",
    description: "Chat with your team in real-time. Create channels for different topics and keep everyone aligned.",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Monitor your portfolio companies' performance. Track metrics, ROI, and stay updated on growth.",
    color: "bg-pink-100 text-pink-600"
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    router.push('/dashboard')
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Skip Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to VS CRM! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Let's take a quick tour of your new platform
            </p>
          </div>
          <Button onClick={handleSkip} variant="outline" size="lg">
            Skip Tutorial
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {features.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-blue-600 w-12'
                    : 'bg-gray-300 w-8'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            {currentStep + 1} of {features.length}
          </p>
        </div>

        {/* Feature Showcase */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <div className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full ${features[currentStep].color} flex items-center justify-center mb-6`}>
                {(() => {
                  const Icon = features[currentStep].icon
                  return <Icon className="w-10 h-10" />
                })()}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {features[currentStep].title}
              </h2>
              
              <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                {features[currentStep].description}
              </p>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`p-3 rounded-lg transition-all ${
                  index === currentStep
                    ? 'bg-white shadow-lg ring-2 ring-blue-600'
                    : index <= currentStep
                    ? 'bg-white/60'
                    : 'bg-white/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-1`}>
                  {index <= currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">
                  {feature.title.split(' ')[0]}
                </p>
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button onClick={handleSkip} variant="ghost">
            Skip Tutorial
          </Button>

          <Button
            onClick={() => {
              if (currentStep < features.length - 1) {
                setCurrentStep(currentStep + 1)
              } else {
                handleComplete()
              }
            }}
            size="lg"
          >
            {currentStep < features.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Start Using CRM
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
