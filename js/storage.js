/**
 * STOCKLAB - LocalStorage Persistence Layer
 * Handles safe caching and retrieval of watchlists, portfolios, paper trades, journal notes, and curriculum progress.
 */

const STORAGE_KEYS = {
  PREFERENCES: 'stocklab_prefs',
  WATCHLISTS: 'stocklab_watchlists',
  PORTFOLIO: 'stocklab_portfolio',
  PAPER_TRADING: 'stocklab_paper_trading',
  TRADE_JOURNAL: 'stocklab_trade_journal',
  LEARNING_PROGRESS: 'stocklab_learning_progress',
  THESIS_LOGS: 'stocklab_theses'
};

const DEFAULT_PORTFOLIO = [
  { symbol: 'AAPL', shares: 20, avgPrice: 198.50, buyDate: '2024-01-15' },
  { symbol: 'MSFT', shares: 15, avgPrice: 410.20, buyDate: '2024-02-10' },
  { symbol: 'NVDA', shares: 10, avgPrice: 118.40, buyDate: '2024-03-05' }
];

const DEFAULT_WATCHLIST = [
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOG', 'META', 'RELIANCE', 'TCS'
];

const DEFAULT_PAPER_TRADING = {
  cash: 100000.00,
  positions: [
    { symbol: 'AAPL', shares: 15, avgPrice: 215.00, entryDate: '2024-04-10' },
    { symbol: 'MSFT', shares: 10, avgPrice: 420.00, entryDate: '2024-04-12' }
  ],
  orders: [
    { id: 'ORD-101', symbol: 'AAPL', type: 'BUY', orderType: 'MARKET', shares: 15, price: 215.00, status: 'FILLED', timestamp: '2024-04-10 10:30' },
    { id: 'ORD-102', symbol: 'MSFT', type: 'BUY', orderType: 'MARKET', shares: 10, price: 420.00, status: 'FILLED', timestamp: '2024-04-12 11:15' }
  ],
  tradeHistory: [
    { id: 'TRD-1', symbol: 'NVDA', type: 'SELL', shares: 5, buyPrice: 105.00, sellPrice: 125.00, pnl: 100.00, pnlPercent: 19.04, date: '2024-04-05' }
  ]
};

const StorageService = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading from localStorage key: ${key}`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error saving to localStorage key: ${key}`, e);
      return false;
    }
  },

  // Preferences (e.g. mode: 'beginner' | 'pro', theme: 'dark')
  getPreferences() {
    return this.get(STORAGE_KEYS.PREFERENCES, {
      mode: 'beginner',
      theme: 'dark',
      hasSeenOnboarding: false,
      hasSeenChartTutorial: false,
      activeIndicators: ['sma20', 'sma50', 'rsi']
    });
  },

  savePreferences(prefs) {
    const current = this.getPreferences();
    return this.set(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
  },

  // Watchlists
  getWatchlist() {
    return this.get(STORAGE_KEYS.WATCHLISTS, DEFAULT_WATCHLIST);
  },

  saveWatchlist(watchlist) {
    return this.set(STORAGE_KEYS.WATCHLISTS, watchlist);
  },

  addToWatchlist(symbol) {
    const list = this.getWatchlist();
    if (!list.includes(symbol.toUpperCase())) {
      list.push(symbol.toUpperCase());
      this.saveWatchlist(list);
      return true;
    }
    return false;
  },

  removeFromWatchlist(symbol) {
    const list = this.getWatchlist();
    const filtered = list.filter(s => s !== symbol.toUpperCase());
    this.saveWatchlist(filtered);
    return filtered;
  },

  // Portfolio
  getPortfolio() {
    return this.get(STORAGE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
  },

  savePortfolio(portfolio) {
    return this.set(STORAGE_KEYS.PORTFOLIO, portfolio);
  },

  addPortfolioPosition(position) {
    const port = this.getPortfolio();
    const existingIndex = port.findIndex(p => p.symbol === position.symbol.toUpperCase());
    if (existingIndex >= 0) {
      // Average up/down
      const existing = port[existingIndex];
      const totalShares = existing.shares + position.shares;
      const totalCost = (existing.shares * existing.avgPrice) + (position.shares * position.avgPrice);
      port[existingIndex].shares = totalShares;
      port[existingIndex].avgPrice = parseFloat((totalCost / totalShares).toFixed(2));
    } else {
      port.push({
        symbol: position.symbol.toUpperCase(),
        shares: position.shares,
        avgPrice: position.avgPrice,
        buyDate: new Date().toISOString().split('T')[0]
      });
    }
    this.savePortfolio(port);
    return port;
  },

  removePortfolioPosition(symbol) {
    const port = this.getPortfolio();
    const filtered = port.filter(p => p.symbol !== symbol.toUpperCase());
    this.savePortfolio(filtered);
    return filtered;
  },

  // Paper Trading
  getPaperTradingState() {
    return this.get(STORAGE_KEYS.PAPER_TRADING, DEFAULT_PAPER_TRADING);
  },

  savePaperTradingState(state) {
    return this.set(STORAGE_KEYS.PAPER_TRADING, state);
  },

  // Trade Journal
  getJournalEntries() {
    return this.get(STORAGE_KEYS.TRADE_JOURNAL, [
      {
        id: 'JRN-1',
        symbol: 'AAPL',
        tradeType: 'BUY',
        reason: 'Technical',
        thesis: 'Bounced off the 50-day moving average with high volume and positive RSI momentum divergence.',
        invalidation: 'Breakdown below $195 on daily close.',
        reflection: 'Target reached smoothly. Discipline on stop-loss avoided emotional exits.',
        date: '2024-04-10'
      }
    ]);
  },

  saveJournalEntry(entry) {
    const entries = this.getJournalEntries();
    entries.unshift({
      id: 'JRN-' + (entries.length + 1),
      date: new Date().toISOString().split('T')[0],
      ...entry
    });
    this.set(STORAGE_KEYS.TRADE_JOURNAL, entries);
    return entries;
  },

  // Learning Progress (Module IDs completed: [1, 2, 3, ...])
  getLearningProgress() {
    return this.get(STORAGE_KEYS.LEARNING_PROGRESS, [1, 2]);
  },

  markModuleComplete(moduleId) {
    const progress = this.getLearningProgress();
    if (!progress.includes(moduleId)) {
      progress.push(moduleId);
      this.set(STORAGE_KEYS.LEARNING_PROGRESS, progress);
    }
    return progress;
  },

  // Stock Thesis Builders
  getTheses() {
    return this.get(STORAGE_KEYS.THESIS_LOGS, {});
  },

  saveStockThesis(symbol, thesisData) {
    const theses = this.getTheses();
    theses[symbol.toUpperCase()] = {
      ...thesisData,
      updatedAt: new Date().toISOString()
    };
    this.set(STORAGE_KEYS.THESIS_LOGS, theses);
    return theses;
  }
};
