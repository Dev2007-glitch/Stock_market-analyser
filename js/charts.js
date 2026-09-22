/**
 * STOCKLAB - High-Precision Canvas Charting Engine (Light Theme & Trend Channels)
 * Supports Candlesticks, Volume bars, SMA/EMA overlays, Trend Channels, and RSI/MACD sub-panes.
 */

class StockChartEngine {
  constructor(canvasElement, inspectContainer) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.inspectContainer = inspectContainer;

    this.candles = [];
    this.activeIndicators = ['sma20', 'sma50', 'rsi', 'trend'];
    this.hoverIndex = null;
    this.mouseX = null;
    this.mouseY = null;

    // Friendly Light Theme Colors
    this.colors = {
      bg: '#ffffff',
      grid: '#f1f5f9',
      border: '#e2e8f0',
      text: '#64748b',
      textBright: '#0f172a',
      gain: '#059669',
      loss: '#e11d48',
      crosshair: '#2563eb',
      sma20: '#0284c7',
      sma50: '#d97706',
      sma200: '#7c3aed',
      ema20: '#db2777',
      trendSupport: '#059669',
      trendResistance: '#e11d48',
      trendLine: '#2563eb',
      rsiLine: '#059669',
      macdLine: '#0284c7',
      macdSignal: '#d97706',
      macdHistGain: '#059669',
      macdHistLoss: '#e11d48'
    };

    this.setupListeners();
  }

  setupListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    window.addEventListener('resize', () => this.resizeAndDraw());
  }

  setData(candles, activeIndicators = null) {
    this.candles = candles || [];
    if (activeIndicators) {
      this.activeIndicators = activeIndicators;
    }
    this.resizeAndDraw();
    this.updateInspectBar(this.candles.length - 1);
  }

  onMouseMove(e) {
    if (!this.candles.length) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    const width = this.canvas.clientWidth;
    const paddingLeft = 14;
    const paddingRight = 65;
    const chartWidth = width - paddingLeft - paddingRight;
    const candleWidth = chartWidth / this.candles.length;

    const index = Math.floor((this.mouseX - paddingLeft) / candleWidth);
    if (index >= 0 && index < this.candles.length) {
      this.hoverIndex = index;
      this.updateInspectBar(index);
    } else {
      this.hoverIndex = null;
    }
    this.draw();
  }

  onMouseLeave() {
    this.hoverIndex = null;
    this.mouseX = null;
    this.mouseY = null;
    this.draw();
    this.updateInspectBar(this.candles.length - 1);
  }

  updateInspectBar(index) {
    if (!this.inspectContainer || !this.candles[index]) return;
    const candle = this.candles[index];
    const prevCandle = index > 0 ? this.candles[index - 1] : candle;
    const change = candle.close - prevCandle.close;
    const changePct = prevCandle.close > 0 ? (change / prevCandle.close) * 100 : 0;
    const isGain = change >= 0;

    this.inspectContainer.innerHTML = `
      <div class="inspect-metric"><span class="inspect-label">DATE:</span> <span class="inspect-val">${candle.date}</span></div>
      <div class="inspect-metric"><span class="inspect-label">O:</span> <span class="inspect-val">${candle.open.toFixed(2)}</span></div>
      <div class="inspect-metric"><span class="inspect-label">H:</span> <span class="inspect-val">${candle.high.toFixed(2)}</span></div>
      <div class="inspect-metric"><span class="inspect-label">L:</span> <span class="inspect-val">${candle.low.toFixed(2)}</span></div>
      <div class="inspect-metric"><span class="inspect-label">C:</span> <span class="inspect-val ${isGain ? 'gain' : 'loss'}">${candle.close.toFixed(2)}</span></div>
      <div class="inspect-metric"><span class="inspect-label">CHG:</span> <span class="inspect-val ${isGain ? 'gain' : 'loss'}">${isGain ? '+' : ''}${change.toFixed(2)} (${isGain ? '+' : ''}${changePct.toFixed(2)}%)</span></div>
      <div class="inspect-metric"><span class="inspect-label">VOL:</span> <span class="inspect-val">${(candle.volume / 1000000).toFixed(2)}M</span></div>
    `;
  }

  resizeAndDraw() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height) || 380;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.scale(dpr, dpr);
    this.draw();
  }

  draw() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    if (!this.candles || this.candles.length === 0) {
      ctx.fillStyle = this.colors.text;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('NO PRICE DATA AVAILABLE', width / 2, height / 2);
      return;
    }

    const paddingLeft = 14;
    const paddingRight = 65;
    const paddingTop = 20;
    const paddingBottom = 26;

    const hasRsi = this.activeIndicators.includes('rsi');
    const hasMacd = this.activeIndicators.includes('macd');

    let subPaneCount = 0;
    if (hasRsi) subPaneCount++;
    if (hasMacd) subPaneCount++;

    const subPaneHeight = subPaneCount > 0 ? Math.min(75, Math.floor(height * 0.22)) : 0;
    const totalSubPanesHeight = subPaneCount * subPaneHeight;

    const mainChartBottom = height - paddingBottom - totalSubPanesHeight;
    const mainChartHeight = mainChartBottom - paddingTop;
    const chartWidth = width - paddingLeft - paddingRight;
    const candleWidth = chartWidth / this.candles.length;

    // 1. Min / Max Price in range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    this.candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceRange = (maxPrice - minPrice) || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const adjustedRange = maxPrice - minPrice;

    const getY = (price) => mainChartBottom - ((price - minPrice) / adjustedRange) * mainChartHeight;
    const getX = (index) => paddingLeft + index * candleWidth + candleWidth / 2;

    // 2. Draw Soft Background & Grid Lines
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;

    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const p = minPrice + (adjustedRange / priceSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = this.colors.text;
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(2), width - paddingRight + 8, y + 3);
    }

    // 3. Draw Volume in lower 20% of main chart
    const volHeight = mainChartHeight * 0.22;
    this.candles.forEach((c, i) => {
      const x = paddingLeft + i * candleWidth;
      const vH = (c.volume / maxVolume) * volHeight;
      const y = mainChartBottom - vH;
      const isGain = c.close >= c.open;

      ctx.fillStyle = isGain ? 'rgba(5, 150, 105, 0.20)' : 'rgba(225, 29, 72, 0.20)';
      ctx.fillRect(x + 1, y, Math.max(1, candleWidth - 2), vH);
    });

    // 4. Draw Candlesticks
    this.candles.forEach((c, i) => {
      const cx = getX(i);
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);
      const isGain = c.close >= c.open;
      const color = isGain ? this.colors.gain : this.colors.loss;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, highY);
      ctx.lineTo(cx, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      const bodyWidth = Math.max(2, candleWidth * 0.7);

      ctx.fillStyle = color;
      ctx.fillRect(cx - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });

    // 5. Draw Trend Analysis Channel & Pivot Levels (if trend enabled)
    if (this.activeIndicators.includes('trend')) {
      const trendData = TrendAnalysisEngine.analyzeTrend(this.candles);

      // Draw Support Level Line
      if (trendData.primarySupport) {
        const supY = getY(parseFloat(trendData.primarySupport));
        if (supY >= paddingTop && supY <= mainChartBottom) {
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.6)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(paddingLeft, supY);
          ctx.lineTo(width - paddingRight, supY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#059669';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`SUPP: $${trendData.primarySupport}`, paddingLeft + 4, supY - 3);
        }
      }

      // Draw Resistance Level Line
      if (trendData.primaryResistance) {
        const resY = getY(parseFloat(trendData.primaryResistance));
        if (resY >= paddingTop && resY <= mainChartBottom) {
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(paddingLeft, resY);
          ctx.lineTo(width - paddingRight, resY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#e11d48';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`RES: $${trendData.primaryResistance}`, paddingLeft + 4, resY - 3);
        }
      }
    }

    // 6. Draw Moving Average Overlays (SMA 20, 50, 200, EMA 20)
    const closes = this.candles.map(c => c.close);

    const drawLineIndicator = (values, color, lineWidth = 1.6) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      let started = false;

      values.forEach((v, idx) => {
        if (v !== null) {
          const x = getX(idx);
          const y = getY(v);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    if (this.activeIndicators.includes('sma20')) {
      const sma20 = TechnicalIndicators.calculateSMA(closes, 20);
      drawLineIndicator(sma20, this.colors.sma20);
    }
    if (this.activeIndicators.includes('sma50')) {
      const sma50 = TechnicalIndicators.calculateSMA(closes, 50);
      drawLineIndicator(sma50, this.colors.sma50);
    }
    if (this.activeIndicators.includes('sma200')) {
      const sma200 = TechnicalIndicators.calculateSMA(closes, 200);
      drawLineIndicator(sma200, this.colors.sma200);
    }
    if (this.activeIndicators.includes('ema20')) {
      const ema20 = TechnicalIndicators.calculateEMA(closes, 20);
      drawLineIndicator(ema20, this.colors.ema20);
    }

    // 7. Draw Sub-Panes (RSI / MACD)
    let currentSubPaneTop = mainChartBottom;

    if (hasRsi) {
      currentSubPaneTop += 6;
      this.drawRsiPane(currentSubPaneTop, subPaneHeight - 10, paddingLeft, paddingRight, width, closes);
      currentSubPaneTop += subPaneHeight;
    }

    if (hasMacd) {
      currentSubPaneTop += 6;
      this.drawMacdPane(currentSubPaneTop, subPaneHeight - 10, paddingLeft, paddingRight, width, closes);
    }

    // 8. Draw Crosshair & Hover Highlights
    if (this.hoverIndex !== null && this.mouseX !== null && this.mouseY !== null) {
      const hX = getX(this.hoverIndex);

      // Vertical line
      ctx.strokeStyle = this.colors.crosshair;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hX, paddingTop);
      ctx.lineTo(hX, height - paddingBottom);
      ctx.stroke();

      // Horizontal line in main chart
      if (this.mouseY >= paddingTop && this.mouseY <= mainChartBottom) {
        ctx.beginPath();
        ctx.moveTo(paddingLeft, this.mouseY);
        ctx.lineTo(width - paddingRight, this.mouseY);
        ctx.stroke();

        // Price bubble on Y axis
        const hoverPrice = minPrice + ((mainChartBottom - this.mouseY) / mainChartHeight) * adjustedRange;
        ctx.fillStyle = this.colors.crosshair;
        ctx.fillRect(width - paddingRight + 2, this.mouseY - 9, 60, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(hoverPrice.toFixed(2), width - paddingRight + 8, this.mouseY + 4);
      }
      ctx.setLineDash([]);
    }
  }

  drawRsiPane(top, height, padL, padR, width, closes) {
    const ctx = this.ctx;
    const rsiValues = TechnicalIndicators.calculateRSI(closes, 14);
    const chartW = width - padL - padR;
    const candleW = chartW / this.candles.length;

    ctx.strokeStyle = this.colors.border;
    ctx.strokeRect(padL, top, chartW, height);

    const getY = (val) => top + height - (val / 100) * height;

    // 70 & 30 Lines
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padL, getY(70));
    ctx.lineTo(width - padR, getY(70));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
    ctx.beginPath();
    ctx.moveTo(padL, getY(30));
    ctx.lineTo(width - padR, getY(30));
    ctx.stroke();
    ctx.setLineDash([]);

    // RSI Label
    ctx.fillStyle = this.colors.text;
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('RSI (14)', padL + 4, top + 10);
    ctx.fillText('70', width - padR + 6, getY(70) + 3);
    ctx.fillText('30', width - padR + 6, getY(30) + 3);

    // Draw RSI Line
    ctx.strokeStyle = this.colors.rsiLine;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;

    rsiValues.forEach((v, idx) => {
      if (v !== null) {
        const x = padL + idx * candleW + candleW / 2;
        const y = getY(v);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.stroke();
  }

  drawMacdPane(top, height, padL, padR, width, closes) {
    const ctx = this.ctx;
    const { macdLine, signalLine, histogram } = TechnicalIndicators.calculateMACD(closes, 12, 26, 9);
    const chartW = width - padL - padR;
    const candleW = chartW / this.candles.length;

    ctx.strokeStyle = this.colors.border;
    ctx.strokeRect(padL, top, chartW, height);

    let maxVal = 1;
    histogram.forEach(h => {
      if (h !== null && Math.abs(h) > maxVal) maxVal = Math.abs(h);
    });

    const zeroY = top + height / 2;
    const getY = (val) => zeroY - (val / (maxVal * 1.5)) * (height / 2);

    // Zero Line
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.beginPath();
    ctx.moveTo(padL, zeroY);
    ctx.lineTo(width - padR, zeroY);
    ctx.stroke();

    ctx.fillStyle = this.colors.text;
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('MACD (12, 26, 9)', padL + 4, top + 10);

    // Draw Histogram Bars
    histogram.forEach((h, idx) => {
      if (h !== null) {
        const x = padL + idx * candleW;
        const y = getY(h);
        const barH = Math.abs(y - zeroY);
        ctx.fillStyle = h >= 0 ? this.colors.macdHistGain : this.colors.macdHistLoss;
        ctx.fillRect(x + 1, Math.min(y, zeroY), Math.max(1, candleW - 2), Math.max(1, barH));
      }
    });

    // Draw MACD Line
    ctx.strokeStyle = this.colors.macdLine;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    let started = false;
    macdLine.forEach((v, idx) => {
      if (v !== null) {
        const x = padL + idx * candleW + candleW / 2;
        const y = getY(v);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Draw Signal Line
    ctx.strokeStyle = this.colors.macdSignal;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    started = false;
    signalLine.forEach((v, idx) => {
      if (v !== null) {
        const x = padL + idx * candleW + candleW / 2;
        const y = getY(v);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();
  }
}
