'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  MicOff
} from 'lucide-react'

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

  // Initialize speech recognition
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
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setInput('') // Clear input when starting
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
          prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: fullContent }
              : m
          )
        )
      }

      // Check for invoice data
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Invoice Assistant</h3>
                <p className="text-blue-100 text-xs">Describe your invoice in plain English</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Let's create an invoice!</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">
                  I'll help you build your invoice step by step. Just tell me what work was done:
                </p>
                <div className="mt-4 space-y-2 text-left">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-xs border border-blue-100">
                    <div className="font-bold text-blue-900 mb-1">💬 Conversational Example:</div>
                    <div className="text-slate-600 space-y-1">
                      <div><strong>You:</strong> "Kitchen remodel"</div>
                      <div><strong>AI:</strong> "What labor items should I include?"</div>
                      <div><strong>You:</strong> "Demolition $500, cabinet install $600"</div>
                      <div><strong>AI:</strong> "Any materials needed?"</div>
                      <div><strong>You:</strong> "Yes, 5 boxes of tile at $40 each"</div>
                      <div><strong>AI:</strong> "Anything else?"</div>
                      <div><strong>You:</strong> "That's it, create it"</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl text-xs text-slate-600 border border-slate-100">
                    <strong>Quick mode:</strong> "Invoice for John Doe - demolition $500, tile work $300, 3 boxes tile at $50 each. Done."
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              const displayText = cleanContent(message.content)
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-100 text-slate-700'
                    }`}
                  >
                    {displayText || (isLoading && message.role === 'assistant' ? 'Thinking...' : '')}
                    
                    {/* Show extracted invoice indicator */}
                    {message.role === 'assistant' && message.content.includes('```invoice_data') && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                          <Check className="w-4 h-4" />
                          Invoice data extracted!
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Apply Button */}
          {extractedInvoice && (
            <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100">
              <button
                onClick={handleApply}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply to Invoice Form
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-3 rounded-xl transition-all flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Describe your invoice...'}
                className={`flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  isListening 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-slate-50 border-slate-200 focus:bg-white'
                }`}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}




