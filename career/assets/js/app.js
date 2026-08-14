// Karya Saarthi Career Portal - Main JS

// Attendance Timer
let timerInterval = null;
let startTime = null;

function startAttendanceTimer(startTimeStr) {
    startTime = new Date(startTimeStr);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!startTime) return;
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const el = document.getElementById('attendance-timer');
    if (el) el.textContent = display;
    const durEl = document.getElementById('attendance-duration');
    if (durEl) durEl.textContent = `${hours}h ${minutes}m`;
}

function stopAttendanceTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// Commission Calculator
function calculateCommission() {
    const val = parseFloat(document.getElementById('project-value')?.value || 0);
    const rate = 0.10;
    const commission = val * rate;
    const el = document.getElementById('commission-result');
    if (el) el.textContent = '₹' + commission.toLocaleString('en-IN');
    const m5 = document.getElementById('monthly-5');
    if (m5) m5.textContent = '₹' + (commission * 5).toLocaleString('en-IN');
    const m10 = document.getElementById('monthly-10');
    if (m10) m10.textContent = '₹' + (commission * 10).toLocaleString('en-IN');
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confirm Dialog
function confirmAction(message) {
    return confirm(message);
}
