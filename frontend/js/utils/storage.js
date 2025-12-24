// LocalStorage utilities for visitor tracking
// All code uses camelCase naming convention

/**
 * Get or create a unique visitor ID
 * @returns {string} Visitor ID
 */
export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('bookmarkletVisitorId');
  if (!visitorId) {
    // Generate a unique ID for this visitor
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bookmarkletVisitorId', visitorId);
  }
  return visitorId;
}

/**
 * Check if visitor has viewed today
 * @returns {boolean} True if viewed today
 */
export function hasViewedToday() {
  const lastViewDate = localStorage.getItem('bookmarkletLastViewDate');
  const today = new Date().toDateString();
  return lastViewDate === today;
}

