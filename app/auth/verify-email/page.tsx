"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setStatus("error")
        setMessage("Invalid verification link")
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Your email has been verified successfully!")
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/auth/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.message || "Verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VS CRM
          </h1>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button onClick={() => router.push("/auth/login")}>
                  Go to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

