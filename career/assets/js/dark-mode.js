/**
 * Karya Saarthi - Default Dark (Black) Theme
 * The site is permanently dark. No toggle.
 * This file is retained for compatibility but the toggle button is removed.
 */
(function () {
  "use strict";
  // Site is always in dark/black mode — nothing to do.
  // Clear any stale localStorage preference so old visitors are not stuck.
  try {
    localStorage.removeItem("ks_dark_mode");
  } catch (e) {}
})();
