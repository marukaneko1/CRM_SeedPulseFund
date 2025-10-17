"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Building, Edit2, Trash2 } from "lucide-react"
import { ContactForm } from "@/components/forms/contact-form"
import { BulkActions } from "@/components/bulk-actions"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  linkedin?: string
  twitter?: string
  notes?: string
  companyId?: string
  company?: {
    id: string
    name: string
  }
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>()

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchContacts()
    }
  }, [session])

  const handleAddContact = () => {
    setSelectedContact(undefined)
    setShowForm(true)
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowForm(true)
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    
    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  const handleBulkImport = async (importedContacts: any[]) => {
    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: importedContacts }),
      })

      if (response.ok) {
        await fetchContacts()
      } else {
        throw new Error('Import failed')
      }
    } catch (error) {
      console.error('Error importing contacts:', error)
      throw error
    }
  }

  const exportColumns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'position', label: 'Position' },
    { key: 'company.name', label: 'Company' },
  ]

  const filteredContacts = contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 overflow-y-auto max-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contacts</h1>
          <p className="text-gray-600">{contacts.length} contacts in your network</p>
        </div>
        <div className="flex gap-2">
          <BulkActions
            data={contacts}
            columns={exportColumns}
            entityName="contacts"
            onImport={handleBulkImport}
          />
          <Button onClick={handleAddContact}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
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

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      ) : filteredContacts.length > 0 ? (
        /* Contacts Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => {
            const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`
            const fullName = `${contact.firstName} ${contact.lastName}`
            
            return (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">{fullName}</CardTitle>
                      <p className="text-sm text-gray-600 truncate">{contact.position || 'No position'}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditContact(contact)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteContact(contact.id)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{contact.company.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.linkedin && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 flex-shrink-0">in</span>
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {contact.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-2">{contact.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No contacts match your search' : 'Add your first contact to get started'}
            </p>
            <Button onClick={handleAddContact}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          contact={selectedContact}
          onClose={() => setShowForm(false)}
          onSuccess={() => fetchContacts()}
        />
      )}
    </div>
  )
}


