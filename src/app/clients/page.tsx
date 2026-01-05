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
  Building2
} from 'lucide-react'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name')
    if (data) setClients(data)
    setLoading(false)
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get current user for RLS
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('You must be logged in to add clients')
      return
    }

    const { error } = await supabase.from('clients').insert([{
      ...newClient,
      user_id: user.id
    }])

    if (!error) {
      setShowModal(false)
      setNewClient({ name: '', email: '', phone: '', address: '' })
      fetchClients()
    } else {
      console.error('Error adding client:', error)
      alert('Failed to add client')
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
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary h-14 px-8 text-sm group copper-glow"
        >
          <UserPlus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or location..."
            className="input-field pl-11"
          />
        </div>
        <button className="h-14 px-6 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-all flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filter
        </button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">Loading Clients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="card-premium p-6 group relative animate-fade-up"
              style={{ animationDelay: `${0.15 + (index * 0.05)}s` }}
            >
              {/* More options button */}
              <button className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-secondary text-muted-foreground rounded-lg hover:bg-foreground hover:text-background transition-all opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-border flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:from-primary/10 group-hover:to-accent/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    Premium Client
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{client.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground line-clamp-1">{client.address}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-5 border-t border-border flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center" title="Paid Invoices">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center" title="Active Projects">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/5 rounded-lg transition-all group/btn">
                  View Profile
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {clients.length === 0 && (
            <div className="col-span-full bg-card rounded-[2rem] border-2 border-dashed border-border p-16 text-center space-y-6 animate-fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto border border-border">
                <Users className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground font-syne">No clients yet</h3>
                <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
                  Start building your client network by adding your first customer.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary px-8 h-14 group"
              >
                Add Your First Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="bg-card rounded-[2rem] w-full max-w-xl border border-border shadow-2xl relative overflow-hidden animate-scale-in"
          >
            {/* Decorative gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-secondary text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-8 pb-6 border-b border-border relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground font-syne">New Client</h2>
              <p className="text-muted-foreground font-medium mt-1">Add a new customer to your directory.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddClient} className="p-8 space-y-5">
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
                    className="input-field pl-11"
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
                      className="input-field pl-11"
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
                      className="input-field pl-11"
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
                    className="input-field pl-11 py-3 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-14 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 btn-primary h-14 group"
                >
                  Create Client
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
