export function initializeCategories() {
  const categoryGrid = document.getElementById('categoryGrid');
  if (!categoryGrid) return;
  
  const categories = [
    { name: 'Developer Tools', icon: '💻', count: 0, color: '#22c55e', slug: 'developer-tools' },
    { name: 'Productivity', icon: '⚡', count: 0, color: '#22c55e', slug: 'productivity' },
    { name: 'Privacy & Security', icon: '🔒', count: 0, color: '#22c55e', slug: 'privacy-security' },
    { name: 'Automation', icon: '🤖', count: 0, color: '#22c55e', slug: 'automation' },
    { name: 'Utilities', icon: '🛠️', count: 0, color: '#22c55e', slug: 'utilities' },
    { name: 'Visual Effects', icon: '🎨', count: 0, color: '#22c55e', slug: 'visual-effects' },
    { name: 'Games', icon: '🎮', count: 0, color: '#22c55e', slug: 'games' },
    { name: 'Hacks', icon: '⚡', count: 0, color: '#22c55e', slug: 'hacks' }
  ];
  
  categories.forEach(category => {
    const categoryCard = document.createElement('div');
    categoryCard.className = 'categoryCard';
    categoryCard.innerHTML = `
      <div class="categoryIcon">${category.icon}</div>
      <h4 class="categoryName">${category.name}</h4>
      <span class="categoryCount">${category.count} bookmarklets</span>
    `;
    categoryCard.addEventListener('click', () => {
      const url = new URL('./pages/browse.html', window.location.href);
      url.searchParams.set('category', category.slug);
      window.location.href = url.toString();
    });
    
    categoryGrid.appendChild(categoryCard);
  });
}

