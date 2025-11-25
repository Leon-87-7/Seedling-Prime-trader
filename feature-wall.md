# Feature Wall - Seedling Prime Trader

A unified roadmap combining comprehensive analysis from both Claude and Gemini AI models.

---

## 🎯 Current Status

**Seedling Prime Trader** is a sophisticated stock market tracking and alerting system with:

- ✅ User authentication with personalized profiles
- ✅ Watchlist management with real-time data
- ✅ Price alerts with email notifications
- ✅ Stock search and detail pages
- ✅ TradingView chart integration
- ✅ Background job processing (Inngest)
- ✅ Daily news summaries via email

**Critical Gap:** No portfolio management - users can't track what they own.

---

## 🚨 Tier 1: Critical Features (Must Have)

These are essential features that define a trading platform. Without these, the app is incomplete.

### 1. Portfolio Management ⭐ HIGHEST PRIORITY

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No holdings/positions tracking
- No purchase history or cost basis
- No profit/loss calculations
- No portfolio value tracking over time
- No asset allocation views
- No diversification analysis

**Required Components:**

- Portfolio database model (userId, symbol, quantity, purchasePrice, purchaseDate)
- Transaction database model (buy/sell logging)
- Portfolio calculation engine
- Portfolio summary page with total value, P&L, daily change
- Holdings table (symbol, quantity, cost basis, current value, P&L)
- Transaction history page with filtering/sorting
- Portfolio performance charts (daily/weekly/monthly/yearly)
- Asset allocation pie chart
- Sector diversification analysis

**Database Schema:**

```typescript
// Portfolio Model
{
  userId: string (indexed)
  symbol: string
  company: string
  totalQuantity: number
  averageCostBasis: number
  currentValue: number
  totalCost: number
  unrealizedGainLoss: number
  unrealizedGainLossPercent: number
  lastUpdated: Date
  createdAt: Date
}

// Transaction Model
{
  userId: string (indexed)
  symbol: string
  company: string
  transactionType: 'buy' | 'sell'
  quantity: number
  pricePerShare: number
  totalAmount: number
  fees?: number
  transactionDate: Date
  notes?: string
  createdAt: Date
}
```

**Files to Create:**

- `database/models/portfolio.model.ts`
- `database/models/transaction.model.ts`
- `lib/actions/portfolio.actions.ts`
- `lib/actions/transaction.actions.ts`
- `lib/utils/portfolio-calculations.ts`
- `app/(root)/portfolio/page.tsx`
- `app/(root)/transactions/page.tsx`
- `components/PortfolioSummary.tsx`
- `components/PortfolioTable.tsx`
- `components/TransactionHistory.tsx`
- `components/AddTransactionDialog.tsx`

**Estimated Time:** 2-3 weeks

**Dev Points:**

- **UI/UX Strategy ("Best of Both Worlds"):**
  - We will create two separate, focused pages:
    - `/portfolio`: For a high-level summary of current holdings and performance.
    - `/transactions`: For a detailed, filterable log of all historical trades.
  - To connect them seamlessly, the `/portfolio` page will feature a "Recent Transactions" widget showing the last 3-5 trades, with a clear "View All" link to the dedicated transactions page. This provides a quick overview while keeping the main portfolio view clean and uncluttered.

- **Table Library (TanStack Table):**
  - All data-heavy tables (`PortfolioTable`, `TransactionHistory`, and a refactored `WatchlistTable`) will be built using the **TanStack Table** library.
  - **Reasoning:** This standardizes our approach, significantly reduces manual state management for sorting and filtering, and provides a robust, "headless" foundation that integrates perfectly with our existing `shadcn/ui` components. This ensures a consistent user experience and simplifies future development.

---

### 2. Account Settings & Profile Management

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No account settings page
- No profile editing UI
- No password change functionality
- No email verification
- No notification preferences
- No session management

**Features to Implement:**

- Settings page layout with navigation tabs
- Profile editing (name, country, investment goals, risk tolerance, industry)
- Password change with current password verification
- Email change with verification
- Delete account functionality
- Notification preferences:
  - Email alerts on/off
  - Daily news summary on/off
  - Weekly performance report on/off
  - Alert frequency (instant, daily digest, weekly digest)
- Session management (view active sessions, logout all devices)
- Export user data (GDPR compliance)

**Files to Create:**

- `app/(root)/settings/page.tsx`
- `app/(root)/settings/profile/page.tsx`
- `app/(root)/settings/security/page.tsx`
- `app/(root)/settings/notifications/page.tsx`
- `components/ProfileEditForm.tsx`
- `components/PasswordChangeForm.tsx`
- `components/NotificationPreferences.tsx`
- `database/models/notification-preferences.model.ts`

**Known Bug to Fix:**

- `lib/actions/user.actions.ts:59` - Missing userId in query parameter

**Estimated Time:** 1-2 weeks

---

### 3. Dark/Light Mode Toggle

**Status:** PARTIALLY IMPLEMENTED

**Current State:**

- Dark mode is implemented and set as default
- `className="dark"` on HTML element in `app/layout.tsx`
- No toggle to switch between themes

**What's Missing:**

- Theme toggle button in Header
- Theme preference stored in user settings or localStorage
- Smooth transition between themes
- Theme selector in Settings page

**Implementation:**

- Add theme context provider
- Create theme toggle component
- Store preference in localStorage or user profile
- Update all components to respect theme
- Add theme option to Settings > Profile page

**Files to Create/Update:**

- `lib/contexts/ThemeContext.tsx`
- `components/ThemeToggle.tsx`
- `app/layout.tsx` (update)
- `components/Header.tsx` (add toggle button)

**Estimated Time:** 2-3 days

---

### 4. Transaction Management

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No transaction history dedicated page
- No transaction editing/deletion
- No cash balance tracking
- No transaction filters (by date, symbol, type)
- No bulk import from CSV

**Features to Implement:**

- Transaction history page with table
- Filter transactions by:
  - Date range
  - Stock symbol
  - Transaction type (buy/sell)
  - Amount range
- Transaction detail modal
- Edit/delete transaction functionality
- Cash account ledger (optional)
- Bulk import from CSV
- Export transactions to CSV

**Files to Create:**

- `app/(root)/transactions/page.tsx`
- `components/TransactionFilters.tsx`
- `components/TransactionDetailDialog.tsx`
- `components/TransactionImport.tsx`
- `database/models/cash-account.model.ts` (optional)

**Estimated Time:** 1 week

---

## 🔧 Tier 2: High Priority Features (Should Have)

These features significantly enhance user experience and are expected in modern trading apps.

### 5. News UI Integration

**Status:** BACKEND IMPLEMENTED, UI MISSING

**Current State:**

- `getNews()` function exists in `lib/actions/finnhub.actions.ts`
- Daily news summaries sent via email
- News NOT displayed in app UI

**What's Missing:**

- News section on stock detail pages
- General market news page
- News filtering by symbol/sector
- News search functionality

**Features to Implement:**

- Add news section to stock detail page (`app/(root)/stocks/[symbol]/page.tsx`)
- Create dedicated news page (`app/(root)/news/page.tsx`)
- Display news with:
  - Headline, source, summary
  - Published date/time
  - External link to full article
  - Category/tags
- Filter news by:
  - Stock symbol
  - Date range
  - Source
  - Category (earnings, M&A, general)

**Files to Create/Update:**

- `app/(root)/news/page.tsx`
- `app/(root)/stocks/[symbol]/page.tsx` (update)
- `components/NewsSection.tsx`
- `components/NewsList.tsx`
- `components/NewsItem.tsx`
- `components/NewsFilters.tsx`

**Estimated Time:** 3-5 days

---

### 6. Advanced Alert Features

**Status:** PARTIALLY IMPLEMENTED

**Current Limitations:**

- Only price upper/lower alerts work
- Volume alerts disabled (API limitation)
- No percentage change alerts
- No moving average crossover alerts
- No multi-condition alerts
- No alert history/logs

**Features to Add:**

- Percentage change alerts (+/-X% in 24 hours)
- Moving average alerts (50-day, 200-day crossovers)
- RSI alerts (overbought > 70, oversold < 30)
- MACD crossover alerts
- News keyword alerts (trigger on specific news)
- Multi-condition alerts (price AND volume)
- Alert history page (all triggered alerts)
- Alert analytics (success rate, avg time to trigger)
- Snooze/pause alerts temporarily

**Database Updates:**

```typescript
// Extend Alert Model
{
  alertType: 'price_upper' | 'price_lower' | 'volume' | 'percent_change' | 'ma_crossover' | 'rsi' | 'macd' | 'news_keyword'
  percentChange?: number
  maPeriod?: number
  rsiThreshold?: number
  newsKeywords?: string[]
  conditions?: AlertCondition[] // for multi-condition
  snoozedUntil?: Date
}
```

**Files to Create:**

- `app/(root)/alerts/page.tsx`
- `app/(root)/alerts/history/page.tsx`
- `components/AdvancedAlertDialog.tsx`
- `components/AlertHistoryTable.tsx`
- `components/AlertAnalytics.tsx`
- `lib/actions/advanced-alerts.actions.ts`
- `database/models/alert-history.model.ts`

**Estimated Time:** 1-2 weeks

---

### 7. Password Reset Flow

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No "Forgot Password" link on sign-in page
- No password reset email functionality
- No reset token generation/validation
- No reset password page

**Features to Implement:**

- "Forgot Password" link on sign-in page
- Email with password reset link (6-hour expiration)
- Reset token generation and storage
- Reset password page with token validation
- Password strength requirements displayed
- Success confirmation and auto-redirect to sign-in

**Files to Create:**

- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `lib/actions/password-reset.actions.ts`
- `lib/nodemailer/templates.ts` (add password reset template)
- `database/models/password-reset-token.model.ts`

**Estimated Time:** 3-5 days

---

### 8. Email Verification

**Status:** NOT IMPLEMENTED

**Current State:**

- Users can sign up without email verification
- No verification emails sent

**What's Missing:**

- Email verification on signup
- Verification token generation
- Verification email template
- Account activation flow
- Resend verification email option

**Features to Implement:**

- Send verification email on signup
- Verification link with token (24-hour expiration)
- Verify email page
- Resend verification email button
- Prevent certain actions until email verified (optional)
- Email verified badge in profile

**Files to Create:**

- `app/(auth)/verify-email/page.tsx`
- `lib/actions/email-verification.actions.ts`
- `lib/nodemailer/templates.ts` (add verification template)
- `database/models/verification-token.model.ts`

**Estimated Time:** 3-5 days

---

### 9. Real-time Price Updates

**Status:** NOT IMPLEMENTED

**Current Limitation:**

- 15-minute cached data from Finnhub
- No live price streaming
- Manual refresh required

**What's Missing:**

- WebSocket integration for live prices
- Real-time updates on watchlist page
- Real-time updates on portfolio page
- Real-time updates on stock detail pages
- Connection status indicator

**Implementation Options:**

1. **Finnhub WebSocket** (requires premium plan for real-time)
2. **Polygon.io WebSocket** (alternative provider)
3. **Server-Sent Events (SSE)** (simpler, one-way)
4. **Polling with shorter intervals** (least optimal)

**Features to Implement:**

- WebSocket connection manager
- Live price component with animation
- Reconnection logic on disconnect
- Connection status indicator (green dot = live, yellow = delayed)
- Fallback to cached data if connection fails
- Real-time P&L updates in portfolio

**Files to Create:**

- `lib/websocket/price-stream.ts`
- `lib/websocket/connection-manager.ts`
- `components/LivePrice.tsx`
- `components/ConnectionStatus.tsx`
- Update `app/(root)/watchlist/page.tsx`
- Update `app/(root)/portfolio/page.tsx`
- Update `app/(root)/stocks/[symbol]/page.tsx`

**Estimated Time:** 1-2 weeks

---

### 10. Stock Comparison Tool

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No side-by-side stock comparison
- No correlation analysis
- No relative performance charts
- No peer comparison

**Features to Implement:**

- Compare up to 5 stocks simultaneously
- Side-by-side metrics table:
  - Price, change, % change
  - Market cap, P/E ratio, EPS
  - Dividend yield, beta
  - 52-week range
  - Revenue, profit margin
- Performance comparison chart (1D, 1W, 1M, 1Y, 5Y)
- Correlation matrix (how stocks move together)
- Sector average comparison
- Peer group auto-suggestions
- Add stocks from watchlist or search
- Export comparison to PDF/CSV

**Files to Create:**

- `app/(root)/compare/page.tsx`
- `components/StockComparisonTable.tsx`
- `components/CorrelationMatrix.tsx`
- `components/RelativePerformanceChart.tsx`
- `components/ComparisonSelector.tsx`
- `lib/actions/comparison.actions.ts`
- `lib/utils/correlation-calculator.ts`

**Estimated Time:** 1 week

---

## 📊 Tier 3: Medium Priority Features (Nice to Have)

These features add significant value but aren't critical for core functionality.

### 11. Stock Screener

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No stock filtering/screening tool
- No custom screening criteria
- No saved screen presets

**Features to Implement:**

- Filter stocks by:
  - Market cap (micro, small, mid, large cap)
  - P/E ratio range
  - Dividend yield (% range)
  - Price change (% change in 1D, 1W, 1M, 1Y)
  - Volume (unusual volume, volume > X)
  - Price range ($X to $Y)
  - Sector/industry
  - Technical indicators (RSI, MACD, moving averages)
  - Beta (volatility vs market)
  - EPS, revenue growth
- Preset screens:
  - Value stocks (low P/E, high dividend)
  - Growth stocks (high revenue growth, low/no dividend)
  - Momentum stocks (strong price momentum)
  - Dividend aristocrats (consistent dividend growth)
  - Penny stocks (< $5)
- Custom screens (save user-created filters)
- Screener results table with sorting
- Add to watchlist directly from results
- Export results to CSV
- Backtest screener criteria (historical performance)

**Files to Create:**

- `app/(root)/screener/page.tsx`
- `components/ScreenerFilters.tsx`
- `components/ScreenerResults.tsx`
- `components/SavedScreens.tsx`
- `components/PresetScreens.tsx`
- `lib/actions/screener.actions.ts`
- `database/models/saved-screen.model.ts`

**Estimated Time:** 2 weeks

---

### 12. Portfolio Analytics Dashboard

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No portfolio performance metrics
- No risk analysis tools
- No rebalancing recommendations

**Features to Implement:**

- **Performance Metrics:**
  - Total return (time-weighted return, money-weighted return)
  - Sharpe ratio (risk-adjusted return)
  - Alpha (excess return vs benchmark)
  - Beta (volatility vs S&P 500)
  - Maximum drawdown (largest peak-to-trough decline)
  - Volatility (standard deviation of returns)
  - Win rate (% of profitable trades)
  - Average gain/loss per trade

- **Risk Analysis:**
  - Portfolio beta
  - Value at Risk (VaR) - max expected loss
  - Concentration risk (% in single stock/sector)
  - Sector allocation vs target allocation
  - Correlation with S&P 500

- **Visualization:**
  - Performance chart vs S&P 500
  - Sector allocation pie chart
  - Top gainers/losers
  - Performance heatmap by holding
  - Monthly returns calendar heatmap

**Files to Create:**

- `app/(root)/analytics/page.tsx`
- `components/PerformanceMetrics.tsx`
- `components/RiskAnalysis.tsx`
- `components/AssetAllocationChart.tsx`
- `components/PerformanceComparison.tsx`
- `components/SectorAllocationChart.tsx`
- `lib/utils/analytics-calculations.ts`
- `lib/utils/risk-metrics.ts`

**Estimated Time:** 2 weeks

---

### 13. Dividend Tracking

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No dividend tracking or forecasting
- No upcoming dividend dates
- No dividend income history

**Features to Implement:**

- Dividend tracker dashboard:
  - Total annual dividend income (projected)
  - Dividend yield (portfolio weighted average)
  - Upcoming dividends (next 30/60/90 days)
  - Dividend payment history
  - Dividend growth rate
- Dividend calendar:
  - Ex-dividend dates
  - Payment dates
  - Amount per share
- Dividend reinvestment tracking (optional)
- Dividend aristocrats in portfolio (25+ years of increases)
- Monthly dividend income chart
- Export dividend income report (for taxes)

**Files to Create:**

- `app/(root)/dividends/page.tsx`
- `components/DividendTracker.tsx`
- `components/DividendCalendar.tsx`
- `components/DividendHistory.tsx`
- `components/DividendIncomeChart.tsx`
- `lib/actions/dividend.actions.ts`
- `database/models/dividend-payment.model.ts`

**Estimated Time:** 1 week

---

### 14. Research Tools & Earnings Calendar

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No analyst ratings
- No earnings calendar
- No SEC filings integration
- No insider trading data

**Features to Implement:**

- **Analyst Ratings:**
  - Buy/hold/sell consensus
  - Price targets (high, average, low)
  - Recent rating changes
  - Analyst firm names

- **Earnings Calendar:**
  - Upcoming earnings dates for watchlist/portfolio
  - Earnings time (before market, after market)
  - EPS estimate vs actual
  - Revenue estimate vs actual
  - Earnings surprises (beat/miss)
  - Historical earnings data

- **SEC Filings (if API available):**
  - 10-K (annual report)
  - 10-Q (quarterly report)
  - 8-K (current events)
  - Form 4 (insider trading)
  - 13F (institutional holdings)

- **Insider Trading:**
  - Recent buys/sells by insiders
  - Insider name, title, shares, price, date
  - Insider ownership percentage

- **Institutional Ownership:**
  - Top institutional holders
  - % of shares held
  - Recent changes in holdings

**Files to Create:**

- `app/(root)/research/page.tsx`
- `app/(root)/research/earnings-calendar/page.tsx`
- `app/(root)/research/analyst-ratings/page.tsx`
- `app/(root)/research/insider-trading/page.tsx`
- `components/AnalystRatings.tsx`
- `components/EarningsCalendar.tsx`
- `components/InsiderTrading.tsx`
- `components/InstitutionalOwnership.tsx`
- `components/SECFilings.tsx`
- `lib/actions/research.actions.ts`

**Estimated Time:** 2 weeks

---

### 15. Alert History & Analytics

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No log of triggered alerts
- No alert performance tracking
- No alert success rate analysis

**Features to Implement:**

- Alert history page showing all triggered alerts:
  - Alert type, symbol, trigger price, target price
  - Triggered date/time
  - Time to trigger (from creation to trigger)
  - Action taken (if any)
- Alert analytics:
  - Total alerts created
  - Total alerts triggered
  - Success rate (if user marked outcome)
  - Average time to trigger
  - Most triggered symbols
  - Alert performance by type
- User feedback on alerts:
  - Mark alert as "profitable", "break-even", "loss"
  - Add notes on action taken
  - Rate alert usefulness

**Files to Create:**

- `app/(root)/alerts/history/page.tsx`
- `app/(root)/alerts/analytics/page.tsx`
- `components/AlertHistoryTable.tsx`
- `components/AlertAnalytics.tsx`
- `components/AlertFeedback.tsx`
- `database/models/alert-history.model.ts`

**Estimated Time:** 4-6 days

---

## 🌟 Tier 4: Advanced Features (Future Enhancements)

These are nice-to-have features for long-term growth and differentiation.

### 16. Tax Reporting & Optimization

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No capital gains/losses tracking
- No wash sale detection
- No tax lot management
- No 1099-B style reports

**Features to Implement:**

- Capital gains/losses report:
  - Short-term vs long-term gains
  - Realized vs unrealized gains
  - Total gain/loss for tax year
  - Gain/loss by stock
- Wash sale detection (buy within 30 days of loss)
- Tax lot management:
  - Cost basis methods (FIFO, LIFO, Specific ID, Average Cost)
  - Tax lot detail per holding
- Tax-loss harvesting opportunities:
  - Identify positions with losses
  - Suggest candidates for tax-loss harvesting
  - Calculate potential tax savings
- 1099-B style report (summary for tax filing)
- Export to TurboTax/TaxAct format
- Year-end tax summary

**Files to Create:**

- `app/(root)/reports/tax/page.tsx`
- `components/TaxReport.tsx`
- `components/CapitalGainsTable.tsx`
- `components/WashSaleDetector.tsx`
- `components/TaxLossHarvesting.tsx`
- `lib/utils/tax-calculator.ts`
- `lib/utils/wash-sale-detector.ts`

**Estimated Time:** 2-3 weeks

---

### 17. Data Export & Reporting

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No portfolio export (CSV, PDF, Excel)
- No transaction export
- No performance reports

**Features to Implement:**

- Export formats:
  - CSV (holdings, transactions, alerts)
  - PDF (portfolio summary, performance report)
  - Excel (with formulas for P&L calculations)
- Report types:
  - Portfolio summary report
  - Transaction history report
  - Performance report (monthly/quarterly/annual)
  - Dividend income report
  - Sector allocation report
  - Tax report (capital gains)
- Scheduled reports:
  - Email weekly/monthly performance reports
  - Auto-generate end-of-year tax summary

**Files to Create:**

- `app/(root)/reports/page.tsx`
- `components/ExportDialog.tsx`
- `components/ReportGenerator.tsx`
- `lib/utils/export-helpers.ts`
- `lib/utils/pdf-generator.ts`
- `lib/utils/excel-generator.ts`

**Estimated Time:** 1-2 weeks

---

### 18. Progressive Web App (PWA)

**Status:** NOT IMPLEMENTED

**Current State:**

- Responsive web design exists
- No offline support
- Not installable on mobile

**Features to Implement:**

- Service worker for offline support
- Web manifest (app name, icons, theme color)
- Install prompt on mobile browsers
- Offline fallback pages
- Background sync for data
- Push notifications (browser notifications)
- App icon on home screen
- Splash screen
- Standalone display mode (no browser chrome)

**Files to Create:**

- `public/manifest.json`
- `public/service-worker.js`
- `public/offline.html`
- `lib/pwa/register-sw.ts`
- Update `app/layout.tsx` (add manifest link)
- Add app icons in `public/icons/` (192x192, 512x512)

**Estimated Time:** 3-5 days

---

### 19. Social Features (Optional)

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No idea sharing or watchlist sharing
- No discussion forums
- No following other users
- No leaderboards

**Features to Implement:**

- **Idea Sharing:**
  - Post trade ideas (bullish/bearish/neutral)
  - Add rationale and analysis
  - Target price and timeframe
  - Like/save ideas
  - Comment on ideas

- **Watchlist Sharing:**
  - Make watchlist public/private
  - Share watchlist link
  - Follow other users' public watchlists
  - Clone watchlist to own account

- **Discussion Forums:**
  - Stock-specific discussion threads
  - General market chat
  - Comments and replies
  - Upvote/downvote
  - Report spam/abuse

- **Social Features:**
  - Follow other users
  - User profiles with:
    - Bio, avatar, location
    - Public portfolio (opt-in)
    - Performance stats (if portfolio public)
    - Ideas posted, comments made
  - Activity feed (followed users' activity)
  - Direct messaging (optional)

- **Leaderboards:**
  - Top performers (based on public portfolios)
  - Most followed users
  - Most active contributors
  - Best ideas (by likes/success rate)
  - Weekly/monthly/all-time rankings

**Database Models:**

```typescript
// IdeaPost Model
{
  userId: string
  symbol: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  title: string
  content: string
  targetPrice?: number
  timeframe?: string
  likes: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

// Comment Model
{
  postId: string
  userId: string
  content: string
  createdAt: Date
}

// Follow Model
{
  followerId: string
  followingId: string
  createdAt: Date
}
```

**Files to Create:**

- `app/(root)/community/page.tsx`
- `app/(root)/community/[userId]/page.tsx`
- `app/(root)/community/ideas/page.tsx`
- `app/(root)/community/discussions/page.tsx`
- `components/IdeaFeed.tsx`
- `components/IdeaPost.tsx`
- `components/StockDiscussion.tsx`
- `components/Leaderboard.tsx`
- `components/UserProfile.tsx`
- `database/models/idea.model.ts`
- `database/models/comment.model.ts`
- `database/models/follow.model.ts`
- `lib/actions/community.actions.ts`

**Estimated Time:** 3-4 weeks

---

### 20. Two-Factor Authentication (2FA)

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No 2FA option for enhanced security
- No authenticator app integration
- No backup codes

**Features to Implement:**

- 2FA setup in Settings > Security
- Authentication methods:
  - TOTP (Time-based One-Time Password) via authenticator app
  - SMS-based codes (optional, less secure)
  - Email-based codes (fallback)
- QR code for authenticator app setup
- Backup codes generation (10 single-use codes)
- 2FA required on:
  - Sign in
  - Password change
  - Email change
  - Sensitive actions (delete account, export data)
- Remember device for 30 days (optional)
- Recovery flow if lost authenticator

**Files to Create:**

- `app/(root)/settings/security/2fa/page.tsx`
- `components/TwoFactorSetup.tsx`
- `components/TwoFactorVerify.tsx`
- `components/BackupCodes.tsx`
- `lib/actions/two-factor.actions.ts`
- `database/models/two-factor.model.ts`

**Estimated Time:** 1 week

---

### 21. Native Mobile App

**Status:** NOT IMPLEMENTED

**Current State:**

- Web app with responsive design
- No native iOS/Android app

**Implementation Options:**

1. **React Native** (JavaScript, share code with web)
2. **Flutter** (Dart, cross-platform)
3. **Native iOS (Swift) + Android (Kotlin)** (best performance, most effort)

**Features to Implement:**

- Native iOS and Android apps
- Native push notifications
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Native navigation patterns
- Offline mode with local database sync
- Home screen widgets (portfolio summary)
- Share sheet integration (share stocks)
- Camera for scanning QR codes (optional)
- App Store and Google Play listings

**Estimated Time:** 8-12 weeks (full native apps)

---

### 22. Options Trading Support

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No options chain data
- No options positions tracking
- No options P&L calculations

**Features to Implement:**

- Options chain display:
  - Call and put options
  - Strike prices, expiration dates
  - Bid/ask, last price, volume
  - Open interest
  - Implied volatility
  - Greeks (delta, gamma, theta, vega)
- Options positions in portfolio:
  - Calls/puts owned
  - Strike, expiration, quantity
  - Cost basis, current value, P&L
  - Break-even price
- Options strategies:
  - Covered call
  - Protective put
  - Iron condor
  - Straddle/strangle
- Options calculator:
  - Calculate potential profit/loss
  - Visualize P&L graph

**Note:** Requires options data API (Polygon.io, Tradier, etc.)

**Estimated Time:** 3-4 weeks

---

### 23. Crypto Integration

**Status:** NOT IMPLEMENTED

**What's Missing:**

- No cryptocurrency support
- No crypto portfolio tracking

**Features to Implement:**

- Add cryptocurrency support:
  - Bitcoin, Ethereum, major altcoins
  - Real-time crypto prices
  - Crypto watchlist
  - Crypto portfolio tracking
  - Crypto alerts
- Crypto-specific metrics:
  - Market cap, circulating supply
  - 24h volume, 24h change
  - All-time high/low
  - Fear & Greed Index
- Crypto news integration
- Crypto exchange integration (optional):
  - Connect Coinbase, Binance, Kraken
  - Auto-sync crypto holdings

**Note:** Requires crypto data API (CoinGecko, CoinMarketCap, Cryptocompare)

**Estimated Time:** 2-3 weeks

---

### 24. AI-Powered Features

**Status:** PARTIALLY IMPLEMENTED

**Current State:**

- Gemini AI used for email personalization
- No AI-powered investment insights

**Features to Add:**

- **AI Stock Analysis:**
  - Generate AI summary of company fundamentals
  - Sentiment analysis of news articles
  - Predict price trends (with disclaimers)

- **AI Portfolio Advisor:**
  - Suggest portfolio rebalancing
  - Identify overexposed sectors
  - Recommend stocks based on user preferences
  - Risk assessment and recommendations

- **AI-Powered Alerts:**
  - Smart alert suggestions based on patterns
  - Anomaly detection (unusual price/volume)

- **Natural Language Queries:**
  - Ask questions like "What are my best performers this month?"
  - "Show me dividend stocks in my watchlist"
  - "Find technology stocks under $100"

**Files to Create:**

- `lib/ai/stock-analysis.ts`
- `lib/ai/portfolio-advisor.ts`
- `components/AIInsights.tsx`
- `components/AIChat.tsx`

**Note:** Requires AI API (OpenAI, Anthropic Claude, Google Gemini)

**Estimated Time:** 2-3 weeks

---

## 📅 Recommended Implementation Timeline

### **Phase 1: Critical Foundation (2-3 weeks)**

1. Portfolio Management (database models, CRUD, portfolio page, transaction page)
2. Transaction Management (history, filters, edit/delete)
3. Account Settings (layout, profile editing, password change)
4. Dark/Light Mode Toggle
5. Fix bug at `lib/actions/user.actions.ts:59`

**Success Criteria:** Users can track their holdings and transactions

---

### **Phase 2: Enhanced UX (1-2 weeks)**

1. News UI Integration (show news on stock pages)
2. Notification Preferences (email settings)
3. Password Reset Flow (forgot password)
4. Email Verification (verify email on signup)
5. Advanced Alerts - Percentage Change

**Success Criteria:** Complete user account management experience

---

### **Phase 3: Discovery & Analytics (2 weeks)**

1. Stock Screener (filter stocks by criteria)
2. Stock Comparison Tool (compare up to 5 stocks)
3. Portfolio Analytics (Sharpe ratio, beta, risk metrics)
4. Asset Allocation Charts (sector diversification)
5. Alert History Page (triggered alerts log)

**Success Criteria:** Users can discover stocks and analyze portfolio performance

---

### **Phase 4: Real-time & Research (2 weeks)**

1. Real-time Price Updates (WebSocket integration)
2. Dividend Tracking (upcoming dividends, income history)
3. Earnings Calendar (upcoming earnings for watchlist)
4. Analyst Ratings Integration (if API available)
5. Alert Analytics (success rate, performance)

**Success Criteria:** Real-time data and comprehensive research tools

---

### **Phase 5: Mobile & Advanced (3 weeks)**

1. PWA Implementation (offline support, installable)
2. Data Export (CSV, PDF, Excel)
3. Tax Reporting (capital gains, wash sales)
4. Two-Factor Authentication (2FA)
5. Advanced Alert Types (MA crossover, RSI, MACD)

**Success Criteria:** Mobile-optimized with advanced features

---

### **Phase 6: Social & Future (Ongoing)**

1. Social Features (idea sharing, discussions, leaderboards) - Optional
2. Native Mobile App (React Native or Flutter) - Optional
3. Options Trading Support - Optional
4. Crypto Integration - Optional
5. AI-Powered Features - Optional

**Success Criteria:** Community engagement and platform differentiation

---

## 🐛 Known Bugs & Technical Debt

### Critical Bug

- **`lib/actions/user.actions.ts:59`** - Missing userId in query parameter

### API Limitations

- Volume alerts disabled (Finnhub quote endpoint lacks volume data)
- 15-minute cached data (not real-time without premium plan)

### Technical Debt

1. No rate limiting on API endpoints
2. No comprehensive error logging/monitoring (add Sentry)
3. Limited input validation (add Zod schemas)
4. No test coverage (add unit, integration, E2E tests)
5. Hard-coded API keys in .env (use secrets manager)
6. No database connection pooling
7. No CI/CD pipeline (add GitHub Actions)

---

## 🎯 Success Metrics

### User Engagement

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration
- User retention (7-day, 30-day)

### Feature Adoption

- % users with portfolio (Phase 1 goal: 80%+)
- % users with active alerts (Phase 2 goal: 60%+)
- Average watchlist size (goal: 10+ stocks)
- Average portfolio size (goal: 5+ holdings)
- Transaction frequency

### Performance

- Page load time < 2 seconds
- API response time < 500ms
- Background job success rate > 99%
- Email delivery rate > 95%
- Error rate < 1%

---

## 🚀 Getting Started

### Immediate Next Steps:

1. **Fix the bug** in `lib/actions/user.actions.ts:59`
2. **Start Phase 1:** Create portfolio and transaction database models
3. **Review** this roadmap with your team and adjust priorities

### Questions to Consider:

- Do you want real-time data or is 15-minute delay acceptable?
- Should portfolio tracking be manual entry or integrate with a brokerage API?
- Is social/community feature a priority or nice-to-have?
- What's your target user: active traders, long-term investors, or both?

---

## 📚 Resources

### API Providers

- **Stock Data:** Finnhub (current), Polygon.io, Alpha Vantage, IEX Cloud
- **Crypto Data:** CoinGecko, CoinMarketCap
- **Options Data:** Polygon.io, Tradier
- **AI Services:** OpenAI, Anthropic Claude, Google Gemini (current)

### Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API routes, Server Actions, MongoDB, Mongoose
- **Auth:** Better Auth
- **Jobs:** Inngest
- **Email:** Nodemailer + AWS SES
- **Charts:** TradingView widgets

---

**Last Updated:** 2025-11-25

**Total Features:** 24 features across 4 tiers
**Estimated Total Time:** 20-30 weeks for all tiers (Tier 1-3: 7-9 weeks)
