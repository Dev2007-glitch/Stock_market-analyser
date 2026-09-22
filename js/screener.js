/**
 * STOCKLAB - Stock Screener & Filter Engine
 * Multi-factor stock filtering with educational presets (Growth, Value, Quality, Dividends, Momentum).
 */

const ScreenerController = {
  activePreset: 'all',
  filters: {
    sector: 'ALL',
    maxPe: 150,
    minGrowth: -50,
    minMargin: -50,
    minDividend: 0
  },

  presets: {
    all: {
      name: 'All Stocks',
      desc: 'View all equities in the STOCKLAB universe without active filters.'
    },
    growth: {
      name: 'High Growth Compounders',
      desc: 'Companies growing annual revenue at > 15% with solid gross margins.',
      apply: (s) => s.revenueGrowth >= 12 && s.grossMargin >= 40
    },
    value: {
      name: 'Value & Reasonable Multiples',
      desc: 'Stocks trading at lower P/E ratios (< 25) with profitable free cash flows.',
      apply: (s) => s.pe <= 28 && s.pe > 0 && s.netMargin > 10
    },
    large_caps: {
      name: 'Mega & Large Caps',
      desc: 'Established market leaders with valuations over $200 Billion.',
      apply: (s) => s.marketCap >= 200000000000
    },
    dividends: {
      name: 'Dividend Payers',
      desc: 'Cash-generative businesses paying regular dividend distributions.',
      apply: (s) => s.dividendYield >= 0.5
    },
    momentum: {
      name: 'High Relative Momentum',
      desc: 'Stocks exhibiting strong positive price action and positive quarterly earnings acceleration.',
      apply: (s) => s.changePercent > 0 && s.epsGrowth > 10
    }
  },

  render(container) {
    const stocks = Object.values(STOCK_DATABASE);
    let filtered = stocks;

    if (this.activePreset !== 'all' && this.presets[this.activePreset].apply) {
      filtered = filtered.filter(this.presets[this.activePreset].apply);
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">🔍 STOCK SCREENER & FILTER WORKSTATION</div>
          <span class="data-source-badge">${filtered.length} MATCHES FOUND</span>
        </div>

        <div class="beginner-mode-badge">
          <strong>💡 How to use a Screener:</strong> Screeners filter through thousands of companies to identify potential research candidates matching specific analytical criteria. <em>A screen is a starting point for deep research, never an automatic buy recommendation.</em>
        </div>

        <!-- Presets Row -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
          ${Object.keys(this.presets).map(key => {
            const p = this.presets[key];
            const isActive = this.activePreset === key;
            return `
              <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}" onclick="ScreenerController.selectPreset('${key}')" style="font-size: 11px; padding: 4px 10px;">
                ${p.name}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Active Preset Description -->
        <div style="font-size: 12px; color: var(--text-secondary); background: var(--bg-tertiary); padding: 8px 12px; border-radius: 4px; margin-bottom: 14px; font-family: var(--font-mono);">
          <strong>CURRENT PRESET:</strong> ${this.presets[this.activePreset].desc}
        </div>

        <!-- Results Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
                <th style="padding: 8px;">TICKER</th>
                <th style="padding: 8px;">COMPANY</th>
                <th style="padding: 8px;">SECTOR</th>
                <th style="padding: 8px;">PRICE</th>
                <th style="padding: 8px;">CHG %</th>
                <th style="padding: 8px;">MKT CAP</th>
                <th style="padding: 8px;">P/E</th>
                <th style="padding: 8px;">REV GROWTH</th>
                <th style="padding: 8px;">NET MARGIN</th>
                <th style="padding: 8px;">DIV YIELD</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(s => {
                const isGain = s.changePercent >= 0;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle); cursor: pointer;" class="table-row-hover" onclick="AppState.set('currentSymbol', '${s.symbol}'); AppState.set('activeView', 'analyze');">
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${s.symbol}</td>
                    <td style="padding: 8px; color: var(--text-secondary);">${s.companyName}</td>
                    <td style="padding: 8px; color: var(--text-dim); font-size: 11px;">${s.sector}</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${s.currency === 'INR' ? '₹' : '$'}${s.price.toFixed(2)}</td>
                    <td style="padding: 8px; font-family: var(--font-mono);" class="${isGain ? 'gain' : 'loss'}">${isGain ? '+' : ''}${s.changePercent.toFixed(2)}%</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${s.marketCapFormatted}</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${s.pe ? s.pe.toFixed(1) : '--'}</td>
                    <td style="padding: 8px; font-family: var(--font-mono); ${s.revenueGrowth >= 10 ? 'color: var(--gain-green);' : ''}">${s.revenueGrowth >= 0 ? '+' : ''}${s.revenueGrowth.toFixed(1)}%</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${s.netMargin.toFixed(1)}%</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${s.dividendYield > 0 ? s.dividendYield.toFixed(2) + '%' : '--'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  selectPreset(presetKey) {
    this.activePreset = presetKey;
    const container = document.getElementById('view-screener');
    if (container) this.render(container);
  }
};
