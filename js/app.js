'use strict';

const state = {
  apps: [],
  category: 'All',
  query: '',
  sort: 'popular'
};

const fallbackApps = [
  {
    id: 'sample-app',
    name: 'Sample Android App',
    developer: 'Community Developer',
    version: '1.0.0',
    updated: '2026-08-01',
    size: '10 MB',
    category: 'Tools',
    description: 'Replace this sample record by editing data/apps.json in your GitHub repository.',
    icon: 'assets/icons/default-app.svg',
    apkUrl: '#',
    sourceUrl: 'https://github.com/',
    rating: 5,
    downloads: 1,
    featured: true
  }
];

const elements = {
  appGrid: document.querySelector('#appGrid'),
  featuredGrid: document.querySelector('#featuredGrid'),
  featuredSection: document.querySelector('#featuredSection'),
  searchForm: document.querySelector('#searchForm'),
  searchInput: document.querySelector('#searchInput'),
  clearSearch: document.querySelector('#clearSearch'),
  categoryNav: document.querySelector('#categoryNav'),
  chipRow: document.querySelector('#mobileCategoryChips'),
  sortSelect: document.querySelector('#sortSelect'),
  resultLabel: document.querySelector('#resultLabel'),
  emptyState: document.querySelector('#emptyState'),
  resetFilters: document.querySelector('#resetFilters'),
  showAllFeatured: document.querySelector('#showAllFeatured'),
  modal: document.querySelector('#appModal'),
  modalContent: document.querySelector('#modalContent'),
  template: document.querySelector('#appCardTemplate')
};

const categories = ['All', 'Productivity', 'Education', 'Business', 'Tools', 'Games'];

async function loadApps() {
  try {
    const response = await fetch('data/apps.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('apps.json must contain an array');
    state.apps = data;
  } catch (error) {
    console.warn('Could not load data/apps.json. Showing fallback data.', error);
    state.apps = fallbackApps;
  }

  renderCategoryChips();
  renderFeatured();
  renderApps();
  openAppFromUrl();
}

function renderCategoryChips() {
  elements.chipRow.innerHTML = '';
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-chip${category === state.category ? ' active' : ''}`;
    button.dataset.category = category;
    button.textContent = category;
    button.addEventListener('click', () => setCategory(category));
    elements.chipRow.appendChild(button);
  });
}

function renderFeatured() {
  const featured = state.apps.filter((app) => app.featured).slice(0, 3);
  elements.featuredGrid.innerHTML = '';
  elements.featuredSection.hidden = featured.length === 0;

  featured.forEach((app) => {
    const card = document.createElement('article');
    card.className = 'featured-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${app.name}`);
    card.innerHTML = `
      <div class="featured-top">
        <img src="${escapeAttribute(app.icon)}" alt="${escapeAttribute(app.name)} icon" loading="lazy">
        <div>
          <h3>${escapeHtml(app.name)}</h3>
          <p class="developer">${escapeHtml(app.developer)}</p>
        </div>
      </div>
      <p>${escapeHtml(app.description)}</p>
      <div class="featured-footer">
        <span>${escapeHtml(app.category)}</span>
        <span>★ ${formatRating(app.rating)}</span>
      </div>
    `;
    card.addEventListener('click', () => openModal(app));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(app);
      }
    });
    elements.featuredGrid.appendChild(card);
  });
}

function getFilteredApps() {
  const normalizedQuery = state.query.trim().toLowerCase();
  let result = state.apps.filter((app) => {
    const categoryMatches = state.category === 'All' || app.category === state.category;
    const searchable = `${app.name} ${app.developer} ${app.description} ${app.category}`.toLowerCase();
    const queryMatches = !normalizedQuery || searchable.includes(normalizedQuery);
    return categoryMatches && queryMatches;
  });

  result = [...result].sort((a, b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'newest') return new Date(b.updated) - new Date(a.updated);
    return Number(b.downloads || 0) - Number(a.downloads || 0);
  });

  return result;
}

function renderApps() {
  const apps = getFilteredApps();
  elements.appGrid.innerHTML = '';

  apps.forEach((app) => {
    const fragment = elements.template.content.cloneNode(true);
    const card = fragment.querySelector('.app-card');
    const button = fragment.querySelector('.app-card-button');
    const icon = fragment.querySelector('.app-icon');

    icon.src = app.icon || 'assets/icons/default-app.svg';
    icon.alt = `${app.name} icon`;
    fragment.querySelector('.app-name').textContent = app.name;
    fragment.querySelector('.app-developer').textContent = app.developer;
    fragment.querySelector('.app-rating').textContent = `★ ${formatRating(app.rating)}`;
    fragment.querySelector('.app-size').textContent = app.size || 'APK';
    fragment.querySelector('.app-description').textContent = app.description;
    fragment.querySelector('.category-badge').textContent = app.category;
    fragment.querySelector('.version-label').textContent = `v${app.version}`;
    button.setAttribute('aria-label', `View details for ${app.name}`);
    button.addEventListener('click', () => openModal(app));
    card.dataset.appId = app.id;
    elements.appGrid.appendChild(fragment);
  });

  elements.emptyState.hidden = apps.length !== 0;
  elements.resultLabel.textContent = buildResultLabel(apps.length);
  syncCategoryControls();
}

function buildResultLabel(count) {
  const categoryText = state.category === 'All' ? 'All categories' : state.category;
  const appText = count === 1 ? '1 app' : `${count} apps`;
  return state.query ? `${appText} matching “${state.query}”` : `${categoryText} · ${appText}`;
}

function setCategory(category) {
  state.category = category;
  renderCategoryChips();
  renderApps();
  document.querySelector('#apps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function syncCategoryControls() {
  document.querySelectorAll('[data-category]').forEach((control) => {
    control.classList.toggle('active', control.dataset.category === state.category);
  });
}

function openModal(app, updateUrl = true) {
  const sourceButton = app.sourceUrl
    ? `<a class="secondary-button" href="${escapeAttribute(app.sourceUrl)}" target="_blank" rel="noopener">View source</a>`
    : '';

  const downloadDisabled = !app.apkUrl || app.apkUrl === '#';
  const downloadButton = downloadDisabled
    ? '<span class="primary-button" aria-disabled="true">APK unavailable</span>'
    : `<a class="primary-button" href="${escapeAttribute(app.apkUrl)}" target="_blank" rel="noopener" download>Download APK</a>`;

  elements.modalContent.innerHTML = `
    <div class="modal-app">
      <header class="modal-app-header">
        <img class="modal-app-icon" src="${escapeAttribute(app.icon || 'assets/icons/default-app.svg')}" alt="${escapeAttribute(app.name)} icon">
        <div>
          <span class="category-badge">${escapeHtml(app.category)}</span>
          <h2 id="modalAppName">${escapeHtml(app.name)}</h2>
          <p class="modal-developer">${escapeHtml(app.developer)}</p>
        </div>
      </header>
      <div class="modal-stats">
        <div class="modal-stat"><strong>${escapeHtml(app.version)}</strong><span>Version</span></div>
        <div class="modal-stat"><strong>${escapeHtml(app.size || 'APK')}</strong><span>Download size</span></div>
        <div class="modal-stat"><strong>★ ${formatRating(app.rating)}</strong><span>Community rating</span></div>
        <div class="modal-stat"><strong>${formatDownloads(app.downloads)}</strong><span>Downloads</span></div>
      </div>
      <section class="modal-description">
        <h3>About this app</h3>
        <p>${escapeHtml(app.description)}</p>
      </section>
      <div class="modal-actions">
        ${downloadButton}
        ${sourceButton}
      </div>
      <div class="modal-note">Only install APK files from developers and repositories you trust. Consider scanning every APK before installation.</div>
    </div>
  `;

  elements.modal.classList.add('open');
  elements.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  elements.modal.querySelector('.modal-close')?.focus();

  if (updateUrl && app.id) {
    const url = new URL(window.location.href);
    url.searchParams.set('app', app.id);
    history.replaceState({}, '', url);
  }
}

function closeModal() {
  elements.modal.classList.remove('open');
  elements.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  const url = new URL(window.location.href);
  url.searchParams.delete('app');
  history.replaceState({}, '', url);
}

function openAppFromUrl() {
  const appId = new URLSearchParams(window.location.search).get('app');
  if (!appId) return;
  const app = state.apps.find((item) => item.id === appId);
  if (app) openModal(app, false);
}

function resetFilters() {
  state.query = '';
  state.category = 'All';
  state.sort = 'popular';
  elements.searchInput.value = '';
  elements.sortSelect.value = 'popular';
  elements.clearSearch.classList.remove('visible');
  renderCategoryChips();
  renderApps();
}

function formatRating(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : '—';
}

function formatDownloads(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M+`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K+`;
  return `${number}+`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

elements.searchForm.addEventListener('submit', (event) => event.preventDefault());

elements.searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  elements.clearSearch.classList.toggle('visible', Boolean(state.query));
  renderApps();
});

elements.clearSearch.addEventListener('click', () => {
  state.query = '';
  elements.searchInput.value = '';
  elements.clearSearch.classList.remove('visible');
  elements.searchInput.focus();
  renderApps();
});

elements.categoryNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (button) setCategory(button.dataset.category);
});

elements.sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderApps();
});

elements.resetFilters.addEventListener('click', resetFilters);

elements.showAllFeatured.addEventListener('click', () => {
  resetFilters();
  document.querySelector('#apps')?.scrollIntoView({ behavior: 'smooth' });
});

elements.modal.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-modal]')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.modal.classList.contains('open')) closeModal();
});

loadApps();
