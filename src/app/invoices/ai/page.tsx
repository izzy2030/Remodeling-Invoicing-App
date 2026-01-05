'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Send,
  Hammer,
  Sparkles,
  FileText,
  User as UserIcon,
  ArrowLeft,
  Mic,
  Wrench,
  Home,
  Bath
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
    { label: 'Kitchen Remodel', icon: Home, prompt: 'Create an invoice for a kitchen remodel' },
    { label: 'Bathroom Renovation', icon: Bath, prompt: 'Create an invoice for a bathroom renovation' },
    { label: 'General Repairs', icon: Wrench, prompt: 'Create an invoice for general home repairs' },
  ]

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => router.push('/invoices')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors flex items-center gap-2 text-muted-foreground group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground font-syne">AI Invoice</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-10 animate-fade-up">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-2xl shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Greeting */}
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">Hi {firstName} 👋</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-syne tracking-tight leading-tight">
                What invoice can I help
                <br />
                <span className="text-gradient">you create today?</span>
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.prompt)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-transparent border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary hover:border-primary/20 transition-all group"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Tip */}
            <p className="text-sm text-muted-foreground max-w-md text-center">
              Describe the work you've completed and I'll generate a professional invoice for you.
            </p>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 py-8 space-y-5 overflow-y-auto">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-fade-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20'
                      : 'bg-secondary/30 backdrop-blur-sm text-foreground rounded-bl-md'
                  }`}
                >
                  {message.content.includes('```invoice_data') ? (
                    <div className="space-y-3">
                      <p className="font-medium">Perfect! I've prepared your invoice data.</p>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold">Redirecting to invoice form...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 animate-fade-up">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-secondary/30 backdrop-blur-sm px-5 py-4 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-violet-500/50 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 pt-6 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden focus-within:border-primary/50 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the work you completed..."
                rows={1}
                className="w-full px-5 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none bg-transparent font-medium"
                style={{ minHeight: '56px', maxHeight: '160px' }}
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-transparent">
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`p-2.5 rounded-xl transition-all ${isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-violet-500/20 font-semibold text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            AI can make mistakes. Review invoice details before sending to clients.
          </p>
        </div>
      </footer>
    </div>
  )
}
