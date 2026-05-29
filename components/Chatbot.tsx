'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'bot' | 'user'
  text: string
}

const quickReplies = [
  'I need thesis help',
  'Website development',
  'Logo design',
  'Talk to support',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm Saarthi 🤝\nHow can I help you today?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTyping(true)

    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text,
      }))

      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) {
        throw new Error('Meta AI request failed')
      }

      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: 'bot', text: data.text }])
      } else {
        throw new Error('Empty response from AI')
      }
    } catch (error) {
      console.error('AI Chat Error in Chatbot, falling back:', error)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Thanks for reaching out about "${text}"! 🙏\n\nOur team will get back to you shortly. Meanwhile, you can:\n\n📱 WhatsApp: +91 8595025753\n📧 Email: support@karyasaarthi.com`,
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-2xl shadow-accent/40 flex items-center justify-center text-2xl cursor-pointer hover:bg-accent-dark transition-colors"
      >
        {open ? '✕' : '🤖'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="bg-navy px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl">🤖</div>
              <div>
                <h4 className="text-white font-bold text-sm">Saarthi</h4>
                <p className="text-white/60 text-xs">Usually replies instantly</p>
              </div>
              <div className="ml-auto w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-green-400/30" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" style={{ minHeight: 200 }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 border border-slate-100 shadow-sm flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-100">
              {quickReplies.map(q => (
                <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-medium hover:bg-navy/10 transition-colors cursor-pointer">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button onClick={() => send(input)} className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-dark transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
