'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'bot' | 'user'
  text: string
  suggestions?: string[]
}

/* ────────────────────────────────────────────────────────
   FAQ knowledge base — keyword → response + next actions
   ──────────────────────────────────────────────────────── */
interface FaqEntry {
  keywords: string[]
  response: string
  suggestions: string[]
}

const FAQ_DB: FaqEntry[] = [
  // Greetings & What is KS
  {
    keywords: ['hi', 'hello', 'hey', 'what is karya', 'what is ks', 'about karya', 'karya saarthi'],
    response:
      'Hey! 👋 Karya Saarthi is your academic and technical project partner. We complete thesis, websites, assignments AND teach you everything. So you understand your own work! 🎓\n\nWhat can I help you with today?',
    suggestions: ['Services we offer', 'How much does it cost?', 'How to start?', 'Talk to support'],
  },
  // How is KS different
  {
    keywords: ['different', 'why karya', 'why you', 'unique', 'better', 'special', 'comparison'],
    response:
      'Great question! Here\'s the difference:\n\n❌ Traditional services = Write project, hand it over, goodbye.\n\n✅ Karya Saarthi = Write project + 6-8 teaching sessions + free revisions + lifetime support.\n\nYour professor will ask questions in viva. With us, you UNDERSTAND everything. Plus 100% original work with plagiarism report! 📄',
    suggestions: ['How much does it cost?', 'Is it plagiarism-free?', 'How to start?'],
  },
  // Pricing
  {
    keywords: ['price', 'cost', 'charge', 'fee', 'budget', 'how much', 'pricing', 'rate', 'expensive', 'cheap', 'affordable'],
    response:
      'Great question! Here\'s our pricing:\n\n📚 Master\'s Thesis: ₹15,000 - ₹25,000\n📝 Research Paper (20 pages): ₹5,000 - ₹8,000\n💻 Website (5 pages): ₹10,000 - ₹30,000\n📄 Assignment: ₹500 - ₹3,000\n\nAll prices include: Project work + Teaching sessions + Plagiarism report + Free revisions + Support.\n\nWant an exact quote? Tell me:\n1️⃣ Your topic\n2️⃣ Number of pages\n3️⃣ Deadline',
    suggestions: ['I need thesis help', 'Website development', 'Can you do it fast?', 'Talk to support'],
  },
  // Thesis pricing specifically
  {
    keywords: ['thesis cost', 'thesis price', 'thesis fee', 'thesis budget'],
    response:
      'Master\'s thesis (80-100 pages): ₹15,000 - ₹25,000 depending on complexity.\nPhD thesis (150-200 pages): Custom quote based on research depth.\n\nThis includes:\n✅ Complete writing\n✅ 6-8 teaching sessions\n✅ Turnitin plagiarism report\n✅ Unlimited free revisions\n\nWant exact quote? Share your topic and deadline!',
    suggestions: ['How long does it take?', 'Is it plagiarism-free?', 'How to start?'],
  },
  // Timeline / Speed
  {
    keywords: ['time', 'how long', 'deadline', 'fast', 'urgent', 'rush', 'quick', 'days', '3 days', 'delivery', 'duration', 'speed'],
    response:
      'Yes! We can deliver fast! ⚡\n\n📚 Master\'s thesis: 4-5 days\n🎓 PhD thesis: 2-3 weeks\n📝 Research paper: 2-3 days\n📄 Assignment: 1-2 days\n\nRush delivery available too! Timeline affects pricing (rush charge may apply).\n\nWhen\'s your deadline exactly? 📅',
    suggestions: ['How much does it cost?', 'How to start?', 'Talk to support'],
  },
  // Plagiarism
  {
    keywords: ['plagiarism', 'copy', 'original', 'turnitin', 'unique', 'copied', 'authentic'],
    response:
      '100% original! We provide Turnitin plagiarism report as proof. <5% plagiarism guaranteed. ✅\n\nWe do original research and write from scratch. No copy-paste. If somehow plagiarism is found, we revise FREE until it\'s completely original!\n\nThis is why 2000+ students trust us. 🎓',
    suggestions: ['How much does it cost?', 'What about teaching?', 'How to start?'],
  },
  // Teaching / Understanding
  {
    keywords: ['teach', 'understand', 'learn', 'explain', 'viva', 'presentation', 'doubt', 'session', 'teaching'],
    response:
      'Don\'t worry! We teach until you understand. 📚\n\n✅ Unlimited teaching sessions included\n✅ We adapt to YOUR learning style — diagrams, examples, videos\n✅ After completion, reach out anytime with doubts\n✅ Lifetime support!\n\nSo when you present, you explain everything confidently! 💪\n\nReady to start?',
    suggestions: ['How to start?', 'How much does it cost?', 'Talk to support'],
  },
  // Professor suspicion
  {
    keywords: ['professor', 'suspect', 'caught', 'viva', 'defend', 'presentation worry'],
    response:
      'Smart question! Here\'s why they won\'t suspect:\n\n1️⃣ You\'ll understand EVERYTHING (teaching sessions!)\n2️⃣ You can explain every concept & data point\n3️⃣ In viva, you\'ll answer confidently\n4️⃣ Writing style matches your level\n\nProfessors suspect when students CAN\'T explain. Since you CAN — no suspicion! 💯',
    suggestions: ['How does teaching work?', 'Is it plagiarism-free?', 'How to start?'],
  },
  // Revision
  {
    keywords: ['revision', 'change', 'not happy', 'not satisfied', 'modify', 'edit', 'redo', 'refund', 'guarantee'],
    response:
      'Unlimited free revisions! ♻️\n\n❌ Not satisfied? We revise.\n📝 Professor asked changes? We do it FREE.\n🔄 Want different approach? We rewrite.\n\nThis continues until you\'re 100% happy. We get paid when YOU\'RE satisfied. Not before!\n\nThat\'s our confidence in quality. 💪',
    suggestions: ['How much does it cost?', 'How to start?', 'Talk to support'],
  },
  // How to start / Process
  {
    keywords: ['start', 'begin', 'process', 'how to', 'step', 'order', 'book', 'get started', 'procedure'],
    response:
      'Super simple! 🚀\n\n1️⃣ Message us your topic, deadline & pages\n2️⃣ Get FREE quote within 1 hour\n3️⃣ Pay (multiple options available)\n4️⃣ We start immediately — daily updates\n5️⃣ Deliver 2-3 days before deadline\n6️⃣ Teaching sessions begin\n7️⃣ Submit with confidence! 🎉\n\n📱 WhatsApp: +91 7991124091\n📧 Email: info@karyasaarthi.com',
    suggestions: ['How much does it cost?', 'Services we offer', 'Talk to support'],
  },
  // Services
  {
    keywords: ['service', 'offer', 'what do you do', 'help with', 'work', 'category', 'provide'],
    response:
      'We offer a wide range of services! 🛠️\n\n🎓 Academic — Thesis, Research Papers, Assignments, Data Analysis\n💻 Technical — Website Dev, App Dev, UI/UX Design\n📊 Business — Business Plans, Digital Marketing, Consulting\n✍️ Writing — Content Writing, Translation, Documentation\n\nAll services include teaching sessions so you understand everything!',
    suggestions: ['I need thesis help', 'Website development', 'How much does it cost?', 'How to start?'],
  },
  // Thesis help
  {
    keywords: ['thesis', 'dissertation', 'research paper', 'phd', 'masters', 'mba project'],
    response:
      '📚 We\'re thesis experts!\n\nWe handle:\n• Master\'s / PhD Thesis (any subject)\n• Research Papers & Journals\n• MBA Project Reports\n• Data Analysis (SPSS, Python, Excel)\n\n✅ 100% Original + Turnitin Report\n✅ Teaching sessions included\n✅ Delivery in 4-5 days\n\nShare your topic and we\'ll send a free quote! 📩',
    suggestions: ['How much does it cost?', 'How long does it take?', 'How to start?'],
  },
  // Website
  {
    keywords: ['website', 'web dev', 'web development', 'app', 'software', 'coding', 'programming'],
    response:
      '💻 We build amazing websites!\n\n• Business Websites\n• E-commerce Stores\n• Portfolio Sites\n• Web Applications\n• Mobile Apps\n\nStarting from ₹10,000. Full-stack development with modern tech.\n\n✅ Responsive design\n✅ SEO optimized\n✅ Free hosting support\n\nTell me about your project!',
    suggestions: ['How much does it cost?', 'How long does it take?', 'How to start?'],
  },
  // Assignment
  {
    keywords: ['assignment', 'homework', 'project report', 'ppt', 'presentation'],
    response:
      '📝 We handle all types of assignments!\n\n• Written Assignments\n• Project Reports\n• Presentations (PPT)\n• Case Studies\n• Lab Reports\n\nStarting from just ₹500!\n✅ Delivery in 1-2 days\n✅ Teaching included\n\nShare your requirements!',
    suggestions: ['How much does it cost?', 'How to start?', 'Talk to support'],
  },
  // Samples / Portfolio
  {
    keywords: ['sample', 'portfolio', 'previous work', 'example', 'show me', 'proof'],
    response:
      'Yes! We have anonymized samples available. 📂\n\nWe maintain client confidentiality, but we can share:\n• Sample theses (names removed)\n• Website portfolio\n• Research paper examples\n\nAsk our team on WhatsApp for samples!\n📱 +91 7991124091',
    suggestions: ['How to start?', 'How much does it cost?', 'Talk to support'],
  },
  // Payment
  {
    keywords: ['payment', 'pay', 'upi', 'razorpay', 'card', 'emi', 'bank'],
    response:
      '💳 We accept multiple payment options via Razorpay:\n\n• UPI (GPay, PhonePe, Paytm)\n• Credit/Debit Cards\n• Net Banking\n• EMI options available\n\n100% secure payments! 🔒',
    suggestions: ['How much does it cost?', 'How to start?', 'Talk to support'],
  },
  // Contact / Support
  {
    keywords: ['contact', 'support', 'talk', 'human', 'agent', 'call', 'whatsapp', 'phone', 'email', 'reach'],
    response:
      '📞 Connect with our team directly!\n\n📱 WhatsApp: +91 7991124091\n📧 Email: info@karyasaarthi.com\n🌐 Website: karyasaarthi.com/contact\n\n⏰ Available Mon-Sat, 9 AM - 9 PM IST\nWe respond within 30 minutes! 💬',
    suggestions: ['How to start?', 'Services we offer', 'How much does it cost?'],
  },
]

/* ────────────────────────────────────────────────────────
   Matching logic — fuzzy keyword matching
   ──────────────────────────────────────────────────────── */
function findFaqResponse(input: string): FaqEntry | null {
  const lower = input.toLowerCase().trim()

  // Score each entry by how many keywords match
  let bestMatch: FaqEntry | null = null
  let bestScore = 0

  for (const entry of FAQ_DB) {
    let score = 0
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        // Longer keyword matches get higher score
        score += kw.length
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  return bestScore > 0 ? bestMatch : null
}

const FALLBACK_RESPONSE: Message = {
  role: 'bot',
  text: '🤔 I\'m not sure about that, but our team can help!\n\nLet me connect you:\n\n📱 WhatsApp: +91 7991124091\n📧 Email: info@karyasaarthi.com\n\nOr tell me more about what you need — I might be able to help differently!',
  suggestions: ['Services we offer', 'How much does it cost?', 'How to start?', 'Talk to support'],
}

const quickReplies = [
  '👋 What is Karya Saarthi?',
  '💰 How much does it cost?',
  '🚀 How to start?',
  '📞 Talk to support',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hey! 👋 I\'m Saarthi, your assistant.\n\nI can help you with services, pricing, timelines, and more. What can I help you with today?',
      suggestions: ['What is Karya Saarthi?', 'Services we offer', 'How much does it cost?', 'How to start?'],
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTyping(true)

    // 1. Try local FAQ match first (instant)
    const faqMatch = findFaqResponse(text)
    if (faqMatch) {
      // Simulate a brief typing delay for natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: faqMatch.response,
          suggestions: faqMatch.suggestions,
        }])
        setTyping(false)
      }, 400 + Math.random() * 400)
      return
    }

    // 2. Try AI endpoint as fallback
    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text,
      }))

      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) throw new Error('AI request failed')

      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.text,
          suggestions: ['How to start?', 'Talk to support'],
        }])
      } else {
        throw new Error('Empty response')
      }
    } catch {
      // 3. Final fallback
      setMessages(prev => [...prev, { ...FALLBACK_RESPONSE }])
    } finally {
      setTyping(false)
    }
  }, [messages])

  // Get suggestions from the last bot message
  const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot')
  const currentSuggestions = lastBotMsg?.suggestions ?? []

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl cursor-pointer transition-colors"
        style={{
          background: open ? 'var(--color-surface-2, #1f2937)' : 'linear-gradient(135deg, #FF6B35, #e85d2a)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          <motion.span key={open ? 'close' : 'open'} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
            {open ? '✕' : '💬'}
          </motion.span>
        </AnimatePresence>
        {!open && messages.length <= 1 && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-96 overflow-hidden flex flex-col"
            style={{
              maxHeight: '75vh',
              borderRadius: 20,
              backgroundColor: 'var(--color-surface-1, #0d1117)',
              border: '1px solid var(--color-hairline, rgba(255,255,255,0.08))',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: '1px solid var(--color-hairline, rgba(255,255,255,0.08))',
              background: 'var(--color-surface-2, #161b22)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35, #e85d2a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>🤝</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink, #fff)' }}>Saarthi</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-ink-muted, #8b949e)' }}>Online · Replies instantly</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-ink-muted, #8b949e)',
                  fontSize: 18, cursor: 'pointer', padding: 4,
                }}
                aria-label="Close chat"
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
              minHeight: 200, maxHeight: 360,
              background: 'var(--color-canvas, #0d1117)',
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                  {m.role === 'bot' && (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #FF6B35, #e85d2a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, marginTop: 2,
                    }}>🤝</div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    ...(m.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #FF6B35, #e85d2a)',
                          color: '#fff',
                        }
                      : {
                          backgroundColor: 'var(--color-surface-2, #161b22)',
                          color: 'var(--color-ink, #e6edf3)',
                          border: '1px solid var(--color-hairline, rgba(255,255,255,0.06))',
                        }),
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #FF6B35, #e85d2a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12,
                  }}>🤝</div>
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    backgroundColor: 'var(--color-surface-2, #161b22)',
                    border: '1px solid var(--color-hairline, rgba(255,255,255,0.06))',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: 'var(--color-ink-muted, #8b949e)',
                        animation: `chat-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Suggestion chips — show from last bot message */}
            {currentSuggestions.length > 0 && !typing && (
              <div style={{
                padding: '8px 16px 4px',
                display: 'flex', flexWrap: 'wrap', gap: 6,
                borderTop: '1px solid var(--color-hairline, rgba(255,255,255,0.06))',
                background: 'var(--color-canvas, #0d1117)',
              }}>
                {currentSuggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 500,
                      border: '1px solid var(--color-hairline, rgba(255,255,255,0.12))',
                      backgroundColor: 'var(--color-surface-2, #161b22)',
                      color: 'var(--color-accent-blue, #58a6ff)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              display: 'flex', gap: 8,
              borderTop: '1px solid var(--color-hairline, rgba(255,255,255,0.06))',
              background: 'var(--color-surface-2, #161b22)',
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--color-hairline, rgba(255,255,255,0.1))',
                  backgroundColor: 'var(--color-canvas, #0d1117)',
                  color: 'var(--color-ink, #e6edf3)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg, #FF6B35, #e85d2a)' : 'var(--color-surface-1, #21262d)',
                  color: '#fff', fontSize: 16, cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                  opacity: input.trim() ? 1 : 0.4,
                }}
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes chat-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  )
}
