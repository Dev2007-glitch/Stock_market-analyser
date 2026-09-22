/**
 * STOCKLAB - Dedicated Trend Analysis & Market Regime Engine
 * Detects trend direction, trend strength, dynamic support & resistance pivots,
 * linear regression channels, and generates plain-English trend explanations.
 */

const TrendAnalysisEngine = {
  /**
   * Analyzes the complete price trend from historical OHLCV data
   * @param {Array<{date: string, open: number, high: number, low: number, close: number, volume: number}>} candles
   * @returns {Object} Full trend analysis report
   */
  analyzeTrend(candles) {
    if (!candles || candles.length < 20) {
      return {
        direction: 'INSUFFICIENT DATA',
        strength: 50,
        regime: 'NEUTRAL',
        statusColor: '#64748b',
        supportLevels: [],
        resistanceLevels: [],
        summary: 'Not enough data to calculate trend.',
        actionableTakeaway: 'Wait for more price history.'
      };
    }

    const closes = candles.map(c => c.close);
    const n = closes.length;
    const latestPrice = closes[n - 1];

    // 1. Calculate Moving Averages (20, 50, 200)
    const sma20 = TechnicalIndicators.calculateSMA(closes, 20);
    const sma50 = TechnicalIndicators.calculateSMA(closes, Math.min(50, n));
    const sma200 = TechnicalIndicators.calculateSMA(closes, Math.min(200, n));

    const latestSma20 = sma20[n - 1] || latestPrice;
    const latestSma50 = sma50[n - 1] || latestPrice;
    const latestSma200 = sma200[n - 1] || latestPrice;

    // 2. Linear Regression Slope (Trend Line)
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const lookback = Math.min(50, n);
    const startIdx = n - lookback;

    for (let i = 0; i < lookback; i++) {
      const x = i;
      const y = closes[startIdx + i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const slope = (lookback * sumXY - sumX * sumY) / (lookback * sumXX - sumX * sumX);
    const slopePercentPerBar = (slope / closes[startIdx]) * 100;

    // 3. Find Pivot Highs and Pivot Lows (Support & Resistance)
    const pivotHighs = [];
    const pivotLows = [];

    for (let i = 5; i < n - 5; i++) {
      const currentHigh = candles[i].high;
      const currentLow = candles[i].low;

      let isHigh = true;
      let isLow = true;

      for (let j = i - 5; j <= i + 5; j++) {
        if (j === i) continue;
        if (candles[j].high > currentHigh) isHigh = false;
        if (candles[j].low < currentLow) isLow = false;
      }

      if (isHigh) pivotHighs.push({ price: currentHigh, date: candles[i].date, index: i });
      if (isLow) pivotLows.push({ price: currentLow, date: candles[i].date, index: i });
    }

    // Sort Support (below current price) and Resistance (above current price)
    const supportLevels = pivotLows
      .map(p => p.price)
      .filter(p => p < latestPrice)
      .sort((a, b) => b - a)
      .slice(0, 3);

    const resistanceLevels = pivotHighs
      .map(p => p.price)
      .filter(p => p > latestPrice)
      .sort((a, b) => a - b)
      .slice(0, 3);

    // Primary Support & Resistance fallbacks
    const primarySupport = supportLevels.length > 0 ? supportLevels[0] : (latestPrice * 0.95);
    const primaryResistance = resistanceLevels.length > 0 ? resistanceLevels[0] : (latestPrice * 1.05);

    // 4. Determine Overall Trend Direction & Strength
    let direction = 'CONSOLIDATION / SIDEWAYS';
    let strengthScore = 50; // 0 to 100
    let statusColor = '#f59e0b';
    let regime = 'SIDEWAYS';

    const isAboveSma50 = latestPrice > latestSma50;
    const isAboveSma200 = latestPrice > latestSma200;
    const isSma50Above200 = latestSma50 > latestSma200;

    if (slopePercentPerBar > 0.15 && isAboveSma50 && isAboveSma200) {
      direction = 'STRONG UPTREND ↗';
      strengthScore = Math.min(95, Math.round(75 + slopePercentPerBar * 20));
      statusColor = '#10b981';
      regime = 'BULLISH';
    } else if (slopePercentPerBar > 0.05 && isAboveSma50) {
      direction = 'MODERATE UPTREND ↗';
      strengthScore = Math.min(75, Math.round(60 + slopePercentPerBar * 20));
      statusColor = '#10b981';
      regime = 'MILDLY BULLISH';
    } else if (slopePercentPerBar < -0.15 && !isAboveSma50 && !isAboveSma200) {
      direction = 'STRONG DOWNTREND ↘';
      strengthScore = Math.min(95, Math.round(75 + Math.abs(slopePercentPerBar) * 20));
      statusColor = '#f43f5e';
      regime = 'BEARISH';
    } else if (slopePercentPerBar < -0.05 && !isAboveSma50) {
      direction = 'MODERATE DOWNTREND ↘';
      strengthScore = Math.min(75, Math.round(60 + Math.abs(slopePercentPerBar) * 20));
      statusColor = '#f43f5e';
      regime = 'MILDLY BEARISH';
    } else {
      direction = 'CONSOLIDATION / RANGE-BOUND ↔';
      strengthScore = 40;
      statusColor = '#3b82f6';
      regime = 'NEUTRAL / RANGE';
    }

    // 5. Plain English Interpretations
    let explanation = '';
    let actionableTakeaway = '';

    if (regime === 'BULLISH' || regime === 'MILDLY BULLISH') {
      explanation = `The stock is making consistently higher highs and trading comfortably above both its 50-day ($${latestSma50.toFixed(2)}) and 200-day ($${latestSma200.toFixed(2)}) moving averages. This indicates ongoing institutional accumulation.`;
      actionableTakeaway = `Trend-followers look for pullbacks toward key support ($${primarySupport.toFixed(2)}) or moving averages rather than chasing extended breakouts.`;
    } else if (regime === 'BEARISH' || regime === 'MILDLY BEARISH') {
      explanation = `The stock is making lower highs and trading below key moving averages (50 SMA: $${latestSma50.toFixed(2)}). Sellers are currently in control of price momentum.`;
      actionableTakeaway = `Disciplined investors avoid "catching a falling knife" until the price can decisively reclaim resistance ($${primaryResistance.toFixed(2)}) and form a stable base.`;
    } else {
      explanation = `The price is oscillating in a horizontal channel between support at $${primarySupport.toFixed(2)} and resistance at $${primaryResistance.toFixed(2)} without a clear directional bias.`;
      actionableTakeaway = `Range traders watch for an eventual decisive breakout above $${primaryResistance.toFixed(2)} or breakdown below $${primarySupport.toFixed(2)} with expanding volume.`;
    }

    // Golden Cross / Death Cross Check
    const goldenCross = isSma50Above200 ? 'Golden Cross Active (Bullish Long-Term)' : 'Death Cross / Bearish Regime';

    return {
      direction,
      strengthScore,
      statusColor,
      regime,
      slopePercentPerBar: slopePercentPerBar.toFixed(2),
      latestPrice,
      primarySupport: primarySupport.toFixed(2),
      primaryResistance: primaryResistance.toFixed(2),
      supportLevels: supportLevels.map(s => s.toFixed(2)),
      resistanceLevels: resistanceLevels.map(r => r.toFixed(2)),
      latestSma50: latestSma50.toFixed(2),
      latestSma200: latestSma200.toFixed(2),
      goldenCross,
      explanation,
      actionableTakeaway
    };
  }
};
