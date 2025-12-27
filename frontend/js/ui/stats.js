import { animateNumber } from '../utils/animations.js';
import { getOrCreateVisitorId, hasViewedToday } from '../utils/storage.js';

export function updateStat(statId, value) {
  const statElement = document.getElementById(statId);
  if (statElement) {
    animateNumber(statElement, 0, value, 1000);
  }
}

export function initializeStats() {
  updateStat('totalBookmarklets', 0);
  updateStat('totalViews', 0);
  updateStat('totalUsers', 0);
  updateStat('totalDownloads', 0);
  updateStat('totalSaved', 0);
  
  trackWebsiteView();
  trackUniqueUser();
  fetchTotalDownloads();
  fetchTotalSaved();
}

export function trackUniqueUser() {
  const userId = getOrCreateVisitorId();
  const usersKey = 'websiteUsers';
  
  let users = JSON.parse(localStorage.getItem(usersKey) || '[]');
  
  if (!users.includes(userId)) {
    users.push(userId);
    localStorage.setItem(usersKey, JSON.stringify(users));
  }
  
  updateStat('totalUsers', users.length);
}

export async function trackWebsiteView() {
  try {
    if (hasViewedToday()) {
      await fetchWebsiteViews();
      return;
    }
    
    const visitorId = getOrCreateVisitorId();
    const today = new Date().toDateString();
    
    localStorage.setItem('bookmarkletLastViewDate', today);
    
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    const newViews = localViews + 1;
    localStorage.setItem('bookmarkletLocalViews', newViews.toString());
    
    try {
    } catch (error) {
      console.log('Backend not available, using local storage');
    }
    
    await fetchWebsiteViews();
  } catch (error) {
    console.error('Error tracking website view:', error);
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    updateStat('totalViews', localViews);
  }
}

export async function fetchWebsiteViews() {
  try {
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    updateStat('totalViews', localViews);
  } catch (error) {
    console.error('Error fetching website views:', error);
    const localViews = parseInt(localStorage.getItem('bookmarkletLocalViews') || '0');
    updateStat('totalViews', localViews);
  }
}

export async function fetchTotalDownloads() {
  try {
    const localDownloads = parseInt(localStorage.getItem('bookmarkletTotalDownloads') || '0');
    updateStat('totalDownloads', localDownloads);
  } catch (error) {
    console.error('Error fetching total downloads:', error);
    const localDownloads = parseInt(localStorage.getItem('bookmarkletTotalDownloads') || '0');
    updateStat('totalDownloads', localDownloads);
  }
}

export async function fetchTotalSaved() {
  try {
    const localSaved = parseInt(localStorage.getItem('bookmarkletTotalSaved') || '0');
    updateStat('totalSaved', localSaved);
  } catch (error) {
    console.error('Error fetching total saved:', error);
    const localSaved = parseInt(localStorage.getItem('bookmarkletTotalSaved') || '0');
    updateStat('totalSaved', localSaved);
  }
}

