export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('bookmarkletVisitorId');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bookmarkletVisitorId', visitorId);
  }
  return visitorId;
}

export function hasViewedToday() {
  const lastViewDate = localStorage.getItem('bookmarkletLastViewDate');
  const today = new Date().toDateString();
  return lastViewDate === today;
}

