/**
 * Karya Saarthi - Session Security & Auto-Logout System
 *
 * Features:
 * - 5-minute inactivity timeout (15 min for admins)
 * - 60-second warning modal with live countdown
 * - Activity tracking (throttled to 1/sec)
 * - "Remember Me" support (7-day extension)
 * - Auto-save/restore form data before timeout
 */
(function () {
  "use strict";

  // ───────────────────────────────────────────────────────
  // Configuration
  // ───────────────────────────────────────────────────────
  var DEFAULT_TIMEOUT = 5 * 60; // 5 minutes in seconds
  var ADMIN_TIMEOUT = 15 * 60; // 15 minutes in seconds
  var REMEMBER_ME_TIMEOUT = 7 * 24 * 60 * 60; // 7 days in seconds
  var WARNING_BEFORE = 60; // Show warning 60s before timeout
  var ACTIVITY_THROTTLE = 1000; // Track activity at most once per second
  var LOGOUT_URL = "/logout.php?reason=timeout";
  var FORM_BACKUP_PREFIX = "ks_form_backup_";

  // ───────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────
  var timeoutDuration = DEFAULT_TIMEOUT;
  var secondsRemaining = 0;
  var countdownInterval = null;
  var timeoutTimer = null;
  var warningTimer = null;
  var warningModal = null;
  var lastActivity = 0;
  var isWarningVisible = false;

  // ───────────────────────────────────────────────────────
  // Determine timeout based on user type / remember-me
  // ───────────────────────────────────────────────────────
  function resolveTimeout() {
    var body = document.body;

    // If "remember me" is active, skip auto-logout entirely
    if (body.getAttribute("data-remember-me") === "true") {
      return REMEMBER_ME_TIMEOUT;
    }

    // Admin gets longer timeout
    if (body.getAttribute("data-user-type") === "admin") {
      return ADMIN_TIMEOUT;
    }

    return DEFAULT_TIMEOUT;
  }

  // ───────────────────────────────────────────────────────
  // Form Data Auto-Save & Restore
  // ───────────────────────────────────────────────────────
  function getFormBackupKey() {
    return FORM_BACKUP_PREFIX + window.location.pathname;
  }

  /**
   * Save all form input values to sessionStorage
   */
  function saveFormData() {
    var data = {};
    var inputs = document.querySelectorAll("input, textarea, select");
    var hasData = false;

    inputs.forEach(function (el) {
      // Skip password fields, hidden fields, submit buttons
      if (
        el.type === "password" ||
        el.type === "hidden" ||
        el.type === "submit" ||
        el.type === "button" ||
        !el.name
      ) {
        return;
      }

      if (el.type === "checkbox" || el.type === "radio") {
        data[el.name + "__" + el.value] = el.checked;
      } else if (el.value.trim() !== "") {
        data[el.name] = el.value;
        hasData = true;
      }
    });

    if (hasData) {
      try {
        sessionStorage.setItem(getFormBackupKey(), JSON.stringify(data));
      } catch (e) {
        // Storage full or unavailable — silently fail
      }
    }
  }

  /**
   * Check for saved form data and offer to restore it
   */
  function checkFormRestore() {
    var key = getFormBackupKey();
    var saved = null;

    try {
      saved = sessionStorage.getItem(key);
    } catch (e) {
      return;
    }

    if (!saved) return;

    var data;
    try {
      data = JSON.parse(saved);
    } catch (e) {
      sessionStorage.removeItem(key);
      return;
    }

    // Only show restore prompt if there are form fields on the page
    var inputs = document.querySelectorAll("input, textarea, select");
    if (!inputs.length) {
      sessionStorage.removeItem(key);
      return;
    }

    // Show restore banner
    var banner = document.createElement("div");
    banner.id = "ks-form-restore-banner";
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99998;" +
      "background:#1e40af;color:#fff;padding:12px 20px;" +
      "display:flex;align-items:center;justify-content:space-between;" +
      "font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2)";

    banner.innerHTML =
      '<span>You have unsaved form data from a previous session. Restore it?</span>' +
      '<div>' +
      '<button id="ks-restore-yes" style="background:#22c55e;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;margin-right:8px;font-size:13px">Restore</button>' +
      '<button id="ks-restore-no" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.4);padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px">Dismiss</button>' +
      "</div>";

    document.body.appendChild(banner);

    document.getElementById("ks-restore-yes").addEventListener(
      "click",
      function () {
        restoreFormData(data);
        sessionStorage.removeItem(key);
        banner.remove();
      }
    );

    document.getElementById("ks-restore-no").addEventListener(
      "click",
      function () {
        sessionStorage.removeItem(key);
        banner.remove();
      }
    );
  }

  function restoreFormData(data) {
    Object.keys(data).forEach(function (key) {
      // Handle checkbox/radio (key format: name__value)
      if (key.indexOf("__") !== -1) {
        var parts = key.split("__");
        var name = parts[0];
        var value = parts[1];
        var el = document.querySelector(
          'input[name="' + name + '"][value="' + value + '"]'
        );
        if (el) el.checked = data[key];
        return;
      }

      var elements = document.querySelectorAll('[name="' + key + '"]');
      elements.forEach(function (el) {
        el.value = data[key];
        // Trigger change event so any JS listeners pick it up
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  // ───────────────────────────────────────────────────────
  // Warning Modal
  // ───────────────────────────────────────────────────────
  function createWarningModal() {
    var overlay = document.createElement("div");
    overlay.id = "ks-logout-warning";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;" +
      "background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);" +
      "display:flex;align-items:center;justify-content:center;" +
      "opacity:0;transition:opacity 0.3s ease";

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:32px 40px;max-width:420px;width:90%;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.25)">' +
      '<div style="width:56px;height:56px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
      '<svg width="28" height="28" fill="none" stroke="#d97706" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>' +
      "</div>" +
      '<h3 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1e293b">Session Expiring</h3>' +
      '<p style="margin:0 0 20px;color:#64748b;font-size:15px">You will be logged out in <strong id="ks-countdown" style="color:#dc2626;font-size:18px">60</strong> seconds due to inactivity.</p>' +
      '<button id="ks-stay-btn" style="background:#2563eb;color:#fff;border:none;padding:12px 32px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:background 0.2s">Stay Logged In</button>' +
      "</div>";

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(function () {
      overlay.style.opacity = "1";
    });

    // Stay logged in button
    document.getElementById("ks-stay-btn").addEventListener("click", function () {
      hideWarning();
      resetTimers();
    });

    return overlay;
  }

  function showWarning() {
    if (isWarningVisible) return;
    isWarningVisible = true;
    secondsRemaining = WARNING_BEFORE;

    warningModal = createWarningModal();
    var countdownEl = document.getElementById("ks-countdown");

    countdownInterval = setInterval(function () {
      secondsRemaining--;
      if (countdownEl) countdownEl.textContent = secondsRemaining;

      if (secondsRemaining <= 0) {
        clearInterval(countdownInterval);
        performLogout();
      }
    }, 1000);
  }

  function hideWarning() {
    isWarningVisible = false;
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (warningModal) {
      warningModal.style.opacity = "0";
      setTimeout(function () {
        if (warningModal && warningModal.parentNode) {
          warningModal.remove();
        }
        warningModal = null;
      }, 300);
    }
  }

  // ───────────────────────────────────────────────────────
  // Timer Management
  // ───────────────────────────────────────────────────────
  function resetTimers() {
    // Clear existing timers
    if (timeoutTimer) clearTimeout(timeoutTimer);
    if (warningTimer) clearTimeout(warningTimer);

    // Set warning timer (fires WARNING_BEFORE seconds before timeout)
    var warningDelay = (timeoutDuration - WARNING_BEFORE) * 1000;
    if (warningDelay > 0) {
      warningTimer = setTimeout(function () {
        showWarning();
      }, warningDelay);
    }

    // Set final logout timer
    timeoutTimer = setTimeout(function () {
      performLogout();
    }, timeoutDuration * 1000);
  }

  function performLogout() {
    // Save form data before logout
    saveFormData();

    // Clean up
    hideWarning();

    // Redirect to logout
    window.location.href = LOGOUT_URL;
  }

  // ───────────────────────────────────────────────────────
  // Activity Tracking (throttled to 1/sec)
  // ───────────────────────────────────────────────────────
  function onActivity() {
    var now = Date.now();
    if (now - lastActivity < ACTIVITY_THROTTLE) return;
    lastActivity = now;

    // If warning is showing, don't reset — user must click "Stay Logged In"
    if (!isWarningVisible) {
      resetTimers();
    }
  }

  function bindActivityEvents() {
    var events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach(function (evt) {
      document.addEventListener(evt, onActivity, { passive: true });
    });
  }

  // ───────────────────────────────────────────────────────
  // Initialize
  // ───────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    timeoutDuration = resolveTimeout();

    // If remember-me with 7-day timeout, effectively skip auto-logout
    // (still set it, but 7 days is practically never)
    if (
      document.body.getAttribute("data-remember-me") === "true"
    ) {
      // No timers, no activity tracking needed for remember-me
      checkFormRestore();
      return;
    }

    // Start timers
    resetTimers();

    // Bind activity listeners
    bindActivityEvents();

    // Check if there's form data to restore
    checkFormRestore();
  });
})();
