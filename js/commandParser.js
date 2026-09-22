/**
 * STOCKLAB - Terminal Command Parser & Keyboard Navigation System
 * Handles command execution, autocomplete suggestions, output logging, and global keyboard shortcuts.
 */

const CommandParser = {
  history: [],
  historyIndex: -1,

  commands: [
    { name: 'AAPL', desc: 'Load Apple Inc. analysis' },
    { name: 'MSFT', desc: 'Load Microsoft analysis' },
    { name: 'NVDA', desc: 'Load NVIDIA analysis' },
    { name: 'TSLA', desc: 'Load Tesla analysis' },
    { name: 'RELIANCE', desc: 'Load Reliance Industries analysis' },
    { name: 'compare AAPL MSFT', desc: 'Compare Apple vs Microsoft side-by-side' },
    { name: 'watch <symbol>', desc: 'Add ticker to personal watchlist' },
    { name: 'remove <symbol>', desc: 'Remove ticker from watchlist' },
    { name: 'learn <topic>', desc: 'Open educational curriculum or glossary (e.g. learn RSI, learn PE)' },
    { name: 'portfolio', desc: 'Open portfolio tracking workstation' },
    { name: 'paper', desc: 'Open $100k paper trading simulator' },
    { name: 'journal', desc: 'Open reflective trade journal' },
    { name: 'markets', desc: 'Open global markets dashboard' },
    { name: 'screener', desc: 'Open stock screener filter' },
    { name: 'risk', desc: 'Open risk management center' },
    { name: 'mode <beginner|pro>', desc: 'Toggle interface between Beginner and Pro mode' },
    { name: 'help', desc: 'Display all available terminal commands' },
    { name: 'clear', desc: 'Clear terminal screen log output' }
  ],

  execute(commandString) {
    if (!commandString || commandString.trim() === '') return;
    const raw = commandString.trim();
    this.history.push(raw);
    this.historyIndex = this.history.length;

    this.log('cmd', `> ${raw}`);

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const arg1 = parts[1] ? parts[1].toUpperCase() : null;
    const arg2 = parts[2] ? parts[2].toUpperCase() : null;

    // Check direct ticker command (e.g. "AAPL")
    if (STOCK_DATABASE[cmd]) {
      AppState.set('currentSymbol', cmd);
      AppState.set('activeView', 'analyze');
      this.log('success', `Loaded analysis workspace for ${cmd} (${STOCK_DATABASE[cmd].companyName}).`);
      return;
    }

    switch (cmd) {
      case 'HELP':
        this.log('info', '--- AVAILABLE STOCKLAB COMMANDS ---');
        this.commands.forEach(c => {
          this.log('info', `  ${c.name.padEnd(20)} : ${c.desc}`);
        });
        break;

      case 'CLEAR':
        const body = document.getElementById('terminal-body');
        if (body) body.innerHTML = '';
        this.log('info', 'Terminal cleared. Type "help" for a list of commands.');
        break;

      case 'COMPARE':
        if (!arg1 || !arg2) {
          this.log('warn', 'Usage: compare <symbol1> <symbol2> (e.g. compare AAPL MSFT)');
          return;
        }
        if (!STOCK_DATABASE[arg1] || !STOCK_DATABASE[arg2]) {
          this.log('error', `One or both symbols not found in database: ${arg1}, ${arg2}`);
          return;
        }
        AppState.set('compareSymbols', [arg1, arg2]);
        AppState.set('activeView', 'compare');
        this.log('success', `Opening comparison workstation for ${arg1} vs ${arg2}.`);
        break;

      case 'WATCH':
      case 'ADD':
        if (!arg1) {
          this.log('warn', 'Usage: watch <symbol> (e.g. watch AAPL)');
          return;
        }
        if (STOCK_DATABASE[arg1]) {
          StorageService.addToWatchlist(arg1);
          UIController.showToast(`Added ${arg1} to Watchlist`, 'success');
          this.log('success', `Added ${arg1} to your watchlist.`);
          AppState.emit('watchlistUpdated', {});
        } else {
          this.log('error', `Unknown ticker symbol: ${arg1}`);
        }
        break;

      case 'REMOVE':
        if (!arg1) {
          this.log('warn', 'Usage: remove <symbol>');
          return;
        }
        StorageService.removeFromWatchlist(arg1);
        UIController.showToast(`Removed ${arg1} from Watchlist`, 'info');
        this.log('info', `Removed ${arg1} from your watchlist.`);
        AppState.emit('watchlistUpdated', {});
        break;

      case 'LEARN':
        if (!arg1) {
          AppState.set('activeView', 'learn');
          this.log('info', 'Opened Learning Center curriculum.');
          return;
        }
        // Check glossary keyword
        if (FINANCIAL_GLOSSARY[arg1]) {
          AppState.openContext(arg1);
          this.log('success', `Opened educational explanation for ${arg1}.`);
        } else {
          AppState.set('activeView', 'learn');
          this.log('info', `Opened Learning Center for ${arg1}.`);
        }
        break;

      case 'PORTFOLIO':
        AppState.set('activeView', 'portfolio');
        this.log('info', 'Opened Portfolio Workstation.');
        break;

      case 'PAPER':
      case 'TRADE':
        AppState.set('activeView', 'paper');
        this.log('info', 'Opened Paper Trading Simulator ($100k Cash).');
        break;

      case 'JOURNAL':
        AppState.set('activeView', 'journal');
        this.log('info', 'Opened Reflective Trade Journal.');
        break;

      case 'MARKET':
      case 'MARKETS':
        AppState.set('activeView', 'markets');
        this.log('info', 'Opened Global Markets Overview.');
        break;

      case 'SCREENER':
        AppState.set('activeView', 'screener');
        this.log('info', 'Opened Stock Screener.');
        break;

      case 'SIMULATOR':
      case 'SIMULATE':
      case 'CANDLE':
      case 'REPLAY':
        AppState.set('activeView', 'simulator');
        this.log('info', 'Opened Real Candlestick Replay Simulator.');
        break;

      case 'RISK':
        AppState.set('activeView', 'risk');
        this.log('info', 'Opened Risk Management Center.');
        break;

      case 'MODE':
        if (arg1 === 'BEGINNER' || arg1 === 'PRO') {
          AppState.setMode(arg1.toLowerCase());
          this.log('success', `Switched UI mode to ${arg1}.`);
        } else {
          this.log('warn', 'Usage: mode <beginner|pro>');
        }
        break;

      default:
        this.log('error', `Unknown command: '${raw}'. Type "help" or enter a ticker like "AAPL".`);
        break;
    }
  },

  log(type, message) {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'terminal-log-row';

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    row.innerHTML = `
      <span class="terminal-log-time">${time}</span>
      <span class="terminal-log-type ${type}">[${type.toUpperCase()}]</span>
      <span class="terminal-log-msg">${message}</span>
    `;

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  },

  initTerminal() {
    const input = document.getElementById('terminal-input');
    const popover = document.getElementById('cli-autocomplete-popover');
    if (!input) return;

    this.log('info', 'STOCKLAB OS Initialized. Welcome to your financial terminal.');
    this.log('info', 'Type a ticker symbol (e.g. AAPL, NVDA), "learn RSI", "paper", or "help".');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        if (popover) popover.classList.remove('active');
        this.execute(val);
      } else if (e.key === 'ArrowUp') {
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          input.value = '';
        }
      }
    });

    // Autocomplete on typing
    input.addEventListener('input', () => {
      const q = input.value.trim().toUpperCase();
      if (!q || !popover) {
        if (popover) popover.classList.remove('active');
        return;
      }

      const matches = this.commands.filter(c => c.name.toUpperCase().startsWith(q) || c.name.toUpperCase().includes(q));
      if (matches.length > 0) {
        popover.innerHTML = matches.slice(0, 6).map(m => `
          <div class="cli-suggestion-item" onclick="document.getElementById('terminal-input').value = '${m.name}'; document.getElementById('cli-autocomplete-popover').classList.remove('active'); document.getElementById('terminal-input').focus();">
            <span class="cli-suggestion-cmd">${m.name}</span>
            <span class="cli-suggestion-desc">${m.desc}</span>
          </div>
        `).join('');
        popover.classList.add('active');
      } else {
        popover.classList.remove('active');
      }
    });
  },

  initGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept shortcuts when typing in inputs
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        UIController.closeModal();
        AppState.closeContext();
        const searchDrop = document.getElementById('search-results-dropdown');
        if (searchDrop) searchDrop.classList.remove('active');
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) searchInput.focus();
          break;

        case '?':
          e.preventDefault();
          UIController.showShortcutsModal();
          break;

        case '1': AppState.set('activeView', 'dashboard'); break;
        case '2': AppState.set('activeView', 'markets'); break;
        case '3':
        case 'w':
        case 'W':
          AppState.set('activeView', 'watchlist');
          break;
        case '4': AppState.set('activeView', 'analyze'); break;
        case '5': AppState.set('activeView', 'compare'); break;
        case '6':
        case 'p':
        case 'P':
          AppState.set('activeView', 'portfolio');
          break;
        case '7':
        case 't':
        case 'T':
          AppState.set('activeView', 'paper');
          break;
        case '8': AppState.set('activeView', 'learn'); break;
        case 'c':
        case 'C':
          e.preventDefault();
          const termInput = document.getElementById('terminal-input');
          if (termInput) termInput.focus();
          break;
      }
    });
  }
};
