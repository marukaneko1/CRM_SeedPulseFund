import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, Mail, MessageSquare, Users, Briefcase } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Venture Studio CRM
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            All-in-one platform to manage your deals, contacts, and portfolio
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <MessageSquare className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Team Messaging</CardTitle>
              <CardDescription>
                Built-in real-time chat for seamless team communication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>
                Integrate with Google Calendar and Calendly for scheduling
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Email Management</CardTitle>
              <CardDescription>
                Mass emails, follow-ups, and tracking all in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="w-10 h-10 text-orange-600 mb-2" />
              <CardTitle>Deal Pipeline</CardTitle>
              <CardDescription>
                Visual pipeline to track deals from lead to close
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-red-600 mb-2" />
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Centralized database for all your contacts and companies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-indigo-600 mb-2" />
              <CardTitle>Portfolio Analytics</CardTitle>
              <CardDescription>
                Track portfolio performance with real-time metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Everything you need in one platform
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Stop juggling multiple tools. Manage your entire venture studio from one place.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

