/**
 * STOCKLAB - Financial News & Earnings Calendar Controller
 * Displays categorized market news feeds, company filings, and scheduled earnings events.
 */

const NewsController = {
  render(container) {
    container.innerHTML = `
      <div class="grid-2" style="margin-bottom: 16px;">
        <!-- News Feed Column -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📰 FINANCIAL NEWS & MARKET DISPATCHES</div>
            <span class="data-source-badge">VERIFIED DEMO FEED</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${FINANCIAL_NEWS.map(n => `
              <div class="card" style="background: var(--bg-tertiary); padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="brand-tag">${n.category}</span>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">${n.source} • ${n.time}</span>
                </div>
                <h4 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; line-height: 1.4;">
                  ${n.headline}
                </h4>
                <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5;">
                  ${n.summary}
                </p>
                ${n.ticker && n.ticker !== 'MARKETS' ? `
                  <div style="margin-top: 6px;">
                    <button class="btn btn-secondary" style="font-size: 10px; padding: 2px 6px; font-family: var(--font-mono);" onclick="AppState.set('currentSymbol', '${n.ticker}'); AppState.set('activeView', 'analyze');">
                      Analyze ${n.ticker} ➔
                    </button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Upcoming Earnings Calendar Column -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📅 UPCOMING EARNINGS CALENDAR</div>
            <span class="data-source-badge">CONSENSUS ESTIMATES</span>
          </div>

          <div class="beginner-mode-badge">
            <strong>Earnings Season:</strong> Public companies report quarterly audited financial results. Stock prices often experience heightened volatility around earnings releases as market participants adjust expectations.
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono);">
                  <th style="padding: 8px;">TICKER</th>
                  <th style="padding: 8px;">COMPANY</th>
                  <th style="padding: 8px;">DATE</th>
                  <th style="padding: 8px;">EXP EPS</th>
                  <th style="padding: 8px;">EXP REV</th>
                </tr>
              </thead>
              <tbody>
                ${UPCOMING_EARNINGS.map(e => `
                  <tr style="border-bottom: 1px solid var(--border-subtle); cursor: pointer;" class="table-row-hover" onclick="AppState.set('currentSymbol', '${e.symbol}'); AppState.set('activeView', 'analyze');">
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${e.symbol}</td>
                    <td style="padding: 8px; color: var(--text-secondary);">${e.company}</td>
                    <td style="padding: 8px; font-family: var(--font-mono); color: var(--text-dim);">${e.date}</td>
                    <td style="padding: 8px; font-family: var(--font-mono); font-weight: 600;">${e.expectedEps}</td>
                    <td style="padding: 8px; font-family: var(--font-mono);">${e.expectedRev}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
