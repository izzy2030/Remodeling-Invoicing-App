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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">Clients</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your professional relationships and lead history.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="h-14 px-8 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email or project..." 
            className="w-full h-16 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-2xl text-base font-semibold text-slate-900 focus:border-primary focus:bg-white transition-all outline-none"
          />
        </div>
        <button className="h-16 px-8 bg-white border-2 border-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8 hover:border-primary/20 hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 border-2 border-slate-50 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                     {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{client.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Premium Client</p>
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{client.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-primary transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 line-clamp-1">{client.address}</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center" title="Paid Invoices">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center" title="Active Projects">
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
            <div className="col-span-full bg-white rounded-[3rem] border-4 border-dashed border-slate-50 p-20 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Users className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Directory is empty</h3>
                <p className="text-slate-500 font-medium mt-2">Start growing your network by adding your first client.</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="h-14 px-10 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Create First Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-xl md:max-w-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-6 right-8">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 border-b border-slate-50">
                <h2 className="text-3xl font-extrabold text-slate-900 font-outfit">New Client</h2>
                <p className="text-slate-500 font-medium mt-2">Enter the details for your new lead or customer.</p>
              </div>

              <form onSubmit={handleAddClient} className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 ml-1">Full Client Name</label>
                  <input 
                    required
                    type="text" 
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="e.g. Johnathan Miller"
                    className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-600 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="client@email.com"
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-600 ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="+1 (000) 000-0000"
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 ml-1">Project Address</label>
                  <textarea 
                    required
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder="Where is the job site located?"
                    className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-16 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
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
