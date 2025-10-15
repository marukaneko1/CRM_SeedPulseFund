"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, AlertCircle, Database } from "lucide-react"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSeed = async () => {
    setStatus("loading")
    setMessage("Setting up database...")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Database setup complete!")
      } else {
        if (data.status === 'already_seeded') {
          setStatus("success")
          setMessage("Database is already set up!")
        } else {
          setStatus("error")
          setMessage(data.message || "Setup failed")
        }
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to server")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <CardTitle className="text-2xl">Database Setup</CardTitle>
          </div>
          <p className="text-gray-600">
            Initialize your CRM database with demo data
          </p>
        </CardHeader>
        <CardContent>
          {status === "idle" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to set up your database with:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Admin user account</li>
                <li>Demo companies</li>
                <li>Sample channels</li>
              </ul>
              <Button onClick={handleSeed} className="w-full">
                Set Up Database
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-2">Login Credentials:</p>
                <p className="text-sm text-blue-800">Email: admin@demo.com</p>
                <p className="text-sm text-blue-800">Password: password123</p>
              </div>

              <a href="/auth/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </a>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => setStatus("idle")} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
