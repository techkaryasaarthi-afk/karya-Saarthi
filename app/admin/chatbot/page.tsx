'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { DEPARTMENT_HUBS, STAFF_ROLE_CONFIGS } from '@/lib/org'
import Link from 'next/link'

interface Message {
  role: 'bot' | 'user'
  text: string
}

const samplePrompts = [
  'Who is the Campus Saarthi Head?',
  'What are the SOPs for Tech department?',
  'Where is the Legal dashboard located?',
  'What does Digital Saarthi do?',
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: `Welcome to the **Karya Saarthi Internal Assistant** 🤖\n\nI can help you locate departments, find responsible heads, verify standard operating procedures (SOPs), or understand inter-departmental routes.\n\nWhat can I assist you with today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'directory'>('chat')
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
        role: m.role === 'bot' ? 'assistant' : 'user',
        text: m.text,
      }))

      const response = await fetch('/api/admin/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) {
        throw new Error('API Request Failed')
      }

      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: 'bot', text: data.text }])
      } else {
        throw new Error('Empty reply')
      }
    } catch (e) {
      console.error('Chat error:', e)
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: `⚠️ **Connection Error**\nCould not reach the chatbot service. Please try again later or contact the Tech department.`,
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy font-heading tracking-tight">
            Internal AI Chatbot
          </h1>
          <p className="text-slate-500 text-sm">
            Chat with Meta AI Llama to query SOPs, organization structure, and directories.
          </p>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden w-full bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'chat' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'
            }`}
          >
            💬 Chatbot
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'directory' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'
            }`}
          >
            📋 Org Directory
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Side: Directory (Hidden on mobile if chat tab is active) */}
        <div
          className={`${
            activeTab === 'directory' ? 'block' : 'hidden sm:block'
          } lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden`}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-navy text-sm font-heading flex items-center gap-2">
              <span>🏢</span> Department Directory
            </h3>
            <p className="text-xs text-slate-400 mt-1">Quick links to active hubs and meeting rooms.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {DEPARTMENT_HUBS.map(hub => {
              const roleConfig = STAFF_ROLE_CONFIGS.find(r => r.department === hub.key)
              return (
                <div
                  key={hub.key}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100/50 transition-colors flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-navy text-xs leading-none">{hub.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">Dept: {hub.key}</p>
                    </div>
                    <span className="text-xs">💼</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                    <Link
                      href={hub.route}
                      className="px-2.5 py-1 rounded-lg bg-navy/5 text-navy hover:bg-[rgba(0,153,255,0.12)] text-[10px] font-bold transition-all"
                    >
                      Dashboard ➡️
                    </Link>
                    <Link
                      href={hub.meetingRoute}
                      className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 text-[10px] font-bold transition-all"
                    >
                      Meetings 🎥
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Chat Area (Hidden on mobile if directory tab is active) */}
        <div
          className={`${
            activeTab === 'chat' ? 'flex' : 'hidden sm:flex'
          } lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex-col overflow-hidden`}
        >
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy border border-navy/10 flex items-center justify-center text-lg font-bold">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-navy text-sm font-heading">Saarthi AI</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium">Meta Llama 3 Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs md:text-sm whitespace-pre-line leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-accent text-white rounded-br-md shadow-md shadow-accent/10'
                        : 'bg-white text-slate-700 border border-slate-150 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {/* Render basic markdown links beautifully */}
                    {m.text.split('\n').map((line, lIdx) => {
                      // Parse links [Label](URL)
                      const linkRegex = /\[(.*?)\]\((.*?)\)/g
                      const parts = []
                      let lastIndex = 0
                      let match

                      while ((match = linkRegex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(line.substring(lastIndex, match.index))
                        }
                        parts.push(
                          <Link
                            key={match.index}
                            href={match[2]}
                            className={`underline font-bold hover:opacity-85 ${
                              m.role === 'user' ? 'text-white' : 'text-accent'
                            }`}
                          >
                            {match[1]}
                          </Link>
                        )
                        lastIndex = linkRegex.lastIndex
                      }

                      if (lastIndex < line.length) {
                        parts.push(line.substring(lastIndex))
                      }

                      return (
                        <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>
                          {parts.length > 0 ? parts : line}
                        </p>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-slate-150 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-2 bg-slate-50/50">
            {samplePrompts.map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:text-navy hover:border-slate-300 transition-all cursor-pointer shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-slate-100 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask Saarthi about SOPs, roles, or directories..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-navy/20 focus:ring-2 focus:ring-navy/5 transition-all"
            />
            <button
              onClick={() => send(input)}
              className="px-5 py-3 rounded-xl bg-accent text-white font-bold text-sm shadow-md hover:bg-accent-dark transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Send 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

