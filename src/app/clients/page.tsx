'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Search,
  MoreVertical,
  Loader2,
  Filter,
  ArrowRight,
  X,
  CreditCard,
  Briefcase,
  UserPlus,
  Building2,
  Trash,
  Edit,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/Dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name')
    if (data) setClients(data)
    setLoading(false)
  }

  const openEditModal = (client: any) => {
    setEditingClient(client)
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setNewClient({ name: '', email: '', phone: '', address: '' })
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (editingClient) {
      // Update existing client
      const { error } = await supabase
        .from('clients')
        .update(newClient)
        .eq('id', editingClient.id)

      if (!error) {
        closeModal()
        fetchClients()
      } else {
        console.error('Error updating client:', error)
        alert('Error updating client')
      }
    } else {
      // Add new client
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to add clients')
        setSubmitting(false)
        return
      }

      const { error } = await supabase.from('clients').insert([{
        ...newClient,
        user_id: user.id
      }])

      if (!error) {
        closeModal()
        fetchClients()
      } else {
        console.error('Error adding client:', error)
      }
    }
    setSubmitting(false)
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      return
    }

    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client')
    } else {
      fetchClients()
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Client Management</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-syne tracking-tight">Clients</h1>
          <p className="text-muted-foreground font-medium mt-2">Manage your professional relationships and project history.</p>
        </div>

        <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8" onClick={() => { setEditingClient(null); setNewClient({ name: '', email: '', phone: '', address: '' }) }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'New Client'}</DialogTitle>
              <DialogDescription>{editingClient ? 'Update client details below.' : 'Add a new customer to your directory.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Full Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="e.g. John Miller"
                    className="input-field !pl-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      required
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="client@email.com"
                      className="input-field !pl-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+1 (000) 000-0000"
                      className="input-field !pl-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Project Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <textarea
                    required
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Where is the job site located?"
                    className="input-field !pl-11 py-3 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (editingClient ? 'Saving...' : 'Creating...') : (editingClient ? 'Save Changes' : 'Create Client')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or location..."
            className="input-field !pl-11 h-14"
          />
        </div>
        <Button variant="outline" className="h-14 px-6 font-semibold">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          Filter
        </Button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-md blur-xl" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-md">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">Loading Clients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="card-premium p-6 group animate-fade-up"
              style={{ animationDelay: `${0.15 + (index * 0.05)}s` }}
            >
              {/* Header with Avatar & Actions */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 rounded-md border-2 border-transparent">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-secondary to-muted">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      {client.name}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 bg-secondary px-2 py-0.5 rounded inline-block">
                      Legacy Client
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Client Options</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEditModal(client)}>
                      <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`mailto:${client.email}`)}>
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{client.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-foreground line-clamp-1 cursor-help">{client.address}</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs normal-case">{client.address}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-5 border-t border-border/60 flex items-center justify-between">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => window.open(`mailto:${client.email}`)}
                          className="w-9 h-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          <CreditCard className="w-4.5 h-4.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Send Payment Link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => openEditModal(client)}
                          className="w-9 h-9 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          <Briefcase className="w-4.5 h-4.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Client</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(client)}
                  className="font-bold text-primary uppercase tracking-widest text-[10px] h-9"
                >
                  View Profile
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {clients.length === 0 && (
            <div className="col-span-full bg-card rounded-lg border-2 border-dashed border-border p-16 text-center space-y-6 animate-fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-md flex items-center justify-center mx-auto border border-border">
                <Users className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground font-syne">No clients yet</h3>
                <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
                  Start building your client network by adding your first customer.
                </p>
              </div>
              <Button onClick={() => setShowModal(true)} size="lg" className="rounded-md px-12 h-14">
                Add Your First Client
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
