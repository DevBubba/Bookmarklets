// GitHub API integration for repository stats
// All code uses camelCase naming convention

import { animateNumber } from '../utils/animations.js';

/**
 * Update GitHub stat element with animated number
 * @param {string} statId - ID of the stat element
 * @param {number} value - Value to display
 */
export function updateGitHubStat(statId, value) {
  const statElement = document.getElementById(statId);
  if (statElement) {
    const currentValue = parseInt(statElement.textContent) || 0;
    animateNumber(statElement, currentValue, value, 1500);
  }
}

/**
 * Initialize GitHub stats
 * Fetches repository stats from GitHub API
 */
export async function initializeGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets');
    if (response.ok) {
      const data = await response.json();
      
      updateGitHubStat('githubStars', data.stargazers_count || 77);
      updateGitHubStat('githubForks', data.forks_count || 18);
      
      // Try to fetch repository views (requires authentication, so we'll use a workaround)
      // GitHub's traffic API requires auth, so we'll calculate an estimate based on stars/forks
      // Or you can set this manually if you have access to GitHub Insights
      await fetchRepositoryViews();
      
      // Fetch open issues count
      const openIssuesResponse = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/issues?state=open&per_page=1');
      if (openIssuesResponse.ok) {
        const openIssuesData = await openIssuesResponse.json();
        // Try to get count from Link header
        const linkHeader = openIssuesResponse.headers.get('Link');
        let openIssuesCount = openIssuesData.length;
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            openIssuesCount = parseInt(match[1]);
          }
        }
        updateGitHubStat('githubIssues', openIssuesCount || 0);
      }
      
      // Fetch closed issues count
      const closedIssuesResponse = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/issues?state=closed&per_page=1');
      if (closedIssuesResponse.ok) {
        const closedIssuesData = await closedIssuesResponse.json();
        // Try to get count from Link header
        const linkHeader = closedIssuesResponse.headers.get('Link');
        let closedIssuesCount = closedIssuesData.length;
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            closedIssuesCount = parseInt(match[1]);
          }
        }
        updateGitHubStat('githubClosedIssues', closedIssuesCount || 0);
      }
    }
    
    // Fetch last commit
    await fetchLastCommit();
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    // Use fallback values from HTML
    updateGitHubStat('githubStars', 77);
    updateGitHubStat('githubForks', 18);
    updateGitHubStat('githubViews', 0);
    updateGitHubStat('githubIssues', 0);
    updateGitHubStat('githubClosedIssues', 0);
    const lastCommitElement = document.getElementById('lastCommit');
    if (lastCommitElement) {
      lastCommitElement.textContent = 'Unable to load';
    }
  }
}

/**
 * Fetch repository views
 * Using the actual total views: 2,195 (as shown in GitHub Insights)
 */
export async function fetchRepositoryViews() {
  try {
    // GitHub's traffic API requires authentication, so we'll use the actual value
    // Total views: 2,195 (as of the user's GitHub Insights data)
    const totalViews = 2195;
    updateGitHubStat('githubViews', totalViews);
    
    // If you want to update this dynamically, you would need to:
    // 1. Set up a backend endpoint that uses GitHub's authenticated API
    // 2. Or manually update this value periodically
    // The GitHub traffic API endpoint is: GET /repos/{owner}/{repo}/traffic/views
    // But it requires authentication and returns data for the last 14 days
  } catch (error) {
    console.error('Error fetching repository views:', error);
    updateGitHubStat('githubViews', 2195); // Fallback to known value
  }
}

/**
 * Fetch last commit information
 * Gets the most recent commit and updates the UI
 */
// Store commit URL globally for access from anywhere
let globalCommitUrl = null;

export async function fetchLastCommit() {
  try {
    console.log('Fetching last commit...');
    const response = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/commits?per_page=1');
    if (response.ok) {
      const data = await response.json();
      console.log('Commit data received:', data);
      if (data.length > 0 && data[0]) {
        const commit = data[0];
        const commitSha = commit.sha;
        console.log('Commit SHA:', commitSha);
        
        if (!commitSha) {
          console.error('No commit SHA found in response');
          return;
        }
        
        const commitDate = new Date(commit.commit.author.date);
        const formattedDate = commitDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Update the last commit date text if element exists
        const lastCommitElement = document.getElementById('lastCommit');
        if (lastCommitElement) {
          lastCommitElement.textContent = formattedDate;
        }
        
        const commitUrl = `https://github.com/DevBubba/Bookmarklets/commit/${commitSha}`;
        globalCommitUrl = commitUrl; // Store globally
        console.log('Commit URL:', commitUrl);
        
        // Update the latest commit button link to point to the actual commit
        const latestCommitButton = document.getElementById('latestCommitButton');
        if (latestCommitButton) {
          latestCommitButton.href = commitUrl;
          console.log('Updated latestCommitButton href to:', latestCommitButton.href);
        } else {
          console.warn('latestCommitButton element not found');
        }
        
        // Function to update all lastCommitLink elements
        const updateLastCommitLinks = () => {
          // Try multiple selectors to find the links
          let lastCommitLinks = Array.from(document.querySelectorAll('#lastCommitLink'));
          
          // If not found by ID, try finding links that match the pattern
          if (lastCommitLinks.length === 0) {
            // Find all footer links that contain "Latest Commit" text
            const allFooterLinks = document.querySelectorAll('.footerLink');
            allFooterLinks.forEach(link => {
              if (link.textContent.trim() === 'Latest Commit' || link.id === 'lastCommitLink') {
                lastCommitLinks.push(link);
              }
            });
          }
          
          console.log('Found lastCommitLink elements:', lastCommitLinks.length);
          
          if (lastCommitLinks.length > 0) {
            lastCommitLinks.forEach((link, index) => {
              // Use both setAttribute and direct property assignment to ensure it works
              link.setAttribute('href', commitUrl);
              link.href = commitUrl;
              // Remove any onclick handlers that might interfere
              if (link.onclick) {
                link.onclick = null;
              }
              // Force remove and re-add to ensure it's updated
              const oldHref = link.getAttribute('href');
              link.removeAttribute('href');
              link.setAttribute('href', commitUrl);
              link.href = commitUrl;
              
              console.log(`Updated lastCommitLink[${index}]`);
              console.log(`  Old href: ${oldHref}`);
              console.log(`  New href: ${link.href}`);
              console.log(`  getAttribute('href'): ${link.getAttribute('href')}`);
              console.log(`  Link element:`, link);
            });
            return true; // Success
          } else {
            console.warn('No lastCommitLink elements found');
            return false; // Not found
          }
        };
        
        // Update immediately
        let updated = updateLastCommitLinks();
        
        // If not found, retry multiple times
        if (!updated) {
          setTimeout(() => {
            updateLastCommitLinks();
          }, 100);
          setTimeout(() => {
            updateLastCommitLinks();
          }, 500);
          setTimeout(() => {
            updateLastCommitLinks();
          }, 1000);
        }
        
        // Use MutationObserver to watch for when footer is added to DOM
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                // Check if this node or its children contain the link
                const link = node.id === 'lastCommitLink' ? node : node.querySelector?.('#lastCommitLink');
                if (link) {
                  link.setAttribute('href', commitUrl);
                  link.href = commitUrl;
                  console.log('MutationObserver updated lastCommitLink:', link.href);
                }
              }
            });
          });
        });
        
        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Also update on window load
        if (document.readyState === 'loading') {
          window.addEventListener('load', () => {
            updateLastCommitLinks();
          });
        }
        
        // Store the commit URL globally so we can update links that load later
        window.__latestCommitUrl = commitUrl;
        
        // Also create a function that can be called anytime to update links
        window.updateLatestCommitLinks = () => {
          const url = window.__latestCommitUrl || globalCommitUrl || commitUrl;
          console.log('updateLatestCommitLinks called with URL:', url);
          const links = document.querySelectorAll('#lastCommitLink');
          console.log('Found links to update:', links.length);
          links.forEach((link, i) => {
            const oldHref = link.href;
            link.removeAttribute('href');
            link.setAttribute('href', url);
            link.href = url;
            console.log(`Link ${i}: ${oldHref} -> ${link.href}`);
          });
          return links.length > 0;
        };
        
        // Call it one more time after everything loads
        if (document.readyState === 'complete') {
          setTimeout(() => updateLastCommitLinks(), 2000);
        } else {
          window.addEventListener('load', () => {
            setTimeout(() => updateLastCommitLinks(), 1000);
          });
        }
      } else {
        console.error('No commits found in response');
      }
    } else {
      console.error('Failed to fetch commits:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching last commit:', error);
    const lastCommitElement = document.getElementById('lastCommit');
    if (lastCommitElement) {
      lastCommitElement.textContent = 'Unable to load';
    }
  }
}

