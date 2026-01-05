'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  X, 
  Sparkles, 
  Bot, 
  User,
  Check,
  Loader2,
  Mic,
  MicOff,
  ChevronRight,
  Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

interface InvoiceData {
  client_name?: string
  invoice_date?: string
  due_date?: string
  labor_items?: Array<{ description: string; amount: number }>
  material_items?: Array<{ description: string; amount: number }>
  tax_rate?: number
  notes?: string
}

interface AIChatProps {
  clients: { id: string; name: string }[]
  onApplyInvoice: (data: InvoiceData) => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIChat({ clients, onApplyInvoice }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractedInvoice, setExtractedInvoice] = useState<InvoiceData | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          if (finalTranscript) {
            setInput(prev => prev + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setInput('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          clients
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }
      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullContent += chunk
        setMessages(prev => 
          prev.map(m => m.id === assistantMessage.id ? { ...m, content: fullContent } : m)
        )
      }

      const match = fullContent.match(/```invoice_data\s*([\s\S]*?)```/)
      if (match) {
        try {
          const invoiceData = JSON.parse(match[1])
          setExtractedInvoice(invoiceData)
        } catch (e) {
          console.error('Failed to parse invoice data:', e)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    if (extractedInvoice) {
      onApplyInvoice(extractedInvoice)
      setExtractedInvoice(null)
      setIsOpen(false)
    }
  }

  const cleanContent = (text: string) => {
    if (!text) return ''
    return text.replace(/```invoice_data[\s\S]*?```/g, '').trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-primary text-white rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
              >
                <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-background animate-pulse" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">Support AI Assistant</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="fixed bottom-8 right-8 left-auto top-auto translate-x-0 translate-y-0 w-[440px] h-[680px] p-0 overflow-hidden flex flex-col bg-white rounded-[2.5rem]">
          {/* Header */}
          <div className="px-8 py-6 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight">AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Active Now</p>
                </div>
              </div>
            </div>
            {/* Radix Close is built-in to DialogContent, but we can add our own logic if needed */}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-extrabold text-slate-900 font-syne tracking-tight">Ready to build?</h4>
                  <p className="text-slate-500 font-medium px-4">
                    Describe the work you've done and I'll handle the line items for you.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3 text-primary" />
                    Example
                  </p>
                  <p className="text-sm font-bold text-slate-700 italic">
                    "Invoice for Apex regarding kitchen demolition $500 and 5 boxes of tile at $40 each."
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 self-end shadow-sm">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] px-5 py-4 text-sm font-medium leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-[1.5rem] rounded-br-none shadow-lg shadow-primary/20'
                    : 'bg-slate-50 text-slate-700 rounded-[1.5rem] rounded-bl-none border border-slate-100'
                }`}>
                  {cleanContent(message.content) || (isLoading && message.role === 'assistant' ? 'Thinking...' : '')}
                  {message.role === 'assistant' && message.content.includes('```invoice_data') && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex gap-2 items-center text-emerald-700 font-bold text-xs">
                      <Check className="w-4 h-4" /> Data Extracted
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          /* Action Bar */
          <div className="px-6 py-4 bg-white border-t border-slate-100 space-y-4">
            {extractedInvoice && (
              <Button
                onClick={handleApply}
                className="w-full h-14 bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-2"
              >
                <Check className="w-5 h-5 mr-2" />
                Apply to Form
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </Button>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Message Assistant...'}
                className={`w-full h-14 pl-14 pr-14 bg-slate-50 border-2 border-slate-50 rounded-3xl text-sm font-bold text-slate-900 focus:bg-white focus:border-primary transition-all underline-none ${
                    isListening ? 'bg-red-50 border-red-100' : ''
                }`}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute left-2 top-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  )
}
