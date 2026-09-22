/**
 * STOCKLAB - Core Financial Analytics & Quality Score Engine
 * Computes portfolio metrics, concentration, risk heuristics, and the Analytical Snapshot Score.
 */

const FinancialCalculations = {
  /**
   * Calculates Daily Returns from Close price array
   */
  calculateDailyReturns(closes) {
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    return returns;
  },

  /**
   * Calculates Historical Annualized Volatility
   * Standard deviation of daily log returns * sqrt(252 trading days)
   */
  calculateVolatility(closes) {
    if (closes.length < 10) return 0;
    const dailyReturns = this.calculateDailyReturns(closes);
    const mean = dailyReturns.reduce((acc, val) => acc + val, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (dailyReturns.length - 1);
    const dailyStdDev = Math.sqrt(variance);
    const annualizedVol = dailyStdDev * Math.sqrt(252);
    return parseFloat((annualizedVol * 100).toFixed(2));
  },

  /**
   * Calculates Portfolio Total Value, Cost Basis, Today's P/L, Total P/L, and Allocations
   */
  calculatePortfolioStats(positions, stockDatabase) {
    let totalValue = 0;
    let totalCost = 0;
    let todayPnl = 0;
    const processedPositions = [];

    positions.forEach(pos => {
      const stock = stockDatabase[pos.symbol.toUpperCase()];
      if (!stock) return;

      const currentPrice = stock.price;
      const positionValue = pos.shares * currentPrice;
      const positionCost = pos.shares * pos.avgPrice;
      const unrealizedPnl = positionValue - positionCost;
      const unrealizedPnlPercent = positionCost > 0 ? (unrealizedPnl / positionCost) * 100 : 0;
      const dayChange = (stock.change || 0) * pos.shares;

      totalValue += positionValue;
      totalCost += positionCost;
      todayPnl += dayChange;

      processedPositions.push({
        ...pos,
        currentPrice,
        positionValue,
        positionCost,
        unrealizedPnl,
        unrealizedPnlPercent,
        dayChange,
        currency: stock.currency || 'USD'
      });
    });

    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const todayPnlPercent = totalValue > 0 ? (todayPnl / totalValue) * 100 : 0;

    // Calculate allocations
    processedPositions.forEach(p => {
      p.allocation = totalValue > 0 ? parseFloat(((p.positionValue / totalValue) * 100).toFixed(1)) : 0;
    });

    // Sort by largest allocation
    processedPositions.sort((a, b) => b.allocation - a.allocation);

    const largestPosition = processedPositions.length > 0 ? processedPositions[0] : null;
    let bestPerformer = null;
    let worstPerformer = null;

    if (processedPositions.length > 0) {
      const sortedByPnl = [...processedPositions].sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent);
      bestPerformer = sortedByPnl[0];
      worstPerformer = sortedByPnl[sortedByPnl.length - 1];
    }

    // Concentration Risk Check
    const hasConcentrationRisk = largestPosition && largestPosition.allocation >= 40.0;

    return {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercent,
      todayPnl,
      todayPnlPercent,
      positions: processedPositions,
      largestPosition,
      bestPerformer,
      worstPerformer,
      hasConcentrationRisk
    };
  },

  /**
   * Generates STOCKLAB ANALYTICAL SNAPSHOT Quality Score (0-100)
   * Broken down into: Growth, Profitability, Financial Health, Valuation, and Momentum.
   */
  calculateQualityScore(stock) {
    if (!stock) return null;

    // 1. Growth Score (0 - 100)
    let growthScore = 50;
    if (stock.revenueGrowth > 20) growthScore += 25;
    else if (stock.revenueGrowth > 10) growthScore += 15;
    else if (stock.revenueGrowth < 0) growthScore -= 20;

    if (stock.epsGrowth > 25) growthScore += 25;
    else if (stock.epsGrowth > 10) growthScore += 15;
    else if (stock.epsGrowth < 0) growthScore -= 20;
    growthScore = Math.min(99, Math.max(15, growthScore));

    // 2. Profitability Score (0 - 100)
    let profitScore = 50;
    if (stock.grossMargin > 60) profitScore += 15;
    else if (stock.grossMargin < 20) profitScore -= 10;

    if (stock.netMargin > 25) profitScore += 20;
    else if (stock.netMargin > 15) profitScore += 10;
    else if (stock.netMargin < 5) profitScore -= 20;

    if (stock.roe > 25) profitScore += 15;
    else if (stock.roe < 10) profitScore -= 10;
    profitScore = Math.min(99, Math.max(15, profitScore));

    // 3. Financial Health Score (0 - 100)
    let healthScore = 50;
    if (stock.debtToEquity < 0.5) healthScore += 25;
    else if (stock.debtToEquity < 1.0) healthScore += 10;
    else if (stock.debtToEquity > 2.5) healthScore -= 25;

    if (stock.cash > stock.debt) healthScore += 20;
    else healthScore -= 10;
    healthScore = Math.min(99, Math.max(15, healthScore));

    // 4. Valuation Score (0 - 100) - Higher score = more attractive / reasonable valuation
    let valScore = 50;
    if (stock.pe < 20 && stock.pe > 0) valScore += 25;
    else if (stock.pe < 30) valScore += 10;
    else if (stock.pe > 60) valScore -= 25;

    if (stock.ps < 5) valScore += 15;
    else if (stock.ps > 20) valScore -= 20;
    valScore = Math.min(99, Math.max(15, valScore));

    // 5. Momentum Score (0 - 100)
    let momentumScore = 50;
    const closes = (stock.historicalData || []).map(d => d.close);
    if (closes.length >= 50) {
      const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
      const latestPrice = stock.price;
      if (latestPrice > sma50) momentumScore += 20;
      else momentumScore -= 15;

      if (stock.changePercent > 0) momentumScore += 15;
      else momentumScore -= 10;
    }
    momentumScore = Math.min(99, Math.max(15, momentumScore));

    // Composite Weighted Score
    const overall = Math.round(
      growthScore * 0.25 +
      profitScore * 0.25 +
      healthScore * 0.20 +
      valScore * 0.15 +
      momentumScore * 0.15
    );

    return {
      overall,
      growth: Math.round(growthScore),
      profitability: Math.round(profitScore),
      health: Math.round(healthScore),
      valuation: Math.round(valScore),
      momentum: Math.round(momentumScore)
    };
  }
};
