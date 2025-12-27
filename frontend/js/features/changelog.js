function parseChangelogMarkdown(markdown) {
  let html = '';
  const lines = markdown.split('\n');
  let inVersion = false;
  let currentVersion = null;
  let currentSection = null;
  let currentList = [];
  const versions = []; // Store all versions for TOC
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      continue;
    }
    
    if (line.includes('📚 〢') && line.includes('id="description"')) {
      continue;
    }
    
    if (line.includes('All notable changes and updates')) {
      continue;
    }
    
    if (line.includes('🌐 〢 Table Of Contents') || (line.includes('id="content"') && line.includes('Table Of Contents'))) {
      continue;
    }
    
    if (line.startsWith('- **[🔗') || line.startsWith('- **[📖') || line.startsWith('- **[📥') || line.startsWith('- **📚') || (line.includes('🏷️ 〢 Version') && line.startsWith('  -'))) {
      continue;
    }
    
    const versionMatch = line.match(/##\s*<a\s+id="([^"]+)"[^>]*><\/a>\s*[^\[]+\s*\[([^\]]+)\]\([^\)]+\)\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (versionMatch) {
      if (inVersion && currentVersion) {
        if (currentSection && currentList.length > 0) {
          html += renderSection(currentSection, currentList);
        }
        html += `</div>`;
      }
      
      inVersion = true;
      currentVersion = {
        id: versionMatch[1],
        title: versionMatch[2],
        date: versionMatch[3]
      };
      
      versions.push({
        id: currentVersion.id,
        title: currentVersion.title,
        date: currentVersion.date
      });
      
      currentList = [];
      currentSection = null;
      
      const dateObj = new Date(currentVersion.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      html += `<div id="version-${currentVersion.id}" style="margin-top: 3rem; padding: 2rem; background: rgba(30, 41, 59, 0.2); border-radius: 1rem; border-left: 4px solid var(--accentColor); scroll-margin-top: 100px;">`;
      html += `<h3 style="font-size: 1.5rem; color: var(--accentColor); margin-bottom: 0.5rem; font-weight: 700;">${parseMarkdownLinks(currentVersion.title)}</h3>`;
      html += `<p style="color: var(--textSecondary); margin-bottom: 1.5rem; font-size: 0.95rem;">${formattedDate}</p>`;
      continue;
    }
    
    const sectionMatch = line.match(/###\s*([➕🔨🛠️🗑️✍️🚫📝\s]+)(.+)/);
    if (sectionMatch && inVersion) {
      if (currentSection && currentList.length > 0) {
        html += renderSection(currentSection, currentList);
        currentList = [];
      }
      
      currentSection = sectionMatch[2].trim();
      continue;
    }
    
    if (line.startsWith('- ') && inVersion) {
      const item = line.substring(2).trim();
      if (item !== 'N/A') {
        currentList.push(parseMarkdownLinks(item));
      }
      continue;
    }
    
    if (inVersion && line.startsWith('### ') && !line.match(/###\s*[➕🔨🛠️🗑️✍️🚫📝]/)) {
      const description = line.substring(4).trim();
      if (description) {
        if (currentSection && currentList.length > 0) {
          html += renderSection(currentSection, currentList);
          currentList = [];
          currentSection = null;
        }
        html += `<p style="color: var(--textSecondary); margin-top: 1rem; line-height: 1.8;">${parseMarkdownLinks(description)}</p>`;
      }
      continue;
    }
    
    if (!inVersion && line && !line.startsWith('#') && !line.startsWith('-')) {
    }
  }
  
  if (inVersion && currentVersion) {
    if (currentSection && currentList.length > 0) {
      html += renderSection(currentSection, currentList);
    }
    html += `</div>`;
  }
  
  return { html, versions };
}

/**
 * Generate table of contents HTML from versions array
 * @param {Array} versions - Array of version objects
 * @returns {string} HTML for TOC
 */
function generateTableOfContents(versions) {
  if (versions.length === 0) return '';
  
  // Match the structure used on other pages (reportIssue.html, request.html)
  let tocHtml = '<section class="aboutTOC section">';
  tocHtml += '<div class="sectionContainerSubtle">';
  tocHtml += '<div class="aboutContent">';
  tocHtml += '<h2 class="aboutSectionTitle">Table of Contents</h2>';
  tocHtml += '<nav class="tocNav">';
  
  versions.forEach(version => {
    const dateObj = new Date(version.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const linkText = `${escapeHtml(version.title)} (${formattedDate})`;
    tocHtml += `<a href="#version-${version.id}" class="tocLink">${linkText}</a>`;
  });
  
  tocHtml += '</nav>';
  tocHtml += '</div>';
  tocHtml += '</div>';
  tocHtml += '</section>';
  
  return tocHtml;
}

function renderSection(sectionName, items) {
  if (items.length === 0) return '';
  
  const sectionIcons = {
    'Added': '✨',
    'Fixed': '🔨',
    'Changed': '🛠️',
    'Removed': '🗑️',
    'To Do': '✍️',
    'Not Working': '🚫',
    'Notes': '📝'
  };
  
  const icon = sectionIcons[sectionName] || '•';
  
  let html = `<div style="margin-top: 1.5rem;">`;
  html += `<h4 style="font-size: 1.125rem; color: var(--textPrimary); margin-bottom: 0.75rem; font-weight: 600;">${icon} ${escapeHtml(sectionName)}</h4>`;
  html += `<ul style="margin-left: 1.5rem; color: var(--textSecondary); line-height: 1.8;">`;
  
  items.forEach(item => {
    html += `<li>${item}</li>`;
  });
  
  html += `</ul>`;
  html += `</div>`;
  
  return html;
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function parseMarkdownLinks(text) {
  const boldPlaceholders = [];
  const linkPlaceholders = [];
  let boldIndex = 0;
  let linkIndex = 0;
  
  let result = text.replace(/\*\*\[([^\]]+)\]\(([^\)]+)\)\*\*/g, (match, linkText, url) => {
    const escapedText = escapeHtml(linkText);
    const escapedUrl = escapeHtml(url);
    const placeholder = `__PLACEHOLDER_BOLD_${boldIndex}__`;
    boldPlaceholders.push(`<strong><a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accentColor); text-decoration: none;">${escapedText}</a></strong>`);
    boldIndex++;
    return placeholder;
  });
  
  result = result.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, linkText, url) => {
    const escapedText = escapeHtml(linkText);
    const escapedUrl = escapeHtml(url);
    const placeholder = `__PLACEHOLDER_LINK_${linkIndex}__`;
    linkPlaceholders.push(`<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accentColor); text-decoration: none;">${escapedText}</a>`);
    linkIndex++;
    return placeholder;
  });
  
  result = escapeHtml(result);
  
  boldPlaceholders.forEach((html, index) => {
    result = result.replace(`__PLACEHOLDER_BOLD_${index}__`, html);
  });
  
  linkPlaceholders.forEach((html, index) => {
    result = result.replace(`__PLACEHOLDER_LINK_${index}__`, html);
  });
  
  return result;
}


export async function initializeChangelog() {
  const changelogContainer = document.getElementById('changelogContent');
  if (!changelogContainer) return;
  
  changelogContainer.innerHTML = '<p style="color: var(--textSecondary); text-align: center;">Loading changelog...</p>';
  
  try {
    const changelogUrl = 'https://raw.githubusercontent.com/DevBubba/Rocket-Cleaner/refs/heads/main/CHANGELOG.md';
    
    const response = await fetch(changelogUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'text/plain, text/markdown, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch changelog: ${response.status} ${response.statusText}`);
    }
    
    const markdown = await response.text();
    const cleanMarkdown = markdown.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const result = parseChangelogMarkdown(cleanMarkdown);
    
    if (result.html && result.html.trim().length > 0) {
      const tocHtml = generateTableOfContents(result.versions);
      changelogContainer.innerHTML = tocHtml + result.html;
    } else {
      changelogContainer.innerHTML = '<p style="color: var(--textSecondary); text-align: center;">No changelog entries found.</p>';
    }
  } catch (error) {
    console.error('Error loading changelog:', error);
    changelogContainer.innerHTML = `
      <div style="padding: 2rem; background: rgba(239, 68, 68, 0.1); border-radius: 1rem; border-left: 4px solid #ef4444; text-align: center;">
        <p style="color: var(--textSecondary); margin-bottom: 1rem;">Unable to load changelog automatically.</p>
        <p style="color: var(--textSecondary);">
          <a href="https://github.com/DevBubba/Bookmarklets/blob/main/docs/CHANGELOG.md" target="_blank" rel="noopener noreferrer" style="color: var(--accentColor); text-decoration: none;">View changelog on GitHub</a>
        </p>
      </div>
    `;
  }
}

