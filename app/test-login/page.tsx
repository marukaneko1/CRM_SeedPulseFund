"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function TestLoginPage() {
  const { data: session, status } = useSession()
  const [result, setResult] = useState<any>(null)

  const handleTestLogin = async () => {
    try {
      const result = await signIn("credentials", {
        email: "admin@demo.com",
        password: "password123",
        redirect: false,
      })
      setResult(result)
      console.log("Test login result:", result)
    } catch (error) {
      console.error("Test login error:", error)
      setResult({ error: error.message })
    }
  }

  if (status === "loading") return <div>Loading...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <p>Status: {status}</p>
          <p>Session: {session ? JSON.stringify(session, null, 2) : "No session"}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleTestLogin}>
            Test Login
          </Button>
          
          {session && (
            <Button onClick={() => signOut()} variant="outline">
              Sign Out
            </Button>
          )}
        </div>

        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold">Login Result:</h3>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

