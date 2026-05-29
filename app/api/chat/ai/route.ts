import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiUrl = process.env.META_AI_API_URL
  const apiKey = process.env.META_AI_API_KEY

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ error: 'Meta AI API is not configured' }, { status: 503 })
  }

  try {
    const { message, history } = await request.json()

    // Map history to standard OpenAI/Llama chat messages format
    const messages = [
      {
        role: 'system',
        content: `You are Saarthi, the virtual assistant for Karya Saarthi (a brand of Karyanex Private Limited).
Karya Saarthi offers professional services across 4 categories:
1. Academic: Thesis, research papers, project reports, data analysis (SPSS, Python, etc.) starting from ₹500.
2. Technical: Website & app development, UI/UX, database setup starting from ₹1,000.
3. Business: Business plans, company registration, resumes, pitch decks starting from ₹500.
4. Government: Tender documents, compliances, proposals, MOUs starting from ₹5,000.

Be helpful, professional, polite, and concise. Refer users to /services for services, /contact for quotes and booking free consultations, and /login or /signup for account access. If the question is not about Karya Saarthi or general services, politely try to answer or redirect them to support.`
      }
    ]

    if (Array.isArray(history)) {
      history.forEach((h: { role: 'user' | 'bot' | 'assistant'; text: string }) => {
        messages.push({
          role: h.role === 'bot' ? 'assistant' : 'user',
          content: h.text,
        })
      })
    }

    messages.push({
      role: 'user',
      content: message,
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-instruct',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Meta AI request failed' }, { status: response.status })
    }

    // Extract message content from standard OpenAI response format or fallback
    let text = ''
    if (data.choices && data.choices[0] && data.choices[0].message) {
      text = data.choices[0].message.content
    } else if (data.response) {
      text = data.response
    } else if (data.text) {
      text = data.text
    } else {
      text = typeof data === 'string' ? data : JSON.stringify(data)
    }

    return NextResponse.json({ text })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Meta AI request failed' }, { status: 500 })
  }
}
