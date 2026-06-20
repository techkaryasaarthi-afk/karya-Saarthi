const fs = require('fs');
const files = [
  'app/dashboard/page.tsx',
  'app/vendor/page.tsx',
  'app/admin/marketing/page.tsx'
];

const replacements = {
  'â‚¹': '₹',
  'â€”': '—',
  'Â·': '·',
  'â€¦': '…',
  'ðŸ“‹': '📋',
  'ðŸ’°': '💰',
  'â­ ': '⭐',
  'ðŸš€': '🚀',
  'ðŸ” ': '🔍',
  'ðŸ“¦': '📦',
  'â ³': '⏳',
  'ðŸ“ ': '📁',
  'â–²': '▲',
  'ðŸ’¬': '💬',
  'ðŸ””': '🔔',
  'ðŸ‘¨â€ ðŸ’¼': '👨‍💼',
  'ðŸ”„': '🔄',
  'ðŸ“­': '📫',
  'ðŸ› ï¸ ': '🛠️',
  'ðŸŽ§': '🎧',
  'ðŸ“£': '📢',
  'ðŸ“ ': '📝',
  'ðŸŽ™ï¸ ': '🎙️',
  'ðŸ’»': '💻',
  'ðŸ“…': '📅',
  'ðŸ“Š': '📊',
  'ðŸ—“ï¸ ': '🗓️',
  'ðŸ¤ ': '🤝',
  'ðŸŽª': '🎪',
  'ðŸ” ': '🕵',
  'ðŸŽ¨': '🎨',
  'ðŸ–¼': '🖼',
  'â–¦': '▦',
  'ðŸ”—': '🔗',
  'ðŸ‘ ': '👁',
  'ðŸ—‘ï¸ ': '🗑️',
  'âœ ï¸ ': '✏️',
  'â€"': '—',
  'â€œ': '“',
  'â€ ': '”',
  'â€˜': '‘',
  'â€™': '’'
};

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (const [bad, good] of Object.entries(replacements)) {
      content = content.split(bad).join(good);
    }
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed encoding in ' + file);
    } else {
      console.log('No changes needed in ' + file);
    }
  } else {
    console.log('File not found: ' + file);
  }
}
