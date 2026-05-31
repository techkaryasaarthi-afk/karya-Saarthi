import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { STAFF_ROLE_CONFIGS, DEPARTMENT_HUBS } from '@/lib/org'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, history } = await request.json()
  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const apiUrl = process.env.META_AI_API_URL
  const apiKey = process.env.META_AI_API_KEY

  // Detailed company structure details
  const companyStructureDetails = `
Kanya Saarthi Organization Structure & Department Directory:
${STAFF_ROLE_CONFIGS.map(role => `- ${role.title}: Department: "${role.department}", Route: "${role.route}"`).join('\n')}

Department Hubs:
${DEPARTMENT_HUBS.map(hub => `- ${hub.name}: Route: "${hub.route}", Meeting Room: "${hub.meetingRoute}"`).join('\n')}

Standard Operating Procedures (SOPs):
1. Campus Saarthi: Manage campus ambassadors, coordinate college workshops, process student referrals.
2. Digital Saarthi: Design and develop client websites, maintain SEO rankings, run social media campaigns.
3. Calling Saarthi: Handle outbound lead generation, client follow-up calls, feedback surveys.
4. Government Saarthi: Compile public tender documentation, check compliance, advise on govt schemes.
5. Marketing Saarthi: Plan overall campaigns, manage partnerships marquee, bulk email/whatsapp outreach.
6. Finance: Process invoices, review revenue/expenses, handle vendor payouts.
7. Legal: Review MOUs, legal policies, and agreement compliance.
8. Data Analytics: Analyze platform stats, pillar KPIs, and prepare reports.
9. Tech: Manage platform workspace, chat system, Jitsi meeting integrations, and database scripts.
10. Customer Service: Address client complaints, answer CRM leads, update project milestones.
11. R&D: Explore new features, optimize web performance, integrate AI services.
`;

  // If Meta AI is configured, let's call the API
  if (apiUrl && apiKey) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are Saarthi AI, the virtual assistant for Karya Saarthi (a brand of Karyanex Private Limited).
You help staff members with queries about our company structure, department directories, SOPs, and inter-department tasks.
Be professional, concise, helpful, and polite. Always provide accurate routes or directory details where possible.

${companyStructureDetails}`
        }
      ]

      if (Array.isArray(history)) {
        history.forEach((h: { role: 'user' | 'bot' | 'assistant'; text: string }) => {
          messages.push({
            role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
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
          temperature: 0.5,
          max_tokens: 500,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        let text = ''
        if (data.choices && data.choices[0] && data.choices[0].message) {
          text = data.choices[0].message.content
        } else if (data.response) {
          text = data.response
        } else if (data.text) {
          text = data.text
        }
        if (text) {
          return NextResponse.json({ text })
        }
      }
    } catch (e) {
      console.error('Failed calling Meta AI API, using local rules fallback:', e)
    }
  }

  // Local rules-based smart fallback when Meta AI API is not configured or fails
  const msgLower = message.toLowerCase();
  let text = '';

  if (msgLower.includes('campus')) {
    text = `🎓 **Campus Saarthi Department**
- **Head/Role:** Campus Saarthi Head (Route: [\`/admin/pillars/campus\`](/admin/pillars/campus))
- **Primary SOP:** Manages the college ambassador network, coordinate college workshops, and process student referrals.
- **Meetings:** Managed at [\`Board Meetings\`](/admin/board/meetings).`;
  } else if (msgLower.includes('digital') || msgLower.includes('website') || msgLower.includes('seo')) {
    text = `💻 **Digital Saarthi Department**
- **Heads/Roles:** 
  - Digital Saarthi Head (Route: [\`/admin/digital\`](/admin/digital))
  - Digital Marketing Head (Route: [\`/admin/digital\`](/admin/digital))
- **Primary SOP:** Core web & mobile app development, SEO optimization, brand building, and social media management.
- **Meetings:** Accessible in [\`Board Meetings\`](/admin/board/meetings).`;
  } else if (msgLower.includes('calling') || msgLower.includes('phone') || msgLower.includes('call')) {
    text = `📞 **Calling Saarthi Department**
- **Head/Role:** Calling Saarthi Head (Route: [\`/admin/pillars/calling\`](/admin/pillars/calling))
- **Primary SOP:** Operates the outbound voice outreach, lead generation follow-ups, client surveys, and appointment scheduling.`;
  } else if (msgLower.includes('government') || msgLower.includes('govt') || msgLower.includes('tender')) {
    text = `🏛️ **Government Saarthi Department**
- **Head/Role:** Government Saarthi Head (Route: [\`/admin/pillars/government\`](/admin/pillars/government))
- **Primary SOP:** Coordinates public sector tender preparation, checks regulatory compliances, and advises on government schemes.`;
  } else if (msgLower.includes('market') || msgLower.includes('field') || msgLower.includes('ground')) {
    text = `🗺️ **Market Saarthi Department**
- **Head/Role:** Operation/Field Management (Route: [\`/admin/pillars/market\`](/admin/pillars/market))
- **Primary SOP:** Handles hyperlocal field sales, offline lead capture, on-ground activations, and territory management.`;
  } else if (msgLower.includes('finance') || msgLower.includes('invoice') || msgLower.includes('payment') || msgLower.includes('salary')) {
    text = `💵 **Finance Department**
- **Head/Role:** Finance Department Head (Route: [\`/admin/finance\`](/admin/finance))
- **Primary SOP:** Manages the platform's incoming revenues, client invoicing, pending payment alerts, and team payroll audits.`;
  } else if (msgLower.includes('legal') || msgLower.includes('mou') || msgLower.includes('policy')) {
    text = `⚖️ **Legal Department**
- **Head/Role:** Legal Head (Route: [\`/admin/board/legal\`](/admin/board/legal))
- **Primary SOP:** Reviews corporate partnerships, compiles MOUs, handles client arbitration, and maintains legal terms.`;
  } else if (msgLower.includes('analytics') || msgLower.includes('kpi') || msgLower.includes('report')) {
    text = `📊 **Data Analytics Department**
- **Head/Role:** Data Analytics Head (Route: [\`/admin/analytics\`](/admin/analytics))
- **Primary SOP:** Tracks performance KPIs across all 5 Saarthi pillars, compiles investor metrics, and prepares data scorecards.`;
  } else if (msgLower.includes('tech') || msgLower.includes('code') || msgLower.includes('system') || msgLower.includes('database')) {
    text = `⚙️ **Tech Department**
- **Head/Role:** Tech Department Head (Route: [\`/admin/workspace\`](/admin/workspace))
- **Primary SOP:** Integrates internal software, manages collaborative workspace folders, handles database scripts, and maintains the Jitsi video widgets.`;
  } else if (msgLower.includes('customer') || msgLower.includes('service') || msgLower.includes('crm') || msgLower.includes('client')) {
    text = `👤 **Customer Service Department**
- **Head/Role:** Customer Service Head (Route: [\`/admin/crm\`](/admin/crm))
- **Primary SOP:** Manages CRM lead pipelines, client onboarding, support ticket resolution, and tracks overall project delivery satisfaction.`;
  } else if (msgLower.includes('rnd') || msgLower.includes('research') || msgLower.includes('development')) {
    text = `🚀 **Research & Development (R&D)**
- **Head/Role:** R&D Head (Route: [\`/admin/workspace\`](/admin/workspace))
- **Primary SOP:** Identifies emerging SaaS trends, executes optimization tasks (e.g. video rendering speedups), and runs experimental AI modules.`;
  } else if (msgLower.includes('operation') || msgLower.includes('project') || msgLower.includes('manager')) {
    text = `⚙️ **Operations & Projects**
- **Heads/Roles:**
  - Operation Head (Route: [\`/admin/operations\`](/admin/operations))
  - Project Manager (Route: [\`/admin/projects\`](/admin/projects))
- **Primary SOP:** Monitored workflow delivery, assigns tasks to vendors, and oversees milestone progression.`;
  } else {
    text = `👋 **Karya Saarthi Internal Assistant**
*(Note: Meta AI Llama API is currently unconfigured or unreachable. Using the local directory knowledge base.)*

I am here to guide you through Karya Saarthi's company structure, standard operating procedures, and routes. 

Try asking me about:
- **Five Saarthi Pillars:** Campus, Digital, Calling, Government, Market Saarthi
- **Core Departments:** Tech, Finance, Legal, Analytics, Customer Service, R&D, Operations
- **Heads & Dashboards:** Ask "Who is the head of Campus Saarthi?" or "Where is the Legal dashboard?"

**Quick Directory Summary:**
- **Campus Saarthi Head** ➡️ [\`/admin/pillars/campus\`](/admin/pillars/campus)
- **Digital Saarthi Head** ➡️ [\`/admin/digital\`](/admin/digital)
- **Calling Saarthi Head** ➡️ [\`/admin/pillars/calling\`](/admin/pillars/calling)
- **Government Saarthi Head** ➡️ [\`/admin/pillars/government\`](/admin/pillars/government)
- **Management Head (Board)** ➡️ [\`/admin/board\`](/admin/board)`;
  }

  return NextResponse.json({ text })
}
