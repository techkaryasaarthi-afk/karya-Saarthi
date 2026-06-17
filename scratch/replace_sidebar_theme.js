const fs = require('fs');
const path = require('path');

const files = [
  'components/admin/AdminSidebar.tsx',
  'app/admin/layout.tsx'
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
    console.log(`Updated ${relPath}`);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
}
