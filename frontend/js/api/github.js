import { animateNumber } from '../utils/animations.js';

export function updateGitHubStat(statId, value) {
  const statElement = document.getElementById(statId);
  if (statElement) {
    const currentValue = parseInt(statElement.textContent) || 0;
    animateNumber(statElement, currentValue, value, 1500);
  }
}

export async function initializeGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets');
    if (response.ok) {
      const data = await response.json();
      
      updateGitHubStat('githubStars', data.stargazers_count || 77);
      updateGitHubStat('githubForks', data.forks_count || 18);
      
      await fetchRepositoryViews();
      const openIssuesResponse = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/issues?state=open&per_page=1');
      if (openIssuesResponse.ok) {
        const openIssuesData = await openIssuesResponse.json();
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
      
      const closedIssuesResponse = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/issues?state=closed&per_page=1');
      if (closedIssuesResponse.ok) {
        const closedIssuesData = await closedIssuesResponse.json();
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
    
    await fetchLastCommit();
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
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

export async function fetchRepositoryViews() {
  try {
    const totalViews = 2195;
    updateGitHubStat('githubViews', totalViews);
  } catch (error) {
    console.error('Error fetching repository views:', error);
    updateGitHubStat('githubViews', 2195);
  }
}

let globalCommitUrl = null;

export async function fetchLastCommit() {
  try {
    const response = await fetch('https://api.github.com/repos/DevBubba/Bookmarklets/commits?per_page=1');
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0 && data[0]) {
        const commit = data[0];
        const commitSha = commit.sha;
        
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
        
        const lastCommitElement = document.getElementById('lastCommit');
        if (lastCommitElement) {
          lastCommitElement.textContent = formattedDate;
        }
        
        const commitUrl = `https://github.com/DevBubba/Bookmarklets/commit/${commitSha}`;
        globalCommitUrl = commitUrl;
        
        const latestCommitButton = document.getElementById('latestCommitButton');
        if (latestCommitButton) {
          latestCommitButton.href = commitUrl;
        }
        
        const updateLastCommitLinks = () => {
          let lastCommitLinks = Array.from(document.querySelectorAll('#lastCommitLink'));
          
          if (lastCommitLinks.length === 0) {
            const allFooterLinks = document.querySelectorAll('.footerLink');
            allFooterLinks.forEach(link => {
              if (link.textContent.trim() === 'Latest Commit' || link.id === 'lastCommitLink') {
                lastCommitLinks.push(link);
              }
            });
          }
          
          if (lastCommitLinks.length > 0) {
            lastCommitLinks.forEach((link) => {
              link.setAttribute('href', commitUrl);
              link.href = commitUrl;
              if (link.onclick) {
                link.onclick = null;
              }
              link.removeAttribute('href');
              link.setAttribute('href', commitUrl);
              link.href = commitUrl;
            });
            return true;
          } else {
            return false;
          }
        };
        
        let updated = updateLastCommitLinks();
        
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
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                const link = node.id === 'lastCommitLink' ? node : node.querySelector?.('#lastCommitLink');
                if (link) {
                  link.setAttribute('href', commitUrl);
                  link.href = commitUrl;
                }
              }
            });
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        if (document.readyState === 'loading') {
          window.addEventListener('load', () => {
            updateLastCommitLinks();
          });
        }
        
        window.__latestCommitUrl = commitUrl;
        
        window.updateLatestCommitLinks = () => {
          const url = window.__latestCommitUrl || globalCommitUrl || commitUrl;
          const links = document.querySelectorAll('#lastCommitLink');
          links.forEach((link) => {
            link.removeAttribute('href');
            link.setAttribute('href', url);
            link.href = url;
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

