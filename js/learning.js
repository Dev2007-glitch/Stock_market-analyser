/**
 * STOCKLAB - Educational Curriculum & Financial Glossary Engine
 * 24 interactive modules with mini-quizzes, visual diagrams, and an "Explain This" contextual dictionary.
 */

const CURRICULUM_MODULES = [
  {
    id: 1,
    title: 'What is a Stock?',
    category: 'Foundations',
    level: 'Beginner',
    summary: 'A stock represents fractional ownership in a real-world operating business.',
    content: `
      <p>When you buy a share of stock, you are purchasing a fractional piece of ownership in that corporation. If a company has 1,000,000 shares outstanding and you own 10,000 shares, you own 1% of the entire company.</p>
      <div class="interactive-diagram card" style="margin: 12px 0; background: #0d1117;">
        <div style="display:flex; justify-content:space-around; align-items:center; text-align:center; padding: 10px;">
          <div>🏢 <strong>Company</strong><br><small>Generates goods/services</small></div>
          <div>➔</div>
          <div>📑 <strong>Shares</strong><br><small>Units of equity</small></div>
          <div>➔</div>
          <div>👥 <strong>Investors</strong><br><small>Receive claim on profits</small></div>
        </div>
      </div>
      <p>Stockholders have a claim on the company's assets and earnings. Historically, businesses issue shares to raise capital to hire employees, build factories, or invent new technologies without taking on debt.</p>
    `,
    quiz: {
      question: 'What does owning a stock actually give you?',
      options: [
        'A guaranteed monthly salary from the company',
        'A fractional ownership interest in the business and its earnings',
        'A loan contract where the company promises to pay fixed interest'
      ],
      correctIndex: 1,
      explanation: 'Stocks are equity instruments. They represent partial ownership in the underlying company, not guaranteed loans or employment.'
    }
  },

  {
    id: 2,
    title: 'What is a Stock Exchange?',
    category: 'Foundations',
    level: 'Beginner',
    summary: 'A secure, regulated marketplace where buyers and sellers trade shares.',
    content: `
      <p>A stock exchange is an organized secondary marketplace (like the NASDAQ, New York Stock Exchange, or NSE) where existing shares are continuously bought and sold between participants.</p>
      <p>The exchange functions as an automated matching engine: it matches investors willing to buy at a certain price (bids) with investors willing to sell (asks).</p>
    `,
    quiz: {
      question: 'Who are you typically buying from when you place a stock order?',
      options: [
        'Directly from the CEO of the company',
        'Another investor or market maker willing to sell at that price',
        'The Federal Reserve'
      ],
      correctIndex: 1,
      explanation: 'In the secondary market, stock trades occur between existing shareholders and incoming buyers matched by the exchange.'
    }
  },

  {
    id: 3,
    title: 'What is a Ticker Symbol?',
    category: 'Foundations',
    level: 'Beginner',
    summary: 'A short abbreviation uniquely identifying a publicly traded asset.',
    content: `
      <p>A ticker symbol is a unique series of letters assigned to a security for trading purposes. Examples include <code>AAPL</code> for Apple Inc., <code>MSFT</code> for Microsoft, and <code>RELIANCE</code> for Reliance Industries.</p>
    `,
    quiz: {
      question: 'Why do exchanges use ticker symbols instead of full company names?',
      options: [
        'To prevent confusion and enable fast, unambiguous electronic order execution',
        'Because computer memory is limited to 4 characters',
        'To keep company names secret from competitors'
      ],
      correctIndex: 0,
      explanation: 'Tickers eliminate ambiguity between companies with similar names and streamline fast electronic routing.'
    }
  },

  {
    id: 4,
    title: 'Market Capitalization',
    category: 'Valuation',
    level: 'Beginner',
    summary: 'The total dollar market value of a company’s outstanding shares.',
    content: `
      <p>Market Cap = <strong>Current Share Price × Total Outstanding Shares</strong>.</p>
      <p><strong>Common Classifications:</strong></p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Mega-Cap:</strong> $200B+ (e.g. Apple, Microsoft, NVIDIA)</li>
        <li><strong>Large-Cap:</strong> $10B - $200B</li>
        <li><strong>Mid-Cap:</strong> $2B - $10B</li>
        <li><strong>Small-Cap:</strong> $300M - $2B</li>
      </ul>
      <p><em>Beginner Trap:</em> A stock at $10 is NOT necessarily "cheaper" than a stock at $500. You must compare total market capitalization and business valuation metrics.</p>
    `,
    quiz: {
      question: 'Company A has 100M shares at $50 ($5B cap). Company B has 10M shares at $200 ($2B cap). Which company is larger?',
      options: [
        'Company B because $200 per share is higher than $50',
        'Company A because its total market value is $5B vs $2B',
        'They are equal'
      ],
      correctIndex: 1,
      explanation: 'Size is measured by Market Capitalization (Price × Shares), not the price of a single share.'
    }
  },

  {
    id: 5,
    title: 'Revenue (Top Line)',
    category: 'Fundamentals',
    level: 'Beginner',
    summary: 'The total money brought in from selling goods and services before any expenses.',
    content: `
      <p>Revenue is often called the "top line" because it sits at the very top of the income statement. Revenue growth demonstrates whether a company’s customer base and sales volume are expanding over time.</p>
    `,
    quiz: {
      question: 'Can a company have record revenue and still lose money?',
      options: [
        'Yes, if its expenses and costs exceed the revenue brought in',
        'No, high revenue always guarantees profit',
        'Only if taxes are zero'
      ],
      correctIndex: 0,
      explanation: 'Revenue measures total sales. If cost of goods, R&D, and overhead exceed revenue, the company records a net loss.'
    }
  },

  {
    id: 6,
    title: 'Net Profit (Bottom Line)',
    category: 'Fundamentals',
    level: 'Beginner',
    summary: 'The remaining earnings after subtracting all operating costs, interest, and taxes.',
    content: `
      <p>Net profit (or net income) is the money left over for shareholders. A business that consistently turns revenue into durable profit possesses pricing power or cost efficiency.</p>
    `,
    quiz: {
      question: 'What is Profit Margin?',
      options: [
        'The percentage of each revenue dollar that converts into net profit',
        'The total salary paid to executive management',
        'The stock price divided by the number of stores'
      ],
      correctIndex: 0,
      explanation: 'Net Profit Margin = (Net Income / Revenue) × 100. A 20% margin means 20 cents of every dollar in revenue becomes profit.'
    }
  },

  {
    id: 7,
    title: 'Earnings Per Share (EPS)',
    category: 'Fundamentals',
    level: 'Beginner',
    summary: 'A company’s net profit divided by the number of outstanding shares.',
    content: `
      <p><strong>EPS = Net Income / Total Shares Outstanding</strong></p>
      <p>EPS is vital because it standardizes earnings on a per-share basis, allowing you to see how much profit was generated on behalf of your single share.</p>
    `,
    quiz: {
      question: 'If a company buys back its own shares, what usually happens to EPS (assuming net profit is unchanged)?',
      options: [
        'EPS decreases because there is less cash',
        'EPS increases because the same profit is divided by fewer shares',
        'EPS stays completely unchanged'
      ],
      correctIndex: 1,
      explanation: 'Share buybacks reduce the denominator (share count), increasing the profit attributable to each remaining share.'
    }
  },

  {
    id: 8,
    title: 'The P/E Ratio (Price-to-Earnings)',
    category: 'Valuation',
    level: 'Beginner',
    summary: 'How many dollars investors are paying for each $1 of annual earnings.',
    content: `
      <p><strong>P/E = Share Price / Earnings Per Share (EPS)</strong></p>
      <p>A P/E of 25 means investors are paying $25 for every $1 the company earns each year.</p>
      <p><strong>How to interpret:</strong></p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>High P/E (30+):</strong> Investors expect rapid future earnings growth or high durability.</li>
        <li><strong>Low P/E (<15):</strong> Company may be mature, in a cyclical industry, or facing structural headwinds.</li>
      </ul>
      <p><em>Rule:</em> Never evaluate P/E in isolation—always compare within the same industry alongside growth rates.</p>
    `,
    quiz: {
      question: 'Stock X has P/E = 15. Stock Y has P/E = 50. Is Stock X automatically the better investment?',
      options: [
        'Yes, lower P/E is always strictly superior',
        'No. Stock Y might be growing revenue at 60% per year while Stock X is in decline. Growth and quality matter.',
        'Yes, high P/E stocks are illegal'
      ],
      correctIndex: 1,
      explanation: 'Valuation ratios must be evaluated alongside business growth, competitive moats, profitability, and risk.'
    }
  },

  {
    id: 9,
    title: 'Dividends & Yield',
    category: 'Fundamentals',
    level: 'Beginner',
    summary: 'Cash distributions paid directly by a profitable company to its shareholders.',
    content: `
      <p><strong>Dividend Yield = Annual Dividends Per Share / Share Price</strong>.</p>
      <p>Mature companies with steady cash flows (like utilities, consumer staples, or telecom) often return excess capital as dividends, whereas fast-growing tech companies often reinvest cash into R&D.</p>
    `,
    quiz: {
      question: 'What is a Dividend Payout Ratio?',
      options: [
        'The percentage of company net earnings paid out as dividends',
        'The tax rate on stock profits',
        'The broker commission fee'
      ],
      correctIndex: 0,
      explanation: 'Payout ratio measures sustainability. A payout ratio > 90% may indicate the dividend is at risk if profits decline.'
    }
  },

  {
    id: 10,
    title: 'Reading Candlestick Charts',
    category: 'Technical',
    level: 'Beginner',
    summary: 'Visualizing price action (Open, High, Low, Close) across defined intervals.',
    content: `
      <p>Every candle tells a story about the battle between buyers (bulls) and sellers (bears):</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Green Body:</strong> Close > Open (buyers pushed prices up).</li>
        <li><strong>Red Body:</strong> Close < Open (sellers pushed prices down).</li>
        <li><strong>Upper Wick:</strong> Highest price reached during that period.</li>
        <li><strong>Lower Wick:</strong> Lowest price reached during that period.</li>
      </ul>
    `,
    quiz: {
      question: 'What does a long lower wick on a candle typically suggest?',
      options: [
        'Sellers drove the price down during the session, but buyers stepped in aggressively to push it back up before close',
        'The market was closed that day',
        'The company went bankrupt'
      ],
      correctIndex: 0,
      explanation: 'A long lower shadow/wick indicates price rejection at lower levels and buying interest (demand).'
    }
  },

  {
    id: 11,
    title: 'Trading Volume',
    category: 'Technical',
    level: 'Beginner',
    summary: 'The total number of shares traded over a given period.',
    content: `
      <p>Volume confirms the conviction behind price moves. A stock breaking to a new 52-week high on <strong>3x average volume</strong> indicates institutional buying, whereas a move on light volume can be prone to false breakouts.</p>
    `,
    quiz: {
      question: 'Why is volume important during a price breakout?',
      options: [
        'It confirms that many large market participants are participating in the move',
        'It changes the company tax rate',
        'It guarantees the price will never fall again'
      ],
      correctIndex: 0,
      explanation: 'High volume reflects institutional participation and liquidity, validating the strength of a price trend.'
    }
  },

  {
    id: 12,
    title: 'Moving Averages (SMA & EMA)',
    category: 'Technical',
    level: 'Intermediate',
    summary: 'Smoothing price data to identify primary underlying trend directions.',
    content: `
      <p><strong>SMA (Simple Moving Average):</strong> The arithmetic average of close prices over N periods.</p>
      <p><strong>EMA (Exponential Moving Average):</strong> Applies more weight to recent prices for faster responsiveness.</p>
      <p><strong>Key Benchmarks:</strong></p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>20-day:</strong> Short-term momentum</li>
        <li><strong>50-day:</strong> Intermediate institutional support</li>
        <li><strong>200-day:</strong> Long-term bull/bear line in the sand</li>
      </ul>
    `,
    quiz: {
      question: 'What is a "Golden Cross"?',
      options: [
        'When a short-term moving average (e.g. 50 SMA) crosses above a long-term moving average (e.g. 200 SMA)',
        'When a company pays a special dividend',
        'When gold prices rise higher than stocks'
      ],
      correctIndex: 0,
      explanation: 'A Golden Cross is a widely followed technical pattern indicating potential long-term bullish momentum shift.'
    }
  },

  {
    id: 13,
    title: 'RSI (Relative Strength Index)',
    category: 'Technical',
    level: 'Intermediate',
    summary: 'A momentum oscillator measuring the speed and change of price moves (0-100).',
    content: `
      <p>RSI measures internal price momentum over 14 periods:</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Above 70:</strong> Often described as overbought (extended momentum).</li>
        <li><strong>Below 30:</strong> Often described as oversold (potential exhaustion).</li>
      </ul>
      <p><em>Important:</em> Strong trending stocks can remain "overbought" with RSI > 70 for months. Never use RSI as a standalone sell trigger.</p>
    `,
    quiz: {
      question: 'Is an RSI reading below 30 an automatic guarantee that the stock will immediately bounce?',
      options: [
        'Yes, it is impossible for price to drop further',
        'No, deeply troubled companies in downtrends can stay oversold while prices continue falling',
        'RSI only applies to crypto'
      ],
      correctIndex: 1,
      explanation: 'RSI is a momentum tool, not a crystal ball. Always cross-reference with support levels, trend, and fundamentals.'
    }
  },

  {
    id: 14,
    title: 'MACD Indicator',
    category: 'Technical',
    level: 'Intermediate',
    summary: 'Trend-following momentum indicator displaying the relationship between two EMAs.',
    content: `
      <p>MACD consists of: (1) MACD Line (12 EMA - 26 EMA), (2) Signal Line (9 EMA of MACD), and (3) Histogram (difference between MACD & Signal).</p>
      <p>Bullish signal: MACD line crossing above the signal line with expanding positive histogram bars.</p>
    `,
    quiz: {
      question: 'What does an expanding positive MACD histogram indicate?',
      options: [
        'Short-term upward momentum is accelerating faster than the baseline trend',
        'The company announced a stock split',
        'Trading has been halted'
      ],
      correctIndex: 0,
      explanation: 'Histogram expansion shows that the gap between fast and slow averages is widening in the direction of the trend.'
    }
  },

  {
    id: 15,
    title: 'Support and Resistance',
    category: 'Technical',
    level: 'Intermediate',
    summary: 'Key price levels where buying demand or selling supply historically concentrates.',
    content: `
      <p><strong>Support:</strong> A floor where buyers have repeatedly stepped in to absorb selling pressure.</p>
      <p><strong>Resistance:</strong> A ceiling where sellers have emerged to take profits or exit positions.</p>
      <p><em>Polarity Principle:</em> When strong resistance is decisively broken on high volume, it often flips into new support on future pullbacks.</p>
    `,
    quiz: {
      question: 'What happens when a major resistance level is broken on heavy volume?',
      options: [
        'The previous resistance level often acts as a new support floor',
        'The stock is automatically delisted',
        'Volume drops to zero permanently'
      ],
      correctIndex: 0,
      explanation: 'This is the principle of role reversal in technical analysis: former ceilings become new floors.'
    }
  },

  {
    id: 16,
    title: 'Understanding Volatility & Beta',
    category: 'Risk',
    level: 'Intermediate',
    summary: 'How much and how fast a stock’s price fluctuates relative to the market.',
    content: `
      <p><strong>Beta:</strong> Measures sensitivity against a benchmark (e.g. S&P 500 = 1.0):</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Beta = 1.0:</strong> Moves in tandem with the index.</li>
        <li><strong>Beta = 1.8:</strong> High-beta stock (amplified swings up and down).</li>
        <li><strong>Beta = 0.6:</strong> Defensive, lower-volatility stock (e.g. consumer staples/utilities).</li>
      </ul>
    `,
    quiz: {
      question: 'If the market drops 10%, what would a stock with Beta = 2.0 historically be expected to do (all else equal)?',
      options: [
        'Drop approximately 20%',
        'Gain 20%',
        'Stay completely unchanged'
      ],
      correctIndex: 0,
      explanation: 'Beta represents price sensitivity multiplier relative to benchmark market fluctuations.'
    }
  },

  {
    id: 17,
    title: 'Risk Management & Position Sizing',
    category: 'Risk',
    level: 'Essential',
    summary: 'The single most critical discipline that separates long-term survivors from gamblers.',
    content: `
      <p>Never risk losing a catastrophic percentage of your capital on any single trade or thesis. Professional risk management principles:</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li>Know your maximum acceptable loss BEFORE entering.</li>
        <li>Calculate share count based on your stop-loss distance, not impulse.</li>
        <li>Understand that a 50% portfolio loss requires a 100% gain just to break even.</li>
      </ul>
    `,
    quiz: {
      question: 'If a portfolio drops 50% in value, what percentage gain is required on the remaining capital to recover to the starting balance?',
      options: [
        '50%',
        '100%',
        '75%'
      ],
      correctIndex: 1,
      explanation: 'If $10,000 drops to $5,000 (-50%), you must make $5,000 on your remaining $5,000, which is a +100% return.'
    }
  },

  {
    id: 18,
    title: 'Portfolio Diversification',
    category: 'Risk',
    level: 'Essential',
    summary: 'Spreading capital across uncorrelated assets, sectors, and geographies.',
    content: `
      <p>Diversification reduces idiosyncratic (company-specific) risk without necessarily reducing long-term expected returns. If you hold 15-25 high-quality companies across multiple sectors, a single corporate fraud or bankruptcy cannot wipe out your life savings.</p>
    `,
    quiz: {
      question: 'If you own 5 different stocks but all 5 are semiconductor chip manufacturers, are you diversified?',
      options: [
        'Yes, because you own 5 separate tickers',
        'No, because all 5 companies share identical industry, supply chain, and cyclical risks',
        'Yes, if they are in different states'
      ],
      correctIndex: 1,
      explanation: 'Holding stocks within the same sector exposes the portfolio to heavy sector concentration risk.'
    }
  },

  {
    id: 19,
    title: 'Fundamental Analysis Overview',
    category: 'Analysis',
    level: 'Intermediate',
    summary: 'Evaluating business economics, financial health, management quality, and competitive moats.',
    content: `
      <p>Fundamental analysis treats the stock as a business. You study:</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Income Statement:</strong> Revenue growth, gross and net margins.</li>
        <li><strong>Balance Sheet:</strong> Cash reserves vs total debt obligations.</li>
        <li><strong>Cash Flow Statement:</strong> Free Cash Flow generated after capital expenditures.</li>
        <li><strong>Moat:</strong> Switching costs, network effects, brand equity, or cost advantages.</li>
      </ul>
    `,
    quiz: {
      question: 'What is an "economic moat"?',
      options: [
        'A structural competitive advantage that protects a company’s profits from competitors over time',
        'A lake surrounding a company headquarters',
        'A high interest rate loan'
      ],
      correctIndex: 0,
      explanation: 'Coined by Warren Buffett, an economic moat allows a firm to maintain high return on capital despite competition.'
    }
  },

  {
    id: 20,
    title: 'Technical Analysis Overview',
    category: 'Analysis',
    level: 'Intermediate',
    summary: 'Studying price action, supply/demand volume, and market psychology.',
    content: `
      <p>Technical analysis studies the auction dynamics of the market. While fundamentals tell you <em>WHAT</em> to consider buying, technicals help you understand <em>WHEN</em> institutions are accumulating and where clear risk/reward setups exist.</p>
    `,
    quiz: {
      question: 'What is the best way to use technical analysis in practice?',
      options: [
        'As an exact fortune-telling prediction of the future with 100% certainty',
        'As a probabilistic framework to identify favorable risk-to-reward entry/exit points and trend health',
        'As a substitute for basic risk management'
      ],
      correctIndex: 1,
      explanation: 'Technicals are tools for assessing market probability and managing risk, not crystal balls.'
    }
  },

  {
    id: 21,
    title: 'Paper Trading & Simulation',
    category: 'Practical',
    level: 'Beginner',
    summary: 'Practicing execution and psychological discipline without risking real capital.',
    content: `
      <p>Paper trading uses virtual money in simulated conditions. It allows beginners to test order types (Market vs Limit), test their research process, and build execution discipline before committing real savings.</p>
    `,
    quiz: {
      question: 'What is a Limit Order?',
      options: [
        'An order that executes only at a specified target price or better',
        'An order that buys at whatever price is available immediately',
        'An order that limits your account balance'
      ],
      correctIndex: 0,
      explanation: 'Limit orders ensure price certainty: you will only buy at or below your specified limit price.'
    }
  },

  {
    id: 22,
    title: 'How to Build an Investment Thesis',
    category: 'Practical',
    level: 'Advanced',
    summary: 'Developing a structured, hypothesis-driven rationale for every trade or investment.',
    content: `
      <p>A professional investment thesis must answer 4 questions:</p>
      <ol style="padding-left: 20px; margin: 8px 0;">
        <li><strong>The Core Drivers:</strong> Why will this business be significantly more valuable in 3-5 years?</li>
        <li><strong>Valuation Check:</strong> Is the market price reasonable relative to its growth and cash generation?</li>
        <li><strong>Bear Case:</strong> What is the smartest counter-argument against this stock?</li>
        <li><strong>Thesis Invalidation:</strong> What concrete evidence would prove my hypothesis wrong and trigger an exit?</li>
      </ol>
    `,
    quiz: {
      question: 'Why must you define thesis invalidation criteria BEFORE placing a trade?',
      options: [
        'To prevent emotional rationalization and holding losing positions when original assumptions are broken',
        'Because the exchange requires it by law',
        'To increase broker commissions'
      ],
      correctIndex: 0,
      explanation: 'Pre-defining invalidation prevents cognitive dissonance and emotional decision-making under stress.'
    }
  },

  {
    id: 23,
    title: 'Avoiding Common Beginner Traps',
    category: 'Psychology',
    level: 'Essential',
    summary: 'Recognizing FOMO, revenge trading, averaging down into failing businesses, and leverage traps.',
    content: `
      <p><strong>Top Beginner Mistakes:</strong></p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>FOMO (Fear of Missing Out):</strong> Buying after a stock has already spiked 200% in days.</li>
        <li><strong>Confusing Share Price with Valuation:</strong> Believing a $2 stock is "cheap" and a $300 stock is "expensive".</li>
        <li><strong>All-In Bets:</strong> Putting 80%+ of capital into one speculative narrative.</li>
        <li><strong>Ignoring Risk/Reward:</strong> Risking $5 to make $1.</li>
      </ul>
    `,
    quiz: {
      question: 'What should you do when you feel a strong emotional urge to buy a stock solely because it went up 30% today?',
      options: [
        'Immediately buy at market price with all available cash',
        'Pause, step back, and evaluate business fundamentals, valuation, and technical risk/reward objectively',
        'Borrow money to double the order size'
      ],
      correctIndex: 1,
      explanation: 'Emotional chasing of parabolic moves is the most common cause of rapid capital destruction for beginners.'
    }
  },

  {
    id: 24,
    title: 'Reading Financial Results (Earnings Reports)',
    category: 'Analysis',
    level: 'Advanced',
    summary: 'How to extract actionable business insights from quarterly 10-Q and 10-K filings.',
    content: `
      <p>When companies report quarterly earnings, look beyond the headline EPS "beat or miss":</p>
      <ul style="padding-left: 20px; margin: 8px 0;">
        <li><strong>Forward Guidance:</strong> What is management projecting for next quarter’s revenue and margins?</li>
        <li><strong>Segment Breakdown:</strong> Are high-margin core growth units accelerating?</li>
        <li><strong>Cash Conversion:</strong> Did reported accounting profit actually translate into Free Cash Flow?</li>
      </ul>
    `,
    quiz: {
      question: 'Why does a stock sometimes drop after reporting earnings that beat analyst estimates?',
      options: [
        'Because management lowered future forward revenue guidance or margins contracted',
        'The exchange malfunctioned',
        'Stocks always drop on good news'
      ],
      correctIndex: 0,
      explanation: 'Markets are forward-looking. If future guidance or underlying margins disappoint, strong past earnings are discounted.'
    }
  }
];

// Financial Glossary for Global "Explain This" Context Drawer
const FINANCIAL_GLOSSARY = {
  PE: {
    title: 'P/E Ratio (Price-to-Earnings)',
    level: 'Beginner',
    category: 'Valuation',
    whatItMeasures: 'Relative Valuation & Earnings Multiple',
    basicIdea: 'Compares a company’s current share price to its annual earnings per share (EPS). It answers: "How many dollars are investors paying for $1 of current company profit?"',
    rules: [
      'P/E = Share Price / Earnings Per Share',
      'High P/E (30+): High expected growth or premium market quality',
      'Low P/E (<15): Value stock, mature industry, or potential business challenges'
    ],
    analystUsage: 'Analysts never use P/E in isolation. They compare a stock\'s P/E against its 5-year historical average, peer group competitors, and PEG ratio (P/E divided by earnings growth rate).'
  },

  EPS: {
    title: 'Earnings Per Share (EPS)',
    level: 'Beginner',
    category: 'Profitability',
    whatItMeasures: 'Per-Share Corporate Profit',
    basicIdea: 'Represents the exact portion of company net profit allocated to each individual share of common stock.',
    rules: [
      'EPS = Net Income / Total Outstanding Shares',
      'Diluted EPS accounts for potential stock options and convertible bonds'
    ],
    analystUsage: 'Consistent double-digit EPS growth over 3-5 years is one of the hallmarks of high-performing compounder companies.'
  },

  MARKET_CAP: {
    title: 'Market Capitalization',
    level: 'Beginner',
    category: 'Size & Valuation',
    whatItMeasures: 'Total Enterprise Equity Value',
    basicIdea: 'The total aggregate dollar market value of all outstanding shares issued by the corporation.',
    rules: [
      'Market Cap = Current Stock Price × Total Outstanding Shares',
      'Mega-Cap ($200B+), Large-Cap ($10B+), Mid-Cap ($2B-$10B), Small-Cap (<$2B)'
    ],
    analystUsage: 'Determines index weighting (e.g. S&P 500 is market-cap weighted) and risk profile.'
  },

  BETA: {
    title: 'Beta (Market Sensitivity)',
    level: 'Intermediate',
    category: 'Risk & Volatility',
    whatItMeasures: 'Systematic Market Risk Multiplier',
    basicIdea: 'Measures how violently a stock\'s historical price moves relative to the broader benchmark market index (Beta = 1.0).',
    rules: [
      'Beta > 1.0: Stock is more volatile than the market (e.g. TSLA, NVDA)',
      'Beta < 1.0: Stock is less volatile than the market (e.g. consumer staples, telecom)'
    ],
    analystUsage: 'Used in the Capital Asset Pricing Model (CAPM) to calculate expected cost of equity capital.'
  },

  RSI: {
    title: 'Relative Strength Index (RSI)',
    level: 'Beginner',
    category: 'Technical Momentum',
    whatItMeasures: 'Momentum & Overbought/Oversold Conditions',
    basicIdea: 'An oscillator bounded between 0 and 100 measuring the speed and velocity of recent price changes.',
    rules: [
      'Above 70: Often described as Overbought',
      'Below 30: Often described as Oversold',
      'IMPORTANT: Not an automatic buy or sell signal'
    ],
    analystUsage: 'Analysts look for Momentum Divergence—where price makes a new high but RSI fails to make a new high, signaling exhausting buying pressure.'
  },

  MACD: {
    title: 'MACD (Moving Average Convergence Divergence)',
    level: 'Intermediate',
    category: 'Technical Trend',
    whatItMeasures: 'Trend Direction & Acceleration',
    basicIdea: 'Displays the relationship between two exponential moving averages (typically 12 EMA and 26 EMA) alongside a 9-day signal line.',
    rules: [
      'MACD Line crossing above Signal Line: Bullish momentum acceleration',
      'MACD Line crossing below Signal Line: Bearish momentum shift'
    ],
    analystUsage: 'Best used in confluence with price support/resistance levels and volume confirmation.'
  },

  GROSS_MARGIN: {
    title: 'Gross Margin %',
    level: 'Intermediate',
    category: 'Profitability',
    whatItMeasures: 'Pricing Power & Production Efficiency',
    basicIdea: 'The percentage of revenue retained after incurring the direct costs of producing goods or services (COGS).',
    rules: [
      'Gross Margin = (Revenue - COGS) / Revenue × 100',
      'Software/Tech often enjoys 70-85% gross margins; Hardware/Auto 15-30%'
    ],
    analystUsage: 'High and expanding gross margins indicate strong pricing power and durable competitive moat.'
  },

  DEBT_TO_EQUITY: {
    title: 'Debt-to-Equity (D/E Ratio)',
    level: 'Intermediate',
    category: 'Financial Health',
    whatItMeasures: 'Financial Leverage & Solvency Risk',
    basicIdea: 'Compares a company\'s total debt obligations to its total shareholder equity.',
    rules: [
      'D/E < 0.5: Conservative, low-risk capital structure',
      'D/E > 2.0: High financial leverage (vulnerable during interest rate spikes or revenue downturns)'
    ],
    analystUsage: 'Helps stress-test whether a business can comfortably service its debts during a severe recession.'
  }
};
