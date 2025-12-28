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
  Loader2
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
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Client Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your customer contact details and view their history.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-bold text-slate-400">
                       {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{client.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Customer since 2025</p>
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>{client.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                    <p className="line-clamp-1">{client.address}</p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Projects: 0</span>
                  <button className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group/btn transition-all">
                    View Portfolio
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
                <p className="text-slate-500 text-sm mt-1">Fill in the professional details for your client.</p>
              </div>
              <form onSubmit={handleAddClient} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                    <input 
                      required
                      type="email" 
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</label>
                    <input 
                      type="text" 
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Complete Address</label>
                  <textarea 
                    required
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder="123 Builder St, Construction City, ST 12345"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                  >
                    Save Client
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
