/**
 * STOCKLAB - Paper Trading Simulator Engine
 * Simulated $100k demo trading, Market/Limit orders, position tracking, and performance metrics.
 */

const PaperTradingController = {
  render(container) {
    const state = StorageService.getPaperTradingState();
    const portfolioStats = FinancialCalculations.calculatePortfolioStats(state.positions, STOCK_DATABASE);
    const totalAccountValue = state.cash + portfolioStats.totalValue;

    // Calculate Win Rate from tradeHistory
    let wins = 0;
    let totalRealizedPnl = 0;
    state.tradeHistory.forEach(t => {
      if (t.pnl > 0) wins++;
      totalRealizedPnl += t.pnl;
    });
    const winRate = state.tradeHistory.length > 0 ? ((wins / state.tradeHistory.length) * 100).toFixed(1) : '0.0';

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">📈 PAPER TRADING WORKSTATION (SIMULATED $100,000 DEMO CASH)</div>
          <button class="btn btn-secondary" id="btn-reset-paper" style="font-size: 11px;">Reset Simulator</button>
        </div>

        <div class="grid-4" style="margin-bottom: 16px;">
          <div class="stat-box">
            <span class="stat-box-label">TOTAL ACCOUNT VALUE</span>
            <span class="stat-box-value">$${totalAccountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="stat-box-sub">Cash + Open Positions</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">AVAILABLE DEMO CASH</span>
            <span class="stat-box-value" style="color: var(--accent-cyan);">$${state.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="stat-box-sub">Liquid purchasing power</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">REALIZED P/L (CLOSED)</span>
            <span class="stat-box-value ${totalRealizedPnl >= 0 ? 'gain' : 'loss'}">${totalRealizedPnl >= 0 ? '+' : ''}$${totalRealizedPnl.toFixed(2)}</span>
            <span class="stat-box-sub">From ${state.tradeHistory.length} completed trades</span>
          </div>

          <div class="stat-box">
            <span class="stat-box-label">SIMULATOR WIN RATE</span>
            <span class="stat-box-value">${winRate}%</span>
            <span class="stat-box-sub">${wins} wins / ${state.tradeHistory.length} trades</span>
          </div>
        </div>

        <!-- Order Placement Form & Open Positions Layout -->
        <div class="grid-2" style="margin-bottom: 16px;">
          <!-- Order Placement Module -->
          <div class="card" style="background: var(--bg-tertiary);">
            <div class="card-header">
              <span class="card-title">EXECUTE SIMULATED ORDER</span>
              <span class="data-source-badge">ZERO REAL RISK</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div class="grid-2">
                <div>
                  <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">SELECT ASSET</label>
                  <select id="paper-order-symbol" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-card); font-family: var(--font-mono);">
                    ${Object.keys(STOCK_DATABASE).map(sym => {
                      const st = STOCK_DATABASE[sym];
                      return `<option value="${sym}" ${sym === AppState.get('currentSymbol') ? 'selected' : ''}>${sym} ($${st.price})</option>`;
                    }).join('')}
                  </select>
                </div>

                <div>
                  <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">ORDER ACTION</label>
                  <div style="display: flex; gap: 4px;">
                    <button type="button" class="btn btn-success active" id="paper-btn-buy" style="flex: 1; padding: 6px;">BUY</button>
                    <button type="button" class="btn btn-secondary" id="paper-btn-sell" style="flex: 1; padding: 6px;">SELL</button>
                  </div>
                </div>
              </div>

              <div class="grid-2">
                <div>
                  <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">ORDER TYPE</label>
                  <select id="paper-order-type" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-card); font-family: var(--font-mono);">
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">QUANTITY (SHARES)</label>
                  <input type="number" id="paper-order-shares" value="10" min="1" step="1" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-card); font-family: var(--font-mono); padding: 5px;">
                </div>
              </div>

              <div id="paper-limit-price-group" style="display: none;">
                <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">LIMIT TARGET PRICE ($)</label>
                <input type="number" id="paper-limit-price" value="200.00" min="0.01" step="0.01" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-card); font-family: var(--font-mono); padding: 5px;">
              </div>

              <!-- Beginner Order Explanation Box -->
              <div id="order-type-explanation" class="beginner-mode-badge" style="margin: 0; font-size: 11px;">
                <strong>Market Order:</strong> Executes immediately at the best available current market price ($<span id="order-est-price">--</span>).
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 12px;">
                <span style="color: var(--text-muted);">ESTIMATED TOTAL:</span>
                <span id="order-est-total" style="font-weight: 700; color: var(--text-primary);">$0.00</span>
              </div>

              <button class="btn btn-primary" id="btn-submit-order" style="width: 100%; padding: 8px; font-weight: 700; font-family: var(--font-mono);">
                CONFIRM & SUBMIT ORDER
              </button>
            </div>
          </div>

          <!-- Open Paper Positions -->
          <div class="card" style="background: var(--bg-tertiary);">
            <div class="card-header">
              <span class="card-title">OPEN SIMULATED POSITIONS (${state.positions.length})</span>
            </div>

            <div style="max-height: 280px; overflow-y: auto;">
              ${state.positions.length === 0 ? `
                <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 12px;">
                  No open paper positions.<br>Use the order form to execute your first simulated trade!
                </div>
              ` : `
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono);">
                      <th style="padding: 6px;">SYMBOL</th>
                      <th style="padding: 6px;">SHARES</th>
                      <th style="padding: 6px;">AVG</th>
                      <th style="padding: 6px;">CURRENT</th>
                      <th style="padding: 6px;">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${portfolioStats.positions.map(p => {
                      const posProfit = p.unrealizedPnl >= 0;
                      return `
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: 6px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${p.symbol}</td>
                          <td style="padding: 6px; font-family: var(--font-mono);">${p.shares}</td>
                          <td style="padding: 6px; font-family: var(--font-mono);">$${p.avgPrice.toFixed(2)}</td>
                          <td style="padding: 6px; font-family: var(--font-mono);">$${p.currentPrice.toFixed(2)}</td>
                          <td style="padding: 6px; font-family: var(--font-mono);" class="${posProfit ? 'gain' : 'loss'}">
                            ${posProfit ? '+' : ''}$${p.unrealizedPnl.toFixed(2)} (${posProfit ? '+' : ''}${p.unrealizedPnlPercent.toFixed(2)}%)
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              `}
            </div>
          </div>
        </div>

        <!-- Trade History Table -->
        <div>
          <div class="card-title" style="margin-bottom: 8px;">CLOSED TRADE HISTORY & RECORD</div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-family: var(--font-mono);">
                  <th style="padding: 6px 10px;">DATE</th>
                  <th style="padding: 6px 10px;">ID</th>
                  <th style="padding: 6px 10px;">SYMBOL</th>
                  <th style="padding: 6px 10px;">ACTION</th>
                  <th style="padding: 6px 10px;">SHARES</th>
                  <th style="padding: 6px 10px;">ENTRY PRICE</th>
                  <th style="padding: 6px 10px;">EXIT PRICE</th>
                  <th style="padding: 6px 10px;">REALIZED P/L</th>
                </tr>
              </thead>
              <tbody>
                ${state.tradeHistory.length === 0 ? `
                  <tr><td colspan="8" style="padding: 20px; text-align: center; color: var(--text-muted);">No closed trades yet. Sell an open position to record realized performance.</td></tr>
                ` : state.tradeHistory.map(t => {
                  const isGain = t.pnl >= 0;
                  return `
                    <tr style="border-bottom: 1px solid var(--border-subtle);">
                      <td style="padding: 6px 10px; color: var(--text-dim); font-family: var(--font-mono);">${t.date}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);">${t.id}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${t.symbol}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);">${t.type}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);">${t.shares}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);">$${t.buyPrice.toFixed(2)}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);">$${t.sellPrice.toFixed(2)}</td>
                      <td style="padding: 6px 10px; font-family: var(--font-mono);" class="${isGain ? 'gain' : 'loss'}">
                        ${isGain ? '+' : ''}$${t.pnl.toFixed(2)} (${isGain ? '+' : ''}${t.pnlPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindOrderFormEvents(container);
  },

  bindOrderFormEvents(container) {
    let orderAction = 'BUY';
    const symbolSelect = container.querySelector('#paper-order-symbol');
    const orderTypeSelect = container.querySelector('#paper-order-type');
    const sharesInput = container.querySelector('#paper-order-shares');
    const limitPriceInput = container.querySelector('#paper-limit-price');
    const limitGroup = container.querySelector('#paper-limit-price-group');
    const buyBtn = container.querySelector('#paper-btn-buy');
    const sellBtn = container.querySelector('#paper-btn-sell');
    const estPriceSpan = container.querySelector('#order-est-price');
    const estTotalSpan = container.querySelector('#order-est-total');
    const explanationDiv = container.querySelector('#order-type-explanation');
    const submitBtn = container.querySelector('#btn-submit-order');
    const resetBtn = container.querySelector('#btn-reset-paper');

    const updateEstimate = () => {
      const sym = symbolSelect.value;
      const stock = STOCK_DATABASE[sym];
      const shares = parseInt(sharesInput.value, 10) || 0;
      const type = orderTypeSelect.value;
      const price = type === 'MARKET' ? (stock ? stock.price : 0) : (parseFloat(limitPriceInput.value) || 0);

      estPriceSpan.innerText = price.toFixed(2);
      estTotalSpan.innerText = `$${(shares * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      if (type === 'MARKET') {
        limitGroup.style.display = 'none';
        explanationDiv.innerHTML = `<strong>Market Order:</strong> Attempts to execute immediately at the best available market price ($${price.toFixed(2)}).`;
      } else {
        limitGroup.style.display = 'block';
        explanationDiv.innerHTML = `<strong>Limit Order:</strong> Attempts to execute only at your specified target price ($${price.toFixed(2)}) or better.`;
      }
    };

    buyBtn.addEventListener('click', () => {
      orderAction = 'BUY';
      buyBtn.className = 'btn btn-success active';
      sellBtn.className = 'btn btn-secondary';
      submitBtn.className = 'btn btn-primary';
      submitBtn.innerText = 'CONFIRM & SUBMIT BUY ORDER';
      updateEstimate();
    });

    sellBtn.addEventListener('click', () => {
      orderAction = 'SELL';
      sellBtn.className = 'btn btn-danger active';
      buyBtn.className = 'btn btn-secondary';
      submitBtn.className = 'btn btn-danger';
      submitBtn.innerText = 'CONFIRM & SUBMIT SELL ORDER';
      updateEstimate();
    });

    symbolSelect.addEventListener('change', updateEstimate);
    orderTypeSelect.addEventListener('change', updateEstimate);
    sharesInput.addEventListener('input', updateEstimate);
    limitPriceInput.addEventListener('input', updateEstimate);
    updateEstimate();

    // Order Submission
    submitBtn.addEventListener('click', () => {
      const sym = symbolSelect.value;
      const stock = STOCK_DATABASE[sym];
      const shares = parseInt(sharesInput.value, 10);
      const orderType = orderTypeSelect.value;
      const price = orderType === 'MARKET' ? stock.price : parseFloat(limitPriceInput.value);

      if (!shares || shares <= 0) {
        UIController.showToast('Please enter a valid share quantity.', 'error');
        return;
      }

      const state = StorageService.getPaperTradingState();
      const totalCost = shares * price;

      if (orderAction === 'BUY') {
        if (state.cash < totalCost) {
          UIController.showToast(`Insufficient cash ($${state.cash.toFixed(2)}) for order ($${totalCost.toFixed(2)}).`, 'error');
          return;
        }

        // Deduct Cash & Add Position
        state.cash -= totalCost;
        const existing = state.positions.find(p => p.symbol === sym);
        if (existing) {
          const totShares = existing.shares + shares;
          existing.avgPrice = ((existing.shares * existing.avgPrice) + totalCost) / totShares;
          existing.shares = totShares;
        } else {
          state.positions.push({
            symbol: sym,
            shares: shares,
            avgPrice: price,
            entryDate: new Date().toISOString().split('T')[0]
          });
        }

        state.orders.push({
          id: `ORD-${Date.now().toString().slice(-4)}`,
          symbol: sym,
          type: 'BUY',
          orderType: orderType,
          shares: shares,
          price: price,
          status: 'FILLED',
          timestamp: new Date().toLocaleTimeString()
        });

        StorageService.savePaperTradingState(state);
        UIController.showToast(`Simulated BUY order filled: ${shares} shares of ${sym} at $${price.toFixed(2)}`, 'success');

        // Trigger Trade Journal Modal prompt
        JournalController.promptPostTradeJournal(sym, 'BUY', shares, price);
        this.render(container);
      } else {
        // SELL Order
        const existing = state.positions.find(p => p.symbol === sym);
        if (!existing || existing.shares < shares) {
          UIController.showToast(`Cannot sell ${shares} shares of ${sym}. You only own ${existing ? existing.shares : 0} shares.`, 'error');
          return;
        }

        const realizedPnl = (price - existing.avgPrice) * shares;
        const realizedPnlPercent = ((price - existing.avgPrice) / existing.avgPrice) * 100;

        state.cash += totalCost;
        existing.shares -= shares;
        if (existing.shares === 0) {
          state.positions = state.positions.filter(p => p.symbol !== sym);
        }

        state.tradeHistory.unshift({
          id: `TRD-${Date.now().toString().slice(-4)}`,
          symbol: sym,
          type: 'SELL',
          shares: shares,
          buyPrice: existing.avgPrice,
          sellPrice: price,
          pnl: parseFloat(realizedPnl.toFixed(2)),
          pnlPercent: parseFloat(realizedPnlPercent.toFixed(2)),
          date: new Date().toISOString().split('T')[0]
        });

        StorageService.savePaperTradingState(state);
        UIController.showToast(`Simulated SELL order filled: ${shares} shares of ${sym} (P/L: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)})`, 'success');

        JournalController.promptPostTradeJournal(sym, 'SELL', shares, price);
        this.render(container);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset paper trading simulator to starting $100,000 cash balance?')) {
          StorageService.savePaperTradingState(DEFAULT_PAPER_TRADING);
          UIController.showToast('Simulator reset to $100,000 demo cash.', 'info');
          this.render(container);
        }
      });
    }
  }
};
