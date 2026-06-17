const fs = require('fs');
const path = require('path');

const files = [
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/all-saarthi/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/analytics/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/announcements/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/blogs/new/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/blogs/[id]/edit/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/blogs/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/kpi/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/legal/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/meetings/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/pillars/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/reports/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/board/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/chatbot/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/crm/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/digital/email/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/digital/social/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/digital/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/finance/invoices/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/finance/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/hr/attendance/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/hr/leaves/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/hr/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/marketing/events/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/marketing/newsletter/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/marketing/outreach/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/marketing/referrals/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/marketing/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/newsletter/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/operations/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/pillars/calling/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/pillars/campus/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/pillars/digital/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/pillars/government/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/pillars/market/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/profile/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/projects/[id]/chat/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/projects/[id]/kanban/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/projects/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/requests/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/settings/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/staff/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/staff-requests/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/users/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/vendors/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/workspace/page.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/layout.tsx",
    "C:/Users/Aman Mishra/Downloads/karyasaarthi/app/admin/page.tsx"
];

const replacements = [
  { from: /bg-white/g, to: 'bg-[var(--color-surface-1)]' },
  { from: /bg-slate-50\/50/g, to: 'bg-[var(--color-canvas)]' },
  { from: /bg-slate-50/g, to: 'bg-[var(--color-surface-2)]' },
  { from: /bg-slate-100/g, to: 'bg-[var(--color-surface-2)] border border-[var(--color-hairline)]' },
  { from: /bg-slate-200/g, to: 'bg-[var(--color-surface-2)] border border-[var(--color-hairline-soft)]' },
  { from: /bg-navy/g, to: 'bg-[var(--color-inverse-surface)]' }, 
  { from: /hover:bg-slate-50/g, to: 'hover:bg-[var(--color-surface-2)]' },
  { from: /hover:bg-slate-100/g, to: 'hover:bg-[var(--color-surface-2)]' },
  { from: /hover:bg-slate-200/g, to: 'hover:bg-[var(--color-surface-1)]' },
  { from: /border-slate-50/g, to: 'border-[var(--color-hairline-soft)]' },
  { from: /border-slate-100/g, to: 'border-[var(--color-hairline-soft)]' },
  { from: /border-slate-200/g, to: 'border-[var(--color-hairline)]' },
  { from: /border-navy/g, to: 'border-[var(--color-hairline)]' },
  { from: /text-navy/g, to: 'text-[var(--color-ink)]' },
  { from: /text-slate-700/g, to: 'text-[var(--color-ink)]' },
  { from: /text-slate-600/g, to: 'text-[var(--color-ink)]' },
  { from: /text-slate-500/g, to: 'text-[var(--color-ink-muted)]' },
  { from: /text-slate-400/g, to: 'text-[var(--color-ink-muted)]' },
  { from: /text-slate-300/g, to: 'text-[var(--color-hairline)]' },
  { from: /shadow-sm/g, to: '' },
  { from: /shadow-md/g, to: '' },
  { from: /shadow-lg/g, to: '' },
  { from: /focus:border-navy/g, to: 'focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)]' },
];

const basePath = 'c:\\Users\\Aman Mishra\\Downloads\\karyasaarthi';

for (const relPath of files) {
  const fullPath = path.join(basePath, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const {from, to} of replacements) {
      content = content.replace(from, to);
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(Updated  + relPath);
  }
}
