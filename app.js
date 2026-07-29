import { CATEGORIES, POLITIES_DATA, GREAT_RULERS, TIMELINE_EVENTS } from './data.js';

// Global App State
const state = {
  activeCategory: 'all',
  searchQuery: '',
  selectedPolity: null,
  activeTab: 'home'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  renderCategories();
  renderPolities();
  renderRulers();
  renderTimeline();
  setupEventListeners();
});

/* -------------------------------------------------------------
   1. Canvas Floating Golden Dust Particles
------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.5,
    speedY: Math.random() * 0.4 + 0.1,
    speedX: Math.random() * 0.3 - 0.15,
    opacity: Math.random() * 0.6 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------------
   2. Main Category Cards Rendering
------------------------------------------------------------- */
function renderCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card" data-category="${cat.id}">
      <div class="category-card-img-wrap">
        <img class="category-card-img" src="${cat.image}" alt="${cat.title}">
        <span class="category-card-count">${cat.count} Polities</span>
      </div>
      <div class="category-card-body">
        <h3 class="category-card-title">${cat.title}</h3>
        <div class="category-card-subtitle">${cat.subtitle}</div>
        <p class="category-card-desc">${cat.description}</p>
        <button class="category-card-btn">
          <span>Explore Category</span>
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Add click listeners to category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-category');
      filterCategory(catId);
      scrollToSection('archive');
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

/* -------------------------------------------------------------
   3. Polity Listing Grid & Filtering
------------------------------------------------------------- */
function renderPolities() {
  const grid = document.getElementById('polity-grid');
  if (!grid) return;

  let filtered = POLITIES_DATA;

  // Category filter
  if (state.activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.activeCategory);
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.founder.toLowerCase().includes(q) ||
      p.capital.toLowerCase().includes(q) ||
      p.dynasty.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i data-lucide="scroll" style="width: 48px; height: 48px; color: var(--gold-primary); margin-bottom: 1rem;"></i>
        <h3 style="font-family: var(--font-heading); color: var(--gold-light);">No Historical Records Found</h3>
        <p>Try adjusting your search criteria or category filter.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(polity => `
    <div class="polity-card" data-id="${polity.id}">
      <div class="polity-card-header">
        <div>
          <h3 class="polity-card-name">${polity.name}</h3>
          <div class="polity-card-timeline">${polity.timeline}</div>
        </div>
        <span class="polity-type-badge">${polity.category}</span>
      </div>
      <div class="polity-card-body">
        <div class="polity-meta-row">
          <span class="polity-meta-label">Capital:</span>
          <span class="polity-meta-val">${polity.capital}</span>
        </div>
        <div class="polity-meta-row">
          <span class="polity-meta-label">Founder:</span>
          <span class="polity-meta-val">${polity.founder}</span>
        </div>
        <div class="polity-meta-row">
          <span class="polity-meta-label">Dynasty:</span>
          <span class="polity-meta-val">${polity.dynasty}</span>
        </div>
        <p class="polity-card-summary">${polity.summary}</p>
      </div>
      <div class="polity-card-footer">
        <button class="view-details-btn" onclick="openPolityModal('${polity.id}')">
          <span>View Details & Archive</span>
          <i data-lucide="book-open" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

/* -------------------------------------------------------------
   4. Polity Detail Modal
------------------------------------------------------------- */
window.openPolityModal = function(id) {
  const polity = POLITIES_DATA.find(p => p.id === id);
  if (!polity) return;

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <button class="modal-close-btn" onclick="closePolityModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div class="modal-banner">
          <img class="modal-banner-img" src="${polity.image}" alt="${polity.name}">
          <div class="modal-banner-overlay"></div>
          <div class="modal-header-text">
            <span class="polity-type-badge">${polity.polityType}</span>
            <h2 class="modal-title">${polity.name}</h2>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-quick-info">
            <div class="quick-info-item">
              <div class="quick-info-label">Founder</div>
              <div class="quick-info-value">${polity.founder}</div>
            </div>
            <div class="quick-info-item">
              <div class="quick-info-label">Dynasty</div>
              <div class="quick-info-value">${polity.dynasty}</div>
            </div>
            <div class="quick-info-item">
              <div class="quick-info-label">Era / Timeline</div>
              <div class="quick-info-value">${polity.timeline}</div>
            </div>
            <div class="quick-info-item">
              <div class="quick-info-label">Capital City</div>
              <div class="quick-info-value">${polity.capital}</div>
            </div>
          </div>

          <h3 class="modal-section-title">Historical Importance & Overview</h3>
          <p class="modal-text">${polity.summary}</p>

          ${polity.rulers ? `
            <h3 class="modal-section-title">Major Rulers & Chieftains</h3>
            <p class="modal-text">${polity.rulers.join(' • ')}</p>
          ` : ''}

          ${polity.contributions ? `
            <h3 class="modal-section-title">Cultural & Administrative Contributions</h3>
            <p class="modal-text">${polity.contributions}</p>
          ` : ''}

          ${polity.monuments ? `
            <h3 class="modal-section-title">Architecture, Monuments & Archaeology</h3>
            <p class="modal-text">${polity.monuments}</p>
          ` : ''}

          ${polity.mapRegion ? `
            <h3 class="modal-section-title">Territorial Scope & Modern Region</h3>
            <p class="modal-text">${polity.mapRegion}</p>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();

  // Close on backdrop click
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closePolityModal();
  });
};

window.closePolityModal = function() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
  document.body.style.overflow = 'auto';
};

/* -------------------------------------------------------------
   5. Great Rulers Grid Rendering
------------------------------------------------------------- */
function renderRulers() {
  const container = document.getElementById('rulers-grid');
  if (!container) return;

  container.innerHTML = GREAT_RULERS.map(ruler => `
    <div class="ruler-card">
      <div class="ruler-header">
        <img class="ruler-avatar" src="${ruler.image}" alt="${ruler.name}">
        <div>
          <h3 class="ruler-name">${ruler.name}</h3>
          <div class="ruler-title">${ruler.title}</div>
        </div>
      </div>
      <div class="ruler-reign">${ruler.dynasty} • ${ruler.reign}</div>
      <div class="ruler-details">${ruler.achievements}</div>
    </div>
  `).join('');
}

/* -------------------------------------------------------------
   6. Interactive Timeline Rendering
------------------------------------------------------------- */
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = TIMELINE_EVENTS.map((event, idx) => {
    const isLeft = idx % 2 === 0;
    return `
      <div class="timeline-node ${isLeft ? 'left' : 'right'}">
        <div class="timeline-point" title="Click for details"></div>
        <div class="timeline-box" onclick="alertTimelineEvent('${event.title}', '${event.period}', '${event.significance}')">
          <div class="timeline-period">${event.period}</div>
          <h3 class="timeline-node-title">${event.title}</h3>
          <p class="timeline-desc">${event.description}</p>
        </div>
      </div>
    `;
  }).join('');
}

window.alertTimelineEvent = function(title, period, significance) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content" style="max-width: 600px;">
        <button class="modal-close-btn" onclick="closePolityModal()">
          <i data-lucide="x"></i>
        </button>
        <div class="modal-body" style="padding-top: 2.5rem;">
          <span class="polity-type-badge">${period}</span>
          <h2 class="modal-title" style="font-size: 1.8rem; margin-top: 0.5rem; color: var(--gold-bright);">${title}</h2>
          <h3 class="modal-section-title">Historical Significance</h3>
          <p class="modal-text">${significance}</p>
        </div>
      </div>
    </div>
  `;
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
};

/* -------------------------------------------------------------
   7. Event Listeners & Navigation Controls
------------------------------------------------------------- */
function setupEventListeners() {
  // Category Filter Tabs
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-category');
      renderPolities();
    });
  });

  // Global Navbar Search Autocomplete
  const searchInput = document.getElementById('nav-search');
  const searchDropdown = document.getElementById('search-dropdown');

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      state.searchQuery = q;
      renderPolities();

      if (q.length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      const matches = POLITIES_DATA.filter(p => p.name.toLowerCase().includes(q) || p.capital.toLowerCase().includes(q)).slice(0, 5);
      if (matches.length > 0) {
        searchDropdown.innerHTML = matches.map(m => `
          <div class="search-result-item" onclick="openPolityModal('${m.id}')">
            <div class="search-result-title">${m.name}</div>
            <div class="search-result-meta">${m.category.toUpperCase()} • Capital: ${m.capital}</div>
          </div>
        `).join('');
        searchDropdown.style.display = 'block';
      } else {
        searchDropdown.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });
  }

  // Keyboard escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePolityModal();
  });
}

function filterCategory(catId) {
  state.activeCategory = catId;
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === catId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderPolities();
}

window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
