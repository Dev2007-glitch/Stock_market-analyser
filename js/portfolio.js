/**
 * STOCKLAB - Portfolio Tracker & Allocation Engine
 * Manages demo portfolio positions, cost basis, unrealized P/L, concentration risks, and allocation views.
 */

const PortfolioController = {
  render(container) {
    const rawPositions = StorageService.getPortfolio();
    const stats = FinancialCalculations.calculatePortfolioStats(rawPositions, STOCK_DATABASE);

    const isProfit = stats.totalPnl >= 0;
    const isTodayProfit = stats.todayPnl >= 0;

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">💼 DEMO PORTFOLIO OVERVIEW</div>
          <button class="btn btn-primary" id="btn-add-position">+ Add Position</button>
        </div>

        <div class="grid-4" style="margin-bottom: 16px;">
          <div class="stat-box">
            <span class="stat-box-label">TOTAL PORTFOLIO VALUE</span>
            <span class="stat-box-value">$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="stat-box-sub">Cost Basis: $${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">TOTAL UNREALIZED P/L</span>
            <span class="stat-box-value ${isProfit ? 'gain' : 'loss'}">${isProfit ? '+' : ''}$${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${isProfit ? '+' : ''}${stats.totalPnlPercent.toFixed(2)}%)</span>
            <span class="stat-box-sub">All-time return</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">TODAY'S P/L</span>
            <span class="stat-box-value ${isTodayProfit ? 'gain' : 'loss'}">${isTodayProfit ? '+' : ''}$${stats.todayPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${isTodayProfit ? '+' : ''}${stats.todayPnlPercent.toFixed(2)}%)</span>
            <span class="stat-box-sub">Daily fluctuation</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">LARGEST POSITION</span>
            <span class="stat-box-value">${stats.largestPosition ? stats.largestPosition.symbol + ' (' + stats.largestPosition.allocation + '%)' : 'None'}</span>
            <span class="stat-box-sub">${stats.hasConcentrationRisk ? '⚠️ High Concentration' : '✓ Balanced'}</span>
          </div>
        </div>

        ${stats.hasConcentrationRisk ? `
          <div class="beginner-mode-badge" style="border-color: var(--accent-amber); background: rgba(245, 158, 11, 0.1); color: var(--accent-amber);">
            <strong>⚠️ Concentration Risk Warning:</strong> Your position in <strong>${stats.largestPosition.symbol}</strong> accounts for ${stats.largestPosition.allocation}% of your entire portfolio. Diversified portfolios typically aim to limit single positions below 15-20% to prevent adverse single-stock shocks.
          </div>
        ` : ''}

        <!-- Allocation Breakdown Bar -->
        <div style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px; color:var(--text-secondary);">
            <span>PORTFOLIO ASSET ALLOCATION</span>
            <span>${stats.positions.length} Positions</span>
          </div>
          <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: var(--bg-tertiary); gap: 2px;">
            ${stats.positions.map((p, idx) => {
              const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
              const color = colors[idx % colors.length];
              return `<div style="width: ${p.allocation}%; background: ${color}; height: 100%;" title="${p.symbol}: ${p.allocation}%"></div>`;
            }).join('')}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px;">
            ${stats.positions.map((p, idx) => {
              const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
              const color = colors[idx % colors.length];
              return `
                <span style="font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background: ${color}; display: inline-block;"></span>
                  <strong>${p.symbol}</strong> ${p.allocation}%
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Positions Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
                <th style="padding: 8px 10px;">SYMBOL</th>
                <th style="padding: 8px 10px;">SHARES</th>
                <th style="padding: 8px 10px;">AVG PRICE</th>
                <th style="padding: 8px 10px;">CURRENT</th>
                <th style="padding: 8px 10px;">MARKET VALUE</th>
                <th style="padding: 8px 10px;">TOTAL P/L</th>
                <th style="padding: 8px 10px;">ALLOCATION</th>
                <th style="padding: 8px 10px; text-align: right;">ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${stats.positions.length === 0 ? `
                <tr>
                  <td colspan="8" style="padding: 30px; text-align: center; color: var(--text-muted);">
                    Your portfolio is empty. Click "+ Add Position" or execute a paper trade.
                  </td>
                </tr>
              ` : stats.positions.map(p => {
                const posProfit = p.unrealizedPnl >= 0;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle); transition: background var(--transition-fast);" class="table-row-hover">
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); cursor: pointer;" onclick="AppState.set('currentSymbol', '${p.symbol}'); AppState.set('activeView', 'analyze');">
                      ${p.symbol}
                    </td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${p.shares}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">$${p.avgPrice.toFixed(2)}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);">$${p.currentPrice.toFixed(2)}</td>
                    <td style="padding: 10px; font-family: var(--font-mono); font-weight: 600;">$${p.positionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="padding: 10px; font-family: var(--font-mono);" class="${posProfit ? 'gain' : 'loss'}">
                      ${posProfit ? '+' : ''}$${p.unrealizedPnl.toFixed(2)} (${posProfit ? '+' : ''}${p.unrealizedPnlPercent.toFixed(2)}%)
                    </td>
                    <td style="padding: 10px; font-family: var(--font-mono);">${p.allocation}%</td>
                    <td style="padding: 10px; text-align: right;">
                      <button class="btn btn-secondary" style="padding: 2px 8px; font-size: 10px;" onclick="PortfolioController.removePosition('${p.symbol}')">Remove</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind Add Position Modal
    const addBtn = container.querySelector('#btn-add-position');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddPositionModal());
    }
  },

  showAddPositionModal() {
    const modal = document.getElementById('global-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.innerText = 'ADD POSITION TO DEMO PORTFOLIO';
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">TICKER SYMBOL</label>
          <select id="modal-pos-symbol" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono);">
            ${Object.keys(STOCK_DATABASE).map(sym => `<option value="${sym}">${sym} - ${STOCK_DATABASE[sym].companyName}</option>`).join('')}
          </select>
        </div>

        <div class="grid-2">
          <div>
            <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">SHARES</label>
            <input type="number" id="modal-pos-shares" value="10" min="1" step="1" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono); padding: 6px;">
          </div>
          <div>
            <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">AVG PURCHASE PRICE ($)</label>
            <input type="number" id="modal-pos-price" value="150.00" min="0.01" step="0.01" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono); padding: 6px;">
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="UIController.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="modal-pos-submit">Save Position</button>
    `;

    document.getElementById('modal-pos-submit').addEventListener('click', () => {
      const sym = document.getElementById('modal-pos-symbol').value;
      const shares = parseInt(document.getElementById('modal-pos-shares').value, 10);
      const avgPrice = parseFloat(document.getElementById('modal-pos-price').value);

      if (sym && shares > 0 && avgPrice > 0) {
        StorageService.addPortfolioPosition({ symbol: sym, shares, avgPrice });
        UIController.closeModal();
        UIController.showToast(`Added ${shares} shares of ${sym} to portfolio`, 'success');
        AppState.emit('portfolioUpdated', {});
      }
    });

    UIController.openModal();
  },

  removePosition(symbol) {
    if (confirm(`Remove ${symbol} from your demo portfolio?`)) {
      StorageService.removePortfolioPosition(symbol);
      UIController.showToast(`Removed ${symbol} from portfolio`, 'info');
      AppState.emit('portfolioUpdated', {});
    }
  }
};
