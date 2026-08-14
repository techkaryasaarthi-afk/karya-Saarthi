<?php
$pageTitle = 'Team Chat';
require_once __DIR__ . '/../config/auth.php';
requireLogin();

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userName = $_SESSION['user_name'];
$userType = $_SESSION['user_type'];

// Ensure tables exist
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS group_chat_messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        message TEXT NOT NULL, has_mention BOOLEAN DEFAULT FALSE,
        has_task_assignment BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_created (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS group_chat_mentions (
        mention_id INT AUTO_INCREMENT PRIMARY KEY, message_id INT NOT NULL,
        mentioned_user_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        FOREIGN KEY (message_id) REFERENCES group_chat_messages(message_id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
} catch (Exception $e) {}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex h-[calc(100vh-56px)] bg-surface-2 overflow-hidden">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Chat Header -->
        <div class="bg-surface-1 border-b border-hairline px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <i class="fas fa-comments text-white text-sm"></i>
                </div>
                <div>
                    <h1 class="text-base font-bold text-ink">Team Chat</h1>
                    <p class="text-xs text-ink-muted" id="online-status">All members • Group channel</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>Live
                </span>
                <button onclick="scrollToBottom()" class="w-8 h-8 rounded-lg bg-surface-2 border border-hairline text-ink-muted hover:text-ink flex items-center justify-center transition" title="Scroll to bottom">
                    <i class="fas fa-arrow-down text-xs"></i>
                </button>
            </div>
        </div>

        <!-- Messages Area -->
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1" style="scroll-behavior:smooth;">
            <div id="chat-loading" class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p class="text-sm text-ink-muted">Loading messages...</p>
                </div>
            </div>
            <div id="chat-empty" class="hidden flex-col items-center justify-center py-20 text-center">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
                    <i class="fas fa-comments text-3xl text-violet-400"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-1">Welcome to Team Chat!</h3>
                <p class="text-sm text-ink-muted max-w-sm">Start the conversation. All team members across every role can see and send messages here.</p>
                <div class="mt-4 flex flex-wrap justify-center gap-2">
                    <span class="px-2.5 py-1 rounded-full text-xs bg-surface-1 border border-hairline text-ink-muted">💡 Type <code class="text-violet-400">@name</code> to mention</span>
                    <span class="px-2.5 py-1 rounded-full text-xs bg-surface-1 border border-hairline text-ink-muted">📋 Type <code class="text-violet-400">/assign @name task</code> to assign</span>
                </div>
            </div>
        </div>

        <!-- Task Assignment Banner -->
        <div id="task-banner" class="hidden bg-green-500/10 border-t border-green-500/20 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <i class="fas fa-check-circle text-green-500"></i>
            <span id="task-banner-text" class="text-sm text-green-400 font-medium"></span>
            <button onclick="document.getElementById('task-banner').classList.add('hidden')" class="ml-auto text-green-500/60 hover:text-green-500"><i class="fas fa-times text-xs"></i></button>
        </div>

        <!-- Input Area -->
        <div class="bg-surface-1 border-t border-hairline px-3 sm:px-5 py-3 flex-shrink-0 relative">
            <!-- Mention Autocomplete Dropdown (anchored above input) -->
            <div id="mention-dropdown" class="hidden absolute z-50 bg-surface-1 border border-hairline rounded-xl shadow-2xl max-h-48 overflow-y-auto" style="bottom:100%;left:12px;right:12px;margin-bottom:4px;">
                <div class="p-2 border-b border-hairline">
                    <p class="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-2">Mention a team member</p>
                </div>
                <div id="mention-list" class="p-1"></div>
            </div>
            <div class="flex items-end gap-2">
                <div class="flex-1 relative">
                    <textarea id="chat-input" rows="1" maxlength="2000"
                        class="w-full bg-surface-2 border border-hairline rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-none transition"
                        placeholder="Type a message... Example: /assign @EMP-001 title: Submit report | priority: high | deadline: 2026-08-03"
                        style="max-height:120px;min-height:40px;"></textarea>
                </div>
                <button id="send-btn" type="button" onclick="sendTeamMessage()"
                    class="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-violet-500/25 flex-shrink-0 cursor-pointer">
                    <i class="fas fa-paper-plane text-sm"></i>
                </button>
            </div>
            <div class="flex items-center justify-between mt-1.5 px-1">
                <div class="flex items-center gap-3 text-[11px] text-ink-muted/60">
                    <span><kbd class="px-1 py-0.5 bg-surface-2 rounded text-[10px]">Enter</kbd> send</span>
                    <span><kbd class="px-1 py-0.5 bg-surface-2 rounded text-[10px]">Shift+Enter</kbd> new line</span>
                    <span><code class="px-1 py-0.5 bg-surface-2 rounded text-[10px]">/assign @USER_ID title: task | priority: high | deadline: 2026-08-03</code></span>
                </div>
                <span id="char-count" class="text-[11px] text-ink-muted/40">0/2000</span>
            </div>
        </div>
    </div>
</div>

<style>
.chat-bubble{animation:fadeSlideIn .25s ease-out}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.mention-tag{background:rgba(139,92,246,0.15);color:#a78bfa;padding:1px 4px;border-radius:4px;font-weight:600;cursor:default}
.task-card{background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.08));border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:10px 14px;margin-top:6px}
.date-separator{display:flex;align-items:center;gap:12px;margin:16px 0}
.date-separator::before,.date-separator::after{content:'';flex:1;height:1px;background:var(--color-hairline,#333)}
.date-separator span{font-size:11px;font-weight:600;color:var(--color-ink-muted,#888);text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap}
#mention-dropdown .mention-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background 0.15s}
#mention-dropdown .mention-item:hover,#mention-dropdown .mention-item.active{background:var(--color-surface-2,#1a1a1a)}
</style>

<script>
const API = '<?= BASE_PATH ?>/api/chat.php';
const CURRENT_USER_ID = '<?= htmlspecialchars($userId, ENT_QUOTES) ?>';
const CURRENT_USER_NAME = '<?= htmlspecialchars($userName, ENT_QUOTES) ?>';

let lastMessageId = 0;
let allUsers = [];
let pollTimer = null;
let mentionActive = false;
let mentionStart = -1;
let mentionFilter = '';
let activeMentionIndex = 0;
let selectedMentions = []; // {user_id, name}

// ── Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadMessages();
    pollTimer = setInterval(pollMessages, 3000);
    setupInput();
});

// ── Load Users ──────────────────────────────────────────────────────────
async function loadUsers() {
    try {
        const r = await fetch(API + '?action=users');
        const d = await r.json();
        if (d.success) allUsers = d.users;
    } catch(e) { console.error('Failed to load users', e); }
}

// ── Load Messages ───────────────────────────────────────────────────────
async function loadMessages() {
    try {
        const r = await fetch(API + '?action=messages&limit=100');
        const d = await r.json();
        if (d.success) {
            document.getElementById('chat-loading').classList.add('hidden');
            if (d.messages.length === 0) {
                document.getElementById('chat-empty').classList.remove('hidden');
                document.getElementById('chat-empty').classList.add('flex');
            } else {
                document.getElementById('chat-empty').classList.add('hidden');
                renderMessages(d.messages, false);
            }
        }
    } catch(e) { console.error('Failed to load messages', e); }
}

// ── Poll ────────────────────────────────────────────────────────────────
async function pollMessages() {
    try {
        const r = await fetch(API + '?action=messages&after_id=' + lastMessageId);
        const d = await r.json();
        if (d.success && d.messages.length > 0) {
            document.getElementById('chat-empty').classList.add('hidden');
            renderMessages(d.messages, true);
        }
    } catch(e) {}
}

// ── Render Messages ─────────────────────────────────────────────────────
function renderMessages(messages, append) {
    const container = document.getElementById('chat-messages');
    let lastDate = '';

    messages.forEach(msg => {
        // Date separator
        const msgDate = new Date(msg.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'});
        if (msgDate !== lastDate) {
            lastDate = msgDate;
            const today = new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'});
            const yesterday = new Date(Date.now()-86400000).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'});
            let label = msgDate;
            if (msgDate === today) label = 'Today';
            else if (msgDate === yesterday) label = 'Yesterday';

            // Only add if not already present
            if (!document.getElementById('date-' + msgDate.replace(/\s/g,''))) {
                const sep = document.createElement('div');
                sep.className = 'date-separator';
                sep.id = 'date-' + msgDate.replace(/\s/g,'');
                sep.innerHTML = '<span>' + label + '</span>';
                container.appendChild(sep);
            }
        }

        // Skip if already rendered
        if (document.getElementById('msg-' + msg.message_id)) return;

        const isMe = msg.user_id === CURRENT_USER_ID;
        const initials = msg.sender_name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
        const roleLabel = formatRole(msg.sender_role);
        const time = new Date(msg.created_at).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',hour12:true});
        const processedMsg = processMessageText(msg.message, msg.mentions || []);

        const bubble = document.createElement('div');
        bubble.id = 'msg-' + msg.message_id;
        bubble.className = 'chat-bubble flex gap-2.5 ' + (isMe ? 'flex-row-reverse' : '');

        let taskCard = '';
        if (msg.has_task_assignment == 1) {
            taskCard = '<div class="task-card"><div class="flex items-center gap-2 text-xs"><i class="fas fa-clipboard-check text-green-500"></i><span class="font-bold text-green-400">Task Assigned</span></div></div>';
        }

        const avatarColors = {
            admin:'from-red-500 to-rose-600', employee:'from-blue-500 to-cyan-600',
            intern:'from-orange-500 to-amber-600', campus_saarthi:'from-green-500 to-emerald-600',
            vendor:'from-purple-500 to-violet-600', freelancer:'from-purple-500 to-violet-600',
            pillar_post:'from-teal-500 to-cyan-600', part_time:'from-pink-500 to-rose-600',
            teaching_expert:'from-yellow-500 to-orange-600'
        };
        const gradient = avatarColors[msg.sender_role] || 'from-gray-500 to-slate-600';

        bubble.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow">
                    <span class="text-white text-[10px] font-bold">${initials}</span>
                </div>
            </div>
            <div class="max-w-[75%] sm:max-w-[65%]">
                <div class="flex items-baseline gap-2 ${isMe ? 'flex-row-reverse' : ''} mb-0.5">
                    <span class="text-xs font-bold text-ink">${esc(msg.sender_name)}</span>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted">${roleLabel}</span>
                    <span class="text-[10px] text-ink-muted/50">${time}</span>
                </div>
                <div class="bg-${isMe ? 'violet-500/10 border-violet-500/20' : 'surface-1 border-hairline'} border rounded-xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} px-3.5 py-2.5">
                    <p class="text-sm text-ink leading-relaxed whitespace-pre-wrap break-words">${processedMsg}</p>
                    ${taskCard}
                </div>
            </div>
        `;
        container.appendChild(bubble);
        lastMessageId = Math.max(lastMessageId, parseInt(msg.message_id));
    });

    scrollToBottom();
}

function processMessageText(text, mentions) {
    let escaped = esc(text);
    // Highlight @mentions
    if (mentions && mentions.length > 0) {
        mentions.forEach(m => {
            const patterns = [
                '@' + m.mentioned_name.replace(/ /g, '_'),
                '@' + m.mentioned_name,
                '@' + m.mentioned_user_id
            ];
            patterns.forEach(p => {
                const escapedPattern = esc(p);
                if (escaped.includes(escapedPattern)) {
                    escaped = escaped.replace(escapedPattern, '<span class="mention-tag">@' + esc(m.mentioned_name) + '</span>');
                }
            });
        });
    }
    // Highlight remaining @mentions that weren't in the mentions table
    escaped = escaped.replace(/@(\w+)/g, (match, name) => {
        if (match.includes('mention-tag')) return match;
        return '<span class="mention-tag">' + match + '</span>';
    });
    // Highlight /assign command
    escaped = escaped.replace(/^(\/assign)/i, '<span class="text-green-400 font-bold">$1</span>');
    return escaped;
}

function formatRole(role) {
    const labels = {
        admin:'Admin', employee:'Member', intern:'Intern', campus_saarthi:'Campus Saarthi',
        vendor:'Vendor', freelancer:'Freelancer', pillar_post:'Pillar', part_time:'Part-Time',
        teaching_expert:'Expert'
    };
    return labels[role] || role;
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function scrollToBottom() {
    const c = document.getElementById('chat-messages');
    requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
}

// ── Send Message ────────────────────────────────────────────────────────
async function sendTeamMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    console.log('sendTeamMessage called, message:', message);
    if (!message) { console.log('Empty message, returning'); return; }

    const btn = document.getElementById('send-btn');
    btn.disabled = true;
    btn.style.opacity = '0.4';

    const mentionedIds = selectedMentions.map(m => m.user_id);

    try {
        console.log('Sending to API:', API);
        const r = await fetch(API, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({action:'send', message: message, mentioned_user_ids: mentionedIds})
        });
        console.log('API response status:', r.status);

        if (!r.ok) {
            let errMsg = 'Server error (' + r.status + ')';
            try { const errData = await r.json(); errMsg = errData.error || errMsg; } catch(x) {}
            console.error('API error:', errMsg);
            showChatError(errMsg);
            btn.disabled = false;
            btn.style.opacity = '1';
            input.focus();
            return;
        }

        const d = await r.json();
        console.log('API response data:', d);
        if (d.success) {
            input.value = '';
            input.style.height = '40px';
            selectedMentions = [];
            updateCharCount();

            if (d.task_created) {
                const banner = document.getElementById('task-banner');
                document.getElementById('task-banner-text').textContent =
                    'Task "' + d.task_created.title + '" assigned to ' + d.task_created.assigned_to;
                banner.classList.remove('hidden');
                setTimeout(() => banner.classList.add('hidden'), 5000);
            }
            // Immediately poll for new messages
            await pollMessages();
        } else {
            console.error('API returned failure:', d);
            showChatError(d.error || 'Failed to send message');
        }
    } catch(e) {
        console.error('Send failed:', e);
        showChatError('Network error. Please check your connection.');
    }
    btn.disabled = !input.value.trim();
    btn.style.opacity = input.value.trim() ? '1' : '0.4';
    input.focus();
}

function showChatError(msg) {
    // Remove any existing error toast
    const existing = document.getElementById('chat-error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'chat-error-toast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/90 backdrop-blur text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-[fadeSlideIn_0.25s_ease-out]';
    toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ── Input Setup ─────────────────────────────────────────────────────────
function setupInput() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('send-btn');

    input.addEventListener('input', function() {
        // Auto-resize
        this.style.height = '40px';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        btn.disabled = !this.value.trim();
        updateCharCount();
        handleMentionInput(this);
    });

    input.addEventListener('keydown', function(e) {
        if (mentionActive) {
            const items = document.querySelectorAll('#mention-list .mention-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeMentionIndex = Math.min(activeMentionIndex + 1, items.length - 1);
                updateMentionHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeMentionIndex = Math.max(activeMentionIndex - 1, 0);
                updateMentionHighlight();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (items[activeMentionIndex]) items[activeMentionIndex].click();
            } else if (e.key === 'Escape') {
                closeMentionDropdown();
            }
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTeamMessage();
        }
    });
}

function updateCharCount() {
    const input = document.getElementById('chat-input');
    document.getElementById('char-count').textContent = input.value.length + '/2000';
}

// ── Mention System ──────────────────────────────────────────────────────
function handleMentionInput(input) {
    const val = input.value;
    const cursor = input.selectionStart;
    // Find @ before cursor
    let atPos = -1;
    for (let i = cursor - 1; i >= 0; i--) {
        if (val[i] === '@') { atPos = i; break; }
        if (val[i] === ' ' && i < cursor - 1 && val.substring(i+1, cursor).includes(' ')) break;
    }

    if (atPos >= 0 && (atPos === 0 || val[atPos-1] === ' ' || val[atPos-1] === '\n')) {
        mentionFilter = val.substring(atPos + 1, cursor).toLowerCase();
        mentionStart = atPos;
        mentionActive = true;
        showMentionDropdown(mentionFilter);
    } else {
        closeMentionDropdown();
    }
}

function showMentionDropdown(filter) {
    const dropdown = document.getElementById('mention-dropdown');
    const list = document.getElementById('mention-list');
    const filtered = allUsers.filter(u =>
        u.name.toLowerCase().includes(filter) ||
        u.user_id.toLowerCase().includes(filter)
    ).slice(0, 8);

    if (filtered.length === 0) { closeMentionDropdown(); return; }

    activeMentionIndex = 0;
    list.innerHTML = filtered.map((u, i) => {
        const initials = u.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
        const role = formatRole(u.user_type);
        return `<div class="mention-item ${i===0?'active':''}" data-user-id="${esc(u.user_id)}" data-name="${esc(u.name)}" onclick="selectMention(this)">
            <div class="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <span class="text-primary-400 text-[10px] font-bold">${initials}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-ink truncate">${esc(u.name)}</p>
                <p class="text-[10px] text-ink-muted">${esc(u.user_id)} • ${role}</p>
            </div>
        </div>`;
    }).join('');

    // Dropdown is already positioned via CSS (bottom:100% inside the relative input area)
    dropdown.classList.remove('hidden');
}

function closeMentionDropdown() {
    document.getElementById('mention-dropdown').classList.add('hidden');
    mentionActive = false;
    mentionStart = -1;
}

function updateMentionHighlight() {
    const items = document.querySelectorAll('#mention-list .mention-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === activeMentionIndex);
    });
}

function selectMention(el) {
    const userId = el.dataset.userId;
    const name = el.dataset.name;
    const input = document.getElementById('chat-input');
    const val = input.value;
    const displayName = '@' + name.replace(/ /g, '_');
    const before = val.substring(0, mentionStart);
    const after = val.substring(input.selectionStart);
    input.value = before + displayName + ' ' + after;
    input.focus();
    const newCursor = (before + displayName + ' ').length;
    input.setSelectionRange(newCursor, newCursor);

    if (!selectedMentions.find(m => m.user_id === userId)) {
        selectedMentions.push({user_id: userId, name: name});
    }
    closeMentionDropdown();
    document.getElementById('send-btn').disabled = !input.value.trim();
    updateCharCount();
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
