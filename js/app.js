/**
 * STOCKLAB - Master Application Entrypoint
 * Bootstraps modules, binds DOM event listeners, and updates system clocks.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State and Preferences
  AppState.init();
  UIController.init();
  CommandParser.initTerminal();
  CommandParser.initGlobalShortcuts();
  ViewController.init();

  // 2. Setup Topbar Mode Switchers
  const beginnerBtn = document.getElementById('mode-btn-beginner');
  const proBtn = document.getElementById('mode-btn-pro');

  if (beginnerBtn && proBtn) {
    const updateModeButtons = (currentMode) => {
      beginnerBtn.classList.toggle('active', currentMode === 'beginner');
      proBtn.classList.toggle('active', currentMode === 'pro');
    };

    beginnerBtn.addEventListener('click', () => {
      AppState.setMode('beginner');
      updateModeButtons('beginner');
      UIController.showToast('Switched to Beginner Mode: Educational aids active', 'info');
    });

    proBtn.addEventListener('click', () => {
      AppState.setMode('pro');
      updateModeButtons('pro');
      UIController.showToast('Switched to Pro Mode: High data density active', 'info');
    });

    updateModeButtons(AppState.get('mode'));
  }

  // 3. Setup Navigation Sidebar Clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) {
        AppState.set('activeView', view);
        // On mobile, close sidebar on selection
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  });

  // Mobile Bottom Nav Clicks
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) {
        AppState.set('activeView', view);
      }
    });
  });

  // 4. Live Market Clock Ticker
  const clockEl = document.getElementById('market-clock');
  const updateClock = () => {
    if (!clockEl) return;
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST';
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 5. Update Learning Progress Counter Widget in Sidebar
  const updateSidebarLearningWidget = () => {
    const progress = StorageService.getLearningProgress();
    const countEl = document.getElementById('sidebar-learning-count');
    const barEl = document.getElementById('sidebar-learning-bar');
    if (countEl && barEl) {
      countEl.innerText = `${progress.length} / ${CURRICULUM_MODULES.length}`;
      const pct = (progress.length / CURRICULUM_MODULES.length) * 100;
      barEl.style.width = `${pct}%`;
    }
  };
  updateSidebarLearningWidget();
  AppState.subscribe('activeView', updateSidebarLearningWidget);

  // 6. Launch Initial View
  const initialView = AppState.get('activeView') || 'landing';
  ViewController.renderView(initialView);
  ViewController.updateActiveNav(initialView);
});
