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
  ChevronRight,
  Loader2,
  Filter,
  ArrowRight,
  X,
  CreditCard,
  Briefcase
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
    const { error } = await supabase.from('clients').insert([newClient])
    if (!error) {
      setShowModal(false)
      setNewClient({ name: '', email: '', phone: '', address: '' })
      fetchClients()
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-outfit">Clients</h1>
          <p className="text-muted-foreground font-medium mt-2">Manage your professional relationships and lead history.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="h-14 px-8 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email or project..." 
            className="w-full h-16 pl-14 pr-6 bg-card border border-border rounded-2xl text-base font-semibold text-foreground focus:border-primary transition-all outline-none"
          />
        </div>
        <button className="h-16 px-8 bg-card border border-border text-foreground font-bold rounded-2xl hover:bg-secondary transition-all flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          Filter
        </button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading Directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="card-premium p-8 group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <button className="w-10 h-10 flex items-center justify-center bg-secondary text-muted-foreground rounded-xl hover:bg-foreground hover:text-background transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-secondary border border-border flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500">
                     {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{client.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">Premium Client</p>
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{client.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{client.address}</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center" title="Paid Invoices">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center" title="Active Projects">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <button className="h-10 px-4 text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 rounded-xl transition-all group/btn">
                    View Profile
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          ))}

          {clients.length === 0 && (
            <div className="col-span-full bg-card/50 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-border p-20 text-center space-y-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                <Users className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Directory is empty</h3>
                <p className="text-muted-foreground font-medium mt-2">Start growing your network by adding your first client.</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="h-14 px-10 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/10 active:scale-95"
              >
                Create First Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-card rounded-[3rem] w-full max-w-xl md:max-w-3xl border border-border shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-6 right-8">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 flex items-center justify-center bg-secondary text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 border-b border-border">
                <h2 className="text-3xl font-extrabold text-foreground font-outfit">New Client</h2>
                <p className="text-muted-foreground font-medium mt-2">Enter the details for your new lead or customer.</p>
              </div>

              <form onSubmit={handleAddClient} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Full Client Name</label>
                  <input 
                    required
                    type="text" 
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="e.g. Johnathan Miller"
                    className="w-full h-16 px-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="client@email.com"
                      className="w-full h-16 px-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="+1 (000) 000-0000"
                      className="w-full h-16 px-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Project Address</label>
                  <textarea 
                    required
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder="Where is the job site located?"
                    className="w-full p-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-16 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                  >
                    Create Client
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
