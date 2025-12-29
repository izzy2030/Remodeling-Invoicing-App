'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Send, 
  Zap, 
  Plus, 
  Sparkles,
  FileText,
  User as UserIcon,
  ArrowLeft,
  Mic
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIInvoicePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchData = async () => {
    const [clientsRes, userRes] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.auth.getUser()
    ])
    if (clientsRes.data) setClients(clientsRes.data)
    if (userRes.data.user) setUser(userRes.data.user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          clients
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        assistantMessage += chunk

        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage
          }
          return newMessages
        })
      }

      // Check if AI returned invoice data
      const invoiceMatch = assistantMessage.match(/```invoice_data\s*([\s\S]*?)```/)
      if (invoiceMatch) {
        try {
          const invoiceData = JSON.parse(invoiceMatch[1])
          // Store in sessionStorage and redirect
          sessionStorage.setItem('ai_invoice_data', JSON.stringify(invoiceData))
          setTimeout(() => {
            router.push('/invoices/new?from=ai')
          }, 1500)
        } catch (e) {
          console.error('Failed to parse invoice data', e)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(prev => prev + (prev ? ' ' : '') + transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const quickActions = [
    { label: 'Kitchen Remodel', icon: Sparkles },
    { label: 'Bathroom Renovation', icon: Sparkles },
    { label: 'New Client Invoice', icon: FileText },
  ]

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <button 
            onClick={() => router.push('/invoices')} 
            className="p-2 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-2 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Invoices</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg border-2 border-slate-900">
              <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
            </div>
            <span className="font-bold text-slate-900">AI Invoice</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-violet-500 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-500">Hi {firstName}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light text-slate-800 text-center leading-tight max-w-2xl">
              What invoice can I help you <br className="hidden md:block" />create today?
            </h1>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(`Create an invoice for a ${action.label.toLowerCase()}`)}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <action.icon className="w-4 h-4 text-slate-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 py-8 space-y-6 overflow-y-auto">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-md'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm'
                  }`}
                >
                  {message.content.includes('```invoice_data') ? (
                    <div className="space-y-3">
                      <p>I've prepared your invoice data. Redirecting you to the invoice form...</p>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Creating invoice...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 bg-[#f8f9fa] pt-4 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
           <form onSubmit={handleSubmit} className="relative">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden focus-within:border-slate-300 focus-within:shadow-xl transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the work you did..."
                rows={1}
                className="w-full px-6 py-4 text-base text-slate-900 placeholder:text-slate-400 outline-none resize-none bg-transparent"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleMicClick}
                  className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-slate-900 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-slate-400 mt-3">
            AI can make mistakes. Review invoice details before sending.
          </p>
        </div>
      </footer>
    </div>
  )
}
