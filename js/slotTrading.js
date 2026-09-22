/**
 * STOCKLAB - Live Candle Slot Booking & Next Wick Prediction Engine
 * Inspired by professional live volatility & candle slot trading interfaces.
 * Features: Live tick price stream, countdown slot timer, next candle wick predictive analytics,
 * active slot manager, live P&L tracking, and automatic settlement on candle close.
 */

const SlotTradingEngine = {
  account: {
    balance: 7217.45,
    equity: 7312.66,
    margin: 46.84,
    freeMargin: 7170.61,
    marginLevel: 15612.00,
    currency: 'USD'
  },

  selectedAsset: 'AAPL',
  selectedSlotTime: 30, // seconds per candle slot
  slotAmount: 50, // default $50 stake
  timeRemaining: 30,
  tickInterval: null,
  countdownInterval: null,

  activeSlots: [
    {
      id: 'SLOT-8491',
      asset: 'AAPL (1s)',
      type: 'BUY',
      lotSize: '0.05',
      entryPrice: 228.40,
      currentPrice: 228.95,
      strikePrice: 228.40,
      pnl: 10.25,
      isPositive: true,
      timeRemaining: 18,
      prediction: 'Green Body & Upper Wick',
      estimatedResult: '+85% Payout'
    },
    {
      id: 'SLOT-8492',
      asset: 'NVDA (1s)',
      type: 'BUY',
      lotSize: '0.05',
      entryPrice: 124.10,
      currentPrice: 124.62,
      strikePrice: 124.10,
      pnl: 21.75,
      isPositive: true,
      timeRemaining: 12,
      prediction: 'Bullish Momentum Expansion',
      estimatedResult: '+88% Payout'
    },
    {
      id: 'SLOT-8493',
      asset: 'TSLA (1s)',
      type: 'BUY',
      lotSize: '0.05',
      entryPrice: 247.80,
      currentPrice: 248.55,
      strikePrice: 247.80,
      pnl: 26.68,
      isPositive: true,
      timeRemaining: 8,
      prediction: 'Lower Wick Absorption',
      estimatedResult: '+90% Payout'
    }
  ],

  historySlots: [],

  init() {
    this.startLiveTickEngine();
    this.startSlotCountdown();
  },

  startLiveTickEngine() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      // Simulate live price ticks for active slots
      let totalLivePnl = 0;
      this.activeSlots.forEach(slot => {
        const delta = (Math.random() - 0.46) * 0.15;
        slot.currentPrice = parseFloat((slot.currentPrice + delta).toFixed(2));
        
        const priceDiff = slot.currentPrice - slot.entryPrice;
        if (slot.type === 'BUY') {
          slot.pnl = parseFloat((priceDiff * 25).toFixed(2));
        } else {
          slot.pnl = parseFloat((-priceDiff * 25).toFixed(2));
        }
        slot.isPositive = slot.pnl >= 0;
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
        this.timeRemaining = this.selectedSlotTime;
      }
      this.updateCountdownDOM();
    }, 1000);
  },

  settleExpiringSlots() {
    // Settle active slots whose time expired
    const remaining = [];
    this.activeSlots.forEach(slot => {
      slot.timeRemaining -= this.selectedSlotTime;
      if (slot.timeRemaining <= 0) {
        // Settle Slot
        const win = slot.pnl >= 0;
        this.account.balance = parseFloat((this.account.balance + slot.pnl).toFixed(2));
        this.historySlots.unshift({
          ...slot,
          closedAt: new Date().toLocaleTimeString(),
          result: win ? 'PROFIT' : 'LOSS'
        });
        UIController.showToast(`Slot ${slot.id} Expired: ${win ? '+$' + slot.pnl : '-$' + Math.abs(slot.pnl)} (${slot.asset})`, win ? 'success' : 'error');
      } else {
        remaining.push(slot);
      }
    });
    this.activeSlots = remaining;
  },

  bookSlot(predictionType) {
    const stock = STOCK_DATABASE[this.selectedAsset] || STOCK_DATABASE['AAPL'];
    const currentPrice = stock.price;
    const slotId = `SLOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSlot = {
      id: slotId,
      asset: `${this.selectedAsset} (${this.selectedSlotTime}s)`,
      type: predictionType, // 'BUY' (Green/Upper Wick) or 'SELL' (Red/Lower Wick)
      lotSize: '0.05',
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      strikePrice: currentPrice,
      pnl: 0.00,
      isPositive: true,
      timeRemaining: this.selectedSlotTime,
      prediction: predictionType === 'BUY' ? 'Next Candle: Green / Upper Wick ↗' : 'Next Candle: Red / Lower Wick ↘',
      estimatedResult: '+85% Payout'
    };

    this.activeSlots.unshift(newSlot);
    UIController.showToast(`Booked ${predictionType} Candle Slot for ${this.selectedAsset} @ $${currentPrice.toFixed(2)}`, 'success');
    this.updateActiveSlotsDOM();
  },

  calculateNextWickPrediction(stock) {
    const historical = stock.historicalData || [];
    const trend = TrendAnalysisEngine.analyzeTrend(historical);
    const lastCandle = historical[historical.length - 1] || { open: stock.price, high: stock.price, low: stock.price, close: stock.price };

    const body = Math.abs(lastCandle.close - lastCandle.open);
    const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;

    let predictedDirection = 'BULLISH WICK EXPANSION (GREEN)';
    let probability = 78;
    let expectedHigh = (stock.price * 1.008).toFixed(2);
    let expectedLow = (stock.price * 0.994).toFixed(2);
    let recommendation = 'CALL / BUY (Target Upper Wick Push)';

    if (trend.regime === 'BEARISH' || trend.regime === 'MILDLY BEARISH') {
      predictedDirection = 'BEARISH LOWER WICK EXPANSION (RED)';
      probability = 74;
      expectedHigh = (stock.price * 1.003).toFixed(2);
      expectedLow = (stock.price * 0.988).toFixed(2);
      recommendation = 'PUT / SELL (Target Breakdown Rejection)';
    } else if (upperWick > lowerWick * 2) {
      predictedDirection = 'PULLBACK & LOWER WICK TEST';
      probability = 68;
      recommendation = 'WAIT FOR SUPPORT RETEST OR PUT';
    }

    return {
      predictedDirection,
      probability,
      expectedHigh,
      expectedLow,
      recommendation,
      primarySupport: trend.primarySupport,
      primaryResistance: trend.primaryResistance
    };
  },

  render(container) {
    const stock = STOCK_DATABASE[this.selectedAsset] || STOCK_DATABASE['AAPL'];
    const prediction = this.calculateNextWickPrediction(stock);

    let totalLivePnl = 0;
    this.activeSlots.forEach(s => totalLivePnl += s.pnl);
    const isProfit = totalLivePnl >= 0;

    container.innerHTML = `
      <!-- ================================================================ -->
      <!-- LIVE ACCOUNT STATUS HEADER (Styled exactly like MetaTrader/Deriv live phone terminal) -->
      <!-- ================================================================ -->
      <div class="card" style="background: linear-gradient(135deg, #090d16, #111827); border-color: #1e293b; color: #ffffff; padding: 18px 24px; margin-bottom: 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        
        <!-- Big Neon Live P&L -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 14px;">
          <div>
            <div style="font-size: 11px; font-family: var(--font-mono); color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">
              LIVE FLOATING P&L
            </div>
            <div id="live-total-pnl" style="font-size: 32px; font-weight: 800; font-family: var(--font-mono); color: ${isProfit ? '#38bdf8' : '#f43f5e'}; text-shadow: 0 0 20px ${isProfit ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.4)'};">
              ${isProfit ? '+' : ''}${totalLivePnl.toFixed(2)} USD
            </div>
          </div>

          <!-- Account Metrics Strip -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-family: var(--font-mono); font-size: 12px; text-align: right;">
            <div>
              <span style="color: #94a3b8; font-size: 10px; display: block;">BALANCE</span>
              <strong id="live-acc-balance" style="color: #f1f5f9; font-size: 14px;">$${this.account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px; display: block;">EQUITY</span>
              <strong id="live-acc-equity" style="color: #38bdf8; font-size: 14px;">$${this.account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px; display: block;">FREE MARGIN</span>
              <strong style="color: #f1f5f9; font-size: 14px;">$${this.account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px; display: block;">MARGIN LEVEL</span>
              <strong style="color: #10b981; font-size: 14px;">${this.account.marginLevel.toLocaleString('en-US', { minimumFractionDigits: 2 })}%</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94a3b8;">
          <span>Active Booked Slots: <strong id="live-slot-count" style="color: #ffffff;">${this.activeSlots.length}</strong></span>
          <span>Next Candle Close In: <strong id="live-countdown-timer" style="color: #f59e0b; font-family: var(--font-mono); font-size: 14px;">00:${this.timeRemaining < 10 ? '0' + this.timeRemaining : this.timeRemaining}s</strong></span>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- SLOT BOOKING & NEXT WICK PREDICTION WORKBENCH -->
      <!-- ================================================================ -->
      <div class="grid-2" style="margin-bottom: 16px;">
        
        <!-- 1. Next Candle Wick AI Predictive Analysis Card -->
        <div class="card" style="background: #ffffff; border-left: 4px solid var(--accent-blue);">
          <div class="card-header">
            <div class="card-title">
              <span>🔮 NEXT WICK CANDLE PREDICTION</span>
            </div>
            <span class="brand-tag" style="color: var(--accent-blue);">${prediction.probability}% PROBABILITY</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="stat-box" style="background: var(--bg-tertiary);">
              <span class="stat-box-label">ESTIMATED CANDLE RESULT</span>
              <span class="stat-box-value" style="color: var(--accent-blue); font-size: 15px;">${prediction.predictedDirection}</span>
              <span class="stat-box-sub">Based on live order flow & support rejection</span>
            </div>

            <div class="grid-2">
              <div class="stat-box">
                <span class="stat-box-label">PROJECTED UPPER WICK HIGH</span>
                <span class="stat-box-value" style="color: var(--gain-green);">$${prediction.expectedHigh}</span>
                <span class="stat-box-sub">Target Resistance</span>
              </div>
              <div class="stat-box">
                <span class="stat-box-label">PROJECTED LOWER WICK LOW</span>
                <span class="stat-box-value" style="color: var(--loss-red);">$${prediction.expectedLow}</span>
                <span class="stat-box-sub">Target Support</span>
              </div>
            </div>

            <div style="padding: 10px 14px; background: rgba(37, 99, 235, 0.08); border-radius: 6px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              <strong>🎯 Predictive Signal:</strong> ${prediction.recommendation}. Book a 30s or 1m candle slot below to trade this expected wick expansion.
            </div>
          </div>
        </div>

        <!-- 2. Slot Booking Order Form -->
        <div class="card" style="background: #ffffff;">
          <div class="card-header">
            <span class="card-title">⚡ BOOK CANDLE ANALYSIS SLOT</span>
            <span class="data-source-badge">INSTANT EXECUTION</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="grid-2">
              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">SELECT ASSET</label>
                <select id="slot-asset-select" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono); font-size: 12px; font-weight: 600;">
                  ${Object.keys(STOCK_DATABASE).map(sym => `
                    <option value="${sym}" ${sym === this.selectedAsset ? 'selected' : ''}>${sym} ($${STOCK_DATABASE[sym].price})</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">SLOT TIMEFRAME</label>
                <select id="slot-time-select" class="search-input-wrapper" style="width: 100%; color: var(--text-primary); background: var(--bg-tertiary); font-family: var(--font-mono); font-size: 12px; font-weight: 600;">
                  <option value="15">15 Seconds Wick Slot</option>
                  <option value="30" selected>30 Seconds Candle Slot</option>
                  <option value="60">1 Minute Full Bar Slot</option>
                </select>
              </div>
            </div>

            <!-- Current Price Info -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-tertiary); border-radius: 6px; font-family: var(--font-mono);">
              <span style="font-size: 12px; color: var(--text-muted);">CURRENT STRIKE PRICE:</span>
              <span style="font-size: 16px; font-weight: 800; color: var(--text-primary);">$${stock.price.toFixed(2)}</span>
            </div>

            <!-- Big Action Buttons (BUY GREEN / SELL RED) -->
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-success" id="btn-book-call" style="flex: 1; padding: 14px; font-size: 14px; font-weight: 800; font-family: var(--font-mono); display: flex; flex-direction: column; gap: 2px;">
                <span>CALL / BUY ↗</span>
                <small style="font-size: 10px; font-weight: 500; opacity: 0.9;">Expect Green Body / Upper Wick</small>
              </button>

              <button class="btn btn-danger" id="btn-book-put" style="flex: 1; padding: 14px; font-size: 14px; font-weight: 800; font-family: var(--font-mono); display: flex; flex-direction: column; gap: 2px;">
                <span>PUT / SELL ↘</span>
                <small style="font-size: 10px; font-weight: 500; opacity: 0.9;">Expect Red Body / Lower Wick</small>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ================================================================ -->
      <!-- LIVE ACTIVE SLOTS & POSITIONS STREAM (MetaTrader/Deriv List Format) -->
      <!-- ================================================================ -->
      <div class="card" style="background: #ffffff;">
        <div class="card-header">
          <div class="card-title">
            <span>📋 LIVE ACTIVE SLOTS & RUNNING RESULTS</span>
          </div>
          <span class="data-source-badge">REAL-TIME POSITION STREAM</span>
        </div>

        <div id="live-slots-list-container" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.updateActiveSlotsDOM();
  },

  updateLiveHeaderDOM() {
    const pnlEl = document.getElementById('live-total-pnl');
    const balEl = document.getElementById('live-acc-balance');
    const eqEl = document.getElementById('live-acc-equity');

    let totalLivePnl = 0;
    this.activeSlots.forEach(s => totalLivePnl += s.pnl);
    const isProfit = totalLivePnl >= 0;

    if (pnlEl) {
      pnlEl.innerText = `${isProfit ? '+' : ''}${totalLivePnl.toFixed(2)} USD`;
      pnlEl.style.color = isProfit ? '#38bdf8' : '#f43f5e';
    }
    if (balEl) balEl.innerText = `$${this.account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (eqEl) eqEl.innerText = `$${this.account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  },

  updateCountdownDOM() {
    const timerEl = document.getElementById('live-countdown-timer');
    if (timerEl) {
      timerEl.innerText = `00:${this.timeRemaining < 10 ? '0' + this.timeRemaining : this.timeRemaining}s`;
    }
  },

  updateActiveSlotsDOM() {
    const container = document.getElementById('live-slots-list-container');
    const countEl = document.getElementById('live-slot-count');
    if (!container) return;

    if (countEl) countEl.innerText = this.activeSlots.length;

    if (this.activeSlots.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 12.5px;">
          No active candle slots booked. Click <strong>CALL / BUY</strong> or <strong>PUT / SELL</strong> above to book a live candle prediction slot!
        </div>
      `;
      return;
    }

    // Render list styled matching Image 3 (Live phone MT/Deriv stream)
    container.innerHTML = this.activeSlots.map(slot => {
      const isWin = slot.pnl >= 0;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #0b0f19; border-radius: 8px; border-left: 4px solid ${isWin ? '#38bdf8' : '#f43f5e'}; color: #ffffff; font-family: var(--font-mono); box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
          
          <!-- Left: Asset & Strike -> Current -->
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <strong style="font-size: 14px; color: #f1f5f9;">${slot.asset}</strong>
              <span style="font-size: 11px; padding: 1px 6px; border-radius: 4px; background: ${slot.type === 'BUY' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(244, 63, 94, 0.2)'}; color: ${slot.type === 'BUY' ? '#38bdf8' : '#f43f5e'}; font-weight: 700;">
                ${slot.type} ${slot.lotSize}
              </span>
            </div>
            <div style="font-size: 12px; color: #94a3b8;">
              ${slot.entryPrice.toFixed(2)} ➔ <strong style="color: #ffffff;">${slot.currentPrice.toFixed(2)}</strong>
            </div>
          </div>

          <!-- Right: Live Real-Time P&L flashing -->
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: ${isWin ? '#38bdf8' : '#f43f5e'};">
              ${isWin ? '+' : ''}${slot.pnl.toFixed(2)}
            </div>
            <div style="font-size: 10.5px; color: #94a3b8;">
              ${slot.timeRemaining > 0 ? slot.timeRemaining + 's left' : 'Settling...'}
            </div>
          </div>

        </div>
      `;
    }).join('');
  },

  bindEvents(container) {
    const assetSelect = container.querySelector('#slot-asset-select');
    const timeSelect = container.querySelector('#slot-time-select');
    const btnCall = container.querySelector('#btn-book-call');
    const btnPut = container.querySelector('#btn-book-put');

    if (assetSelect) {
      assetSelect.addEventListener('change', () => {
        this.selectedAsset = assetSelect.value;
        this.render(container);
      });
    }

    if (timeSelect) {
      timeSelect.addEventListener('change', () => {
        this.selectedSlotTime = parseInt(timeSelect.value, 10);
        this.timeRemaining = this.selectedSlotTime;
      });
    }

    if (btnCall) {
      btnCall.addEventListener('click', () => this.bookSlot('BUY'));
    }

    if (btnPut) {
      btnPut.addEventListener('click', () => this.bookSlot('SELL'));
    }
  }
};
