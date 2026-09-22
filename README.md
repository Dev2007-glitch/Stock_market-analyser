# STOCKLAB — Advanced Stock Market Analyzer & Candle Simulation Workstation

![STOCKLAB Banner](https://img.shields.io/badge/STOCKLAB-Trading%20Workstation-059669?style=for-the-badge&logo=appveyor)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Frontend-HTML5%20%7C%20Vanilla%20CSS3%20%7C%20JavaScript%20ES6+-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)

**STOCKLAB** is an institutional-grade, responsive stock market analysis workstation, candlestick simulation engine, and interactive trading academy. Engineered with high-performance Vanilla JavaScript and HTML5 Canvas, it delivers real-time market simulations, wick predictions, algorithmic pattern detection, virtual paper trading, slot trading, and structured financial education without external framework bloat.

---

## 🚀 Key Features

### 1. 🕯️ Candlestick Simulator & Next Wick Prediction
- **Bar-by-Bar Replay**: Step forward, backward, or auto-play historical price action at adjustable simulation speeds (0.25x to 4x).
- **Sub-Candle Tick Engine**: Real-time tick animations simulating formation of intra-bar highs, lows, and wick expansions.
- **Predictive Wick Analysis**: Algorithmic probability calculation for next candle direction, body expansion, and upper/lower wick rejection based on order flow dynamics.
- **Pattern Recognition**: Instant automated detection of classic candlestick formations:
  - *Bullish Hammer / Pin Bar*
  - *Bearish Shooting Star*
  - *Bullish & Bearish Engulfing*
  - *Doji / Indecision*
  - *Morning & Evening Stars*

### 2. 🔬 Stock Analysis & Technical Charts
- **Interactive Canvas Engine**: High-frequency custom HTML5 Canvas rendering for candlesticks and volume histograms.
- **Technical Indicators**:
  - Exponential Moving Averages (EMA 9, EMA 21, EMA 50, EMA 200)
  - Relative Strength Index (RSI 14) with overbought/oversold bands
  - Moving Average Convergence Divergence (MACD 12, 26, 9)
  - Bollinger Bands (20, 2)
  - Average True Range (ATR) & Volatility Indices
- **Dynamic Support & Resistance**: Automated algorithmic pivot points and trend channel calculations.

### 3. ⏱️ Parallel Slot Trading Engine
- **Fixed-Time Interval Contracts**: 30-second, 1-minute, and 5-minute fast-paced slot execution.
- **Live Account Margin Management**: Real-time balance, equity, margin requirements, free margin, and margin level tracking.
- **P&L Real-Time Tick Evaluation**: Open positions updated per tick with profit/loss metrics and automated settlement upon countdown expiry.

### 4. 📈 Virtual Paper Trading Platform
- **Order Execution Simulator**: Supports Market, Limit, and Stop orders with configurable Stop-Loss (SL) and Take-Profit (TP).
- **Execution Log & Portfolio**: Track active positions, realized gains, historical win rates, and order fulfillment history.
- **Risk Calculation**: Pre-trade risk-to-reward ratio and position sizing calculator.

### 5. 🎓 Learn Academy & Interactive Quizzes
- **Structured Curriculum**: Progressive learning modules covering Beginner basics, Technical Analysis, Price Action, Candlestick Psychology, and Risk Management.
- **Interactive Knowledge Checks**: Multi-question quizzes with instant evaluation and progress persistence.
- **Pattern Cheat Sheets**: Reference cards with psychology explanations and trade setup criteria.

### 6. 🔍 Stock Screener & Market News
- **Multi-Parameter Filtering**: Screen equities by sector, market cap, RSI levels, price change, and technical volume spikes.
- **News Aggregator & Sentiment Analysis**: Real-time sentiment tagging (Bullish, Bearish, Neutral) on curated equity news feeds.

### 7. 📓 Trade Journal & Performance Analytics
- **Psychological Logging**: Tag emotions (Disciplined, FOMO, Revenge, Confident) alongside entry/exit reasons.
- **Win-Rate Breakdown**: Analyze trade profitability, average R:R, and common psychological pitfalls.

---

## 🛠️ Project Architecture & Structure

```
stock_market/
├── index.html                 # Master HTML container & navigation layout
├── README.md                  # Comprehensive project documentation
├── css/
│   ├── main.css               # Core styling, variables, dark mode theme & components
│   ├── charts.css             # Chart layouts, canvases, overlays & indicators styling
│   ├── terminal.css           # Command line shortcuts & terminal HUD styling
│   └── responsive.css         # Mobile & tablet media query breakpoints
└── js/
    ├── app.js                 # Application bootstrapper and master event binder
    ├── state.js               # Reactive centralized state management
    ├── storage.js             # LocalStorage abstraction layer for persistence
    ├── router.js              # Single-page application view routing engine
    ├── ui.js                  # Modals, toasts, dropdowns, and UI helpers
    ├── charts.js              # HTML5 Canvas chart renderer & technical overlays
    ├── candleSimulator.js     # Bar-by-bar market replay & next wick prediction
    ├── slotTrading.js         # Short-duration slot booking engine
    ├── paperTrading.js        # Paper portfolio, order management & execution
    ├── trendAnalysis.js       # S/R levels, trendline detection, channel computations
    ├── indicators.js          # RSI, MACD, EMA, Bollinger calculations
    ├── calculations.js        # Financial formulas, PnL, risk-reward & Black-Scholes
    ├── dataProvider.js        # Data dispatch, quote retrieval & mock API feeds
    ├── demoData.js            # Pre-seeded tickers (AAPL, NVDA, TSLA, MSFT, etc.)
    ├── learning.js            # Curriculum modules, quizzes & reference material
    ├── screener.js            # Stock screening and filtering engine
    ├── news.js                # Market news feed and sentiment classifier
    ├── journal.js             # Trade journaling & behavioral analytics
    ├── portfolio.js           # Portfolio balance & asset allocation metrics
    └── commandParser.js       # Fast keyboard shortcuts and terminal commands
```

---

## 💻 Getting Started Locally

### Prerequisites
- Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- (Optional) A local static file server like Python `http.server`, Node `serve`, or VS Code Live Server.

### Running with Python
```bash
# Clone the repository
git clone https://github.com/Dev2007-glitch/Stock_market-analyser.git
cd Stock_market-analyser

# Start local server
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Running with Node.js
```bash
npx serve .
```

---

## ⌨️ Global Keyboard Shortcuts & Terminal Commands

| Shortcut / Command | Action |
| :--- | :--- |
| `Ctrl + K` or `/` | Open Global Search Bar |
| `Space` | Play / Pause Candlestick Simulator Replay |
| `Right Arrow (→)` | Step forward 1 candle |
| `Left Arrow (←)` | Step backward 1 candle |
| `Alt + 1` | Switch to Candle Simulator & Slots View |
| `Alt + 2` | Switch to Stock Analysis View |
| `Alt + 3` | Switch to Paper Trading View |
| `Alt + 4` | Switch to Learn Academy View |

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
