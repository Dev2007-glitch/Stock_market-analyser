/**
 * STOCKLAB - Master View Router & Screen Controller (With Dedicated Trend Analysis)
 * Orchestrates views: Landing, Dashboard, Markets, Watchlist, Analyze, Compare, Portfolio, Paper, Journal, Learn, Screener, News, Risk.
 */

const ViewController = {
  chartEngine: null,

  init() {
    AppState.subscribe('activeView', ({ value }) => {
      this.renderView(value);
      this.updateActiveNav(value);
    });

    AppState.subscribe('currentSymbol', () => {
      if (AppState.get('activeView') === 'analyze') {
        this.renderAnalyzeView();
      }
    });

    AppState.subscribe('timeframe', () => {
      if (AppState.get('activeView') === 'analyze') {
        this.updateChartData();
      }
    });

    AppState.subscribe('activeIndicators', () => {
      if (AppState.get('activeView') === 'analyze') {
        this.updateChartData();
      }
    });

    AppState.subscribe('watchlistUpdated', () => {
      if (AppState.get('activeView') === 'watchlist' || AppState.get('activeView') === 'dashboard') {
        this.renderWatchlistView();
      }
    });

    AppState.subscribe('portfolioUpdated', () => {
      if (AppState.get('activeView') === 'portfolio') {
        PortfolioController.render(document.getElementById('view-portfolio'));
      }
    });
  },

  updateActiveNav(viewName) {
    document.querySelectorAll('.h-nav-item').forEach(item => {
      const v = item.getAttribute('data-view');
      item.classList.toggle('active', v === viewName);
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      const v = item.getAttribute('data-view');
      item.classList.toggle('active', v === viewName);
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      const v = item.getAttribute('data-view');
      item.classList.toggle('active', v === viewName);
    });
  },

  renderView(viewName) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

    const panel = document.getElementById(`view-${viewName}`);
    if (!panel) return;
    panel.classList.add('active');

    switch (viewName) {
      case 'landing': this.renderLandingView(); break;
      case 'dashboard': this.renderDashboardView(); break;
      case 'markets': this.renderMarketsView(); break;
      case 'watchlist': this.renderWatchlistView(); break;
      case 'analyze': this.renderAnalyzeView(); break;
      case 'compare': this.renderCompareView(); break;
      case 'portfolio': PortfolioController.render(panel); break;
      case 'paper': PaperTradingController.render(panel); break;
      case 'journal': JournalController.render(panel); break;
      case 'learn': this.renderLearnView(); break;
      case 'screener': ScreenerController.render(panel); break;
      case 'simulator': CandlestickSimulator.init(panel); break;
      case 'slot-trading': SlotTradingEngine.render(panel); break;
      case 'news': NewsController.render(panel); break;
      case 'risk': this.renderRiskView(); break;
      case 'settings': this.renderSettingsView(); break;
    }
  },

  /* --------------------------------------------------------------------------
     1. LANDING / FIRST EXPERIENCE
     -------------------------------------------------------------------------- */
  renderLandingView() {
    const container = document.getElementById('view-landing');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 860px; margin: 0 auto; padding: 24px 0; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Hero Section -->
        <div class="card" style="text-align: center; padding: 40px 24px; background: #ffffff; border-color: var(--border-subtle);">
          <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div class="brand-logo-icon" style="width: 36px; height: 36px; font-size: 18px;">SL</div>
            <h1 class="brand-title" style="font-size: 30px; font-weight: 800; color: var(--text-primary);">STOCKLAB</h1>
          </div>
          <p style="font-size: 15px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 24px auto; line-height: 1.6;">
            Your friendly terminal for understanding the stock market. Learn core financial principles, analyze stock price trends, and practice disciplined investing with real-time data.
          </p>

          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" style="padding: 10px 22px; font-size: 13px;" onclick="AppState.set('activeView', 'learn');">
              🎓 Start Learning
            </button>
            <button class="btn btn-secondary" style="padding: 10px 22px; font-size: 13px;" onclick="AppState.set('activeView', 'markets');">
              🌐 Explore Markets
            </button>
            <button class="btn btn-secondary" style="padding: 10px 22px; font-size: 13px;" onclick="AppState.set('activeView', 'analyze');">
              🔬 Open Analysis Workspace
            </button>
          </div>
        </div>

        <!-- Interactive Visual: What is a Stock? -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🌱 NEW TO STOCKS? LET'S START AT THE FOUNDATION</span>
            <span class="brand-tag">LESSON 01</span>
          </div>

          <h3 style="font-size: 16px; margin-bottom: 8px; color: var(--text-primary);">WHAT IS A STOCK?</h3>
          <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">
            A stock represents <strong>fractional ownership in a real operating company</strong>. When you own shares in Apple, Microsoft, or Reliance, you hold an equity claim on that company's assets and future profits.
          </p>

          <!-- Interactive Process Flow -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center;">
            <div class="stat-box" style="border-color: var(--accent-blue);">
              <span style="font-size: 22px;">🏢</span>
              <strong style="color: var(--accent-blue); font-size: 12px;">1. Company</strong>
              <small style="color: var(--text-muted); font-size: 10.5px;">Builds goods & services</small>
            </div>
            <div class="stat-box">
              <span style="font-size: 22px;">📑</span>
              <strong style="font-size: 12px;">2. Shares</strong>
              <small style="color: var(--text-muted); font-size: 10.5px;">Divides equity units</small>
            </div>
            <div class="stat-box">
              <span style="font-size: 22px;">👥</span>
              <strong style="font-size: 12px;">3. Investors</strong>
              <small style="color: var(--text-muted); font-size: 10.5px;">Fund business growth</small>
            </div>
            <div class="stat-box">
              <span style="font-size: 22px;">🏛️</span>
              <strong style="font-size: 12px;">4. Exchange</strong>
              <small style="color: var(--text-muted); font-size: 10.5px;">Provides safe liquidity</small>
            </div>
            <div class="stat-box" style="border-color: var(--gain-green);">
              <span style="font-size: 22px;">📊</span>
              <strong style="color: var(--gain-green); font-size: 12px;">5. Price Discovery</strong>
              <small style="color: var(--text-muted); font-size: 10.5px;">Reflects future earnings</small>
            </div>
          </div>
        </div>

        <!-- Interactive Visual: Why Price Moves -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📈 AUCTION DYNAMICS & TRENDS</span>
            <span class="brand-tag" style="color: var(--accent-amber);">LESSON 02</span>
          </div>

          <h3 style="font-size: 16px; margin-bottom: 8px; color: var(--text-primary);">WHY DOES A STOCK PRICE MOVE?</h3>
          <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
            The market is a continuous electronic auction driven by buying demand and selling supply:
          </p>

          <div class="grid-2">
            <div class="stat-box" style="border-left: 4px solid var(--gain-green);">
              <strong style="color: var(--gain-green); font-size: 13px;">BUYERS > SELLERS (DEMAND SURGE)</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                When positive earnings or growth outlook emerges, buyers bid higher prices to purchase shares → <strong>Price trends upward ↗</strong>
              </p>
            </div>

            <div class="stat-box" style="border-left: 4px solid var(--loss-red);">
              <strong style="color: var(--loss-red); font-size: 13px;">SELLERS > BUYERS (SUPPLY OVERHANG)</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                When risks or revenue slowdowns appear, sellers offer shares at lower prices to exit → <strong>Price trends downward ↘</strong>
              </p>
            </div>
          </div>

          <div class="beginner-mode-badge" style="margin-top: 14px;">
            <strong>💡 Pro-Tip:</strong> Click on <strong>"Stock Analysis"</strong> in the sidebar to inspect any stock with our interactive <strong>Trend Analysis Graph</strong> and <strong>Candlestick Chart</strong>!
          </div>
        </div>

      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     2. DASHBOARD VIEW
     -------------------------------------------------------------------------- */
  renderDashboardView() {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const rawPort = StorageService.getPortfolio();
    const portStats = FinancialCalculations.calculatePortfolioStats(rawPort, STOCK_DATABASE);
    const watchlist = StorageService.getWatchlist();

    container.innerHTML = `
      <!-- Top Indices Quick Strip -->
      <div class="grid-5" style="margin-bottom: 16px;">
        ${MARKET_INDICES.map(idx => `
          <div class="stat-box">
            <span class="stat-box-label">${idx.name}</span>
            <span class="stat-box-value">${idx.value}</span>
            <span class="stat-box-sub ${idx.isUp ? 'gain' : 'loss'}">${idx.change} (${idx.changePercent})</span>
          </div>
        `).join('')}
      </div>

      <!-- Quick Portfolio + Watchlist Row -->
      <div class="grid-2" style="margin-bottom: 16px;">
        <div class="card">
          <div class="card-header">
            <span class="card-title">💼 DEMO PORTFOLIO SNAPSHOT</span>
            <button class="btn btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="AppState.set('activeView', 'portfolio');">View Full ➔</button>
          </div>
          <div class="grid-2" style="margin-bottom: 10px;">
            <div class="stat-box">
              <span class="stat-box-label">TOTAL VALUE</span>
              <span class="stat-box-value">$${portStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">TOTAL P/L</span>
              <span class="stat-box-value ${portStats.totalPnl >= 0 ? 'gain' : 'loss'}">${portStats.totalPnl >= 0 ? '+' : ''}$${portStats.totalPnl.toFixed(2)} (${portStats.totalPnlPercent.toFixed(2)}%)</span>
            </div>
          </div>
          <p style="font-size: 11.5px; color: var(--text-muted);">
            Tracking ${portStats.positions.length} active positions. ${portStats.hasConcentrationRisk ? '⚠️ High concentration in ' + portStats.largestPosition.symbol : '✓ Well diversified.'}
          </p>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🔥 TODAY'S TOP MOVERS</span>
            <span class="data-source-badge">REAL-TIME DATA</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${MARKET_MOVERS.gainers.slice(0, 3).map(g => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 6px; cursor: pointer;" onclick="AppState.set('currentSymbol', '${g.symbol}'); AppState.set('activeView', 'analyze');">
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${g.symbol} <small style="color: var(--text-muted); font-weight: 500;">${g.name}</small></span>
                <span style="font-family: var(--font-mono); font-weight: 700;" class="gain">${g.price} (${g.change})</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Watchlist Section -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⭐ MY WATCHLIST</span>
          <button class="btn btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="AppState.set('activeView', 'watchlist');">Manage List ➔</button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
                <th style="padding: 10px;">SYMBOL</th>
                <th style="padding: 10px;">COMPANY</th>
                <th style="padding: 10px;">PRICE</th>
                <th style="padding: 10px;">CHANGE</th>
                <th style="padding: 10px;">MKT CAP</th>
                <th style="padding: 10px;">P/E</th>
                <th style="padding: 10px; text-align: right;">ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${watchlist.map(sym => {
                const stock = STOCK_DATABASE[sym];
                if (!stock) return '';
                const isGain = stock.change >= 0;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle); cursor: pointer;" class="table-row-hover" onclick="AppState.set('currentSymbol', '${sym}'); AppState.set('activeView', 'analyze');">
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${stock.symbol}</td>
                    <td style="padding: 10px; color: var(--text-secondary); font-weight: 500;">${stock.companyName}</td>
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 700;">${stock.currency === 'INR' ? '₹' : '$'}${stock.price.toFixed(2)}</td>
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 600;" class="${isGain ? 'gain' : 'loss'}">${isGain ? '+' : ''}${stock.change.toFixed(2)} (${isGain ? '+' : ''}${stock.changePercent.toFixed(2)}%)</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${stock.marketCapFormatted}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${stock.pe ? stock.pe.toFixed(1) : '--'}</td>
                    <td style="padding: 10px; text-align: right;">
                      <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="event.stopPropagation(); AppState.set('currentSymbol', '${sym}'); AppState.set('activeView', 'analyze');">Analyze</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     3. MARKETS VIEW
     -------------------------------------------------------------------------- */
  renderMarketsView() {
    const container = document.getElementById('view-markets');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">🌐 GLOBAL MARKET INDICES</div>
          <span class="data-source-badge">REAL-TIME FEEDS</span>
        </div>

        <div class="grid-5">
          ${MARKET_INDICES.map(idx => `
            <div class="stat-box" style="border-left: 4px solid ${idx.isUp ? 'var(--gain-green)' : 'var(--loss-red)'};">
              <span class="stat-box-label">${idx.name}</span>
              <span class="stat-box-value">${idx.value}</span>
              <span class="stat-box-sub ${idx.isUp ? 'gain' : 'loss'}">${idx.change} (${idx.changePercent})</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 16px;">
        <div class="card">
          <div class="card-header">
            <span class="card-title">📊 SECTOR PERFORMANCE</span>
            <span class="data-source-badge">TODAY'S SECTOR ROTATION</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${MARKET_SECTORS.map(sec => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 6px;">
                <span style="font-weight: 600; font-size: 12.5px;">${sec.name} <small style="color: var(--text-muted);">(${sec.leadingStock})</small></span>
                <span style="font-family: var(--font-mono); font-weight: 700;" class="${sec.isUp ? 'gain' : 'loss'}">${sec.performance}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🚀 TOP GAINERS & LOSERS</span>
          </div>

          <div class="grid-2">
            <div>
              <div style="font-size: 11px; color: var(--gain-green); font-family: var(--font-mono); font-weight: 800; margin-bottom: 6px;">TOP GAINERS</div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${MARKET_MOVERS.gainers.map(g => `
                  <div style="padding: 6px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 11px; display: flex; justify-content: space-between; cursor: pointer;" onclick="AppState.set('currentSymbol', '${g.symbol}'); AppState.set('activeView', 'analyze');">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${g.symbol}</span>
                    <span style="font-family: var(--font-mono); font-weight: 700;" class="gain">${g.change}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <div style="font-size: 11px; color: var(--loss-red); font-family: var(--font-mono); font-weight: 800; margin-bottom: 6px;">TOP LOSERS</div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${MARKET_MOVERS.losers.map(l => `
                  <div style="padding: 6px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 11px; display: flex; justify-content: space-between; cursor: pointer;" onclick="AppState.set('currentSymbol', '${l.symbol}'); AppState.set('activeView', 'analyze');">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${l.symbol}</span>
                    <span style="font-family: var(--font-mono); font-weight: 700;" class="loss">${l.change}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     4. WATCHLIST VIEW
     -------------------------------------------------------------------------- */
  renderWatchlistView() {
    const container = document.getElementById('view-watchlist');
    if (!container) return;

    const list = StorageService.getWatchlist();

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">⭐ PERSONAL WATCHLIST (${list.length} STOCKS)</div>
          <button class="btn btn-primary" onclick="document.getElementById('global-search-input').focus();">+ Add Ticker</button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
                <th style="padding: 10px;">SYMBOL</th>
                <th style="padding: 10px;">COMPANY</th>
                <th style="padding: 10px;">EXCHANGE</th>
                <th style="padding: 10px;">PRICE</th>
                <th style="padding: 10px;">DAILY CHANGE</th>
                <th style="padding: 10px;">MARKET CAP</th>
                <th style="padding: 10px;">P/E</th>
                <th style="padding: 10px;">BETA</th>
                <th style="padding: 10px; text-align: right;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr><td colspan="9" style="padding: 40px; text-align: center; color: var(--text-muted);">Your watchlist is empty. Search for a stock to start tracking!</td></tr>
              ` : list.map(sym => {
                const stock = STOCK_DATABASE[sym];
                if (!stock) return '';
                const isGain = stock.change >= 0;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle); cursor: pointer;" class="table-row-hover" onclick="AppState.set('currentSymbol', '${sym}'); AppState.set('activeView', 'analyze');">
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${stock.symbol}</td>
                    <td style="padding: 10px; color: var(--text-secondary); font-weight: 500;">${stock.companyName}</td>
                    <td style="padding: 10px; color: var(--text-dim); font-size: 11px;">${stock.exchange}</td>
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 700;">${stock.currency === 'INR' ? '₹' : '$'}${stock.price.toFixed(2)}</td>
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 600;" class="${isGain ? 'gain' : 'loss'}">
                      ${isGain ? '+' : ''}${stock.change.toFixed(2)} (${isGain ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                    </td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${stock.marketCapFormatted}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${stock.pe ? stock.pe.toFixed(1) : '--'}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${stock.beta ? stock.beta.toFixed(2) : '--'}</td>
                    <td style="padding: 10px; text-align: right;">
                      <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px; margin-right: 4px;" onclick="event.stopPropagation(); AppState.set('currentSymbol', '${sym}'); AppState.set('activeView', 'analyze');">Analyze</button>
                      <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px; color: var(--loss-red);" onclick="event.stopPropagation(); StorageService.removeFromWatchlist('${sym}'); ViewController.renderWatchlistView();">Remove</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     5. STOCK ANALYSIS WORKSPACE + DEDICATED TREND ANALYSIS GRAPH
     -------------------------------------------------------------------------- */
  renderAnalyzeView() {
    const container = document.getElementById('view-analyze');
    if (!container) return;

    const sym = AppState.get('currentSymbol') || 'AAPL';
    const stock = STOCK_DATABASE[sym];
    if (!stock) return;

    const isGain = stock.change >= 0;
    const isWatched = StorageService.getWatchlist().includes(sym);
    const score = FinancialCalculations.calculateQualityScore(stock);
    const trend = TrendAnalysisEngine.analyzeTrend(stock.historicalData || []);

    container.innerHTML = `
      <!-- Stock Header Strip -->
      <div class="card" style="padding: 16px 20px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-family: var(--font-mono); font-size: 24px; font-weight: 800; color: var(--accent-blue);">${stock.symbol}</h2>
              <span class="brand-tag">${stock.exchange}</span>
              <span class="brand-tag" style="color: var(--text-secondary);">${stock.sector}</span>
              <span class="data-source-badge">${DataService.getDataSourceTag()}</span>
            </div>
            <h1 style="font-size: 14px; color: var(--text-secondary); font-weight: 500; margin-top: 2px;">${stock.companyName}</h1>
          </div>

          <!-- Price & Daily Change -->
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="text-align: right;">
              <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary);">
                ${stock.currency === 'INR' ? '₹' : '$'}${stock.price.toFixed(2)}
              </div>
              <div style="font-size: 13px; font-weight: 700; font-family: var(--font-mono);" class="${isGain ? 'gain' : 'loss'}">
                ${isGain ? '+' : ''}${stock.change.toFixed(2)} (${isGain ? '+' : ''}${stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 8px;">
              <button class="btn ${isWatched ? 'btn-secondary' : 'btn-primary'}" id="btn-toggle-watch" style="font-size: 12px;">
                ${isWatched ? '✓ In Watchlist' : '+ Watch'}
              </button>
              <button class="btn btn-success" onclick="AppState.set('activeView', 'paper');" style="font-size: 12px;">
                Trade in Simulator
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================== -->
      <!-- DEDICATED TREND ANALYSIS GRAPH & REGIME SECTION -->
      <!-- ================================================================== -->
      <div class="card" style="margin-bottom: 14px; border-left: 4px solid ${trend.statusColor};">
        <div class="card-header">
          <div class="card-title">
            <span>📈 DEDICATED TREND ANALYSIS GRAPH & REGIME</span>
          </div>
          <span class="brand-tag" style="color: ${trend.statusColor}; font-weight: 800;">${trend.regime}</span>
        </div>

        <div class="grid-4" style="margin-bottom: 14px;">
          <!-- Trend Direction Pill -->
          <div class="stat-box" style="border-color: ${trend.statusColor};">
            <span class="stat-box-label">PRIMARY TREND DIRECTION</span>
            <span class="stat-box-value" style="color: ${trend.statusColor}; font-size: 15px;">${trend.direction}</span>
            <span class="stat-box-sub">Slope: ${trend.slopePercentPerBar}% / bar</span>
          </div>

          <!-- Trend Strength Score -->
          <div class="stat-box">
            <span class="stat-box-label">TREND STRENGTH</span>
            <span class="stat-box-value" style="color: var(--accent-blue);">${trend.strengthScore} / 100</span>
            <div class="progress-bar-track" style="margin-top: 4px; height: 5px;">
              <div class="progress-bar-fill" style="width: ${trend.strengthScore}%; background: ${trend.statusColor};"></div>
            </div>
          </div>

          <!-- Primary Support Floor -->
          <div class="stat-box">
            <span class="stat-box-label">KEY SUPPORT FLOOR (BUYERS)</span>
            <span class="stat-box-value" style="color: var(--gain-green);">$${trend.primarySupport}</span>
            <span class="stat-box-sub">Historical demand zone</span>
          </div>

          <!-- Primary Resistance Ceiling -->
          <div class="stat-box">
            <span class="stat-box-label">KEY RESISTANCE (SELLERS)</span>
            <span class="stat-box-value" style="color: var(--loss-red);">$${trend.primaryResistance}</span>
            <span class="stat-box-sub">Historical supply ceiling</span>
          </div>
        </div>

        <!-- Plain English Trend Explanation -->
        <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: 6px; font-size: 12.5px; line-height: 1.6; display: flex; flex-direction: column; gap: 6px;">
          <div>
            <strong style="color: var(--text-primary);">📊 WHY IS IT IN THIS TREND?</strong>
            <p style="color: var(--text-secondary); margin-top: 2px;">${trend.explanation}</p>
          </div>
          <div style="padding-top: 6px; border-top: 1px solid var(--border-subtle);">
            <strong style="color: var(--accent-blue);">🎯 ACTIONABLE STRATEGY FOR BEGINNERS:</strong>
            <p style="color: var(--text-secondary); margin-top: 2px;">${trend.actionableTakeaway}</p>
          </div>
        </div>
      </div>

      <!-- Main Interactive Candlestick Chart Module -->
      <div class="chart-module" style="margin-bottom: 14px;">
        <!-- Chart Controls Toolbar -->
        <div class="chart-toolbar">
          <div class="chart-toolbar-group">
            <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-sans); font-weight: 700; margin-right: 4px;">TIMEFRAME:</span>
            <div class="chart-btn-group" id="chart-timeframe-group">
              ${['1M', '3M', '6M', '1Y', '5Y'].map(tf => `
                <button class="chart-pill ${AppState.get('timeframe') === tf ? 'active' : ''}" data-tf="${tf}">${tf}</button>
              `).join('')}
            </div>
          </div>

          <div class="chart-toolbar-group">
            <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-sans); font-weight: 700; margin-right: 4px;">INDICATORS & TREND:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;" id="chart-indicators-group">
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('trend') ? 'active' : ''}" data-ind="trend">📍 Trend Levels</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('sma20') ? 'active' : ''}" data-ind="sma20">SMA 20</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('sma50') ? 'active' : ''}" data-ind="sma50">SMA 50</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('sma200') ? 'active' : ''}" data-ind="sma200">SMA 200</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('ema20') ? 'active' : ''}" data-ind="ema20">EMA 20</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('rsi') ? 'active' : ''}" data-ind="rsi">RSI (14)</button>
              <button class="chart-pill-indicator ${AppState.get('activeIndicators').includes('macd') ? 'active' : ''}" data-ind="macd">MACD</button>
            </div>
          </div>
        </div>

        <!-- Beginner Chart Tutorial Overlay Strip -->
        <div class="chart-tutorial-banner beginner-only">
          <div class="tutorial-step-content">
            <span class="tutorial-step-badge">CHART GUIDE</span>
            <span>Hover cursor over candles to inspect exact Open, High, Low, Close, and Volume. Green candles indicate price gains; red indicates price declines.</span>
          </div>
          <button class="btn-explain" onclick="AppState.openContext('RSI');">Explain Indicators</button>
        </div>

        <!-- Canvas Chart Viewport -->
        <div class="chart-viewport" id="chart-viewport">
          <canvas id="stock-chart-canvas" class="chart-canvas"></canvas>
        </div>

        <!-- Floating Inspect Bar -->
        <div class="chart-inspect-bar" id="chart-inspect-bar">
          <span style="color: var(--text-dim);">Hover cursor over chart candles to inspect historical points.</span>
        </div>
      </div>

      <!-- STOCKLAB Analytical Snapshot (Educational Quality Score) -->
      <div class="card" style="margin-bottom: 14px;">
        <div class="card-header">
          <div class="card-title">🔬 STOCKLAB ANALYTICAL SNAPSHOT</div>
          <button class="btn-explain" onclick="AppState.openContext('MARKET_CAP');">What is this?</button>
        </div>

        <div class="grid-5" style="margin-bottom: 12px;">
          <div class="stat-box" style="text-align: center;">
            <span class="stat-box-label" style="justify-content: center;">GROWTH SCORE</span>
            <span class="stat-box-value" style="color: var(--accent-blue); font-size: 20px;">${score.growth}/100</span>
            <span class="stat-box-sub">Rev Growth: +${stock.revenueGrowth}%</span>
          </div>

          <div class="stat-box" style="text-align: center;">
            <span class="stat-box-label" style="justify-content: center;">PROFITABILITY</span>
            <span class="stat-box-value" style="color: var(--gain-green); font-size: 20px;">${score.profitability}/100</span>
            <span class="stat-box-sub">Net Margin: ${stock.netMargin}%</span>
          </div>

          <div class="stat-box" style="text-align: center;">
            <span class="stat-box-label" style="justify-content: center;">FINANCIAL HEALTH</span>
            <span class="stat-box-value" style="color: #7c3aed; font-size: 20px;">${score.health}/100</span>
            <span class="stat-box-sub">D/E: ${stock.debtToEquity}</span>
          </div>

          <div class="stat-box" style="text-align: center;">
            <span class="stat-box-label" style="justify-content: center;">VALUATION</span>
            <span class="stat-box-value" style="color: var(--accent-amber); font-size: 20px;">${score.valuation}/100</span>
            <span class="stat-box-sub">P/E: ${stock.pe || '--'}</span>
          </div>

          <div class="stat-box" style="text-align: center;">
            <span class="stat-box-label" style="justify-content: center;">MOMENTUM</span>
            <span class="stat-box-value" style="color: #0284c7; font-size: 20px;">${score.momentum}/100</span>
            <span class="stat-box-sub">Trend: Above SMA 50</span>
          </div>
        </div>
      </div>

      <!-- Fundamental Ratios & Valuation Grid -->
      <div class="grid-2" style="margin-bottom: 14px;">
        <div class="card">
          <div class="card-header">
            <span class="card-title">💰 VALUATION & EARNINGS</span>
            <button class="btn-explain" onclick="AppState.openContext('PE');">Explain P/E</button>
          </div>

          <div class="grid-3">
            <div class="stat-box">
              <span class="stat-box-label">MARKET CAP <button class="btn-explain" onclick="AppState.openContext('MARKET_CAP');">?</button></span>
              <span class="stat-box-value">${stock.marketCapFormatted}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">P/E RATIO <button class="btn-explain" onclick="AppState.openContext('PE');">?</button></span>
              <span class="stat-box-value">${stock.pe ? stock.pe.toFixed(1) : '--'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">FORWARD P/E</span>
              <span class="stat-box-value">${stock.forwardPe ? stock.forwardPe.toFixed(1) : '--'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">EPS (TTM) <button class="btn-explain" onclick="AppState.openContext('EPS');">?</button></span>
              <span class="stat-box-value">${stock.currency === 'INR' ? '₹' : '$'}${stock.eps.toFixed(2)}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">P/S RATIO</span>
              <span class="stat-box-value">${stock.ps ? stock.ps.toFixed(1) : '--'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">BETA <button class="btn-explain" onclick="AppState.openContext('BETA');">?</button></span>
              <span class="stat-box-value">${stock.beta.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🏥 FINANCIAL HEALTH & MARGINS</span>
            <button class="btn-explain" onclick="AppState.openContext('GROSS_MARGIN');">Explain Margins</button>
          </div>

          <div class="grid-3">
            <div class="stat-box">
              <span class="stat-box-label">ANNUAL REVENUE</span>
              <span class="stat-box-value">${stock.revenueFormatted}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">REV GROWTH YoY</span>
              <span class="stat-box-value ${stock.revenueGrowth >= 0 ? 'gain' : 'loss'}">+${stock.revenueGrowth.toFixed(1)}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">GROSS MARGIN <button class="btn-explain" onclick="AppState.openContext('GROSS_MARGIN');">?</button></span>
              <span class="stat-box-value">${stock.grossMargin.toFixed(1)}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">NET MARGIN</span>
              <span class="stat-box-value">${stock.netMargin.toFixed(1)}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">DEBT / EQUITY <button class="btn-explain" onclick="AppState.openContext('DEBT_TO_EQUITY');">?</button></span>
              <span class="stat-box-value">${stock.debtToEquity.toFixed(2)}</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-label">FREE CASH FLOW</span>
              <span class="stat-box-value">${stock.fcfFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Structured Bull / Bear Thesis Section -->
      <div class="card" style="margin-bottom: 14px;">
        <div class="card-header">
          <div class="card-title">🧠 STRUCTURED INVESTMENT THESIS: ${stock.symbol}</div>
          <span class="brand-tag">DISCIPLINED INVESTING</span>
        </div>

        <div class="grid-2" style="margin-bottom: 10px;">
          <div class="stat-box" style="border-left: 4px solid var(--gain-green);">
            <strong style="color: var(--gain-green); font-size: 12px; font-family: var(--font-sans);">BULL CASE (WHAT COULD GO RIGHT?)</strong>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${stock.bullCase}</p>
          </div>

          <div class="stat-box" style="border-left: 4px solid var(--loss-red);">
            <strong style="color: var(--loss-red); font-size: 12px; font-family: var(--font-sans);">BEAR CASE (WHAT COULD GO WRONG?)</strong>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${stock.bearCase}</p>
          </div>
        </div>

        <div class="grid-2">
          <div class="stat-box">
            <strong style="color: var(--accent-amber); font-size: 12px; font-family: var(--font-sans);">KEY RISKS TO MONITOR</strong>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${stock.keyRisks}</p>
          </div>

          <div class="stat-box">
            <strong style="color: var(--accent-blue); font-size: 12px; font-family: var(--font-sans);">THESIS INVALIDATION CRITERIA</strong>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${stock.thesisInvalidation}</p>
          </div>
        </div>
      </div>
    `;

    // Initialize Canvas Chart Engine
    const canvas = document.getElementById('stock-chart-canvas');
    const inspectBar = document.getElementById('chart-inspect-bar');
    if (canvas && inspectBar) {
      this.chartEngine = new StockChartEngine(canvas, inspectBar);
      this.updateChartData();
    }

    // Bind Watchlist toggle
    const watchBtn = document.getElementById('btn-toggle-watch');
    if (watchBtn) {
      watchBtn.addEventListener('click', () => {
        if (isWatched) {
          StorageService.removeFromWatchlist(sym);
          UIController.showToast(`Removed ${sym} from watchlist`, 'info');
        } else {
          StorageService.addToWatchlist(sym);
          UIController.showToast(`Added ${sym} to watchlist`, 'success');
        }
        this.renderAnalyzeView();
      });
    }

    // Bind Timeframe buttons
    document.querySelectorAll('#chart-timeframe-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tf = btn.getAttribute('data-tf');
        AppState.set('timeframe', tf);
        document.querySelectorAll('#chart-timeframe-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Bind Indicator buttons
    document.querySelectorAll('#chart-indicators-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        const ind = btn.getAttribute('data-ind');
        AppState.toggleIndicator(ind);
        btn.classList.toggle('active', AppState.get('activeIndicators').includes(ind));
      });
    });
  },

  async updateChartData() {
    if (!this.chartEngine) return;
    const sym = AppState.get('currentSymbol') || 'AAPL';
    const tf = AppState.get('timeframe') || '6M';
    const inds = AppState.get('activeIndicators') || [];

    const candles = await DataService.getHistoricalData(sym, tf);
    this.chartEngine.setData(candles, inds);
  },

  /* --------------------------------------------------------------------------
     6. COMPARE WORKSPACE
     -------------------------------------------------------------------------- */
  renderCompareView() {
    const container = document.getElementById('view-compare');
    if (!container) return;

    const symbols = AppState.get('compareSymbols') || ['AAPL', 'MSFT'];
    const stocks = symbols.map(s => STOCK_DATABASE[s]).filter(Boolean);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">⚖️ MULTI-STOCK COMPARISON WORKSTATION</div>
          <div style="display: flex; gap: 8px;">
            <select id="compare-add-select" class="search-input-wrapper" style="color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono); font-size: 11px;">
              <option value="">+ Add stock to compare</option>
              ${Object.keys(STOCK_DATABASE).filter(s => !symbols.includes(s)).map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="beginner-mode-badge">
          <strong>How to analyze comparisons:</strong> Compare valuation (P/E), profitability (margins), and growth rates side-by-side to understand why one company commands a premium multiple over another.
        </div>

        <!-- Selected Comparison Badges -->
        <div class="compare-selector-bar" style="margin-bottom: 14px;">
          ${stocks.map(s => `
            <div class="compare-tag">
              <span>${s.symbol}</span>
              <small style="color: var(--text-muted); font-weight: 500;">(${s.companyName})</small>
              ${symbols.length > 1 ? `<span class="compare-tag-remove" onclick="ViewController.removeCompareStock('${s.symbol}')">×</span>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Comparison Metric Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
                <th style="padding: 10px;">FINANCIAL METRIC</th>
                ${stocks.map(s => `<th style="padding: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${s.symbol}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Current Price</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono); font-weight: 700;">${s.currency === 'INR' ? '₹' : '$'}${s.price.toFixed(2)}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Daily Change %</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono); font-weight: 600;" class="${s.changePercent >= 0 ? 'gain' : 'loss'}">${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Market Capitalization</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.marketCapFormatted}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">P/E Ratio (Valuation)</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.pe ? s.pe.toFixed(1) : '--'}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Revenue Growth (YoY)</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono); ${s.revenueGrowth >= 10 ? 'color: var(--gain-green);' : ''}">+${s.revenueGrowth.toFixed(1)}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Gross Margin %</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.grossMargin.toFixed(1)}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Net Profit Margin %</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.netMargin.toFixed(1)}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Return on Equity (ROE)</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.roe.toFixed(1)}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Debt-to-Equity</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.debtToEquity.toFixed(2)}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 8px 10px; color: var(--text-secondary);">Dividend Yield</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.dividendYield > 0 ? s.dividendYield.toFixed(2) + '%' : '--'}</td>`).join('')}
              </tr>
              <tr>
                <td style="padding: 8px 10px; color: var(--text-secondary);">Beta (Volatility)</td>
                ${stocks.map(s => `<td style="padding: 8px 10px; font-family: var(--font-mono);">${s.beta.toFixed(2)}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const select = container.querySelector('#compare-add-select');
    if (select) {
      select.addEventListener('change', () => {
        const val = select.value;
        if (val && !symbols.includes(val) && symbols.length < 4) {
          symbols.push(val);
          AppState.set('compareSymbols', symbols);
          this.renderCompareView();
        }
      });
    }
  },

  removeCompareStock(symbol) {
    let symbols = AppState.get('compareSymbols') || [];
    symbols = symbols.filter(s => s !== symbol);
    if (symbols.length === 0) symbols = ['AAPL'];
    AppState.set('compareSymbols', symbols);
    this.renderCompareView();
  },

  /* --------------------------------------------------------------------------
     7. LEARNING CENTER VIEW (24-MODULE CURRICULUM)
     -------------------------------------------------------------------------- */
  renderLearnView() {
    const container = document.getElementById('view-learn');
    if (!container) return;

    const completed = StorageService.getLearningProgress();
    const progressPercent = ((completed.length / CURRICULUM_MODULES.length) * 100).toFixed(0);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div>
            <div class="card-title">🎓 STOCKLAB BEGINNER CURRICULUM</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              ${completed.length} of ${CURRICULUM_MODULES.length} modules completed (${progressPercent}%)
            </div>
          </div>
          <span class="brand-tag" style="color: var(--gain-green); font-size: 11px;">100% SELF-PACED</span>
        </div>

        <div class="progress-bar-track" style="height: 6px; margin-bottom: 16px;">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="grid-3">
          ${CURRICULUM_MODULES.map(m => {
            const isDone = completed.includes(m.id);
            return `
              <div class="card" style="background: var(--bg-tertiary); cursor: pointer; border-color: ${isDone ? 'var(--gain-green-border)' : 'var(--border-subtle)'};" onclick="ViewController.openModuleModal(${m.id})">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="brand-tag">${m.category}</span>
                  <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: ${isDone ? 'var(--gain-green)' : 'var(--text-dim)'};">
                    ${isDone ? '✓ COMPLETED' : 'MODULE ' + (m.id < 10 ? '0' + m.id : m.id)}
                  </span>
                </div>
                <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${m.title}</h4>
                <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">${m.summary}</p>
                <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                  <span style="font-size: 11px; font-weight: 600; color: var(--accent-blue);">Start Module ➔</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  openModuleModal(moduleId) {
    const m = CURRICULUM_MODULES.find(mod => mod.id === moduleId);
    if (!m) return;

    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.innerText = `MODULE ${m.id < 10 ? '0' + m.id : m.id}: ${m.title.toUpperCase()}`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
        ${m.content}

        ${m.quiz ? `
          <div class="card" style="background: var(--bg-tertiary); margin-top: 10px;">
            <div class="card-title" style="margin-bottom: 8px; color: var(--accent-amber);">📝 KNOWLEDGE CHECK QUIZ</div>
            <p style="font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">${m.quiz.question}</p>

            <div style="display: flex; flex-direction: column; gap: 6px;" id="quiz-options-container">
              ${m.quiz.options.map((opt, idx) => `
                <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start; padding: 10px 14px; font-size: 12px;" onclick="ViewController.handleQuizAnswer(${m.id}, ${idx}, ${m.quiz.correctIndex})">
                  ${idx + 1}. ${opt}
                </button>
              `).join('')}
            </div>

            <div id="quiz-feedback-box" style="margin-top: 10px; display: none; font-size: 11.5px; padding: 10px 14px; border-radius: 6px;"></div>
          </div>
        ` : ''}
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="UIController.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="StorageService.markModuleComplete(${m.id}); UIController.closeModal(); UIController.showToast('Module marked complete!', 'success'); ViewController.renderLearnView();">Mark Completed ✓</button>
    `;

    UIController.openModal();
  },

  handleQuizAnswer(moduleId, selectedIdx, correctIdx) {
    const feedback = document.getElementById('quiz-feedback-box');
    if (!feedback) return;

    const m = CURRICULUM_MODULES.find(mod => mod.id === moduleId);
    if (!m) return;

    if (selectedIdx === correctIdx) {
      feedback.style.display = 'block';
      feedback.style.background = 'var(--gain-green-bg)';
      feedback.style.border = '1px solid var(--gain-green-border)';
      feedback.style.color = 'var(--gain-green)';
      feedback.innerHTML = `<strong>✓ Correct!</strong> ${m.quiz.explanation}`;
      StorageService.markModuleComplete(moduleId);
      this.renderLearnView();
    } else {
      feedback.style.display = 'block';
      feedback.style.background = 'var(--loss-red-bg)';
      feedback.style.border = '1px solid var(--loss-red-border)';
      feedback.style.color = 'var(--loss-red)';
      feedback.innerHTML = `<strong>✗ Incorrect.</strong> Review the explanation and try again.`;
    }
  },

  /* --------------------------------------------------------------------------
     8. RISK CENTER VIEW
     -------------------------------------------------------------------------- */
  renderRiskView() {
    const container = document.getElementById('view-risk');
    if (!container) return;

    const port = StorageService.getPortfolio();
    const stats = FinancialCalculations.calculatePortfolioStats(port, STOCK_DATABASE);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">🛡️ RISK MANAGEMENT & PORTFOLIO SURVIVAL CENTER</div>
          <span class="data-source-badge">RISK HEURISTICS</span>
        </div>

        <div class="beginner-mode-badge" style="border-color: rgba(217, 119, 6, 0.3); background: rgba(217, 119, 6, 0.08); color: var(--accent-amber);">
          <strong>Rule #1 of Investing:</strong> "Never lose money. Rule No. 2: Never forget rule No. 1." — Managing downside risk ensures you remain solvent to benefit from long-term compound growth.
        </div>

        <div class="grid-3" style="margin-bottom: 16px;">
          <div class="card" style="background: var(--bg-tertiary);">
            <div class="card-title" style="color: var(--accent-blue); margin-bottom: 4px;">1. POSITION SIZING</div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">
              Never risk more than 1-2% of total portfolio capital on a single speculative trade. Size your shares based on your planned stop-loss level.
            </p>
          </div>

          <div class="card" style="background: var(--bg-tertiary);">
            <div class="card-title" style="color: var(--gain-green); margin-bottom: 4px;">2. SECTOR DIVERSIFICATION</div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">
              Avoid holding only technology or only financials. Spreading positions across uncorrelated industries cushions against sector-wide corrections.
            </p>
          </div>

          <div class="card" style="background: var(--bg-tertiary);">
            <div class="card-title" style="color: var(--accent-purple); margin-bottom: 4px;">3. ASYMMETRIC LOSS MATH</div>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">
              A 50% loss requires a 100% gain to break even. An 80% loss requires a 400% gain. Capital preservation is your ultimate defense.
            </p>
          </div>
        </div>

        <div class="card" style="background: var(--bg-tertiary);">
          <div class="card-header">
            <span class="card-title">PORTFOLIO CONCENTRATION HEALTH CHECK</span>
            <span class="brand-tag">${stats.positions.length} ACTIVE POSITIONS</span>
          </div>

          ${stats.hasConcentrationRisk ? `
            <div style="padding: 10px 14px; background: rgba(225, 29, 72, 0.1); border: 1px solid var(--loss-red-border); border-radius: 6px; color: var(--loss-red); font-size: 12.5px; margin-bottom: 12px;">
              <strong>⚠️ Severe Concentration Detected:</strong> Your largest position (<strong>${stats.largestPosition.symbol}</strong>) represents <strong>${stats.largestPosition.allocation}%</strong> of your total portfolio. Consider trimming or adding other uncorrelated assets.
            </div>
          ` : `
            <div style="padding: 10px 14px; background: var(--gain-green-bg); border: 1px solid var(--gain-green-border); border-radius: 6px; color: var(--gain-green); font-size: 12.5px; margin-bottom: 12px;">
              <strong>✓ Healthy Diversification:</strong> No single asset currently exceeds 40% of total portfolio value.
            </div>
          `}

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono);">
                  <th style="padding: 8px;">SYMBOL</th>
                  <th style="padding: 8px;">VALUE</th>
                  <th style="padding: 8px;">ALLOCATION</th>
                  <th style="padding: 8px;">RISK STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${stats.positions.map(p => `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${p.symbol}</td>
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 600;">$${p.positionValue.toFixed(2)}</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${p.allocation}%</td>
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 700; color: ${p.allocation > 35 ? 'var(--loss-red)' : 'var(--gain-green)'};">
                      ${p.allocation > 35 ? 'High Concentration' : 'Optimal'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     9. SETTINGS VIEW
     -------------------------------------------------------------------------- */
  renderSettingsView() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">⚙️ TERMINAL PREFERENCES & DATA FEEDS</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
          <div>
            <label style="font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 6px;">INTERFACE THEME</label>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" onclick="document.body.removeAttribute('data-theme'); UIController.showToast('Friendly Light Interface Activated', 'info');">
                ☀️ Friendly Light Interface (Default)
              </button>
              <button class="btn btn-secondary" onclick="document.body.setAttribute('data-theme', 'dark'); UIController.showToast('Dark Terminal Theme Activated', 'info');">
                🌙 Dark Workstation Theme
              </button>
            </div>
          </div>

          <div>
            <label style="font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 6px;">MARKET DATA SOURCE</label>
            <div style="padding: 10px 14px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px; color: var(--text-secondary);">
              Current Provider: <strong>${DataService.getDataSourceTag()}</strong> (Real-time public live quotes & verified market statistics).
            </div>
          </div>

          <div style="padding-top: 12px; border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-secondary" onclick="localStorage.clear(); location.reload();" style="color: var(--loss-red);">
              Reset All Saved LocalStorage Data
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
