// Stats tracking and display functionality
// All code uses camelCase naming convention

import { animateNumber } from '../utils/animations.js';
import { getOrCreateVisitorId, hasViewedToday } from '../utils/storage.js';

/**
 * Update a stat element with animated number
 * @param {string} statId - ID of the stat element
 * @param {number} value - Value to display
 */
export function updateStat(statId, value) {
  const statElement = document.getElementById(statId);
  if (statElement) {
    animateNumber(statElement, 0, value, 1000);
  }
}

/**
 * Initialize stats display
 * Sets up initial stat values and tracks website views
 */
export function initializeStats() {
  // These will be populated from Supabase later
  // For now, set placeholder values
  updateStat('totalBookmarklets', 0);
  updateStat('totalViews', 0);
  updateStat('totalUsers', 0);
  updateStat('totalDownloads', 0);
  updateStat('totalSaved', 0);
  
  // Track website view and user
  trackWebsiteView();
  trackUniqueUser();
  fetchTotalDownloads();
  fetchTotalSaved();
}

/**
 * Track unique users
 * Adds current user to localStorage list if not already present
 */
export function trackUniqueUser() {
  const userId = getOrCreateVisitorId();
  const usersKey = 'websiteUsers';
  
  // Get existing users list
  let users = JSON.parse(localStorage.getItem(usersKey) || '[]');
  
  // Add current user if not already in list
  if (!users.includes(userId)) {
    users.push(userId);
    localStorage.setItem(usersKey, JSON.stringify(users));
  }
  
  // Update stat with total unique users
  updateStat('totalUsers', users.length);
}

/**
 * Track website view
 * Increments view count (once per day per visitor)
 */
export async function trackWebsiteView() {
  try {
    // Check if this visitor has already been counted today
    if (hasViewedToday()) {
      // Still fetch the current total to display
      await fetchWebsiteViews();
      return;
    }
    
    const visitorId = getOrCreateVisitorId();
    const today = new Date().toDateString();
    
    // Mark that this visitor has viewed today
    localStorage.setItem('bookmarkletLastViewDate', today);
    
    // TODO: Replace this with your Supabase endpoint when ready
    // For now, we'll use a simple approach:
    // Option 1: Use a free service like CountAPI or similar
    // Option 2: Set up a simple backend endpoint
    // Option 3: Use Supabase Edge Function
    
    // Temporary: Store view locally and increment a counter
    // This will be replaced with Supabase integration
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    const newViews = localViews + 1;
    localStorage.setItem('bookmarkletLocalViews', newViews.toString());
    
    // Try to send view to backend (when available)
    // This will fail gracefully if backend isn't set up yet
    try {
      // TODO: Replace with your Supabase endpoint
      // await fetch('YOUR_SUPABASE_ENDPOINT/views', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ visitorId, timestamp: new Date().toISOString() })
      // });
    } catch (error) {
      console.log('Backend not available, using local storage');
    }
    
    // Fetch and display current total
    await fetchWebsiteViews();
  } catch (error) {
    console.error('Error tracking website view:', error);
    // Fallback to local storage count
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    updateStat('totalViews', localViews);
  }
}

/**
 * Fetch website views
 * Gets total view count from backend or localStorage
 */
export async function fetchWebsiteViews() {
  try {
    // TODO: Replace with Supabase query when backend is ready
    // For now, use local storage as fallback
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    
    // If you have a backend endpoint, fetch from there:
    // const response = await fetch('YOUR_SUPABASE_ENDPOINT/views/total');
    // const data = await response.json();
    // updateStat('totalViews', data.total || localViews);
    
    // Temporary: Use local storage
    updateStat('totalViews', localViews);
  } catch (error) {
    console.error('Error fetching website views:', error);
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    updateStat('totalViews', localViews);
  }
}

/**
 * Fetch total downloads
 * Gets total download count from backend or localStorage
 */
export async function fetchTotalDownloads() {
  try {
    // TODO: Replace with Supabase endpoint
    // For now, use localStorage as placeholder
    const localDownloads = parseInt(localStorage.getItem('bookmarkletTotalDownloads') || '0');
    updateStat('totalDownloads', localDownloads);
    
    // TODO: Fetch from backend when available
    // const response = await fetch('YOUR_SUPABASE_ENDPOINT/downloads');
    // const data = await response.json();
    // updateStat('totalDownloads', data.total || localDownloads);
  } catch (error) {
    console.error('Error fetching total downloads:', error);
    const localDownloads = parseInt(localStorage.getItem('bookmarkletTotalDownloads') || '0');
    updateStat('totalDownloads', localDownloads);
  }
}

/**
 * Fetch total saved bookmarklets
 * Gets total saved count from backend or localStorage
 */
export async function fetchTotalSaved() {
  try {
    // TODO: Replace with Supabase endpoint
    // For now, use localStorage as placeholder
    const localSaved = parseInt(localStorage.getItem('bookmarkletTotalSaved') || '0');
    updateStat('totalSaved', localSaved);
    
    // TODO: Fetch from backend when available
    // const response = await fetch('YOUR_SUPABASE_ENDPOINT/saved');
    // const data = await response.json();
    // updateStat('totalSaved', data.total || localSaved);
  } catch (error) {
    console.error('Error fetching total saved:', error);
    const localSaved = parseInt(localStorage.getItem('bookmarkletTotalSaved') || '0');
    updateStat('totalSaved', localSaved);
  }
}

