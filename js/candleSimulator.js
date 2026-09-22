/**
 * STOCKLAB - Integrated Candlestick Simulator & Parallel Slot Booking Engine
 * Combines bar-by-bar market replay with parallel real-time next wick prediction
 * and instant slot booking side-by-side.
 */

const CandlestickSimulator = {
  activeSymbol: 'AAPL',
  fullCandles: [],
  currentIndex: 40,
  isPlaying: false,
  playInterval: null,
  speed: 1000,
  timeRemaining: 30,
  countdownInterval: null,
  tickInterval: null,
  canvasEngine: null,

  account: {
    balance: 7217.45,
    equity: 7312.66,
    margin: 46.84,
    freeMargin: 7170.61,
    marginLevel: 15612.00
  },

  activeSlots: [
    {
      id: 'SLOT-8491',
      asset: 'AAPL (30s)',
      type: 'BUY',
      lotSize: '0.05',
      entryPrice: 228.40,
      currentPrice: 228.95,
      pnl: 10.25,
      timeRemaining: 18,
      prediction: 'Green Body & Upper Wick ↗'
    },
    {
      id: 'SLOT-8492',
      asset: 'NVDA (30s)',
      type: 'BUY',
      lotSize: '0.05',
      entryPrice: 124.10,
      currentPrice: 124.62,
      pnl: 21.75,
      timeRemaining: 12,
      prediction: 'Bullish Momentum Expansion ↗'
    }
  ],

  patterns: [
    {
      id: 'hammer',
      name: 'Bullish Hammer / Pin Bar',
      type: 'Bullish Reversal',
      color: '#059669',
      desc: 'Small real body near the top with a long lower shadow (2x body height).',
      psychology: 'Buyers aggressively absorbed selling pressure at support, driving price to close near the top of the session.',
      detect: (c, prev) => {
        const body = Math.abs(c.close - c.open);
        const lowerShadow = Math.min(c.open, c.close) - c.low;
        const upperShadow = c.high - Math.max(c.open, c.close);
        return lowerShadow >= (2 * body) && upperShadow <= (body * 0.5) && body > 0;
      }
    },
    {
      id: 'shooting_star',
      name: 'Shooting Star',
      type: 'Bearish Reversal',
      color: '#e11d48',
      desc: 'Small real body near the bottom with a long upper shadow (2x body height).',
      psychology: 'Buyers attempted to break out, but sellers overwhelmed demand and pushed price down to close near the low.',
      detect: (c, prev) => {
        const body = Math.abs(c.close - c.open);
        const upperShadow = c.high - Math.max(c.open, c.close);
        const lowerShadow = Math.min(c.open, c.close) - c.low;
        return upperShadow >= (2 * body) && lowerShadow <= (body * 0.5) && body > 0;
      }
    },
    {
      id: 'bullish_engulfing',
      name: 'Bullish Engulfing',
      type: 'Bullish Reversal',
      color: '#059669',
      desc: 'Large green candle body completely engulfs prior red body.',
      psychology: 'Buyers completely took control of order flow from the previous session sellers.',
      detect: (c, prev) => {
        if (!prev) return false;
        return prev.close < prev.open && c.close > c.open && c.open <= prev.close && c.close >= prev.open;
      }
    },
    {
      id: 'doji',
      name: 'Doji (Indecision)',
      type: 'Neutral / Equilibrium',
      color: '#d97706',
      desc: 'Open and Close are virtually identical.',
      psychology: 'Balance between buyers and sellers; watch for breakout direction on the next candle.',
      detect: (c, prev) => {
        const body = Math.abs(c.close - c.open);
        const range = c.high - c.low;
        return range > 0 && (body / range) <= 0.08;
      }
    }
  ],

  async init(container) {
    this.activeSymbol = AppState.get('currentSymbol') || 'AAPL';
    this.fullCandles = await DataService.getHistoricalData(this.activeSymbol, '1Y');
    this.currentIndex = Math.min(50, this.fullCandles.length - 10);
    this.startLiveTickEngine();
    this.startSlotCountdown();
    this.render(container);
  },

  startLiveTickEngine() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      let totalLivePnl = 0;
      this.activeSlots.forEach(slot => {
        const delta = (Math.random() - 0.46) * 0.18;
        slot.currentPrice = parseFloat((slot.currentPrice + delta).toFixed(2));
        const diff = slot.currentPrice - slot.entryPrice;
        slot.pnl = parseFloat((slot.type === 'BUY' ? diff * 25 : -diff * 25).toFixed(2));
        totalLivePnl += slot.pnl;
      });
      this.account.equity = parseFloat((this.account.balance + totalLivePnl).toFixed(2));
      this.updateLiveHeaderDOM();
      this.updateActiveSlotsDOM();
    }, 800);
  },

  startSlotCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.settleExpiringSlots();
        this.timeRemaining = 30;
      }
      this.updateCountdownDOM();
    }, 1000);
  },

  settleExpiringSlots() {
    const remaining = [];
    this.activeSlots.forEach(slot => {
      slot.timeRemaining -= 30;
      if (slot.timeRemaining <= 0) {
        const win = slot.pnl >= 0;
        this.account.balance = parseFloat((this.account.balance + slot.pnl).toFixed(2));
        UIController.showToast(`Slot ${slot.id} Expired: ${win ? '+$' + slot.pnl : '-$' + Math.abs(slot.pnl)} (${slot.asset})`, win ? 'success' : 'error');
      } else {
        remaining.push(slot);
      }
    });
    this.activeSlots = remaining;
  },

  bookSlot(type) {
    const stock = STOCK_DATABASE[this.activeSymbol] || STOCK_DATABASE['AAPL'];
    const currentPrice = this.fullCandles[this.currentIndex] ? this.fullCandles[this.currentIndex].close : stock.price;
    const slotId = `SLOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSlot = {
      id: slotId,
      asset: `${this.activeSymbol} (30s)`,
      type: type,
      lotSize: '0.05',
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      pnl: 0.00,
      timeRemaining: 30,
      prediction: type === 'BUY' ? 'Next Candle: Green / Upper Wick ↗' : 'Next Candle: Red / Lower Wick ↘'
    };

    this.activeSlots.unshift(newSlot);
    UIController.showToast(`Booked ${type} Candle Slot for ${this.activeSymbol} @ $${currentPrice.toFixed(2)}`, 'success');
    this.updateActiveSlotsDOM();
  },

  calculateNextWickPrediction() {
    const visibleCandles = this.fullCandles.slice(0, this.currentIndex + 1);
    const trend = TrendAnalysisEngine.analyzeTrend(visibleCandles);
    const currentCandle = this.fullCandles[this.currentIndex] || { close: 200, high: 202, low: 198, open: 199 };

    let direction = 'BULLISH UPPER WICK EXPANSION (GREEN)';
    let probability = 78;
    let expHigh = (currentCandle.close * 1.008).toFixed(2);
    let expLow = (currentCandle.close * 0.994).toFixed(2);
    let recommendation = 'CALL / BUY (Target Upper Wick Push ↗)';

    if (trend.regime.includes('BEARISH')) {
      direction = 'BEARISH LOWER WICK EXPANSION (RED)';
      probability = 74;
      expHigh = (currentCandle.close * 1.003).toFixed(2);
      expLow = (currentCandle.close * 0.988).toFixed(2);
      recommendation = 'PUT / SELL (Target Breakdown Rejection ↘)';
    }

    return { direction, probability, expHigh, expLow, recommendation, trend };
  },

  render(container) {
    const currentCandle = this.fullCandles[this.currentIndex] || { date: '--', close: 0, open: 0, high: 0, low: 0, volume: 0 };
    const prevCandle = this.currentIndex > 0 ? this.fullCandles[this.currentIndex - 1] : null;
    const detectedPatterns = this.patterns.filter(p => p.detect(currentCandle, prevCandle));
    const pred = this.calculateNextWickPrediction();

    let totalLivePnl = 0;
    this.activeSlots.forEach(s => totalLivePnl += s.pnl);
    const isProfit = totalLivePnl >= 0;

    container.innerHTML = `
      <!-- TOP STATUS & REPLAY TOOLBAR STRIP -->
      <div class="card" style="padding: 12px 18px; margin-bottom: 14px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          
          <!-- Asset Selector & Current Candle Date -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <select id="sim-ticker-select" class="search-input-wrapper" style="font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--accent-blue); background: var(--bg-tertiary); padding: 6px 12px;">
              ${Object.keys(STOCK_DATABASE).map(sym => `
                <option value="${sym}" ${sym === this.activeSymbol ? 'selected' : ''}>${sym} - ${STOCK_DATABASE[sym].companyName}</option>
              `).join('')}
            </select>
            <span style="font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono);">
              Bar <strong>${this.currentIndex + 1}</strong> of <strong>${this.fullCandles.length}</strong> (${currentCandle.date})
            </span>
          </div>

          <!-- Replay Controls -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn ${this.isPlaying ? 'btn-danger' : 'btn-success'}" id="btn-sim-play" style="padding: 6px 14px; font-size: 12px;">
              ${this.isPlaying ? '⏸ Pause' : '▶ Play Replay'}
            </button>
            <button class="btn btn-secondary" id="btn-sim-prev" style="padding: 6px 10px; font-size: 12px;" ${this.currentIndex <= 10 ? 'disabled' : ''}>
              ⏮ Prev
            </button>
            <button class="btn btn-primary" id="btn-sim-next" style="padding: 6px 12px; font-size: 12px;" ${this.currentIndex >= this.fullCandles.length - 1 ? 'disabled' : ''}>
              ⏭ Next Bar
            </button>
            <button class="btn btn-secondary" id="btn-sim-reset" style="padding: 6px 10px; font-size: 12px;">
              🔄 Reset
            </button>
          </div>

          <!-- Live Account Floating P&L -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="text-align: right; font-family: var(--font-mono);">
              <span style="font-size: 10px; color: var(--text-muted); display: block;">FLOATING P&L</span>
              <strong id="sim-top-pnl" style="font-size: 16px; color: ${isProfit ? '#0284c7' : '#e11d48'};">
                ${isProfit ? '+' : ''}${totalLivePnl.toFixed(2)} USD
              </strong>
            </div>
            <div style="text-align: right; font-family: var(--font-mono); border-left: 1px solid var(--border-subtle); padding-left: 12px;">
              <span style="font-size: 10px; color: var(--text-muted); display: block;">EQUITY</span>
              <strong id="sim-top-equity" style="font-size: 14px; color: var(--text-primary);">$${this.account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

        </div>
      </div>

      <!-- ================================================================ -->
      <!-- PARALLEL 2-COLUMN WORKBENCH: CHART (LEFT) + SLOT BOOKING (RIGHT) -->
      <!-- ================================================================ -->
      <div class="sim-parallel-container">
        
        <!-- LEFT COLUMN: REAL CANDLESTICK REPLAY CHART & PATTERNS -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <div class="chart-module" style="background: #ffffff; border-radius: 10px; border: 1px solid var(--border-subtle);">
            <!-- Canvas Chart Viewport -->
            <div class="chart-viewport" style="height: 420px;">
              <canvas id="sim-chart-canvas" class="chart-canvas"></canvas>
            </div>
            <div class="chart-inspect-bar" id="sim-inspect-bar">
              <span>Date: <strong>${currentCandle.date}</strong> | Close: <strong>$${currentCandle.close.toFixed(2)}</strong> | Vol: <strong>${(currentCandle.volume/1000000).toFixed(2)}M</strong></span>
            </div>
          </div>

          <!-- Candlestick Pattern Recognition & Buyer/Seller Psychology -->
          <div class="card" style="background: var(--bg-secondary);">
            <div class="card-header">
              <span class="card-title">🔍 DETECTED JAPANESE CANDLESTICK FORMATIONS</span>
              <span class="brand-tag">${detectedPatterns.length} PATTERN(S) IDENTIFIED</span>
            </div>

            ${detectedPatterns.length === 0 ? `
              <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 12px;">
                Standard auction candle at $${currentCandle.close.toFixed(2)}. Step or play forward to see reversal and continuation patterns!
              </div>
            ` : detectedPatterns.map(p => `
              <div style="padding: 10px 14px; background: var(--bg-tertiary); border-radius: 6px; border-left: 4px solid ${p.color}; margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                  <strong style="color: ${p.color}; font-size: 13px;">${p.name}</strong>
                  <span class="brand-tag" style="color: ${p.color};">${p.type}</span>
                </div>
                <p style="font-size: 11.5px; color: var(--text-secondary);">${p.desc}</p>
                <div style="font-size: 11px; color: var(--text-primary); margin-top: 4px;">
                  <strong>Auction Psychology:</strong> ${p.psychology}
                </div>
              </div>
            `).join('')}
          </div>

        </div>

        <!-- RIGHT COLUMN: PARALLEL NEXT WICK PREDICTION & SLOT BOOKING -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- 1. Next Wick Predictive AI Card -->
          <div class="card" style="background: #ffffff; border-left: 4px solid var(--accent-blue);">
            <div class="card-header">
              <span class="card-title">🔮 NEXT WICK PREDICTION</span>
              <span class="brand-tag" style="color: var(--accent-blue);">${pred.probability}% PROBABILITY</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div class="stat-box" style="background: var(--bg-tertiary);">
                <span class="stat-box-label">ESTIMATED NEXT RESULT</span>
                <span class="stat-box-value" style="color: var(--accent-blue); font-size: 13.5px;">${pred.direction}</span>
              </div>

              <div class="grid-2">
                <div class="stat-box">
                  <span class="stat-box-label">UPPER WICK HIGH</span>
                  <span class="stat-box-value" style="color: var(--gain-green); font-size: 15px;">$${pred.expHigh}</span>
                </div>
                <div class="stat-box">
                  <span class="stat-box-label">LOWER WICK LOW</span>
                  <span class="stat-box-value" style="color: var(--loss-red); font-size: 15px;">$${pred.expLow}</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">
                <span>Current Strike: <strong>$${currentCandle.close.toFixed(2)}</strong></span>
                <span>Candle Close: <strong id="sim-countdown-timer" style="color: #d97706; font-size: 13px;">00:${this.timeRemaining < 10 ? '0' + this.timeRemaining : this.timeRemaining}s</strong></span>
              </div>
            </div>
          </div>

          <!-- 2. 1-Click Instant Candle Slot Booking -->
          <div class="card" style="background: #ffffff;">
            <div class="card-header">
              <span class="card-title">⚡ BOOK CANDLE SLOT</span>
              <span class="data-source-badge">30s TIMEFRAME</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="btn btn-success" id="btn-sim-call" style="padding: 12px; font-size: 13px; font-weight: 800; font-family: var(--font-mono); display: flex; justify-content: space-between;">
                <span>CALL / BUY ↗</span>
                <span style="font-size: 11px; font-weight: 600;">Upper Wick Target</span>
              </button>

              <button class="btn btn-danger" id="btn-sim-put" style="padding: 12px; font-size: 13px; font-weight: 800; font-family: var(--font-mono); display: flex; justify-content: space-between;">
                <span>PUT / SELL ↘</span>
                <span style="font-size: 11px; font-weight: 600;">Lower Wick Target</span>
              </button>
            </div>
          </div>

          <!-- 3. Live Active Slots & Positions Stream (MetaTrader Style) -->
          <div class="card" style="background: #ffffff;">
            <div class="card-header">
              <span class="card-title">📋 RUNNING BOOKED SLOTS (<span id="sim-slot-count">${this.activeSlots.length}</span>)</span>
            </div>

            <div id="sim-slots-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto;">
              <!-- Rendered dynamically -->
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents(container);
    this.renderCanvas();
    this.updateActiveSlotsDOM();
  },

  renderCanvas() {
    const canvas = document.getElementById('sim-chart-canvas');
    const inspect = document.getElementById('sim-inspect-bar');
    if (!canvas || !inspect) return;

    this.canvasEngine = new StockChartEngine(canvas, inspect);
    const visibleCandles = this.fullCandles.slice(0, this.currentIndex + 1);
    this.canvasEngine.setData(visibleCandles, ['sma20', 'sma50', 'trend']);
  },

  updateLiveHeaderDOM() {
    const pnlEl = document.getElementById('sim-top-pnl');
    const eqEl = document.getElementById('sim-top-equity');
    let totalLivePnl = 0;
    this.activeSlots.forEach(s => totalLivePnl += s.pnl);
    const isProfit = totalLivePnl >= 0;

    if (pnlEl) {
      pnlEl.innerText = `${isProfit ? '+' : ''}${totalLivePnl.toFixed(2)} USD`;
      pnlEl.style.color = isProfit ? '#0284c7' : '#e11d48';
    }
    if (eqEl) {
      eqEl.innerText = `$${this.account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  },

  updateCountdownDOM() {
    const timerEl = document.getElementById('sim-countdown-timer');
    if (timerEl) {
      timerEl.innerText = `00:${this.timeRemaining < 10 ? '0' + this.timeRemaining : this.timeRemaining}s`;
    }
  },

  updateActiveSlotsDOM() {
    const list = document.getElementById('sim-slots-list');
    const count = document.getElementById('sim-slot-count');
    if (!list) return;

    if (count) count.innerText = this.activeSlots.length;

    if (this.activeSlots.length === 0) {
      list.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 11.5px;">No active slots. Click CALL or PUT to book.</div>`;
      return;
    }

    list.innerHTML = this.activeSlots.map(s => {
      const isWin = s.pnl >= 0;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #0b0f19; border-radius: 6px; border-left: 3px solid ${isWin ? '#38bdf8' : '#f43f5e'}; color: #ffffff; font-family: var(--font-mono); font-size: 11px;">
          <div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <strong>${s.asset}</strong>
              <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; background: ${s.type === 'BUY' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(244, 63, 94, 0.2)'}; color: ${s.type === 'BUY' ? '#38bdf8' : '#f43f5e'}; font-weight: 700;">${s.type}</span>
            </div>
            <div style="color: #94a3b8; font-size: 10px;">${s.entryPrice.toFixed(2)} ➔ ${s.currentPrice.toFixed(2)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 13px; color: ${isWin ? '#38bdf8' : '#f43f5e'};">
              ${isWin ? '+' : ''}${s.pnl.toFixed(2)}
            </div>
            <div style="font-size: 9.5px; color: #94a3b8;">${s.timeRemaining}s</div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindEvents(container) {
    const playBtn = container.querySelector('#btn-sim-play');
    const prevBtn = container.querySelector('#btn-sim-prev');
    const nextBtn = container.querySelector('#btn-sim-next');
    const resetBtn = container.querySelector('#btn-sim-reset');
    const tickerSelect = container.querySelector('#sim-ticker-select');
    const callBtn = container.querySelector('#btn-sim-call');
    const putBtn = container.querySelector('#btn-sim-put');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play(container);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentIndex > 10) {
          this.currentIndex--;
          this.render(container);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentIndex < this.fullCandles.length - 1) {
          this.currentIndex++;
          this.render(container);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.pause();
        this.currentIndex = 40;
        this.render(container);
      });
    }

    if (tickerSelect) {
      tickerSelect.addEventListener('change', async () => {
        this.pause();
        this.activeSymbol = tickerSelect.value;
        this.fullCandles = await DataService.getHistoricalData(this.activeSymbol, '1Y');
        this.currentIndex = 40;
        this.render(container);
      });
    }

    if (callBtn) {
      callBtn.addEventListener('click', () => this.bookSlot('BUY'));
    }

    if (putBtn) {
      putBtn.addEventListener('click', () => this.bookSlot('SELL'));
    }
  },

  play(container) {
    this.isPlaying = true;
    this.playInterval = setInterval(() => {
      if (this.currentIndex < this.fullCandles.length - 1) {
        this.currentIndex++;
        this.render(container);
      } else {
        this.pause();
      }
    }, this.speed);
    const btn = container.querySelector('#btn-sim-play');
    if (btn) {
      btn.className = 'btn btn-danger';
      btn.innerText = '⏸ Pause';
    }
  },

  pause() {
    this.isPlaying = false;
    if (this.playInterval) clearInterval(this.playInterval);
    this.playInterval = null;
  }
};
