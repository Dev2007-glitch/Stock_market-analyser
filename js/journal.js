/**
 * STOCKLAB - Reflective Trade Journal Controller
 * Captures the underlying rationale, thesis invalidation, and lessons for each trade.
 */

const JournalController = {
  render(container) {
    const entries = StorageService.getJournalEntries();

    container.innerHTML = `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">📖 MY REFLECTIVE TRADE JOURNAL</div>
          <button class="btn btn-primary" id="btn-new-journal-entry">+ Log New Thesis</button>
        </div>

        <div class="beginner-mode-badge">
          <strong>🧠 The Analyst Mindset:</strong> Great investors don't just log profit and loss—they record the <em>decision-making process</em> and pre-commit to <em>invalidation criteria</em> before placing a trade.
        </div>

        ${entries.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            Your first thesis hasn't been written yet. Log your reasoning to start building disciplined habits!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${entries.map(e => `
              <div class="card" style="background: var(--bg-tertiary);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--accent-cyan);">${e.symbol}</span>
                    <span class="brand-tag">${e.tradeType || 'TRADE'}</span>
                    <span class="brand-tag" style="color: var(--accent-amber);">${e.reason || 'Technical'}</span>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">${e.date} (${e.id})</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
                  <div>
                    <strong style="color: var(--text-secondary); font-size: 11px;">ENTRY THESIS:</strong>
                    <p style="color: var(--text-primary); margin-top: 2px;">${e.thesis}</p>
                  </div>

                  ${e.invalidation ? `
                    <div>
                      <strong style="color: var(--loss-red); font-size: 11px;">WHAT INVALIDATES THIS THESIS:</strong>
                      <p style="color: var(--text-secondary); margin-top: 2px;">${e.invalidation}</p>
                    </div>
                  ` : ''}

                  ${e.reflection ? `
                    <div style="margin-top: 4px; padding: 6px 10px; background: var(--bg-card); border-left: 2px solid var(--accent-cyan); border-radius: 3px;">
                      <strong style="color: var(--accent-cyan); font-size: 10px;">POST-TRADE REFLECTION:</strong>
                      <p style="color: var(--text-muted); font-size: 11px; margin-top: 2px;">${e.reflection}</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    const newBtn = container.querySelector('#btn-new-journal-entry');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.showNewJournalModal());
    }
  },

  promptPostTradeJournal(symbol, tradeType, shares, price) {
    const modal = document.getElementById('global-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.innerText = `LOG TRADE THESIS FOR ${symbol} (${tradeType})`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="beginner-mode-badge" style="margin:0;">
          <strong>Why did you enter this trade?</strong> Documenting your thinking now prevents emotional second-guessing later.
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">PRIMARY REASON CATEGORY</label>
          <select id="jrn-reason" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono);">
            <option value="Technical">Technical Setup (Breakout, Moving Average, Momentum)</option>
            <option value="Fundamental">Fundamental Quality (Earnings, Margins, Growth)</option>
            <option value="Valuation">Attractive Valuation (Low P/E, Discount to Cash Flow)</option>
            <option value="News">News Catalyst / Earnings Reaction</option>
            <option value="Long-term thesis">Long-Term Multi-Year Thesis</option>
            <option value="Other">Other Rationale</option>
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 4px;">YOUR DETAILED THESIS</label>
          <textarea id="jrn-thesis" rows="3" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-sans); padding: 8px; resize: vertical;" placeholder="e.g. Strong momentum above 50-day SMA with increasing volume..."></textarea>
        </div>

        <div>
          <label style="font-size: 11px; color: var(--loss-red); display: block; margin-bottom: 4px;">WHAT WOULD INVALIDATE THIS THESIS? (CRUCIAL)</label>
          <textarea id="jrn-invalidation" rows="2" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-sans); padding: 8px; resize: vertical;" placeholder="e.g. Daily close below $190 or earnings growth deceleration..."></textarea>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="UIController.closeModal()">Skip for Now</button>
      <button class="btn btn-primary" id="jrn-submit-btn">Save to Journal</button>
    `;

    document.getElementById('jrn-submit-btn').addEventListener('click', () => {
      const reason = document.getElementById('jrn-reason').value;
      const thesis = document.getElementById('jrn-thesis').value.trim() || 'No detailed thesis entered.';
      const invalidation = document.getElementById('jrn-invalidation').value.trim();

      StorageService.saveJournalEntry({
        symbol,
        tradeType,
        reason,
        thesis,
        invalidation,
        reflection: `Executed simulated ${tradeType} of ${shares} shares at $${price.toFixed(2)}.`
      });

      UIController.closeModal();
      UIController.showToast('Logged to Reflective Trade Journal!', 'success');
    });

    UIController.openModal();
  },

  showNewJournalModal() {
    this.promptPostTradeJournal(AppState.get('currentSymbol') || 'AAPL', 'BUY', 10, 200);
  }
};
