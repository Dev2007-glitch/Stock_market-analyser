/**
 * STOCKLAB - Technical Indicator Calculation Engine
 * Computes SMA, EMA, RSI, MACD, and ATR from raw OHLCV price series.
 */

const TechnicalIndicators = {
  /**
   * Simple Moving Average (SMA)
   * @param {Array<number>} values Array of price points (typically close)
   * @param {number} period Window size (e.g. 20, 50, 200)
   * @returns {Array<number|null>} Array matching length of values with SMA or null before window
   */
  calculateSMA(values, period) {
    const result = new Array(values.length).fill(null);
    if (values.length < period) return result;

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += values[i];
    }
    result[period - 1] = parseFloat((sum / period).toFixed(2));

    for (let i = period; i < values.length; i++) {
      sum += values[i] - values[i - period];
      result[i] = parseFloat((sum / period).toFixed(2));
    }
    return result;
  },

  /**
   * Exponential Moving Average (EMA)
   * @param {Array<number>} values Array of price points
   * @param {number} period Window size (e.g. 20)
   * @returns {Array<number|null>} Array of EMA values
   */
  calculateEMA(values, period) {
    const result = new Array(values.length).fill(null);
    if (values.length < period) return result;

    // Start with SMA for first EMA seed point
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += values[i];
    }
    let prevEMA = sum / period;
    result[period - 1] = parseFloat(prevEMA.toFixed(2));

    const multiplier = 2 / (period + 1);

    for (let i = period; i < values.length; i++) {
      const currentEMA = (values[i] - prevEMA) * multiplier + prevEMA;
      result[i] = parseFloat(currentEMA.toFixed(2));
      prevEMA = currentEMA;
    }
    return result;
  },

  /**
   * Relative Strength Index (RSI - Wilder's Smoothing)
   * @param {Array<number>} values Array of close prices
   * @param {number} period Lookback window (standard 14)
   * @returns {Array<number|null>} RSI values (0 - 100)
   */
  calculateRSI(values, period = 14) {
    const result = new Array(values.length).fill(null);
    if (values.length <= period) return result;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    if (avgLoss === 0) {
      result[period] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[period] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
    }

    for (let i = period + 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      // Wilder's Exponential Smoothing
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        result[i] = 100;
      } else {
        const rs = avgGain / avgLoss;
        result[i] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
      }
    }
    return result;
  },

  /**
   * Moving Average Convergence Divergence (MACD)
   * @param {Array<number>} values Close prices
   * @param {number} fastPeriod Fast EMA (default 12)
   * @param {number} slowPeriod Slow EMA (default 26)
   * @param {number} signalPeriod Signal line EMA (default 9)
   * @returns {{ macdLine: Array<number|null>, signalLine: Array<number|null>, histogram: Array<number|null> }}
   */
  calculateMACD(values, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(values, fastPeriod);
    const slowEMA = this.calculateEMA(values, slowPeriod);

    const macdLine = new Array(values.length).fill(null);
    for (let i = 0; i < values.length; i++) {
      if (fastEMA[i] !== null && slowEMA[i] !== null) {
        macdLine[i] = parseFloat((fastEMA[i] - slowEMA[i]).toFixed(2));
      }
    }

    // Calculate signal line as EMA of MACD Line (ignoring nulls)
    const validMacdValues = [];
    const validIndices = [];
    for (let i = 0; i < macdLine.length; i++) {
      if (macdLine[i] !== null) {
        validMacdValues.push(macdLine[i]);
        validIndices.push(i);
      }
    }

    const rawSignal = this.calculateEMA(validMacdValues, signalPeriod);
    const signalLine = new Array(values.length).fill(null);
    const histogram = new Array(values.length).fill(null);

    for (let j = 0; j < validIndices.length; j++) {
      const origIndex = validIndices[j];
      signalLine[origIndex] = rawSignal[j];
      if (macdLine[origIndex] !== null && signalLine[origIndex] !== null) {
        histogram[origIndex] = parseFloat((macdLine[origIndex] - signalLine[origIndex]).toFixed(2));
      }
    }

    return { macdLine, signalLine, histogram };
  },

  /**
   * Average True Range (ATR)
   * @param {Array<{high: number, low: number, close: number}>} candles
   * @param {number} period Lookback window (default 14)
   * @returns {Array<number|null>}
   */
  calculateATR(candles, period = 14) {
    const result = new Array(candles.length).fill(null);
    if (candles.length <= period) return result;

    const tr = [candles[0].high - candles[0].low];
    for (let i = 1; i < candles.length; i++) {
      const h = candles[i].high;
      const l = candles[i].low;
      const prevC = candles[i - 1].close;
      const trueRange = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      tr.push(trueRange);
    }

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += tr[i];
    }
    result[period - 1] = parseFloat((sum / period).toFixed(2));

    for (let i = period; i < candles.length; i++) {
      const currentATR = (result[i - 1] * (period - 1) + tr[i]) / period;
      result[i] = parseFloat(currentATR.toFixed(2));
    }
    return result;
  }
};
