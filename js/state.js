/**
 * STOCKLAB - Reactive Application State Store
 * Implements a lightweight Publish/Subscribe pattern for cross-component synchronization.
 */

const AppState = {
  data: {
    activeView: 'simulator',
    currentSymbol: 'AAPL',
    compareSymbols: ['AAPL', 'MSFT'],
    timeframe: '6M',
    chartType: 'candles',
    activeIndicators: ['sma20', 'sma50', 'rsi'],
    mode: 'beginner', // 'beginner' | 'pro'
    isTerminalCollapsed: false,
    isContextDrawerOpen: false,
    activeContextTopic: null,
    searchQuery: '',
    selectedWatchlistIndex: 0,
    notification: null
  },

  listeners: {},

  init() {
    const prefs = StorageService.getPreferences();
    this.data.mode = prefs.mode || 'beginner';
    this.data.activeIndicators = prefs.activeIndicators || ['sma20', 'sma50', 'rsi'];
    
    // Apply body mode class
    document.body.classList.remove('beginner-mode', 'pro-mode');
    document.body.classList.add(`${this.data.mode}-mode`);
  },

  get(key) {
    return this.data[key];
  },

  set(key, value) {
    const oldValue = this.data[key];
    this.data[key] = value;

    if (key === 'mode') {
      document.body.classList.remove('beginner-mode', 'pro-mode');
      document.body.classList.add(`${value}-mode`);
      StorageService.savePreferences({ mode: value });
    }

    if (key === 'activeIndicators') {
      StorageService.savePreferences({ activeIndicators: value });
    }

    this.emit(key, { value, oldValue });
    this.emit('*', { key, value, oldValue });
  },

  update(updates) {
    Object.keys(updates).forEach(key => {
      this.set(key, updates[key]);
    });
  },

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  },

  emit(key, eventData) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => {
        try {
          cb(eventData);
        } catch (err) {
          console.error(`Error in subscriber for ${key}:`, err);
        }
      });
    }
  },

  toggleIndicator(indicatorId) {
    const current = [...this.data.activeIndicators];
    const index = current.indexOf(indicatorId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(indicatorId);
    }
    this.set('activeIndicators', current);
  },

  setMode(mode) {
    if (mode === 'beginner' || mode === 'pro') {
      this.set('mode', mode);
    }
  },

  openContext(topicKey) {
    this.set('activeContextTopic', topicKey);
    this.set('isContextDrawerOpen', true);
  },

  closeContext() {
    this.set('isContextDrawerOpen', false);
  }
};
