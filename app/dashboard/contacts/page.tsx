"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Building } from "lucide-react"

// Demo contacts only for admin
const demoContacts = [
  {
    id: "1",
    name: "John Doe",
    email: "john@startupx.com",
    phone: "+1 (555) 123-4567",
    company: "Startup X",
    position: "CEO",
    avatar: "JD",
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@innovatelab.io",
    phone: "+1 (555) 234-5678",
    company: "InnovateLab",
    position: "Founder",
    avatar: "SS",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@techventures.com",
    phone: "+1 (555) 345-6789",
    company: "TechVentures",
    position: "CTO",
    avatar: "MJ",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily@growthco.com",
    phone: "+1 (555) 456-7890",
    company: "GrowthCo",
    position: "VP Product",
    avatar: "EC",
  },
]

export default function ContactsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.email === 'admin@demo.com'
  
  const [searchQuery, setSearchQuery] = useState("")
  
  const contacts = isAdmin ? demoContacts : []

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your contacts and relationships</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                  {contact.avatar}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{contact.name}</CardTitle>
                  <p className="text-sm text-gray-600">{contact.position}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-400" />
                <span>{contact.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{contact.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


