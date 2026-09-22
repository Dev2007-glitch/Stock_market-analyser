/**
 * STOCKLAB - UI Components & Interactive Context Controller
 * Manages modal dialogs, educational "Explain This" side panels, search autocomplete, and toast alerts.
 */

const UIController = {
  init() {
    this.bindSearchDropdown();
    this.bindContextDrawer();
    this.bindTerminalToggle();
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  openModal() {
    const modal = document.getElementById('global-modal');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('global-modal');
    if (modal) modal.classList.remove('active');
  },

  showShortcutsModal() {
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.innerText = 'KEYBOARD NAVIGATION SHORTCUTS';
    body.innerHTML = `
      <div class="shortcut-grid">
        <div class="shortcut-item">
          <span class="shortcut-desc">Global Search / Command</span>
          <span class="kbd-badge">/</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Keyboard Help Cheat Sheet</span>
          <span class="kbd-badge">?</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Close Modal / Drawer</span>
          <span class="kbd-badge">ESC</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Go to Dashboard</span>
          <span class="kbd-badge">1</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Go to Global Markets</span>
          <span class="kbd-badge">2</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Watchlist Workstation</span>
          <span class="kbd-badge">3 / W</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Stock Analysis Workspace</span>
          <span class="kbd-badge">4</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Multi-Stock Compare</span>
          <span class="kbd-badge">5</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Portfolio Tracking</span>
          <span class="kbd-badge">6 / P</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Paper Trading Simulator</span>
          <span class="kbd-badge">7 / T</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Learning Center</span>
          <span class="kbd-badge">8</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-desc">Focus CLI Terminal</span>
          <span class="kbd-badge">C</span>
        </div>
      </div>
    `;

    footer.innerHTML = `<button class="btn btn-primary" onclick="UIController.closeModal()">Got it</button>`;
    this.openModal();
  },

  bindSearchDropdown() {
    const searchInput = document.getElementById('global-search-input');
    const dropdown = document.getElementById('search-results-dropdown');
    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', async () => {
      const q = searchInput.value.trim();
      if (!q) {
        dropdown.classList.remove('active');
        return;
      }

      const results = await DataService.search(q);
      if (results.length > 0) {
        dropdown.innerHTML = results.slice(0, 8).map(r => {
          const isGain = r.changePercent >= 0;
          return `
            <div class="search-result-item" onclick="UIController.selectSearchResult('${r.symbol}')">
              <div class="search-result-left">
                <span class="search-result-symbol">${r.symbol}</span>
                <span class="search-result-name">${r.companyName} (${r.exchange})</span>
              </div>
              <div class="search-result-right">
                <span style="font-weight: 600; color: var(--text-primary);">${r.currency === 'INR' ? '₹' : '$'}${r.price.toFixed(2)}</span>
                <span class="${isGain ? 'gain' : 'loss'}" style="font-size: 10px;">${isGain ? '+' : ''}${r.changePercent.toFixed(2)}%</span>
              </div>
            </div>
          `;
        }).join('');
        dropdown.classList.add('active');
      } else {
        dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 11px;">No tickers matching "${q}"</div>`;
        dropdown.classList.add('active');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  },

  selectSearchResult(symbol) {
    const searchInput = document.getElementById('global-search-input');
    const dropdown = document.getElementById('search-results-dropdown');
    if (searchInput) searchInput.value = '';
    if (dropdown) dropdown.classList.remove('active');

    AppState.set('currentSymbol', symbol);
    AppState.set('activeView', 'analyze');
  },

  bindContextDrawer() {
    const drawer = document.getElementById('context-drawer');
    const closeBtn = document.getElementById('context-close-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => AppState.closeContext());
    }

    AppState.subscribe('activeContextTopic', ({ value }) => {
      if (!value) return;
      this.renderContextTopic(value);
    });

    AppState.subscribe('isContextDrawerOpen', ({ value }) => {
      if (!drawer) return;
      if (value) {
        drawer.classList.add('open');
      } else {
        drawer.classList.remove('open');
      }
    });
  },

  renderContextTopic(topicKey) {
    const body = document.getElementById('context-body');
    const title = document.getElementById('context-title');
    if (!body) return;

    const g = FINANCIAL_GLOSSARY[topicKey.toUpperCase()];
    if (!g) {
      title.innerHTML = `📚 FINANCIAL KNOWLEDGE`;
      body.innerHTML = `
        <div class="card">
          <p style="color: var(--text-secondary); font-size: 12px;">Explore our 24-module curriculum in the Learning Center to master this concept.</p>
          <button class="btn btn-primary" style="margin-top: 10px; width: 100%;" onclick="AppState.set('activeView', 'learn');">Open Learning Center</button>
        </div>
      `;
      return;
    }

    title.innerHTML = `📚 ${g.title}`;
    body.innerHTML = `
      <div style="display: flex; gap: 6px; align-items: center;">
        <span class="brand-tag">${g.category}</span>
        <span class="brand-tag" style="color: var(--gain-green);">${g.level}</span>
      </div>

      <div class="card" style="background: var(--bg-tertiary);">
        <div class="card-title" style="margin-bottom: 4px; font-size: 10px;">WHAT IT MEASURES</div>
        <p style="color: var(--text-primary); font-weight: 600; font-size: 12px;">${g.whatItMeasures}</p>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 6px; font-size: 10px;">BASIC IDEA</div>
        <p style="color: var(--text-secondary); font-size: 12px; line-height: 1.5;">${g.basicIdea}</p>
      </div>

      <div class="card" style="background: var(--bg-tertiary);">
        <div class="card-title" style="margin-bottom: 6px; font-size: 10px;">CORE RULES & GUIDELINES</div>
        <ul style="padding-left: 16px; font-size: 11px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
          ${g.rules.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 6px; font-size: 10px;">HOW ANALYSTS USE IT</div>
        <p style="color: var(--text-muted); font-size: 11px; line-height: 1.5;">${g.analystUsage}</p>
      </div>

      <div class="beginner-mode-badge" style="margin-top: 8px;">
        <strong>⚠️ Crucial Reminder:</strong> Indicators and ratios are descriptive tools, never standalone guarantees. Always analyze in broad context.
      </div>
    `;
  },

  bindTerminalToggle() {
    const toggleBtn = document.getElementById('terminal-toggle-btn');
    const drawer = document.getElementById('terminal-drawer');
    const workspace = document.querySelector('.workspace');

    // Bind Horizontal Core Platform Navigation Tabs
    document.querySelectorAll('.h-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        AppState.set('activeView', view);
      });
    });

    // Bind sidebar navigation items (if any)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        AppState.set('activeView', view);
      });
    });

    if (toggleBtn && drawer && workspace) {
      toggleBtn.addEventListener('click', () => {
        const isCollapsed = drawer.classList.toggle('collapsed');
        workspace.classList.toggle('terminal-collapsed', isCollapsed);
        toggleBtn.innerText = isCollapsed ? '▲ EXPAND CLI' : '▼ MINIMIZE';
      });
    }
  }
};
