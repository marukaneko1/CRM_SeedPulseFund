"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw } from "lucide-react"

export default function ResetTutorialPage() {
  const router = useRouter()

  const handleReset = () => {
    // Clear all tutorial progress
    localStorage.removeItem('onboarding_completed')
    localStorage.setItem('new_user', 'true')
    
    // Redirect to onboarding
    router.push('/dashboard/onboarding')
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-6 h-6" />
              Reset Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Want to see the welcome tutorial again? Click the button below to restart the onboarding experience.
            </p>
            <Button onClick={handleReset} size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
